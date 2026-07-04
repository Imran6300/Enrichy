import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagInput from '../components/TagInput.jsx';
import { api } from '../api.js';

export default function NewJobPage() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState([]);
  const [cities, setCities] = useState([]);
  const [target, setTarget] = useState(100);
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState({ exampleKeywords: [], exampleCities: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.suggestions().then(setSuggestions).catch(() => {});
  }, []);

  const combos = keywords.length * cities.length;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (keywords.length === 0 || cities.length === 0) {
      setError('Add at least one business type and one city/location.');
      return;
    }
    setSubmitting(true);
    try {
      const { job } = await api.createJob({ name, keywords, cities, target });
      navigate(`/jobs/${job._id}`);
    } catch (err) {
      setError(err.message);
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

      {error && <div className="error-banner">{error}</div>}

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
              max="2000"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="field-control max-w-[160px]"
            />
            <p className="field-hint">The run stops discovering once this many new leads have been found.</p>
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

          <button className="btn btn-primary w-full sm:w-auto" type="submit" disabled={submitting}>
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
