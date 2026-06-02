import React from "react";
import { avatarFor } from "../lib/avatars";

interface Props {
  name?: string;
  src?: string;
  size?: number;
  ring?: string;
  ringWidth?: 1 | 2 | 4;
  glow?: string;
  online?: boolean;
  showName?: boolean;
  nameColor?: string;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const TrunoAvatar: React.FC<Props> = ({
  name,
  src,
  size = 40,
  ring = "ring-fuchsia-500/50",
  ringWidth = 2,
  glow = "",
  online,
  showName,
  nameColor = "text-white",
  badge,
  className = "",
  onClick,
}) => {
  const url = src || avatarFor(name);
  const ringW = ringWidth === 4 ? "ring-4" : ringWidth === 2 ? "ring-2" : "ring-1";

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className={`relative rounded-full overflow-hidden ${ringW} ${ring} ${glow}`}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        <img
          src={url}
          alt={name || "avatar"}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            const parent = t.parentElement;
            if (parent && !parent.querySelector(".avatar-fallback")) {
              const fb = document.createElement("div");
              fb.className =
                "avatar-fallback absolute inset-0 flex items-center justify-center font-black text-white";
              fb.style.background = "linear-gradient(135deg,#FF0080,#9D4EDD,#00D9FF)";
              fb.style.fontSize = `${size / 2.4}px`;
              fb.textContent = (name || "?").slice(0, 1).toUpperCase();
              parent.appendChild(fb);
            }
          }}
        />
        {online && (
          <span
            className="absolute bottom-0 right-0 rounded-full bg-emerald-400 border border-black"
            style={{ width: Math.max(8, size * 0.18), height: Math.max(8, size * 0.18) }}
          />
        )}
        {badge && <div className="absolute -top-1 -right-1">{badge}</div>}
      </div>
      {showName && name && (
        <span className={`mt-1 text-[11px] font-bold ${nameColor}`}>{name}</span>
      )}
    </div>
  );
};

export default TrunoAvatar;
