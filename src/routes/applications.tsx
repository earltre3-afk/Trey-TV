import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowLeft, Crown, Clock, CheckCircle2, XCircle, AlertCircle, FileEdit,
  ChevronRight, Shield, Search, Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
  head: () => ({
    meta: [{ title: "My Applications — Trey TV" }],
  }),
});

type AppStatus = "draft" | "pending" | "approved" | "rejected" | "needs_more_info";

type Application = {
  id: string;
  application_type: "creator" | "verification";
  status: AppStatus;
  creator_name: string | null;
  channel_name: string | null;
  niche: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string | null;
  verification_data?: {
    display_name?: string;
    profile_title?: string;
    applying_as?: string;
  } | null;
};

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AppStatus, {
  label: string; color: string; bg: string; border: string;
  icon: typeof Clock; borderCard: string;
}> = {
  draft: {
    label: "Draft", color: "text-muted-foreground", bg: "bg-white/5",
    border: "border-white/20", icon: FileEdit, borderCard: "border-white/10",
  },
  pending: {
    label: "Under Review", color: "text-[oklch(0.82_0.15_215)]",
    bg: "bg-[oklch(0.82_0.15_215_/_0.1)]", border: "border-[oklch(0.82_0.15_215_/_0.5)]",
    icon: Clock, borderCard: "border-[oklch(0.82_0.15_215_/_0.3)]",
  },
  approved: {
    label: "Approved", color: "text-primary", bg: "bg-primary/10",
    border: "border-primary/50", icon: CheckCircle2, borderCard: "border-primary/30",
  },
  rejected: {
    label: "Not Approved", color: "text-[oklch(0.65_0.24_15)]",
    bg: "bg-[oklch(0.65_0.24_15_/_0.1)]", border: "border-[oklch(0.65_0.24_15_/_0.5)]",
    icon: XCircle, borderCard: "border-[oklch(0.65_0.24_15_/_0.25)]",
  },
  needs_more_info: {
    label: "More Info Needed", color: "text-[oklch(0.9_0.18_85)]",
    bg: "bg-[oklch(0.82_0.16_85_/_0.1)]", border: "border-[oklch(0.82_0.16_85_/_0.5)]",
    icon: AlertCircle, borderCard: "border-[oklch(0.82_0.16_85_/_0.3)]",
  },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      <Icon className="size-3" /> {cfg.label.toUpperCase()}
    </span>
  );
}

// ── Verification timeline ──────────────────────────────────────────────────────

const VERIF_TIMELINE: { key: AppStatus | "submitted"; label: string; Icon: typeof Clock }[] = [
  { key: "submitted", label: "Submitted", Icon: FileEdit },
  { key: "pending", label: "Under Review", Icon: Search },
  { key: "needs_more_info", label: "More Info\nNeeded", Icon: Info },
  { key: "approved", label: "Approved", Icon: Shield },
  { key: "rejected", label: "Denied", Icon: XCircle },
];

const STATUS_TIMELINE_INDEX: Record<string, number> = {
  pending: 1, needs_more_info: 2, approved: 3, rejected: 4,
};

