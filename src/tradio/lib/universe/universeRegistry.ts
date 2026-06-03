/**
 * TREY TV UNIVERSE — Route / action registry for Trey-I (universe navigation AI).
 *
 * Trey-I is not just a profile helper — it is the universe navigation + onboarding
 * guide. It reads this registry to answer "where is X / how do I Y" with short,
 * direct answers and route buttons. Entries span both the Trey TV hub (parent;
 * routes are canonical even if the screen lives outside this repo) and the Tradio
 * music world (embedded). This is the single source Trey-I queries.
 */

export type UniverseSurface = "trey_tv" | "tradio";

export type UniverseActionType = "navigate" | "open_modal" | "external" | "apply" | "edit";

export interface UniverseRegistryEntry {
  id: string;
  label: string;
  /** Which world this lives in. */
  surface: UniverseSurface;
  /** Canonical route (web). Tradio routes are embedded under /tradio. */
  route: string;
  action: UniverseActionType;
  /** One-line, user-friendly description Trey-I can speak. */
  description: string;
  /** Keywords Trey-I matches natural-language questions against. */
  keywords: string[];
  /** Whether the user must be authenticated / have a Trey TV account first. */
  requiresAccount?: boolean;
  /** Whether this requires (or leads to) a Tradio role. */
  roleRelated?: boolean;
}

