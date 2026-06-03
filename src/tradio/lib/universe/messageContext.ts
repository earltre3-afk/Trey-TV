/**
 * TREY TV UNIVERSE — Shared message + notification context (architecture types).
 *
 * Trey TV owns the ONE account, the ONE Messenger, and the ONE notification
 * backbone. Tradio has NO separate inbox. When a user messages from a Tradio
 * surface, the message still lives in Trey TV Messenger — but it carries this
 * context metadata so the recipient sees a clear "Sent from Tradio …" label and
 * can deep-link back to the originating music surface.
 *
 * These types are the contract the Tradio web UI attaches to outbound messages /
 * mention notifications, and that the Trey TV Messenger + notification backbone
 * read. Nothing here creates a second inbox or identity.
 */

/** Where a message / notification originated. */
export type MessageSourceSurface =
  | "trey_tv"
  | "tradio"
  | "song_wars"
  | "radio_show"
  | "artist_profile"
  | "producer_profile"
  | "dj_profile"
  | "track_page"
  | "playlist"
  | "station"
  | "collab_request";

/** The kind of entity a message / notification is about. */
export type SourceEntityType =
  | "artist"
  | "band"
  | "producer"
  | "dj"
  | "radio_show"
  | "station"
  | "track"
  | "album"
  | "playlist"
  | "song_war_battle"
  | "collab_request"
  | "profile";

/** Role lens the sender/recipient were operating in when the message originated. */
export type RoleContext =
  | "fan"
  | "artist"
  | "producer"
  | "dj"
  | "host"
  | "admin"
  | "owner"
  | "viewer";

/**
 * Context metadata attached to a Trey TV Messenger message that originated from
 * (or is about) a Tradio surface. All fields optional except the surface so it
 * degrades gracefully for plain Trey TV messages.
 */
export interface MessageContext {
  source_surface: MessageSourceSurface;
  source_route?: string;
  source_entity_type?: SourceEntityType;
  source_entity_id?: string;
  source_entity_title?: string;
  source_entity_owner_id?: string;
  /** Deep link into the originating Tradio surface (for "About: …" jump). */
  deep_link_url?: string;
  /** Where to send the user back after they finish in Messenger. */
  return_to_url?: string;
  /** Short human label, e.g. "Sent from Tradio Artist Page". */
  display_context_label?: string;
  sender_role_context?: RoleContext;
  recipient_role_context?: RoleContext;
}

/** A notification that bridges a Trey TV Messenger / mention event into Tradio UI. */
export type UniverseNotificationKind =
  | "messenger_message"
  | "mention"
  | "collab_request"
  | "system";

export interface UniverseNotification {
  id: string;
  kind: UniverseNotificationKind;
  /** Always true here — Tradio never owns the inbox; it only bridges. */
  livesInTreyTvMessenger: boolean;
  title: string;
  body?: string;
  senderName?: string;
  senderId?: string;
  createdAt: string;
  read: boolean;
  context: MessageContext;
}

const SURFACE_LABEL: Record<MessageSourceSurface, string> = {
  trey_tv: "Trey TV",
  tradio: "Tradio",
  song_wars: "Song Wars",
  radio_show: "Radio Show",
  artist_profile: "Tradio Artist Page",
  producer_profile: "Tradio Producer Page",
  dj_profile: "Tradio DJ / Host Page",
  track_page: "Tradio Track",
  playlist: "Tradio Playlist",
  station: "Tradio Station",
  collab_request: "Tradio Collab Request",
};

/** Builds the "Sent from …" label shown in Messenger + the Tradio bridge toast. */
export const buildDisplayContextLabel = (context: MessageContext): string => {
  if (context.display_context_label) return context.display_context_label;
  const surface = SURFACE_LABEL[context.source_surface] ?? "Tradio";
  return context.source_surface === "trey_tv" ? "Trey TV" : `Sent from ${surface}`;
};

/** Builds the "About: …" subject label when the message references an entity. */
export const buildAboutLabel = (context: MessageContext): string | null => {
  if (!context.source_entity_title) return null;
  return `About: ${context.source_entity_title}`;
};

/**
 * Composes a fully-populated MessageContext for an outbound Tradio message.
 * Always routes to Trey TV Messenger — this only attaches provenance.
 */
export const createTradioMessageContext = (params: {
  surface: MessageSourceSurface;
  route?: string;
  entityType?: SourceEntityType;
  entityId?: string;
  entityTitle?: string;
  entityOwnerId?: string;
  returnToUrl?: string;
  senderRole?: RoleContext;
  recipientRole?: RoleContext;
}): MessageContext => {
  const context: MessageContext = {
    source_surface: params.surface,
    source_route: params.route,
    source_entity_type: params.entityType,
    source_entity_id: params.entityId,
    source_entity_title: params.entityTitle,
    source_entity_owner_id: params.entityOwnerId,
    deep_link_url: params.route,
    return_to_url: params.returnToUrl ?? params.route,
    sender_role_context: params.senderRole,
    recipient_role_context: params.recipientRole,
  };
  context.display_context_label = buildDisplayContextLabel(context);
  return context;
};

/** Standard universe copy so every surface stays consistent and non-confusing. */
export const MESSENGER_COPY = {
  newMessage: "New message in Trey TV Messenger",
  fromSender: (name: string) => `Message from ${name}`,
  openInMessenger: "Open in Messenger",
  returnToTradio: "Return to Tradio",
  sentFromTradio: "Sent from Tradio",
  noSeparateInbox: "Messages live in Trey TV Messenger — Tradio doesn’t have a separate inbox.",
} as const;
