// Shared types for the chat components.
// See: docs/superpowers/specs/2026-05-24-watch-party-design.md §9.2

export type ChatKind = "party" | "public";

export type ChatMessageRow = {
  id: string;
  kind: ChatKind;
  scope_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ChatSenderProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

// Optimistic message — shown locally before server confirms.
export type PendingMessage = {
  tempId: string;
  body: string;
  status: "sending" | "sent" | "blocked" | "nudge";
  reason?: string | null;
  timeoutMinutes?: number | null;
  createdAt: number;
};
