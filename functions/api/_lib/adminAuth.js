// Shared admin session helpers for Cloudflare Pages Functions.
//
// Session cookie format:
//   admin_session = base64url(payloadJSON) + "." + base64url(HMAC_SHA256(payloadJSON, ADMIN_SESSION_SECRET))
// payloadJSON = { "iat": <ms>, "exp": <ms> }
//
// Security posture: FAIL CLOSED. If ADMIN_SESSION_SECRET is not configured,
// verifyAdmin() always returns false and no cookie can be minted.

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// --- base64url helpers -------------------------------------------------------
function b64urlEncode(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecodeToString(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// --- HMAC-SHA256 (Web Crypto, available in the Workers runtime) --------------
async function hmacSign(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return b64urlEncode(new Uint8Array(sig));
}

// Constant-time comparison. Folds length differences into the accumulator so
// it never short-circuits on the first differing byte.
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] || 0) ^ (bb[i] || 0);
  }
  return diff === 0;
}

// --- cookie helpers ----------------------------------------------------------
async function createSessionCookie(env, ttlMs) {
  const secret = env && env.ADMIN_SESSION_SECRET;
  if (!secret) return null; // fail closed — cannot sign without a secret
  const ttl = typeof ttlMs === 'number' && ttlMs > 0 ? ttlMs : SESSION_TTL_MS;
  const now = Date.now();
  const payload = JSON.stringify({ iat: now, exp: now + ttl });
  const payloadB64 = b64urlEncode(new TextEncoder().encode(payload));
  const sig = await hmacSign(payloadB64, secret);
  const value = payloadB64 + '.' + sig;
  const maxAge = Math.floor(ttl / 1000);
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookie(request, name) {
  const header = request.headers.get('Cookie') || request.headers.get('cookie') || '';
  if (!header) return null;
  const parts = header.split(';');
  for (let i = 0; i < parts.length; i++) {
    const idx = parts[i].indexOf('=');
    if (idx === -1) continue;
    const k = parts[i].slice(0, idx).trim();
    if (k === name) return parts[i].slice(idx + 1).trim();
  }
  return null;
}

// Verify the admin_session cookie: valid HMAC + not expired. Fails closed.
async function verifyAdmin(request, env) {
  const secret = env && env.ADMIN_SESSION_SECRET;
  if (!secret) return false; // fail closed when unconfigured
  const raw = parseCookie(request, COOKIE_NAME);
  if (!raw) return false;
  const dot = raw.lastIndexOf('.');
  if (dot === -1) return false;
  const payloadB64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!payloadB64 || !sig) return false;

  let expectedSig;
  try {
    expectedSig = await hmacSign(payloadB64, secret);
  } catch (e) {
    return false;
  }
  if (!timingSafeEqual(sig, expectedSig)) return false;

  let payload;
  try {
    payload = JSON.parse(b64urlDecodeToString(payloadB64));
  } catch (e) {
    return false;
  }
  if (!payload || typeof payload.exp !== 'number') return false;
  if (Date.now() >= payload.exp) return false;
  return true;
}

export {
  verifyAdmin,
  createSessionCookie,
  clearSessionCookie,
  timingSafeEqual,
  COOKIE_NAME,
  SESSION_TTL_MS,
};
