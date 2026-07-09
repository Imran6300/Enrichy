import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TagInput from '../components/TagInput.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../api.js';
import { getAiCreds, fetchMe } from '../auth.js';

const MAX_LEADS_PER_RUN = 100;
const DEFAULT_UPSELL_MESSAGE =
  'Get the full source code and run unlimited enrichments on your own server.';

export default function NewJobPage() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState([]);
  const [cities, setCities] = useState([]);
  const [target, setTarget] = useState(MAX_LEADS_PER_RUN);
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState({ exampleKeywords: [], exampleCities: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [freeRunUsed, setFreeRunUsed] = useState(false);
  const [gumroadUrl, setGumroadUrl] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellMessage, setUpsellMessage] = useState(DEFAULT_UPSELL_MESSAGE);

  useEffect(() => {
    api.suggestions().then(setSuggestions).catch(() => {});
    // Check upfront whether this account has already used its free run, so
    // the popup can appear immediately on click instead of only after a
    // failed job-creation round trip.
    Promise.all([fetchMe(), api.publicConfig()])
      .then(([{ user }, config]) => {
        setGumroadUrl(config.gumroadUrl || '');
        setFreeRunUsed(Boolean(config.demoMode) && Boolean(user.freeRunUsed));
      })
      .catch(() => {});
  }, []);

  const combos = keywords.length * cities.length;
  const aiCreds = getAiCreds();
  const hasAiKey = Boolean(aiCreds?.apiKey);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (keywords.length === 0 || cities.length === 0) {
      setError('Add at least one business type and one city/location.');
      return;
    }
    if (!hasAiKey) {
      setError('Add your LLM provider and API key in Settings before starting a run.');
      return;
    }
    if (freeRunUsed) {
      setUpsellMessage(DEFAULT_UPSELL_MESSAGE);
      setShowUpsell(true);
      return;
    }
    setSubmitting(true);
    try {
      const clampedTarget = Math.min(target, MAX_LEADS_PER_RUN);
      const { job } = await api.createJob({ name, keywords, cities, target: clampedTarget });
      navigate(`/jobs/${job._id}`);
    } catch (err) {
      if (err.status === 403 && err.body?.upsell) {
        // Falls back to this if server state was ahead of what we fetched
        // on mount (e.g. free run used in another tab a moment ago).
        setFreeRunUsed(true);
        setUpsellMessage(err.body.upsell.message || DEFAULT_UPSELL_MESSAGE);
        if (err.body.upsell.gumroadUrl) setGumroadUrl(err.body.upsell.gumroadUrl);
        setShowUpsell(true);
      } else {
        setError(err.message);
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="page-head">
        <div>
          <h1>Start a new run</h1>
          <p>Discover, crawl and verify leads for any business type in any city — no code changes needed.</p>
        </div>
      </div>

      {!hasAiKey && (
        <div className="error-banner mb-4">
          You haven't added an LLM API key yet.{' '}
          <Link to="/settings" className="underline">
            Add one in Settings
          </Link>{' '}
          — it's required to run the AI verification step, and your key is only ever used for your own run.
        </div>
      )}

      {freeRunUsed && (
        <div className="info-banner">
          <span className="mt-0.5 shrink-0 text-amber">🔒</span>
          <span>
            You've already used your free run on this account. Get the full source code to run unlimited
            enrichments on your own server —{' '}
            <button type="button" className="underline" onClick={() => setShowUpsell(true)}>
              see purchase options
            </button>
            .
          </span>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <Modal open={showUpsell} onClose={() => setShowUpsell(false)}>
        <p className="mb-1 text-[15px] font-semibold text-ink">One free trial per account</p>
        <p className="mb-4 text-[13.5px] leading-relaxed text-inkDim">{upsellMessage}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {gumroadUrl ? (
            <a href={gumroadUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              Get full access on Gumroad →
            </a>
          ) : (
            <p className="text-[12.5px] text-inkFaint">Purchase link coming soon — check back shortly.</p>
          )}
          <button type="button" className="btn btn-sm" onClick={() => setShowUpsell(false)}>
            Close
          </button>
        </div>
      </Modal>

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.1fr_0.9fr]">
        <form className="panel" onSubmit={handleSubmit}>
          <p className="panel-title">Run parameters</p>

          <div className="field-group">
            <label className="field-label">Business type / keywords</label>
            <TagInput
              value={keywords}
              onChange={setKeywords}
              placeholder="e.g. yoga studio, immigration lawyer, dental clinic…"
            />
            <p className="field-hint">Press Enter or comma to add. Every keyword is combined with every city below.</p>
            {suggestions.exampleKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.exampleKeywords.slice(0, 6).map((k) => (
                  <button
                    type="button"
                    className="chip"
                    key={k}
                    onClick={() => !keywords.includes(k) && setKeywords([...keywords, k])}
                  >
                    + {k}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Cities / locations</label>
            <TagInput value={cities} onChange={setCities} placeholder="e.g. Pune, Jaipur, Nagpur…" />
            {suggestions.exampleCities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.exampleCities.slice(0, 8).map((c) => (
                  <button
                    type="button"
                    className="chip"
                    key={c}
                    onClick={() => !cities.includes(c) && setCities([...cities, c])}
                  >
                    + {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Target new leads</label>
            <input
              type="number"
              min="1"
              max={MAX_LEADS_PER_RUN}
              value={target}
              onChange={(e) => setTarget(Math.min(Number(e.target.value), MAX_LEADS_PER_RUN))}
              className="field-control max-w-[160px]"
            />
            <p className="field-hint">
              The run stops discovering once this many new leads have been found. Capped at {MAX_LEADS_PER_RUN} per run.
            </p>
          </div>

          <div className="field-group">
            <label className="field-label">Run name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Auto-generated from your keywords + cities if left blank"
              className="field-control"
            />
          </div>

          <button className="btn btn-primary w-full sm:w-auto" type="submit" disabled={submitting || !hasAiKey}>
            {submitting ? 'Starting…' : 'Start run →'}
          </button>
        </form>

        <div className="panel">
          <p className="panel-title">What happens next</p>
          <div className="text-[13.5px] leading-relaxed text-inkDim">
            <p className="mb-3">
              <strong className="text-ink">1. Discover</strong> — searches the web for businesses matching each
              keyword × city combination.
            </p>
            <p className="mb-3">
              <strong className="text-ink">2. Enrich</strong> — crawls each business website to extract contacts,
              emails, phone and address.
            </p>
            <p className="mb-0">
              <strong className="text-ink">3. Verify</strong> — runs every resolved email through the 12-check
              self-hosted verification engine.
            </p>
            {combos > 0 && (
              <div className="stat-row mt-[18px]">
                <div className="stat">
                  <div className="stat-value">{combos}</div>
                  <div className="stat-label">Search combos</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{target}</div>
                  <div className="stat-label">Lead target</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
