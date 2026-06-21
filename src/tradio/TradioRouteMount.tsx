import TradioPlatform from "@/tradio/platform/TradioPlatform";
import "./tradio.css";

export function TradioRouteMount() {
  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      <TradioPlatform />
    </div>
  );
}
