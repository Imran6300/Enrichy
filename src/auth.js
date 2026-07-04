const STORAGE_KEY = 'leadEngine.apiKey';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// sessionStorage on purpose, not localStorage: the key clears when the tab
// closes, which is the right tradeoff for a shared/self-hosted internal
// tool — no "remember me forever" on a machine other people might use.
export function getStoredApiKey() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key) {
  try {
    if (key) sessionStorage.setItem(STORAGE_KEY, key);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage unavailable (e.g. private browsing edge cases) — the
    // app will just re-prompt every load, which is a safe fallback.
  }
}

export async function verifyApiKey(key) {
  if (!key) return false;
  const res = await fetch(`${BASE}/api/auth/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
  });
  return res.ok;
}

export function clearAuth() {
  setStoredApiKey('');
}
