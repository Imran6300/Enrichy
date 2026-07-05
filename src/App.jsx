import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import NewJobPage from './pages/NewJobPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import { clearAuth } from './auth.js';
import { resetSocket } from './socket.js';

function handleLogout() {
  resetSocket();
  clearAuth();
  window.location.reload();
}

function NavItem({ to, icon, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-[13.5px] font-medium no-underline transition-colors duration-150 ${
          isActive ? 'bg-panelRaised text-amber' : 'text-inkDim hover:bg-panelRaised hover:text-ink'
        }`
      }
    >
      <span className="w-4 text-center font-mono text-xs opacity-80">{icon}</span>
      {label}
    </NavLink>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="h-8 w-8 shrink-0 animate-brand-glow overflow-hidden rounded-lg">
        <img src="/logo.png" alt="Enrichly" className="block h-full w-full object-cover" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="bg-brand-title bg-clip-text text-[14.5px] font-bold tracking-tight text-transparent">
          Enrichly
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-inkFaint xs:inline">
          Console v2
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile nav drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[236px_1fr]">
      <aside className="sticky top-0 z-30 flex flex-col border-b border-lineSoft bg-panel lg:static lg:border-b-0 lg:border-r">
        {/* This inner wrapper is what actually sticks/scrolls with the
            viewport. The OUTER <aside> is left unconstrained in height on
            desktop so it naturally stretches to match the main column's
            height (CSS Grid's default row-stretch behavior) — that's what
            makes its dark background cover the entire sidebar column, even
            on pages taller than one screen. Without this split, a fixed
            h-screen on the aside itself left a gap below it that leaked the
            page's background glow through as you scrolled past one
            viewport-height of content. */}
        <div className="flex flex-col lg:sticky lg:top-0 lg:h-screen lg:gap-7 lg:overflow-y-auto lg:px-4 lg:py-[22px]">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 lg:px-2 lg:py-0">
          <Brand />

          <button
            type="button"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border border-line bg-panelRaised text-inkDim transition-all duration-150 hover:border-amber-dim hover:text-amber active:scale-90 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[17px] w-[17px]">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[17px] w-[17px]">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu: an absolutely-positioned dropdown anchored below the
            header. It floats OVER the page instead of pushing main content
            down, which is the standard mobile nav pattern and avoids any
            ambiguity between "push" and "overlap" behavior. A backdrop
            behind it makes the overlay obvious and closes the menu on tap.
            On desktop (lg+) it becomes a normal static column again. */}
        {menuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 bg-base/60 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <div
          className={`absolute left-0 right-0 top-full z-20 overflow-hidden border-b border-lineSoft bg-panel shadow-[0_20px_30px_-12px_rgba(0,0,0,0.55)] transition-[max-height] duration-300 ease-out lg:static lg:flex lg:flex-1 lg:flex-col lg:overflow-visible lg:border-b-0 lg:shadow-none ${
            menuOpen ? 'max-h-[480px]' : 'max-h-0 lg:max-h-none'
          }`}
        >
          <nav className="flex flex-col gap-0.5 px-3.5 pb-1 pt-2.5 lg:px-0 lg:pt-0">
            <NavItem to="/" end icon="+" label="New run" onNavigate={() => setMenuOpen(false)} />
            <NavItem to="/jobs" icon="≡" label="Runs" onNavigate={() => setMenuOpen(false)} />
            <NavItem to="/leads" icon="◎" label="Leads" onNavigate={() => setMenuOpen(false)} />
          </nav>

          <div className="mt-0 px-5 py-2.5 font-mono text-[10.5px] leading-relaxed text-inkFaint lg:mt-auto lg:px-2 lg:py-0">
            Self-hosted discovery, enrichment
            <br />
            &amp; verification engine.
            <br />
            No third-party API keys required.
            <br />
            <button
              type="button"
              className="mt-2.5 rounded-md border border-line bg-transparent px-2.5 py-[5px] font-mono text-[11px] text-inkDim transition-colors duration-150 hover:border-amber-dim hover:text-ink"
              onClick={handleLogout}
            >
              Lock dashboard
            </button>
          </div>
        </div>
        </div>
      </aside>

      <main className="min-w-0 w-full max-w-[1180px] px-4 py-6 pb-12 sm:px-6 lg:px-10 lg:py-[30px] lg:pb-[60px]">
        <Routes>
          <Route path="/" element={<NewJobPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