export const UNIVERSE_REGISTRY: UniverseRegistryEntry[] = [
  // ── Trey TV hub ──────────────────────────────────────────────────────────
  {
    id: "treytv_home",
    label: "Trey TV Home",
    surface: "trey_tv",
    route: "/",
    action: "navigate",
    description: "The center of the universe — your personalized Trey TV home.",
    keywords: ["home", "trey tv", "hub", "main", "start"],
  },
  {
    id: "personal_profile",
    label: "My Trey TV Profile",
    surface: "trey_tv",
    route: "/profile",
    action: "navigate",
    description:
      "Your personal Trey TV identity. Your public music identity lives separately on Tradio.",
    keywords: ["personal profile", "my profile", "account profile", "trey tv profile"],
    requiresAccount: true,
  },
  {
    id: "messenger",
    label: "Trey TV Messenger",
    surface: "trey_tv",
    route: "/messenger",
    action: "navigate",
    description:
      "All your direct messages live here — including messages sent from Tradio. Tradio has no separate inbox.",
    keywords: ["messenger", "messages", "inbox", "dm", "chat", "where are my messages"],
    requiresAccount: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    surface: "trey_tv",
    route: "/notifications",
    action: "navigate",
    description: "Your universe-wide notifications, including Tradio events.",
    keywords: ["notifications", "alerts", "bell"],
    requiresAccount: true,
  },
  {
    id: "signal_test",
    label: "Signal Test (Natural Ability)",
    surface: "trey_tv",
    route: "/signal-test",
    action: "navigate",
    description:
      "Discover your Natural Ability. Optional to take; once completed your result is permanent.",
    keywords: [
      "signal test",
      "natural ability",
      "ability test",
      "diviner",
      "reaper",
      "empath",
      "what is my ability",
      "personality",
    ],
    requiresAccount: true,
  },
  {
    id: "settings",
    label: "Settings",
    surface: "trey_tv",
    route: "/settings",
    action: "navigate",
    description: "Manage your account, identity, and preferences.",
    keywords: ["settings", "preferences", "account settings"],
    requiresAccount: true,
  },
  {
    id: "route_me",
    label: "Route Me / Prescribe Me",
    surface: "trey_tv",
    route: "/route-me",
    action: "navigate",
    description: "Get routed across the universe by what you need right now.",
    keywords: ["route me", "prescribe me", "recommend", "what should i do", "discover"],
  },

  // ── Tradio music world ───────────────────────────────────────────────────
  {
    id: "tradio_home",
    label: "Tradio",
    surface: "tradio",
    route: "/tradio",
    action: "navigate",
    description: "The music world inside Trey TV — radio, artists, producers, DJs, and Song Wars.",
    keywords: ["tradio", "music", "radio", "switch to tradio", "go to music"],
  },
  {
    id: "return_to_treytv",
    label: "Return to Trey TV",
    surface: "tradio",
    route: "/",
    action: "navigate",
    description: "Head back to the Trey TV hub from Tradio.",
    keywords: ["return to trey tv", "back to trey tv", "exit tradio", "leave tradio"],
  },
  {
    id: "song_wars",
    label: "Song Wars",
    surface: "tradio",
    route: "/tradio/song-wars",
    action: "navigate",
    description: "Head-to-head music battles with live voting.",
    keywords: ["song wars", "battles", "pvp", "vote", "competition"],
  },
  {
    id: "radio_shows",
    label: "Radio Shows",
    surface: "tradio",
    route: "/tradio/schedule",
    action: "navigate",
    description: "Live shows, premieres, and the broadcast schedule.",
    keywords: ["radio shows", "shows", "broadcasts", "schedule", "live radio"],
  },
  {
    id: "stations",
    label: "Stations",
    surface: "tradio",
    route: "/tradio/stations",
    action: "navigate",
    description: "Artist-owned and curated radio stations.",
    keywords: ["stations", "channels", "radio stations"],
  },
  {
    id: "creator_studio",
    label: "Creator Studio",
    surface: "tradio",
    route: "/tradio/studio",
    action: "navigate",
    description: "Your Tradio control room for releases, beats, shows, and access requests.",
    keywords: ["studio", "creator studio", "control room", "dashboard"],
    requiresAccount: true,
    roleRelated: true,
  },

  // ── Tradio role applications (must have a Trey TV account first) ──────────
  {
    id: "apply_artist",
    label: "Become an Artist",
    surface: "tradio",
    route: "/tradio/studio#access-center",
    action: "apply",
    description:
      "Apply for Artist access from the Access Center. You need a Trey TV account first; roles are reviewed, never self-granted.",
    keywords: [
      "become an artist",
      "artist application",
      "apply artist",
      "how do i become an artist",
      "artist access",
    ],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "apply_producer",
    label: "Apply as Producer",
    surface: "tradio",
    route: "/tradio/studio#access-center",
    action: "apply",
    description: "Apply for Producer access from the Access Center.",
    keywords: ["producer application", "apply producer", "become a producer", "beatmaker access"],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "apply_dj",
    label: "Apply as DJ / Host",
    surface: "tradio",
    route: "/tradio/studio#access-center",
    action: "apply",
    description: "Apply for DJ / Host access from the Access Center.",
    keywords: [
      "dj application",
      "host application",
      "apply dj",
      "become a dj",
      "become a host",
      "broadcast access",
    ],
    requiresAccount: true,
    roleRelated: true,
  },

  // ── Tradio public role profiles + editors ─────────────────────────────────
  {
    id: "artist_profile",
    label: "My Artist Profile",
    surface: "tradio",
    route: "/tradio/artist/me",
    action: "navigate",
    description:
      "Your public Tradio artist page — your music identity, separate from your personal Trey TV profile.",
    keywords: [
      "my artist profile",
      "artist page",
      "where is my artist profile",
      "public music profile",
    ],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "artist_profile_editor",
    label: "Edit Artist Profile",
    surface: "tradio",
    route: "/tradio/artist/me?edit=1",
    action: "edit",
    description: "Edit your public artist profile, releases, and links.",
    keywords: ["edit artist profile", "update artist page", "change artist profile"],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "producer_profile_editor",
    label: "Edit Producer Profile",
    surface: "tradio",
    route: "/tradio/producer/me?edit=1",
    action: "edit",
    description: "Edit your producer page, beat catalog, and credits.",
    keywords: ["edit producer profile", "update producer page"],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "dj_profile_editor",
    label: "Edit DJ / Host Profile",
    surface: "tradio",
    route: "/tradio/dj/me?edit=1",
    action: "edit",
    description: "Edit your DJ / host page, shows, and replays.",
    keywords: ["edit dj profile", "edit host profile", "update dj page"],
    requiresAccount: true,
    roleRelated: true,
  },

  // ── Upload / release ──────────────────────────────────────────────────────
  {
    id: "instant_release",
    label: "Release Music",
    surface: "tradio",
    route: "/tradio/studio/release",
    action: "navigate",
    description: "Publish or schedule a track directly into Tradio.",
    keywords: ["release music", "upload song", "instant release", "drop music", "publish track"],
    requiresAccount: true,
    roleRelated: true,
  },
  {
    id: "show_builder",
    label: "AI Show Builder",
    surface: "tradio",
    route: "/tradio/studio/show-builder",
    action: "navigate",
    description: "Plan a full live radio show with AI.",
    keywords: ["show builder", "build a show", "plan a show", "ai show"],
    requiresAccount: true,
    roleRelated: true,
  },

  // ── Admin / legal ────────────────────────────────────────────────────────
  {
    id: "legal_center",
    label: "Legal & Operations Center",
    surface: "trey_tv",
    route: "/legal",
    action: "navigate",
    description: "Policies, rights, data requests, and reports for the whole universe.",
    keywords: ["legal", "privacy", "terms", "dmca", "delete account", "data request", "report"],
  },
  {
    id: "admin_review",
    label: "Access Review Queue",
    surface: "tradio",
    route: "/tradio/studio#admin-review",
    action: "navigate",
    description: "Admin/reviewer queue for role, verification, and broadcast requests.",
    keywords: ["admin", "review queue", "approve requests", "moderation"],
    requiresAccount: true,
    roleRelated: true,
  },
];

