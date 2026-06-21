import { createFileRoute } from "@tanstack/react-router";
import { TradioRouteMount } from "@/tradio/TradioRouteMount";

export const Route = createFileRoute("/tradio/")({
  component: TradioHomePage,
});

function TradioHomePage() {
  return <TradioRouteMount />;
}
