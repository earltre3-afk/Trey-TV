import logo from "@/assets/trey-tv-logo.jpeg";

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Trey TV"
      className={`${className} w-auto object-contain mix-blend-screen drop-shadow-[0_0_12px_rgba(255,200,80,0.35)]`}
      draggable={false}
    />
  );
}
