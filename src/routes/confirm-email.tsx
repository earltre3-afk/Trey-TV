import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { Mail, Sparkles, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/confirm-email")({
  component: ConfirmEmail,
  validateSearch: z.object({ email: z.string().optional() }).parse,
  head: () => ({
    meta: [
      { title: "Confirm Your Email — Trey TV" },
      { name: "description", content: "Check your inbox to confirm your Trey TV account." },
    ],
  }),
});

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 30000;

function ConfirmEmail() {
  const { email } = Route.useSearch();
  const nav = useNavigate();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConfirmation = useCallback(async (): Promise<boolean> => {
    try {
      // Refresh session to pick up any new confirmation
      await supabase.auth.refreshSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        return true;
      }
    } catch {}
    return false;
  }, []);

  const handleConfirmed = useCallback(() => {
    setConfirmed(true);
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => nav({ to: "/onboarding" }), 1200);
  }, [nav]);

  // Auto-poll
  useEffect(() => {
    // Start polling
    pollRef.current = setInterval(async () => {
      const ok = await checkConfirmation();
      if (ok) handleConfirmed();
    }, POLL_INTERVAL_MS);

    // Stop auto-polling after timeout
    timeoutRef.current = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkConfirmation, handleConfirmed]);

  const handleManualCheck = async () => {
    setChecking(true);
    const ok = await checkConfirmation();
    setChecking(false);
    if (ok) {
      handleConfirmed();
    } else {
      toast.error("We haven't received your confirmation yet. Check your inbox and click the link.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is missing. Go back and sign up again.");
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        toast.error("Couldn't resend. If the problem continues, try signing up again.");
      } else {
        toast.success("Confirmation email resent. Check your inbox.");
        // Restart polling
        setTimedOut(false);
        if (pollRef.current) clearInterval(pollRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        pollRef.current = setInterval(async () => {
          const ok = await checkConfirmation();
          if (ok) handleConfirmed();
        }, POLL_INTERVAL_MS);
        timeoutRef.current = setTimeout(() => {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimedOut(true);
        }, POLL_TIMEOUT_MS);
      }
    } finally {
      setResending(false);
    }
  };

  if (confirmed) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <BackdropGlow />
        <div className="relative max-w-sm w-full mx-auto px-6 text-center space-y-5 animate-rise">
          <Logo className="h-12 mx-auto" />
          <div className="rounded-3xl liquid-glass neon-border p-8 space-y-4">
            <div className="size-16 rounded-full border border-green-400/30 bg-green-400/10 flex items-center justify-center mx-auto">
              <CheckCircle className="size-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold">Email confirmed!</h2>
            <p className="text-sm text-muted-foreground">Taking you into Trey TV…</p>
            <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <BackdropGlow />

      <div className="relative max-w-[440px] w-full mx-auto px-4 py-10 text-center space-y-6 animate-rise">
        <Logo className="h-12 mx-auto" />

        <div className="rounded-3xl liquid-glass neon-border p-8 space-y-6">
          {/* Animated icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
            <div className="relative size-24 rounded-full border border-primary/30 bg-[oklch(0.13_0.02_270)] flex items-center justify-center">
              <Mail className="size-10 text-primary" />
              <div className="absolute -top-1 -right-1 size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                <Sparkles className="size-3.5 text-primary-foreground" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.35em] text-primary uppercase">Account Created</p>
            <h2 className="mt-1 text-xl font-bold">Check your inbox</h2>
            {email ? (
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="text-foreground font-medium break-all">{email}</span>.
                Click the link to activate your Trey TV account.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                We sent you a confirmation email. Click the link inside to activate your account.
              </p>
            )}
          </div>

          {/* Pulse indicator */}
          {!timedOut && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              Waiting for confirmation…
            </div>
          )}

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-muted-foreground space-y-1 text-left">
            <p>• Check your spam or junk folder if you don't see it</p>
            <p>• The link expires in 24 hours</p>
            <p>• Opening the link logs you in automatically</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-gold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {checking ? (
                <>
                  <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  I confirmed my email
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full h-10 rounded-xl border border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Resending…" : "Resend confirmation email"}
            </button>

            <button
              type="button"
              onClick={() => nav({ to: "/signup" })}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              <ArrowLeft className="size-3" />
              Back to sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-55 animate-conic-spin" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
