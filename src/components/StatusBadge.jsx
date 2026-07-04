const LIVE = ['discovering', 'enriching', 'verifying', 'stopping'];
const OK = ['completed'];
const BAD = ['failed'];

const LABELS = {
  queued: 'Queued',
  discovering: 'Discovering',
  enriching: 'Enriching',
  verifying: 'Verifying',
  completed: 'Completed',
  failed: 'Failed',
  stopping: 'Stopping',
  stopped: 'Stopped',
};

const VARIANTS = {
  live: 'text-amber border-amber-dim',
  ok: 'text-teal border-teal-dim',
  bad: 'text-rust border-rust-dim',
  idle: 'text-inkFaint border-line',
};

export default function StatusBadge({ status }) {
  const variant = LIVE.includes(status) ? 'live' : OK.includes(status) ? 'ok' : BAD.includes(status) ? 'bad' : 'idle';
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] font-mono text-[11px] uppercase tracking-wide ${VARIANTS[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${variant === 'live' ? 'animate-pulse-badge' : ''}`} />
      {LABELS[status] || status}
    </span>
  );
}
