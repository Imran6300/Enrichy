import { useState, useEffect } from 'react';
import { setStoredApiKey, getStoredApiKey, verifyApiKey } from '../auth.js';

/**
 * Gates the entire dashboard behind a single API key prompt.
 *
 * This intentionally does not implement multi-user accounts — see
 * src/middleware/auth.js on the backend for why a single shared secret is
 * the right amount of auth for a self-hosted, single-operator tool. This
 * component's only job is: don't render the app until a *valid* key is
 * stored, and give a clear error if the typed key is wrong.
 */
export default function AuthGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const existing = getStoredApiKey();
    if (!existing) {
      setChecking(false);
      return;
    }
    verifyApiKey(existing)
      .then((ok) => {
        setAuthed(ok);
        if (!ok) setStoredApiKey('');
      })
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ok = await verifyApiKey(input.trim());
      if (ok) {
        setStoredApiKey(input.trim());
        setAuthed(true);
      } else {
        setError('That key was rejected by the server. Double-check API_KEY in your .env.');
      }
    } catch (err) {
      setError(err.message || 'Could not reach the API server.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center p-6 font-mono text-[13px] text-inkDim">
        Checking session…
      </div>
    );
  }

  if (authed) {
    return children;
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <form
        className="flex w-full max-w-[360px] animate-fade-in-up flex-col gap-1.5 rounded-lg border border-line bg-panel p-6 sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="mb-4 flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 shrink-0 animate-brand-glow overflow-hidden rounded-lg">
            <img src="/logo.png" alt="Enrichly" className="block h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="bg-brand-title bg-clip-text text-[14.5px] font-bold tracking-tight text-transparent">
              Enrichly
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-inkFaint">Console v2</span>
          </div>
        </div>
        <label className="mb-1 font-mono text-[11.5px] uppercase tracking-wide text-inkDim" htmlFor="apiKey">
          API key
        </label>
        <input
          id="apiKey"
          type="password"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste the API_KEY from your server's .env"
          className="mb-1 rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors duration-150 placeholder:text-inkFaint focus:border-amber-dim"
        />
        {error && <div className="my-1 text-[12.5px] text-rust">{error}</div>}
        <button
          type="submit"
          className="mt-3 rounded-md border-none bg-amber px-3.5 py-2.5 text-[13.5px] font-semibold text-[#07111f] transition-all duration-150 enabled:hover:bg-amber-dim enabled:hover:shadow-[0_4px_18px_rgba(57,255,90,0.3)] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting || !input.trim()}
        >
          {submitting ? 'Checking…' : 'Unlock dashboard'}
        </button>
        <p className="mt-3.5 text-[11.5px] leading-relaxed text-inkFaint">
          This key lives only in this browser's session storage — it's never stored anywhere else. Find it in the{' '}
          <code className="rounded-[3px] bg-field px-1 py-px font-mono">API_KEY</code> value of the server's{' '}
          <code className="rounded-[3px] bg-field px-1 py-px font-mono">.env</code> file.
        </p>
      </form>
    </div>
  );
}
