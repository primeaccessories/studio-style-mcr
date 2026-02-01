// List Stripe payments/charges
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 25;
    const startingAfter = url.searchParams.get('starting_after') || '';

    // Build query params
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('expand[]', 'data.payment_intent');
    if (startingAfter) {
      params.append('starting_after', startingAfter);
    }

    // Fetch checkout sessions (completed payments)
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Format the response
    const payments = data.data.map(session => ({
      id: session.id,
      paymentIntentId: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.customer_details?.name || `${session.metadata?.firstName || ''} ${session.metadata?.lastName || ''}`.trim(),
      metadata: session.metadata,
      created: session.created,
      refunded: false, // Will be updated below
    }));

    // Check refund status for each payment
    for (let payment of payments) {
      if (payment.paymentIntentId) {
        const piResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${payment.paymentIntentId}`, {
          headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
        });
        const pi = await piResponse.json();
        if (pi.charges?.data?.[0]) {
          payment.refunded = pi.charges.data[0].refunded;
          payment.amountRefunded = pi.charges.data[0].amount_refunded;
          payment.chargeId = pi.charges.data[0].id;
        }
      }
    }

    return new Response(JSON.stringify({
      payments,
      hasMore: data.has_more,
      lastId: payments.length > 0 ? payments[payments.length - 1].id : null,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error listing payments:', error);
    return new Response(JSON.stringify({ error: 'Failed to list payments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
