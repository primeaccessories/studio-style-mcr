// CF Pages Function — Upload product image to R2
// R2 binding: IMAGES (bound to studio-style-images bucket)

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const adminPass = formData.get('adminPass');

    if (adminPass !== 'admin123') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
