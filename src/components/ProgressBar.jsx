export default function ProgressBar({ value = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full border border-lineSoft bg-field">
      <div
        className="relative h-full overflow-hidden bg-progress-fill transition-[width] duration-[400ms] ease-out after:absolute after:inset-0 after:animate-shimmer after:bg-shimmer after:content-['']"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
