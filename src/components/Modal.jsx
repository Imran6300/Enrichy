import { useEffect } from 'react';

/**
 * Simple centered overlay modal. Fixed positioning so it's always visible
 * regardless of scroll position — unlike an inline banner, which can end
 * up off-screen if the page is scrolled when it appears.
 */
export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in-up items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-lg border border-line bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
