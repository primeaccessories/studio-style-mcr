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
    const { items, customerInfo, deliveryOption, rewardUsed, userId, couponCode, couponDiscount, firstOrderDiscountUsed, firstOrderDiscountAmount } = body;

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
      collection: 0,
      dropoff: 0,
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
    const deliveryCost = deliveryPrices[deliveryOption] !== undefined ? deliveryPrices[deliveryOption] : deliveryPrices.standard;
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

    // Calculate combined discount (first-order + coupon + reward) as a single Stripe coupon
    let discountParams = {};
    const subtotalPence = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const orderTotalPence = subtotalPence + deliveryCost;
    let totalDiscountPence = 0;
    let discountParts = [];

    // First-order 10% discount
    if (firstOrderDiscountUsed && firstOrderDiscountAmount > 0) {
      const firstOrderPence = Math.round(firstOrderDiscountAmount * 100);
      totalDiscountPence += firstOrderPence;
      discountParts.push('10% First Order');
    }

    // Coupon discount
    if (couponCode && couponDiscount > 0) {
      const couponPence = Math.round(couponDiscount * 100);
      totalDiscountPence += couponPence;
      discountParts.push(couponCode);
    }

    // Reward discount (£20 off)
    if (rewardUsed) {
      const rewardPence = Math.min(2000, Math.max(0, orderTotalPence - totalDiscountPence));
      totalDiscountPence += rewardPence;
      discountParts.push('£20 Reward');
    }

    // Cap discount at order total
    totalDiscountPence = Math.min(totalDiscountPence, orderTotalPence);

    if (totalDiscountPence > 0) {
      const couponName = discountParts.join(' + ');
      discountParams = {
        'discounts[0][coupon]': await createCombinedCoupon(env, totalDiscountPence, couponName),
      };
    }

    // Helper to create a one-time Stripe coupon for the combined discount
    async function createCombinedCoupon(env, amountOff, name) {
      const couponResponse = await fetch('https://api.stripe.com/v1/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'amount_off': amountOff,
          'currency': 'gbp',
          'duration': 'once',
          'name': name,
          'max_redemptions': 1,
        }),
      });
      const coupon = await couponResponse.json();
      return coupon.id;
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
        'metadata[userId]': userId || '',
        'metadata[rewardUsed]': rewardUsed ? 'true' : 'false',
        'metadata[couponCode]': couponCode || '',
        'metadata[couponDiscount]': couponDiscount ? String(couponDiscount) : '0',
        'metadata[firstOrderDiscountUsed]': firstOrderDiscountUsed ? 'true' : 'false',
        'metadata[firstOrderDiscountAmount]': firstOrderDiscountAmount ? String(firstOrderDiscountAmount) : '0',
        ...discountParams,
        ...lineItems.reduce((acc, item, index) => {
          acc[`line_items[${index}][price_data][currency]`] = item.price_data.currency;
          acc[`line_items[${index}][price_data][product_data][name]`] = item.price_data.product_data.name;
          if (item.price_data.product_data.images && item.price_data.product_data.images[0]) {
            let imgUrl = item.price_data.product_data.images[0];
            // Stripe requires absolute URLs — convert relative paths
            if (imgUrl.startsWith('/')) {
              imgUrl = origin + imgUrl;
            }
            // Only include if it's a valid absolute URL
            if (imgUrl.startsWith('http')) {
              acc[`line_items[${index}][price_data][product_data][images][0]`] = imgUrl;
            }
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
