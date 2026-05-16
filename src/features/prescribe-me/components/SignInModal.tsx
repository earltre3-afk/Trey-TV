import React, { useEffect, useState } from 'react';
import { LiquidGlassCard, NeonGlassButton } from './LiquidGlass';
import { Mail, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  message?: string;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
}

const SignInModal: React.FC<Props> = ({ open, onClose, message, sendMagicLink }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setErrMsg('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setStatus('error');
      setErrMsg('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    setErrMsg('');

    const res = await sendMagicLink(trimmed);
    if (res.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setErrMsg(res.error || 'Could not send the link. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
    >
      {/* backdrop */}
      <button
        aria-label="Close sign-in dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-sm">
        <LiquidGlassCard accent="multi">
          <div className="p-6">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-full bg-black/60 border border-fuchsia-400/50 flex items-center justify-center"
              style={{ boxShadow: '0 0 24px rgba(217,70,239,0.45)' }}>
              <Sparkles className="w-7 h-7 text-fuchsia-300" />
            </div>

            <h2
              id="signin-title"
              className="font-serif text-2xl text-center mt-3 leading-tight"
              style={{
                backgroundImage: 'linear-gradient(90deg,#fcd34d,#f0abfc,#c4b5fd)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}
            >
              Sign in to save your prescriptions
            </h2>
            <p className="text-center text-white/70 text-sm mt-2">
              {message || 'Save, favorite, and replay your Trey TV prescriptions on any device.'}
            </p>

            {status === 'sent' ? (
              <div className="mt-5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center mb-3"
                  style={{ boxShadow: '0 0 18px rgba(16,185,129,0.45)' }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="font-serif text-lg text-white">Check your email</div>
                <p className="text-white/65 text-sm mt-1">
                  We sent a magic link to <span className="text-cyan-300">{email}</span>. Tap it to sign in.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 inline-block px-5 py-2.5 rounded-full text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10"
                >
                  Got it
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5">
                <label htmlFor="signin-email" className="text-xs text-white/70 mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" aria-hidden />
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/60 border border-white/15 focus:border-fuchsia-400/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 text-white placeholder:text-white/35 text-sm"
                  />
                </div>

                {status === 'error' && (
                  <div className="mt-2 text-xs text-rose-300">{errMsg}</div>
                )}

                <div className="mt-4">
                  <NeonGlassButton
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full"
                    ariaLabel="Send magic link"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      {status === 'sending' ? 'Sending magic link...' : 'Send magic link'}
                    </span>
                  </NeonGlassButton>
                </div>

                <div className="mt-4 flex items-start gap-2 text-[11px] text-white/55 leading-relaxed">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 mt-0.5 flex-shrink-0" />
                  <span>No passwords. We&rsquo;ll email you a one-tap sign-in link. Your vibe stays private.</span>
                </div>
              </form>
            )}
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};

export default SignInModal;
