import type { PluginFeature, PluginFwdStatus, PluginGame, ProtectedFlowStatus } from "./types";

// Internal read-only diagnostic plugin layer. These registries intentionally
// describe code health and integration surfaces without querying private data.
export const pluginFeatures: PluginFeature[] = [
  {
    key: "trey-i-onboarding",
    displayName: "Trey-I onboarding",
    status: "protected",
    protected: true,
    relatedFiles: [
      "src/routes/onboarding.tsx",
      "src/routes/onboarding.manual.tsx",
      "src/routes/onboarding.voice.tsx",
      "src/routes/onboarding.import-screenshot.tsx",
      "src/lib/trey-i/onboarding.server.ts",
    ],
    notes: ["Protected flow. Diagnostics must not modify onboarding files or expose intake data."],
  },
  {
    key: "fwd-integration",
    displayName: "FWD integration",
    status: "active",
    protected: false,
    relatedFiles: [
      "src/routes/api.fwd.oauth.authorize.tsx",
      "src/lib/fwd/oauth-http.server.ts",
      "src/components/fwd/FwdGifPicker.tsx",
      "src/components/feed/PostCard.tsx",
      "src/routes/inbox.tsx",
      "src/routes/edit-profile.tsx",
    ],
    notes: ["OAuth, picker, feed, comments, messages, and profile GIF-of-the-day surfaces are present."],
  },
  {
    key: "truno-local-play",
    displayName: "Truno local play",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/games.truno.tsx", "src/features/truno/TrunoModule.tsx"],
    notes: ["Local Truno module and route are present."],
  },
  {
    key: "truno-multiplayer",
    displayName: "Truno multiplayer",
    status: "in_progress",
    protected: false,
    relatedFiles: ["src/features/truno/lib/api.ts", "supabase/migrations/20260518051800_truno_game_tables.sql"],
    notes: ["Room and tournament helpers exist; treat as in progress until the full live play path is verified."],
  },
  {
    key: "game-hub",
    displayName: "Game hub",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/games.tsx", "src/routes/games.index.tsx", "src/features/games/GameRoomModule.tsx"],
    notes: ["Game room hub, routes, and shared services are present."],
  },
  {
    key: "profile-sync",
    displayName: "Profile sync",
    status: "needs_polish",
    protected: false,
    relatedFiles: ["src/hooks/use-current-user.ts", "src/hooks/use-profile.ts", "src/routes/u.$uid.tsx"],
    notes: ["UID-backed profile surfaces exist; keep diagnostics conservative until end-to-end sync is verified."],
  },
  {
    key: "prescribe-me",
    displayName: "Prescribe Me",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/prescribe-me.tsx", "src/features/prescribe-me/PrescribeMeApp.tsx"],
    notes: ["Route, feature module, and persistence helper are present."],
  },
  {
    key: "creator-studio",
    displayName: "Creator Studio",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/creator-studio.tsx", "src/routes/creator-studio.index.tsx", "src/hooks/use-creator-studio.ts"],
    notes: ["Creator Studio routes, hooks, and upload helper are present."],
  },
  {
    key: "rewards",
    displayName: "Rewards",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/rewards.tsx", "src/hooks/use-rewards.ts", "src/routes/admin.rewards.tsx"],
    notes: ["User and admin rewards surfaces are present."],
  },
];

export const pluginGames: PluginGame[] = [
  {
    gameType: "truno",
    displayName: "Truno",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 2,
    maxPlayers: 8,
    botFillSupported: "unknown",
    status: "in_progress",
  },
  {
    gameType: "spades",
    displayName: "Spades",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 4,
    maxPlayers: 4,
    botFillSupported: true,
    status: "active",
  },
  {
    gameType: "blackjack",
    displayName: "Blackjack",
    quickPlaySupported: true,
    multiplayerSupported: false,
    minPlayers: 1,
    maxPlayers: 1,
    botFillSupported: false,
    status: "active",
  },
  {
    gameType: "bullshit",
    displayName: "Bullshit",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 3,
    maxPlayers: 4,
    botFillSupported: true,
    status: "active",
  },
];

export function getFwdPluginStatus(): PluginFwdStatus {
  return {
    expectedFwdDomain: "fwd.treytv.com",
    oauthRoutePresence: {
      present: true,
      evidence: [
        "src/routes/api.fwd.oauth.authorize.tsx",
        "src/lib/fwd/oauth-http.server.ts",
        "/api/fwd/oauth/token",
        "/api/fwd/oauth/userinfo",
      ],
    },
    pickerComponentPresence: {
      present: true,
      evidence: ["src/components/fwd/FwdGifPicker.tsx", "src/components/fwd/FwdPickerSheet.tsx"],
    },
    messageIntegrationStatus: "active",
    commentIntegrationStatus: "active",
    profileGifOfTheDayIntegrationStatus: "active",
    missingIntegrationWarnings: [],
  };
}

export function getProtectedFlowStatus(): ProtectedFlowStatus {
  return {
    treyIOnboardingProtectedFiles: [
      "src/lib/trey-i/onboarding.server.ts",
      "src/lib/trey-i/intake.server.ts",
      "src/lib/trey-i/import-screenshot.server.ts",
      "src/lib/trey-i/elevenlabs-session.server.ts",
      "src/lib/trey-i/tts.server.ts",
      "src/lib/trey-i/vertex.server.ts",
      "src/routes/onboarding.tsx",
      "src/routes/onboarding.manual.tsx",
      "src/routes/onboarding.voice.tsx",
      "src/routes/onboarding.import-screenshot.tsx",
    ],
    treyIOnboardingProtectedPatterns: ["src/lib/trey-i/**", "src/routes/onboarding*.tsx", "supabase/migrations/*onboarding*"],
    profileUidRoutingRules: [
      "Public profile routes use /u/$uid.",
      "Prefer public_profile_uid for profile links and cross-feature profile references.",
      "Do not expose private auth user IDs in plugin diagnostics.",
    ],
    dateOfBirthRule: "Use profiles.date_of_birth for birth-date workflows; do not use profiles.age.",
    publicUidRule: "Use 423-style public_profile_uid where available for public profile references.",
    warnings: ["This endpoint reports protected patterns only; it does not read onboarding data."],
  };
}
