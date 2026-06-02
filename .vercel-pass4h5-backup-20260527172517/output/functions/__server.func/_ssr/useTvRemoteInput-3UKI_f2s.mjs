import { r as reactExports } from "../_libs/react.mjs";
function isTvRemoteMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("surface") === "tv" || params.get("input") === "remote";
}
function useTvRemoteMode() {
  return reactExports.useMemo(() => isTvRemoteMode(), []);
}
function useTvRemoteInput(handler) {
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const listener = (event) => {
      const remoteEvent = event;
      const rawAction = remoteEvent.detail?.action;
      const fromAndroidTv = remoteEvent.detail?.source === "android-tv-remote";
      if (!fromAndroidTv && !isTvRemoteMode()) return;
      if (!isTvRemoteAction(rawAction)) return;
      handler(rawAction, remoteEvent);
    };
    window.addEventListener("treytv-remote-input", listener);
    return () => window.removeEventListener("treytv-remote-input", listener);
  }, [handler]);
}
function isTvRemoteAction(action) {
  return action === "UP" || action === "DOWN" || action === "LEFT" || action === "RIGHT" || action === "SELECT" || action === "BACK" || action === "MENU";
}
export {
  useTvRemoteInput as a,
  useTvRemoteMode as u
};
