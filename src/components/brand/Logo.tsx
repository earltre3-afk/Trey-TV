import logo from "@/assets/trey-tv-logo.png";

/**
 * Trey TV logo — transparent background.
 */
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Trey TV"
      draggable={false}
      className={`${className} aspect-square object-contain drop-shadow-[0_0_18px_rgba(244,194,74,0.45)]`}
    />
  );
}
