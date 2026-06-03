import React, { useState } from "react";
import {
  Settings,
  Mail,
  Trash2,
  Info,
  ExternalLink,
  Heart,
  LogIn,
  LogOut,
  User,
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TreyTVLogo } from "../TreyTVLogo";

interface Props {
  onResetAll: () => void;
  onOpenReread?: () => void;
  hasActiveBranch?: boolean;
}

export const SettingsScreen: React.FC<Props> = ({ onResetAll, onOpenReread, hasActiveBranch }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const { user, signOut, isGuest } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("https://famous.ai/api/crm/6a06024d0a5bc44cc4e4a2bd/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "switch-kicks-newsletter",
          tags: ["newsletter", "switch-kicks", "trey-tv"],
        }),
      });
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen px-5 pt-10 pb-24">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em]">Preferences</span>
            </div>
            <h1 className="mt-1 font-display text-4xl font-black text-white">Settings</h1>
          </div>
          <TreyTVLogo size={32} />
        </div>
      </header>

      {/* Account */}
      <section className="mb-6">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">Account</h3>
        {user ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white">
                {(user.name || user.handle || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-display text-sm font-bold text-white">
                  {user.name || "Trey TV reader"}
                </div>
                <div className="text-xs text-white/50">@{user.handle}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => {}}
            className="flex w-full items-center justify-between rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 p-4 text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-violet-300">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isGuest ? "Playing as Guest" : "Sign in to save"}
                </span>
              </div>
              <div className="mt-0.5 font-display text-base font-bold text-white">
                Sync your story across devices
              </div>
              <div className="text-xs text-white/55">
                Keep every branch, choice, and ending safe in your Trey TV account.
              </div>
            </div>
            <div className="rounded-full bg-violet-600 p-2.5 text-white shadow-lg shadow-violet-500/30">
              <LogIn className="h-4 w-4" />
            </div>
          </button>
        )}
      </section>

      {/* Re-read */}
      {onOpenReread && (
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">
            Your Story
          </h3>
          <button
            onClick={onOpenReread}
            disabled={!hasActiveBranch}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <span className="flex items-center gap-2 text-white">
              <Layers className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">Re-read Chapters</span>
            </span>
            <span className="text-xs text-white/40">
              {hasActiveBranch ? "View archive" : "No branch yet"}
            </span>
          </button>
        </section>
      )}

      {/* Newsletter */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-2 text-violet-300">
          <Mail className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Stay In The Loop</span>
        </div>
        <h2 className="mt-1 font-display text-xl font-bold text-white">Get new stories first</h2>
        <p className="mt-1 text-sm text-white/60">
          We're cooking up more interactive worlds for Trey TV. Drop your email.
        </p>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@treytv.com"
            className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30"
          >
            Subscribe
          </button>
        </form>
        {status === "sent" && <p className="mt-2 text-xs text-emerald-400">You're on the list.</p>}
        {status === "error" && (
          <p className="mt-2 text-xs text-red-400">Something went wrong. Try again.</p>
        )}
      </section>

      <section className="mb-6 space-y-2">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">About</h3>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white">
            <Info className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium">Switch Kicks v1.0</span>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Story by Trey Trizzy. Built for Trey TV. Powered by AI — every chapter is generated
            based on your choices.
          </p>
        </div>
        <a
          href="https://treytv.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" /> Visit Trey TV
          </span>
          <ExternalLink className="h-4 w-4 text-white/40" />
        </a>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">
          Danger Zone
        </h3>
        <button
          onClick={() => {
            if (confirm("Delete ALL branches and endings? This cannot be undone.")) onResetAll();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" /> Reset All Progress
        </button>
      </section>

      <p className="mt-8 text-center text-xs text-white/30">
        Made with intention. Stories you don't just read — you live.
      </p>
    </div>
  );
};
