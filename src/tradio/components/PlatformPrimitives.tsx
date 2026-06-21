import React from "react";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function GlassCard({ glow = false, className = "", ...props }: SurfaceProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.055] backdrop-blur-xl ${
        glow ? "shadow-[0_18px_60px_-24px_rgba(168,85,247,0.75)]" : ""
      } ${className}`}
      {...props}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white font-bold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] font-bold text-white transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${className}`}
      {...props}
    />
  );
}
