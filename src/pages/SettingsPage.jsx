import { useEffect, useState } from 'react';
import { getAiCreds, setAiCreds, clearAiCreds } from '../auth.js';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
  { id: 'groq', label: 'Groq', placeholder: 'gsk_...' },
  { id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-...' },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', placeholder: 'your API key' },
];

export default function SettingsPage() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [model, setModel] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getAiCreds();
    if (existing) {
      setProvider(existing.provider || 'openai');
      setApiKey(existing.apiKey || '');
      setBaseURL(existing.baseURL || '');
      setModel(existing.model || '');
    }
  }, []);

  const selected = PROVIDERS.find((p) => p.id === provider);
  const isCustom = provider === 'custom';

  function handleSave(e) {
    e.preventDefault();
    setAiCreds({ provider, apiKey: apiKey.trim(), baseURL: baseURL.trim(), model: model.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    clearAiCreds();
    setApiKey('');
    setBaseURL('');
    setModel('');
  }

  return (
    <div className="animate-fade-in-up">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>
            Bring your own LLM key. Your key is used to run the AI verification step for your enrichment
            run, then discarded — it's never saved on our server or in our database.
          </p>
        </div>
      </div>

      <form className="panel max-w-[560px]" onSubmit={handleSave}>
        <p className="panel-title">LLM provider</p>

        <div className="field-group">
          <label className="field-label">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none focus:border-amber-dim"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label">API key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selected?.placeholder}
            className="w-full rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-inkFaint focus:border-amber-dim"
          />
          <p className="field-hint">Stored only in this browser (localStorage). Never sent anywhere except attached to your own job run.</p>
        </div>

        {isCustom && (
          <>
            <div className="field-group">
              <label className="field-label">Base URL</label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://your-endpoint.example.com/v1"
                className="w-full rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-inkFaint focus:border-amber-dim"
              />
              <p className="field-hint">Must speak the OpenAI /chat/completions wire format.</p>
            </div>
            <div className="field-group">
              <label className="field-label">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. llama-3.1-70b-instruct"
                className="w-full rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-inkFaint focus:border-amber-dim"
              />
            </div>
          </>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md border-none bg-amber px-3.5 py-2.5 text-[13.5px] font-semibold text-[#07111f] transition-all duration-150 hover:bg-amber-dim disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!apiKey.trim() || (isCustom && (!baseURL.trim() || !model.trim()))}
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-line bg-transparent px-3.5 py-2.5 text-[13.5px] text-inkDim transition-colors duration-150 hover:border-amber-dim hover:text-ink"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
