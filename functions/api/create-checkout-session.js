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

    // C7 fix: never trust client-supplied item.price. Fetch authoritative prices
    // from Firestore (siteData/products) and price every line server-side.
    let priceMap;
    try {
      priceMap = await fetchServerPriceMap(env);
    } catch (err) {
      console.error('Price lookup failed:', err);
      return new Response(JSON.stringify({ error: 'Unable to verify prices right now. Please try again in a moment.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Build line items for Stripe using SERVER prices only.
    const lineItems = [];
    let subtotalPence = 0;
    for (const item of items) {
      const serverPrice = lookupServerPrice(priceMap, item);
      if (serverPrice === null) {
        return new Response(JSON.stringify({ error: 'One or more items in your basket are no longer available. Please refresh your basket and try again.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity)) || 1);
      const unitAmount = Math.round(serverPrice * 100); // Convert to pence
      subtotalPence += unitAmount * qty;
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      });
    }

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

    // Calculate combined discount (first-order + coupon + reward) as a single Stripe coupon.
    // subtotalPence is computed above from SERVER prices, not client-supplied values.
    let discountParams = {};
    const orderTotalPence = subtotalPence + deliveryCost;
    let totalDiscountPence = 0;
    let discountParts = [];

    // First-order 10% discount — clamp to at most 10% of the server-computed subtotal.
    if (firstOrderDiscountUsed && firstOrderDiscountAmount > 0) {
      const requestedPence = Math.round(Number(firstOrderDiscountAmount) * 100);
      const maxFirstOrderPence = Math.round(subtotalPence * 0.10);
      const firstOrderPence = Math.max(0, Math.min(requestedPence, maxFirstOrderPence));
      if (firstOrderPence > 0) {
        totalDiscountPence += firstOrderPence;
        discountParts.push('10% First Order');
      }
    }

    // Coupon discount — validated SERVER-SIDE against the real `discountCodes`
    // source. The client-supplied couponDiscount is IGNORED; the discount is
    // recomputed from the coupon's actual type/value, so a fake or tampered code
    // cannot reduce the total. Unknown/disabled code => no discount (order still
    // proceeds, matching the client "Invalid or expired" behaviour).
    if (couponCode) {
      const serverCoupon = await fetchServerCoupon(env, couponCode);
      if (serverCoupon && serverCoupon.value !== null) {
        let couponPence = serverCoupon.type === 'percent'
          ? Math.round(subtotalPence * (Number(serverCoupon.value) || 0) / 100)
          : Math.round((Number(serverCoupon.value) || 0) * 100);
        couponPence = Math.max(0, Math.min(couponPence, subtotalPence));
        if (couponPence > 0) {
          totalDiscountPence += couponPence;
          discountParts.push(String(couponCode).slice(0, 40));
        }
      }
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

// --- C7: authoritative pricing from Firestore --------------------------------

// Convert a Firestore typed number field to a JS number (handles double / integer).
function fsNumber(field) {
  if (!field) return null;
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  if (field.integerValue !== undefined) return Number(field.integerValue);
  return null;
}

// Fetch siteData/products from the Firestore REST API and build a
// productId -> price (in pounds) map. Throws on network / empty-doc errors so
// the caller can FAIL CLOSED rather than fall back to client-supplied prices.
async function fetchServerPriceMap(env) {
  // Project id comes from the site's client config (js/auth.js). Overridable via env.
  const projectId = (env && env.FIREBASE_PROJECT_ID) || 'studiostylemcr-e5ead';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/siteData/products`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) throw new Error(`Firestore responded ${resp.status}`);
  const doc = await resp.json();
  const values = doc && doc.fields && doc.fields.items && doc.fields.items.arrayValue
    ? (doc.fields.items.arrayValue.values || [])
    : [];
  if (!values.length) throw new Error('No products found in Firestore');
  const map = {};
  for (const v of values) {
    const f = v && v.mapValue && v.mapValue.fields;
    if (!f || !f.id || f.id.stringValue === undefined) continue;
    const id = f.id.stringValue;
    const price = fsNumber(f.price);
    if (id && price !== null && price >= 0) map[id] = price;
  }
  if (!Object.keys(map).length) throw new Error('No priced products found in Firestore');
  return map;
}

// Look up a coupon by code in the Firestore `discountCodes` collection and return
// the matching ENABLED coupon's { type, value }, or null. Fails closed (null =>
// no discount) on any error so a fake/tampered/disabled code cannot discount.
async function fetchServerCoupon(env, code) {
  try {
    if (!code) return null;
    const projectId = (env && env.FIREBASE_PROJECT_ID) || 'studiostylemcr-e5ead';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/discountCodes`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) return null;
    const data = await resp.json();
    const docs = (data && data.documents) || [];
    const want = String(code).trim().toUpperCase();
    for (const doc of docs) {
      const f = doc && doc.fields;
      if (!f || !f.code || f.code.stringValue === undefined) continue;
      if (String(f.code.stringValue).toUpperCase() !== want) continue;
      if (!f.enabled || f.enabled.booleanValue !== true) return null;
      return { type: f.type && f.type.stringValue, value: fsNumber(f.value) };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Resolve the authoritative price (in pounds) for a cart line. Tries the stable
// productId first, then falls back to the cart id and the size-stripped cart id
// so older baskets (created before productId existed) still resolve. Returns
// null if the product cannot be found in the catalogue.
function lookupServerPrice(priceMap, item) {
  const candidates = [];
  if (item && item.productId) candidates.push(String(item.productId));
  if (item && item.id) {
    candidates.push(String(item.id));
    candidates.push(String(item.id).replace(/-size-.+$/, ''));
  }
  for (const key of candidates) {
    if (key && Object.prototype.hasOwnProperty.call(priceMap, key)) {
      return priceMap[key];
    }
  }
  return null;
}
