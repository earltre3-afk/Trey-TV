export interface TradioViewportLayout {
  renderDesktopNav: boolean;
  renderUtilityRail: boolean;
}

const DESKTOP_NAV_MIN_WIDTH = 1024;
const UTILITY_RAIL_MIN_WIDTH = 1280;

export function resolveTradioViewportLayout(width: number): TradioViewportLayout {
  return {
    renderDesktopNav: width >= DESKTOP_NAV_MIN_WIDTH,
    renderUtilityRail: width >= UTILITY_RAIL_MIN_WIDTH,
  };
}
