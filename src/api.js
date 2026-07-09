import { getToken, clearAuth, getAiCreds, BASE } from './auth.js';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
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
    // Session expired/invalid — clear it so AuthGate re-prompts on the
    // next render instead of the app silently failing every request.
    clearAuth();
    window.location.reload();
  }
  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  base: BASE,

  suggestions: () => request('/api/meta/suggestions'),

  publicConfig: async () => {
    const res = await fetch(`${BASE}/api/public-config`);
    return res.json();
  },

  createJob: (payload) => {
    const aiCreds = getAiCreds();
    return request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        aiProvider: aiCreds?.provider,
        aiApiKey: aiCreds?.apiKey,
        aiBaseURL: aiCreds?.baseURL,
        aiModel: aiCreds?.model,
      }),
    });
  },
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
    `${BASE}/api/leads/export.csv?${new URLSearchParams({ ...params, token: getToken() })}`,
};
