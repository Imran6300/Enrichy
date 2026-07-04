import { useState } from 'react';

/**
 * Free-text tag input. This is the piece of UI that makes the pipeline
 * "dynamic" — the user types whatever business type / city they want
 * instead of picking from a hardcoded list.
 */
export default function TagInput({ value, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  function commit(raw) {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) {
      if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(i) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div
      className="flex min-h-[44px] flex-wrap gap-1.5 rounded-md border border-line bg-field p-2 transition-colors duration-150 focus-within:border-amber-dim"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {value.map((v, i) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panelRaised py-1 pl-2.5 pr-1 font-mono text-xs text-ink"
          key={v + i}
        >
          {v}
          <button
            type="button"
            className="p-0.5 text-sm leading-none text-inkFaint transition-colors hover:text-rust"
            onClick={() => remove(i)}
            aria-label={`Remove ${v}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        placeholder={value.length === 0 ? placeholder : ''}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && commit(draft)}
        className="min-w-[120px] flex-1 border-none bg-transparent px-1 py-1.5 text-[13.5px] font-mono text-ink outline-none placeholder:text-inkFaint"
      />
    </div>
  );
}
