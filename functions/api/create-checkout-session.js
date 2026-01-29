// Cloudflare Pages Function for creating Stripe Checkout Sessions
// Set STRIPE_SECRET_KEY in Cloudflare Pages environment variables

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { items, customerInfo, deliveryOption } = body;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items in cart' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Delivery prices
    const deliveryPrices = {
      standard: 399, // in pence
      express: 599,
      free: 0,
    };

    // Build line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }));

    // Add delivery as a line item
    const deliveryCost = deliveryPrices[deliveryOption] || deliveryPrices.standard;
    if (deliveryCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: deliveryOption === 'express' ? 'Express Delivery (1-2 days)' : 'Standard Delivery (3-5 days)',
          },
          unit_amount: deliveryCost,
        },
        quantity: 1,
      });
    }

    // Get the origin for success/cancel URLs
    const origin = new URL(request.url).origin;

    // Create Stripe Checkout Session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'payment_method_types[1]': 'klarna',
        'success_url': `${origin}/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/checkout.html?cancelled=true`,
        'customer_email': customerInfo.email,
        'shipping_address_collection[allowed_countries][0]': 'GB',
        'metadata[firstName]': customerInfo.firstName,
        'metadata[lastName]': customerInfo.lastName,
        'metadata[phone]': customerInfo.phone,
        'metadata[address]': customerInfo.address,
        'metadata[city]': customerInfo.city,
        'metadata[postcode]': customerInfo.postcode,
        'metadata[delivery]': deliveryOption,
        ...lineItems.reduce((acc, item, index) => {
          acc[`line_items[${index}][price_data][currency]`] = item.price_data.currency;
          acc[`line_items[${index}][price_data][product_data][name]`] = item.price_data.product_data.name;
          if (item.price_data.product_data.images && item.price_data.product_data.images[0]) {
            acc[`line_items[${index}][price_data][product_data][images][0]`] = item.price_data.product_data.images[0];
          }
          acc[`line_items[${index}][price_data][unit_amount]`] = item.price_data.unit_amount;
          acc[`line_items[${index}][quantity]`] = item.quantity;
          return acc;
        }, {}),
      }),
    });

    const session = await stripeResponse.json();

    if (session.error) {
      console.error('Stripe error:', session.error);
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
