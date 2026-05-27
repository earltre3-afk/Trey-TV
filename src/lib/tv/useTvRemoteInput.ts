import { useEffect, useMemo } from "react";

export type TvRemoteAction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "SELECT" | "BACK" | "MENU";

type TvRemoteEvent = CustomEvent<{
  action?: string;
  source?: string;
}>;

export function isTvRemoteMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("surface") === "tv" || params.get("input") === "remote";
}

export function useTvRemoteMode() {
  return useMemo(() => isTvRemoteMode(), []);
}

export function useTvRemoteInput(handler: (action: TvRemoteAction, event: TvRemoteEvent) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const listener = (event: Event) => {
      const remoteEvent = event as TvRemoteEvent;
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

function isTvRemoteAction(action: unknown): action is TvRemoteAction {
  return (
    action === "UP" ||
    action === "DOWN" ||
    action === "LEFT" ||
    action === "RIGHT" ||
    action === "SELECT" ||
    action === "BACK" ||
    action === "MENU"
  );
}
