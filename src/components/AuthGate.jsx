import { useState, useEffect, useRef } from 'react';
import { getToken, setToken, fetchMe, login, signup, verifyOtp, resendOtp } from '../auth.js';

/**
 * Gates the whole dashboard. Flow:
 *   signup -> OTP screen -> verify-otp -> logged in
 *   login (unverified account) -> OTP screen (server auto-resends) -> logged in
 *   login (verified account) -> logged in directly
 */
export default function AuthGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP screen state
  const [pendingEmail, setPendingEmail] = useState(''); // non-empty => show OTP screen
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    const existing = getToken();
    if (!existing) {
      setChecking(false);
      return;
    }
    fetchMe()
      .then(() => setAuthed(true))
      .catch(() => setToken(''))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    cooldownRef.current = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [resendCooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(email.trim(), password);
        setPendingEmail(email.trim());
        setResendCooldown(45);
      } else {
        const { token } = await login(email.trim(), password);
        setToken(token);
        setAuthed(true);
      }
    } catch (err) {
      if (err.body?.pendingVerification) {
        // Login with correct password but unverified email — server
        // already sent a fresh OTP, just show the same screen.
        setPendingEmail(err.body.email || email.trim());
        setResendCooldown(45);
      } else {
        setError(err.message || 'Could not reach the API server.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setOtpError('');
    setOtpSubmitting(true);
    try {
      const { token } = await verifyOtp(pendingEmail, otp.trim());
      setToken(token);
      setAuthed(true);
    } catch (err) {
      setOtpError(err.message || 'Could not verify that code.');
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtpError('');
    try {
      await resendOtp(pendingEmail);
      setResendCooldown(45);
    } catch (err) {
      setOtpError(err.message || 'Could not resend the code.');
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

  const Logo = (
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
  );

  // ── OTP verification screen ──────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <form
          className="flex w-full max-w-[360px] animate-fade-in-up flex-col gap-1.5 rounded-lg border border-line bg-panel p-6 sm:p-7"
          onSubmit={handleVerifyOtp}
        >
          {Logo}
          <p className="mb-1 text-[13.5px] leading-relaxed text-inkDim">
            We sent a 6-digit code to <span className="text-ink">{pendingEmail}</span>. Enter it below to
            verify your account.
          </p>

          <label className="mb-1 mt-2 font-mono text-[11.5px] uppercase tracking-wide text-inkDim" htmlFor="otp">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="mb-1 rounded-md border border-line bg-field px-3 py-2.5 text-center font-mono text-lg tracking-[0.4em] text-ink outline-none transition-colors duration-150 placeholder:text-inkFaint focus:border-amber-dim"
          />

          {otpError && <div className="my-1 text-[12.5px] text-rust">{otpError}</div>}

          <button
            type="submit"
            className="mt-3 rounded-md border-none bg-amber px-3.5 py-2.5 text-[13.5px] font-semibold text-[#07111f] transition-all duration-150 enabled:hover:bg-amber-dim disabled:cursor-not-allowed disabled:opacity-50"
            disabled={otpSubmitting || otp.length !== 6}
          >
            {otpSubmitting ? 'Verifying…' : 'Verify & continue'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="mt-2 text-[12.5px] text-inkFaint underline decoration-dotted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingEmail('');
              setOtp('');
              setOtpError('');
            }}
            className="mt-1 text-[12px] text-inkFaint"
          >
            ← Use a different email
          </button>
        </form>
      </div>
    );
  }

  // ── Login / signup screen ────────────────────────────────────────────
  return (
    <div className="flex h-full items-center justify-center p-6">
      <form
        className="flex w-full max-w-[360px] animate-fade-in-up flex-col gap-1.5 rounded-lg border border-line bg-panel p-6 sm:p-7"
        onSubmit={handleSubmit}
      >
        {Logo}

        <div className="mb-3 flex gap-1 rounded-md bg-field p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-[5px] py-1.5 text-[12.5px] font-semibold transition-colors ${
              mode === 'login' ? 'bg-panelRaised text-ink' : 'text-inkFaint'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-[5px] py-1.5 text-[12.5px] font-semibold transition-colors ${
              mode === 'signup' ? 'bg-panelRaised text-ink' : 'text-inkFaint'
            }`}
          >
            Sign up
          </button>
        </div>

        <label className="mb-1 font-mono text-[11.5px] uppercase tracking-wide text-inkDim" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-2 rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors duration-150 placeholder:text-inkFaint focus:border-amber-dim"
        />

        <label className="mb-1 font-mono text-[11.5px] uppercase tracking-wide text-inkDim" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
          className="mb-1 rounded-md border border-line bg-field px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors duration-150 placeholder:text-inkFaint focus:border-amber-dim"
        />

        {error && <div className="my-1 text-[12.5px] text-rust">{error}</div>}

        <button
          type="submit"
          className="mt-3 rounded-md border-none bg-amber px-3.5 py-2.5 text-[13.5px] font-semibold text-[#07111f] transition-all duration-150 enabled:hover:bg-amber-dim enabled:hover:shadow-[0_4px_18px_rgba(57,255,90,0.3)] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting || !email.trim() || !password}
        >
          {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>

        {mode === 'signup' && (
          <p className="mt-3.5 text-[11.5px] leading-relaxed text-inkFaint">
            We'll email you a 6-digit code to verify your address. New accounts get one free enrichment
            run; after that you'll be pointed to buy the full source code and self-host it.
          </p>
        )}
      </form>
    </div>
  );
}
