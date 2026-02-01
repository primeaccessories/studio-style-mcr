// Create a refund for a Stripe payment
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return new Response(JSON.stringify({ error: 'Payment intent ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Build refund params
    const params = new URLSearchParams({
      payment_intent: paymentIntentId,
    });

    // Optional: partial refund amount (in pence)
    if (amount) {
      params.append('amount', amount);
    }

    // Optional: reason for refund
    if (reason) {
      params.append('reason', reason); // duplicate, fraudulent, or requested_by_customer
    }

    // Create the refund
    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const refund = await response.json();

    if (refund.error) {
      return new Response(JSON.stringify({ error: refund.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        created: refund.created,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    return new Response(JSON.stringify({ error: 'Failed to create refund' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
