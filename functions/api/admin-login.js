// Server-side admin login.
// POST { password } -> constant-time compare against env.ADMIN_PASSWORD.
// On success sets a signed, HttpOnly `admin_session` cookie (see _lib/adminAuth.js).
// Fails CLOSED: if ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not set, login is disabled.

import { createSessionCookie, timingSafeEqual } from './_lib/adminAuth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };

  try {
    // Fail closed if the admin auth env is not configured.
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
      return new Response(JSON.stringify({ error: 'Admin login is not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';

    if (!timingSafeEqual(password, env.ADMIN_PASSWORD)) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const cookie = await createSessionCookie(env);
    if (!cookie) {
      return new Response(JSON.stringify({ error: 'Admin login is not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie, ...corsHeaders },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
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
