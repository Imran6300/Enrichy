import { useEffect, useRef } from 'react';

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour12: false });
}

const LEVEL_CLASSES = {
  success: 'text-teal',
  error: 'text-rust',
  info: 'text-ink',
};

export default function LogFeed({ lines, live }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines.length]);

  return (
    <div
      ref={ref}
      className="flex h-[260px] flex-col gap-1.5 overflow-y-auto rounded-md border border-lineSoft bg-field px-3.5 py-3 font-mono text-xs [-webkit-overflow-scrolling:touch] sm:h-[340px]"
    >
      {lines.length === 0 && <div className="flex gap-2.5 leading-relaxed text-inkFaint">Waiting for activity…</div>}
      {lines.map((l, i) => (
        <div
          className={`flex flex-wrap items-baseline gap-2.5 leading-relaxed text-inkDim ${LEVEL_CLASSES[l.level] || ''}`}
          key={i}
        >
          <span className="shrink-0 text-inkFaint">{fmtTime(l.ts)}</span>
          <span className="break-all">{l.message}</span>
        </div>
      ))}
      {live && (
        <div className="flex items-baseline gap-2.5">
          <span className="shrink-0 text-inkFaint">{fmtTime(Date.now())}</span>
          <span className="inline-block h-3 w-[7px] animate-blink bg-amber" />
        </div>
      )}
    </div>
  );
}
