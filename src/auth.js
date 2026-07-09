const TOKEN_KEY = 'leadEngine.token';
const AI_CREDS_KEY = 'leadEngine.aiCreds';
export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Session token (per-account JWT) ─────────────────────────────────────
// sessionStorage on purpose: the token clears when the tab closes, so a
// shared/public machine doesn't stay logged in forever.
export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sessionStorage unavailable — app will just re-prompt on next load.
  }
}

export function clearAuth() {
  setToken('');
}

async function authRequest(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export function signup(email, password) {
  return authRequest('/api/auth/signup', { email, password });
}

export function login(email, password) {
  return authRequest('/api/auth/login', { email, password });
}

export function verifyOtp(email, otp) {
  return authRequest('/api/auth/verify-otp', { email, otp });
}

export function resendOtp(email) {
  return authRequest('/api/auth/resend-otp', { email });
}

export async function fetchMe() {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Session expired.');
  return res.json();
}

// ── BYOK: the visitor's own LLM provider + API key ──────────────────────
// Lives ONLY in this browser's localStorage. It is sent to the backend
// exactly once, as part of a job-creation request, and the backend never
// writes it to disk/DB — see routes/jobs.js + buildRuntimeProviderManager.js
// on the server. It is never sent anywhere else from this app.
export function getAiCreds() {
  try {
    const raw = localStorage.getItem(AI_CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAiCreds(creds) {
  try {
    if (creds) localStorage.setItem(AI_CREDS_KEY, JSON.stringify(creds));
    else localStorage.removeItem(AI_CREDS_KEY);
  } catch {
    // ignore — worst case the user re-enters it
  }
}

export function clearAiCreds() {
  setAiCreds(null);
}