/** Simple keyword search Trey-I can use to answer "where is X" questions. */
export const findUniverseEntries = (query: string, limit = 3): UniverseRegistryEntry[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const scored = UNIVERSE_REGISTRY.map((entry) => {
    let score = 0;
    if (entry.label.toLowerCase().includes(q)) score += 5;
    if (entry.description.toLowerCase().includes(q)) score += 1;
    for (const kw of entry.keywords) {
      if (q.includes(kw) || kw.includes(q)) score += 3;
      else if (kw.split(" ").some((word) => q.includes(word) && word.length > 3)) score += 1;
    }
    return { entry, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
};

export const getUniverseEntry = (id: string): UniverseRegistryEntry | undefined =>
  UNIVERSE_REGISTRY.find((entry) => entry.id === id);

/**
 * Canned Trey-I answers for the high-value universe questions in the brief.
 * Each maps to registry entry ids so the assistant can render route buttons.
 */
export const TREY_I_FAQ: { question: string; answer: string; entryIds: string[] }[] = [
  {
    question: "Where is the Signal Test?",
    answer:
      "The Signal Test (Natural Ability) is in your Trey TV identity area and on your profile. It’s optional — but once you finish, your result is permanent.",
    entryIds: ["signal_test", "personal_profile"],
  },
  {
    question: "How do I become an artist on Tradio?",
    answer:
      "Open Tradio → Creator Studio → Access Center and request Artist access. You need a Trey TV account first; roles are reviewed before activation.",
    entryIds: ["apply_artist", "creator_studio"],
  },
  {
    question: "How do I apply as a producer?",
    answer: "Tradio → Creator Studio → Access Center → request Producer access.",
    entryIds: ["apply_producer"],
  },
  {
    question: "How do I apply as a DJ or host?",
    answer:
      "Tradio → Creator Studio → Access Center → request DJ / Host access. Broadcast features may also need Broadcast Access.",
    entryIds: ["apply_dj"],
  },
  {
    question: "Where is my Trey TV Messenger?",
    answer:
      "Messenger is global in Trey TV. All messages — including ones sent from Tradio — arrive there.",
    entryIds: ["messenger"],
  },
  {
    question: "Why does Tradio not have a separate inbox?",
    answer:
      "One account, one Messenger. Tradio shows a bridge alert when you get a message, then opens Trey TV Messenger — so your conversations never get split across apps.",
    entryIds: ["messenger", "tradio_home"],
  },
  {
    question: "Where do I find my artist profile?",
    answer:
      "Your public artist page lives in Tradio and is separate from your personal Trey TV profile.",
    entryIds: ["artist_profile", "artist_profile_editor"],
  },
  {
    question: "How do I switch between Trey TV and Tradio?",
    answer:
      "Use global navigation to enter Tradio, and the “Return to Trey TV” control to come back. You’re always in the same universe and account.",
    entryIds: ["tradio_home", "return_to_treytv"],
  },
  {
    question: "How do I find Song Wars?",
    answer: "Song Wars is in Tradio under the Stations/Events area.",
    entryIds: ["song_wars"],
  },
  {
    question: "How do I find radio shows?",
    answer: "Radio shows and the live schedule are in Tradio.",
    entryIds: ["radio_shows"],
  },
  {
    question: "How do I edit my public artist profile?",
    answer: "Open your Tradio artist page and choose Edit, or go through Creator Studio.",
    entryIds: ["artist_profile_editor", "creator_studio"],
  },
  {
    question:
      "What is the difference between my personal Trey TV profile and my Tradio artist profile?",
    answer:
      "Your Trey TV profile is your personal/social identity. Your Tradio artist (or producer/DJ) profile is your public music identity. They’re connected to the same account, but presented separately.",
    entryIds: ["personal_profile", "artist_profile"],
  },
];
