// CF Pages Function — Upload product image to R2
// R2 binding: IMAGES (bound to studio-style-images bucket)
import { verifyAdmin } from './_lib/adminAuth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // Admin endpoint — restrict CORS to this site's own origin (no wildcard).
  const origin = new URL(request.url).origin;
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Require a valid admin session cookie (replaces the old adminPass form field).
  if (!(await verifyAdmin(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // R2 is not bound in this environment — fail cleanly instead of throwing.
  if (!env.IMAGES) {
    return new Response(JSON.stringify({ error: 'Image storage is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !file.size) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate unique filename
    const ext = (file.name || 'image.jpg').split('.').pop() || 'jpg';
    const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to R2
    await env.IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'image/jpeg' },
    });

    return new Response(JSON.stringify({ url: `/r2/${key}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function onRequestOptions(context) {
  const origin = new URL(context.request.url).origin;
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
