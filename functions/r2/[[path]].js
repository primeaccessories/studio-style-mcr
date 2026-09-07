// CF Pages Function — Serve images from R2
// R2 binding: IMAGES (bound to studio-style-images bucket)

export async function onRequestGet(context) {
  const { params, env } = context;
  const key = params.path.join('/');

  // R2 is not bound in this environment — fail cleanly instead of throwing.
  if (!env.IMAGES) {
    return new Response('Image storage unavailable', { status: 503 });
  }

  const object = await env.IMAGES.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
}
