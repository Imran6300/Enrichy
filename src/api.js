import { getStoredApiKey, clearAuth } from './auth.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getStoredApiKey(),
    },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no body / not json (e.g. CSV)
  }
  if (res.status === 401) {
    // The stored key was rejected (e.g. server's API_KEY changed) — clear
    // it so AuthGate re-prompts on the next render instead of the app
    // silently failing every request forever.
    clearAuth();
    window.location.reload();
  }
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  base: BASE,

  suggestions: () => request('/api/meta/suggestions'),

  createJob: (payload) =>
    request('/api/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  listJobs: () => request('/api/jobs'),
  getJob: (id) => request(`/api/jobs/${id}`),
  stopJob: (id) => request(`/api/jobs/${id}/stop`, { method: 'POST' }),
  deleteJob: (id) => request(`/api/jobs/${id}`, { method: 'DELETE' }),

  listLeads: (params) => request(`/api/leads?${new URLSearchParams(params)}`),
  leadStats: (params) => request(`/api/leads/stats?${new URLSearchParams(params)}`),
  deleteLead: (id) => request(`/api/leads/${id}`, { method: 'DELETE' }),
  updateLead: (id, payload) =>
    request(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  exportCsvUrl: (params) =>
    `${BASE}/api/leads/export.csv?${new URLSearchParams({ ...params, apiKey: getStoredApiKey() })}`,
};
