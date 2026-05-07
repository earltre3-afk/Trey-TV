import { useEffect, useState } from "react";
import logo from "@/assets/trey-tv-logo.png";

/**
 * Trey TV logo. Renders the official transparent-background mark.
 * On mount, a white "card" sits behind the logo and fades away,
 * giving a subtle no-background reveal animation.
 */
export function Logo({ className = "h-9" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${className} relative inline-flex items-center justify-center aspect-square overflow-hidden rounded-md`}
    >
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-700 ease-out ${
          revealed ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />
      <img
        src={logo}
        alt="Trey TV"
        draggable={false}
        className="relative h-full w-full object-contain drop-shadow-[0_0_18px_rgba(244,194,74,0.45)]"
      />
    </div>
  );
}