function VerificationStatusTimeline({ status }: { status: AppStatus }) {
  const activeIdx = STATUS_TIMELINE_INDEX[status] ?? 0;

  return (
    <div className="flex items-start pt-2">
      {VERIF_TIMELINE.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        return (
          <div key={s.key} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`size-11 rounded-full border-2 grid place-items-center transition-all ${
                  isActive
                    ? "border-primary bg-primary/20 shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.7)]"
                    : isDone
                    ? "border-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.2)]"
                    : "border-white/15 bg-white/5"
                }`}
              >
                <s.Icon
                  className={`size-4 ${isActive ? "text-primary" : isDone ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"}`}
                />
              </div>
              <p
                className={`text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-medium ${
                  isActive ? "text-primary" : isDone ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </p>
            </div>
            {i < VERIF_TIMELINE.length - 1 && (
              <div
                className="h-px w-3 mt-5 shrink-0"
                style={{ background: isDone ? "oklch(0.82 0.15 215)" : "oklch(1 0 0 / 0.1)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Verification application card ─────────────────────────────────────────────

function VerificationCard({ app, userAvatar, userName, userHandle }: {
  app: Application; userAvatar: string; userName: string; userHandle: string;
}) {
  const navigate = useNavigate();
  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
  const vData = app.verification_data;
  const displayName = vData?.display_name || userName;
  const handle = displayName ? `@${displayName.toLowerCase().replace(/\s+/g, "")}` : `@${userHandle}`;
  const profession = vData?.profile_title || vData?.applying_as || "";
  const submittedDate = new Date(app.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const updatedDate = app.updated_at
    ? new Date(app.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : submittedDate;

  return (
    <div
      className="rounded-3xl overflow-hidden border"
      style={{
        borderColor: "oklch(0.82 0.16 85 / 0.35)",
        background: "radial-gradient(ellipse 100% 60% at 50% 0%, oklch(0.18 0.07 85 / 0.4) 0%, oklch(0.10 0.03 85 / 0.8) 100%)",
      }}
    >
      {/* Logo header */}
      <div className="flex justify-center pt-5 pb-3">
        <Logo className="h-10 drop-shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.7)]" />
      </div>

      {/* Title */}
      <div className="text-center pb-4 px-5">
        <h2 className="text-lg font-extrabold">
          Verification{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[oklch(0.92_0.18_85)] to-primary">
            Request Status
          </span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Track your verification request.</p>
      </div>

      <div className="px-4 pb-5 space-y-3">
        {/* Profile card */}
        <div className="rounded-2xl border border-[oklch(0.82_0.16_85_/_0.4)] bg-[oklch(0.10_0.04_85_/_0.6)] p-3 flex items-center gap-3">
          <div className="relative shrink-0">
            <img src={userAvatar} alt="" className="size-14 rounded-full object-cover border-2 border-primary shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.5)]" />
            <div className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-primary border-2 border-[#02050B] grid place-items-center">
              <Shield className="size-2.5 text-black" strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground">{handle}</div>
            {profession && <div className="text-xs text-primary mt-0.5">{profession}</div>}
          </div>
        </div>

        {/* Status card */}
        <div className="rounded-2xl border border-[oklch(0.82_0.16_85_/_0.3)] bg-[oklch(0.10_0.04_85_/_0.5)] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-2xl border border-primary/40 bg-primary/15 grid place-items-center shrink-0">
              <FileEdit className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold">
                Current Status:{" "}
                <span className="text-primary">{STATUS_CFG[app.status]?.label ?? "Submitted"}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                <span>📅</span> Submitted on {submittedDate}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                <Clock className="size-3" /> Last updated {updatedDate}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />
          <VerificationStatusTimeline status={app.status} />
        </div>

        {/* Admin notes */}
        {app.review_notes && (
          <div className={`rounded-2xl border p-3 ${cfg.bg} ${cfg.borderCard}`}>
            <div className="text-xs text-muted-foreground mb-1">From our review team:</div>
            <p className={`text-xs italic leading-relaxed ${cfg.color}`}>"{app.review_notes}"</p>
          </div>
        )}

        {/* Action buttons */}
        {(app.status === "draft" || app.status === "needs_more_info") && (
          <Link
            to="/apply/go-verification"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-black"
            style={{ background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))", boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)" }}
          >
            <FileEdit className="size-4" />
            {app.status === "draft" ? "Continue Application" : "Update & Resubmit"}
          </Link>
        )}
        {app.status === "approved" && (
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))", boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)" }}
          >
            <Shield className="size-4 text-black" />
            <span className="text-black">Back to Trey TV</span>
          </button>
        )}
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm border border-[oklch(0.82_0.15_215_/_0.4)] text-foreground flex items-center justify-center gap-2"
          style={{ background: "oklch(0.15 0.06 215 / 0.5)" }}
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </button>
      </div>
    </div>
  );
}

// ── Creator application card ───────────────────────────────────────────────────

function CreatorCard({ app }: { app: Application }) {
  const navigate = useNavigate();
  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
  const title = app.channel_name || app.creator_name || "Creator Application";
  const sub = app.niche ? `Creator · ${app.niche}` : "Creator Application";
  const date = new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`rounded-3xl liquid-glass border ${cfg.borderCard} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className={`size-11 rounded-2xl ${cfg.bg} border ${cfg.border} grid place-items-center shrink-0`}>
          <Crown className={`size-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-base truncate">{title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </div>
            <StatusBadge status={app.status} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">Submitted {date}</div>
        </div>
      </div>

      {app.status === "pending" && (
        <div className="rounded-2xl bg-[oklch(0.82_0.15_215_/_0.08)] border border-[oklch(0.82_0.15_215_/_0.2)] p-3">
          <p className="text-xs text-[oklch(0.82_0.15_215)] leading-relaxed">
            Your application is in the queue. Our team reviews within 3–5 business days and will notify you by email and in-app.
          </p>
        </div>
      )}
      {app.status === "approved" && (
        <div className="rounded-2xl bg-primary/8 border border-primary/20 p-3">
          <p className="text-xs text-primary font-medium leading-relaxed">
            🎉 Congratulations! Your creator application has been approved. Welcome to the creator family.
          </p>
        </div>
      )}
      {(app.status === "rejected" || app.status === "needs_more_info") && app.review_notes && (
        <div className={`rounded-2xl ${cfg.bg} border ${cfg.borderCard} p-3`}>
          <div className="text-xs text-muted-foreground mb-1">Feedback from our team:</div>
          <p className={`text-xs italic leading-relaxed ${cfg.color}`}>"{app.review_notes}"</p>
        </div>
      )}

      <div className="flex gap-2">
        {(app.status === "draft" || app.status === "needs_more_info") && (
          <Link to="/apply/content-creator" className="flex-1 py-2.5 rounded-2xl bg-primary/15 border border-primary/40 text-primary text-xs font-bold text-center hover:bg-primary/25 transition flex items-center justify-center gap-1.5">
            <FileEdit className="size-3.5" />
            {app.status === "draft" ? "Continue Application" : "Update & Resubmit"}
          </Link>
        )}
        {app.status === "approved" && (
          <Link to="/creator-hub" className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold text-center glow-gold hover-scale flex items-center justify-center gap-1.5">
            <Crown className="size-3.5" /> Go to Creator Hub
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ApplicationsPage() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/applications"); } catch {}
      navigate({ to: "/login" });
    }
  }, [isGuest, navigate]);

  const { data: apps = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("creator_applications")
        .select("id, application_type, status, creator_name, channel_name, niche, review_notes, created_at, updated_at, verification_data")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
    enabled: !isGuest,
  });

  if (isGuest) return null;

  const userAvatar = user?.avatar ?? "";
  const userName = user?.name ?? "";
  const userHandle = user?.handle ?? "";

  return (
    <div className="min-h-screen bg-[#02050B] flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5 sticky top-0 z-30 bg-[#02050B]/90 backdrop-blur-md">
        <button
          onClick={() => navigate({ to: "/" })}
          className="size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-foreground transition"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold">My Applications</h1>
        <Link to="/apply" className="size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-primary transition" title="New application">
          <ChevronRight className="size-4" />
        </Link>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Shield className="size-8 animate-pulse" />
            <p className="text-sm">Loading applications…</p>
          </div>
        )}

        {!isLoading && apps.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="size-20 rounded-full bg-white/5 border border-white/10 grid place-items-center">
              <Crown className="size-9 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">No Applications Yet</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Ready to share your voice with the world? Apply to create or request gold verification.
              </p>
            </div>
            <Link
              to="/apply"
              className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-black font-bold text-sm"
              style={{ background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))", boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)" }}
            >
              <Crown className="size-4" /> Start an Application
            </Link>
          </div>
        )}

        {!isLoading && apps.map((app) =>
          app.application_type === "verification" ? (
            <VerificationCard key={app.id} app={app} userAvatar={userAvatar} userName={userName} userHandle={userHandle} />
          ) : (
            <CreatorCard key={app.id} app={app} />
          )
        )}
      </div>
    </div>
  );
}
