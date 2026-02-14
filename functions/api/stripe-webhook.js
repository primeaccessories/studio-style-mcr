// Cloudflare Pages Function - Stripe Webhook
// Automatically saves completed checkout sessions to Firebase
// Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Cloudflare Pages env vars

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
  };

  try {
    const body = await request.text();
    const signature = request.headers.get('Stripe-Signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify webhook signature
    const event = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!event) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Only handle checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const session = event.data.object;

    // Skip if payment not completed
    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ received: true, skipped: 'not paid' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const sessionId = session.id;
    const firebaseProjectId = 'studiostylemcr-e5ead';

    // Check if order already exists in Firebase (avoid duplicates)
    const existsResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/orders/${sessionId}`,
      { method: 'GET' }
    );

    if (existsResponse.ok) {
      // Order already saved (e.g. by order-confirmation.html)
      return new Response(JSON.stringify({ received: true, skipped: 'already exists' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch line items from Stripe
    const lineItemsResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
      }
    );
    const lineItemsData = await lineItemsResponse.json();

    const items = (lineItemsData.data || []).map(item => ({
      name: item.description || 'Item',
      quantity: item.quantity || 1,
      price: (item.amount_total || 0) / 100,
    }));

    const meta = session.metadata || {};
    const orderNumber = 'SSM-' + sessionId.slice(-8).toUpperCase();
    const couponDiscount = meta.couponDiscount ? parseFloat(meta.couponDiscount) : 0;

    // Build Firebase document using Firestore REST API format
    const orderDoc = {
      fields: {
        orderNumber: { stringValue: orderNumber },
        sessionId: { stringValue: sessionId },
        items: {
          arrayValue: {
            values: items.map(item => ({
              mapValue: {
                fields: {
                  name: { stringValue: item.name },
                  quantity: { integerValue: String(item.quantity) },
                  price: { doubleValue: item.price },
                },
              },
            })),
          },
        },
        customerInfo: {
          mapValue: {
            fields: {
              firstName: { stringValue: meta.firstName || '' },
              lastName: { stringValue: meta.lastName || '' },
              email: { stringValue: session.customer_email || session.customer_details?.email || '' },
              phone: { stringValue: meta.phone || '' },
              address: { stringValue: meta.address || '' },
              city: { stringValue: meta.city || '' },
              postcode: { stringValue: meta.postcode || '' },
            },
          },
        },
        deliveryOption: { stringValue: meta.delivery || 'standard' },
        paymentMethod: { stringValue: 'card' },
        total: { doubleValue: (session.amount_total || 0) / 100 },
        currency: { stringValue: session.currency || 'gbp' },
        rewardUsed: { booleanValue: meta.rewardUsed === 'true' },
        couponCode: { stringValue: meta.couponCode || '' },
        couponDiscount: { doubleValue: couponDiscount },
        firstOrderDiscountUsed: { booleanValue: meta.firstOrderDiscountUsed === 'true' },
        firstOrderDiscountAmount: { doubleValue: meta.firstOrderDiscountAmount ? parseFloat(meta.firstOrderDiscountAmount) : 0 },
        status: { stringValue: 'paid' },
        userId: { stringValue: meta.userId || '' },
        stripeCreated: { integerValue: String(session.created || 0) },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    };

    // Save to Firebase using REST API
    const firebaseResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/orders?documentId=${sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDoc),
      }
    );

    if (!firebaseResponse.ok) {
      const err = await firebaseResponse.text();
      console.error('Firebase save error:', err);
      return new Response(JSON.stringify({ error: 'Failed to save order', details: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Webhook: Order saved to Firebase -', orderNumber);

    return new Response(JSON.stringify({ received: true, saved: orderNumber }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts = header.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const signature = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !signature) return null;

    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return null;

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    if (expectedSignature.length !== signature.length) return null;
    let match = true;
    for (let i = 0; i < expectedSignature.length; i++) {
      if (expectedSignature[i] !== signature[i]) match = false;
    }

    if (!match) return null;

    return JSON.parse(payload);
  } catch (e) {
    console.error('Signature verification error:', e);
    return null;
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
  });
}
