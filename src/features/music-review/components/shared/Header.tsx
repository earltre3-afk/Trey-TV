import React, { useState } from "react";
import { ArrowLeft, Bell, Shield, LogOut } from "lucide-react";
import { TreyLogo } from "./Logo";
import { useTreyAuth } from "../../hooks/useTreyAuth";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ showBack, onBack, rightSlot }) => {
  const { user, signInDemo, signOut, toggleAdmin, demoAuthEnabled } = useTreyAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#05070D]/80 backdrop-blur-xl border-b border-[#1a2942]/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 pt-3 pb-3 relative">
          <div className="w-12">
            {showBack ? (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-2xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#F8FAFC] hover:border-[#00B7FF]/60 transition"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            ) : rightSlot ? null : (
              <div className="w-10" />
            )}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <TreyLogo size="md" />
          </div>
          <div className="flex items-center gap-2">
            {rightSlot}
            <button
              className="relative w-10 h-10 rounded-full bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#F8FAFC] hover:border-[#00B7FF]/60 transition"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            {user ? (
              <div className="relative group">
                <button
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${user.isAdmin ? "border-[#FFC857] text-[#FFC857]" : "border-[#00B7FF] text-[#00B7FF]"} bg-[#0B1426]`}
                  aria-label="Account"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B1426] border border-[#1a2942] shadow-xl p-3 hidden group-hover:block z-40">
                  <div className="text-[#F8FAFC] font-semibold truncate">{user.name}</div>
                  <div className="text-xs text-[#94A3B8] truncate">{user.email}</div>
                  <div className="mt-3 flex flex-col gap-2">
                    {demoAuthEnabled && (
                      <button
                        onClick={toggleAdmin}
                        className="flex items-center gap-2 text-xs text-[#00B7FF] hover:text-[#FFC857]"
                      >
                        <Shield size={12} />{" "}
                        {user.isAdmin ? "Disable Admin Mode" : "Enable Admin Mode"}
                      </button>
                    )}
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 text-xs text-[#EF4444]"
                    >
                      <LogOut size={12} /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="px-3 py-2 rounded-2xl border border-[#00B7FF] text-[#00B7FF] text-xs font-semibold hover:bg-[#00B7FF]/10"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </header>

      {showSignIn && (
        <div className="fixed inset-0 z-50 bg-[#05070D]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0B1426] to-[#08111F] border border-[#1a2942] p-6 shadow-[0_0_60px_-10px_rgba(0,183,255,0.4)]">
            <div className="text-center mb-4">
              <TreyLogo size="sm" />
            </div>
            <div className="text-[#FFC857] text-xs tracking-[4px] text-center mb-3">
              SIGN IN TO SUBMIT
            </div>
            {!demoAuthEnabled ? (
              <div className="rounded-2xl border border-[#1a2942] bg-[#05070D]/70 p-4 text-center">
                <div className="text-[#F8FAFC] font-bold">Use your Trey TV account</div>
                <p className="text-[#94A3B8] text-sm mt-2 leading-relaxed">
                  Sign in through Trey TV to submit music, comment, and receive your review report.
                  This import-safe module does not create demo accounts in production.
                </p>
              </div>
            ) : (
              <>
                <input
                  className="w-full mb-3 px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#00B7FF] outline-none"
                  placeholder="Artist name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full mb-4 px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#00B7FF] outline-none"
                  placeholder="Email (for your review)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  disabled={!name || !email}
                  onClick={() => {
                    signInDemo(name, email, false);
                    setShowSignIn(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider disabled:opacity-40"
                >
                  CONTINUE
                </button>
                <button
                  onClick={() => {
                    signInDemo(name || "Trey", email || "trey@trey.tv", true);
                    setShowSignIn(false);
                  }}
                  disabled={!name || !email}
                  className="w-full mt-2 py-2 rounded-2xl border border-[#A855F7]/60 text-[#A855F7] text-xs font-semibold disabled:opacity-30"
                >
                  CONTINUE AS ADMIN (DEMO)
                </button>
              </>
            )}
            <button
              onClick={() => setShowSignIn(false)}
              className="w-full mt-3 text-xs text-[#94A3B8]"
            >
              Cancel
            </button>
            {demoAuthEnabled && (
              <p className="text-[10px] text-[#64748B] mt-3 text-center leading-relaxed">
                Demo identity is local-only and disabled in production unless explicitly enabled.
                Replace with Trey TV auth via{" "}
                <code className="text-[#00B7FF]">window.__TREY_USER__</code>.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
