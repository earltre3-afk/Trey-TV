/**
 * TREY TV / TRADIO — Legal & Operations Center document config.
 *
 * Frontend scaffolding ONLY. All policy bodies are clearly-labelled placeholders
 * pending legal review — nothing here is legal advice or a binding promise. Final
 * copy will be supplied by counsel and dropped into `contentPlaceholder`.
 */

export type LegalCategory =
  | "privacy"
  | "terms"
  | "safety"
  | "copyright"
  | "creator"
  | "music"
  | "ai"
  | "payments"
  | "support"
  | "operations";

export type LegalStatus = "draft" | "pending_review" | "approved" | "active" | "archived";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalVersionEntry {
  version: string;
  date: string;
  note: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  /** Future URL route (the app currently navigates by id via Shell views). */
  route: string;
  category: LegalCategory;
  status: LegalStatus;
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  summary: string;
  /** Flow ids that should surface / require acknowledgement of this document. */
  requiredForFlows: string[];
  relatedDocuments: string[];
  contactEmail: string;
  contentPlaceholder: LegalSection[];
  versionHistory?: LegalVersionEntry[];
}

const PLACEHOLDER = (label: string) => [`Placeholder pending legal review. ${label}`];

const META = {
  status: "pending_review" as LegalStatus,
  version: "0.1.0",
  lastUpdated: "2026-05-29",
  effectiveDate: "Pending",
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  // ── Privacy & Data ─────────────────────────────────────────────────────────
  {
    id: "privacy",
    title: "Privacy Policy",
    route: "/legal/privacy",
    category: "privacy",
    ...META,
    summary:
      "How Trey TV and Tradio collect, use, share, retain, and protect your information — and the controls you have.",
    requiredForFlows: ["signup"],
    relatedDocuments: ["cookies", "privacy-choices", "data-rights", "ai-disclosure"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Information We Collect",
        body: PLACEHOLDER(
          "Account data, profile data, uploaded content, music/listening data, device data, and approximate location if used.",
        ),
      },
      {
        heading: "Recommendation & AI Data",
        body: PLACEHOLDER(
          "Signals used by Prescribe Me and AI recommendations, and how they are processed.",
        ),
      },
      {
        heading: "Cookies & Analytics",
        body: PLACEHOLDER("Use of cookies, analytics, and similar technologies."),
      },
      {
        heading: "How We Share Information",
        body: PLACEHOLDER("Service providers, legal disclosures, and creator-facing visibility."),
      },
      {
        heading: "Retention & Deletion",
        body: PLACEHOLDER("How long data is kept and how deletion requests are handled."),
      },
      {
        heading: "Your Rights & Choices",
        body: PLACEHOLDER("Access, correction, deletion, export, and opt-out rights."),
      },
      {
        heading: "Contact",
        body: PLACEHOLDER("Reach the privacy team at privacy@treytv.example."),
      },
    ],
  },
  {
    id: "notice-at-collection",
    title: "Notice at Collection",
    route: "/legal/notice-at-collection",
    category: "privacy",
    ...META,
    summary:
      "A short summary of the categories of data collected at or before the point of collection.",
    requiredForFlows: [],
    relatedDocuments: ["privacy", "privacy-choices"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Categories Collected",
        body: PLACEHOLDER("Identifiers, account/profile data, content, usage, and inferences."),
      },
      {
        heading: "Purposes",
        body: PLACEHOLDER("Providing the service, personalization, safety, and analytics."),
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    route: "/legal/cookies",
    category: "privacy",
    ...META,
    summary: "The cookies and similar technologies we use and how to control them.",
    requiredForFlows: [],
    relatedDocuments: ["privacy", "privacy-choices"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      { heading: "Essential Cookies", body: PLACEHOLDER("Required for core functionality.") },
      { heading: "Analytics Cookies", body: PLACEHOLDER("Help us understand usage.") },
      { heading: "Advertising Cookies", body: PLACEHOLDER("If/when advertising is used.") },
      { heading: "Preference Cookies", body: PLACEHOLDER("Remember your settings.") },
      { heading: "Managing Cookies", body: PLACEHOLDER("Consent controls and cookie settings.") },
    ],
  },
  {
    id: "privacy-choices",
    title: "Your Privacy Choices",
    route: "/legal/privacy-choices",
    category: "privacy",
    ...META,
    summary:
      "Manage how your information is used, including opt-out and sensitive-data controls where applicable.",
    requiredForFlows: [],
    relatedDocuments: ["privacy", "cookies", "data-rights"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      { heading: "Opt Out of Sale/Share", body: PLACEHOLDER("Where applicable.") },
      { heading: "Limit Sensitive Data Use", body: PLACEHOLDER("Where applicable.") },
      {
        heading: "Manage Cookies & Request Data",
        body: PLACEHOLDER("Links to cookie settings and the data request form."),
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    route: "/legal/data-retention",
    category: "privacy",
    ...META,
    summary: "How long different categories of data are retained and why.",
    requiredForFlows: [],
    relatedDocuments: ["privacy", "delete-account"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Retention Periods",
        body: PLACEHOLDER("Per-category retention and legal hold exceptions."),
      },
    ],
  },

  // ── Platform Rules ─────────────────────────────────────────────────────────
  {
    id: "terms",
    title: "Terms of Service",
    route: "/legal/terms",
    category: "terms",
    ...META,
    summary:
      "The agreement between you and the platform covering accounts, content, rights, and responsibilities.",
    requiredForFlows: ["signup"],
    relatedDocuments: ["community-guidelines", "acceptable-use", "privacy"],
    contactEmail: "legal@treytv.example",
    contentPlaceholder: [
      { heading: "Account Rules", body: PLACEHOLDER("Eligibility and account responsibilities.") },
      {
        heading: "User & Creator Content",
        body: PLACEHOLDER(
          "Your content and the licenses you grant the platform to operate the service.",
        ),
      },
      {
        heading: "Platform Rights",
        body: PLACEHOLDER("Our rights to operate, moderate, and improve the service."),
      },
      {
        heading: "Prohibited Behavior",
        body: PLACEHOLDER("See the Acceptable Use Policy and Community Guidelines."),
      },
      { heading: "Termination", body: PLACEHOLDER("How accounts may be suspended or terminated.") },
      {
        heading: "Disclaimers & Limitation of Liability",
        body: PLACEHOLDER("Service provided “as is” to the extent permitted by law."),
      },
      {
        heading: "Dispute Resolution & Governing Law",
        body: PLACEHOLDER("Governing law placeholder pending counsel."),
      },
    ],
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    route: "/legal/community-guidelines",
    category: "safety",
    ...META,
    summary:
      "The behavior expected across Trey TV and Tradio to keep the community safe and respectful.",
    requiredForFlows: [],
    relatedDocuments: ["terms", "acceptable-use", "moderation-appeals", "safety"],
    contactEmail: "safety@treytv.example",
    contentPlaceholder: [
      { heading: "Harassment & Hate", body: PLACEHOLDER("No harassment, hate, or abuse.") },
      { heading: "Threats & Violence", body: PLACEHOLDER("No threats or incitement.") },
      { heading: "Sexual Content Rules", body: PLACEHOLDER("Content standards and age limits.") },
      {
        heading: "Spam, Scams & Impersonation",
        body: PLACEHOLDER("No spam, scams, or impersonation."),
      },
      { heading: "Illegal Content", body: PLACEHOLDER("Prohibited content.") },
      {
        heading: "Enforcement, Reporting & Appeals",
        body: PLACEHOLDER("Consequences, how to report, and how to appeal."),
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    route: "/legal/acceptable-use",
    category: "terms",
    ...META,
    summary: "Specific prohibited activities on the platform.",
    requiredForFlows: [],
    relatedDocuments: ["terms", "community-guidelines"],
    contactEmail: "legal@treytv.example",
    contentPlaceholder: [
      {
        heading: "Prohibited Activities",
        body: PLACEHOLDER(
          "No illegal uploads, stolen content, malware, platform abuse, unauthorized scraping, harassment, fraud, or unauthorized commercial use.",
        ),
      },
    ],
  },
  {
    id: "safety",
    title: "Safety Rules",
    route: "/legal/safety",
    category: "safety",
    ...META,
    summary: "How we keep users safe and what to do if something goes wrong.",
    requiredForFlows: [],
    relatedDocuments: ["community-guidelines", "minors", "moderation-appeals"],
    contactEmail: "safety@treytv.example",
    contentPlaceholder: [
      { heading: "Staying Safe", body: PLACEHOLDER("Safety expectations and tools.") },
      { heading: "Reporting Safety Issues", body: PLACEHOLDER("How to report a safety concern.") },
    ],
  },
  {
    id: "minors",
    title: "Minors / Age Policy",
    route: "/legal/minors",
    category: "safety",
    ...META,
    summary: "Age requirements and protections for younger users.",
    requiredForFlows: ["signup"],
    relatedDocuments: ["safety", "privacy"],
    contactEmail: "safety@treytv.example",
    contentPlaceholder: [
      {
        heading: "Minimum Age",
        body: PLACEHOLDER("Minimum age requirement pending final business decision."),
      },
      {
        heading: "Under-13 / Parental Consent",
        body: PLACEHOLDER("Restriction or parental-consent model pending decision."),
      },
      {
        heading: "Teen Safety & Age-Gated Features",
        body: PLACEHOLDER("Protections and gated features."),
      },
    ],
  },
  {
    id: "moderation-appeals",
    title: "Moderation & Appeals",
    route: "/legal/moderation-appeals",
    category: "safety",
    ...META,
    summary: "How moderation decisions are made and how to appeal them.",
    requiredForFlows: [],
    relatedDocuments: ["community-guidelines", "acceptable-use"],
    contactEmail: "appeals@treytv.example",
    contentPlaceholder: [
      {
        heading: "Content Removal & Restrictions",
        body: PLACEHOLDER("Content removal, account restrictions, and role-access restrictions."),
      },
      {
        heading: "How to Appeal",
        body: PLACEHOLDER("Appeal form and review timeline placeholder."),
      },
      { heading: "Repeat Violations", body: PLACEHOLDER("Consequences for repeat violations.") },
    ],
  },

  // ── Creator & Music Rules ────────────────────────────────────────────────
  {
    id: "creator-terms",
    title: "Creator Terms",
    route: "/legal/creator-terms",
    category: "creator",
    ...META,
    summary: "Additional terms for creators using artist, producer, and DJ/host tools.",
    requiredForFlows: ["role-request"],
    relatedDocuments: ["terms", "music-upload-terms", "producer-terms", "dj-broadcast-terms"],
    contactEmail: "creators@treytv.example",
    contentPlaceholder: [
      {
        heading: "Creator Responsibilities",
        body: PLACEHOLDER("Rights ownership, accuracy, and conduct."),
      },
      { heading: "Role Access", body: PLACEHOLDER("Roles are reviewed and may be revoked.") },
    ],
  },
  {
    id: "music-upload-terms",
    title: "Music Upload Terms",
    route: "/legal/music-upload-terms",
    category: "music",
    ...META,
    summary: "Terms you agree to when uploading or releasing music on Tradio.",
    requiredForFlows: ["music-upload", "instant-release"],
    relatedDocuments: ["copyright", "dmca", "producer-terms"],
    contactEmail: "rights@treytv.example",
    contentPlaceholder: [
      {
        heading: "Rights Ownership",
        body: PLACEHOLDER(
          "You must own or control the rights to upload this music, including vocals, masters, and composition where applicable.",
        ),
      },
      {
        heading: "No Stolen or Uncleared Material",
        body: PLACEHOLDER("No stolen beats and no uncleared samples unless rights are secured."),
      },
      {
        heading: "Tradio-Native Release Terms",
        body: PLACEHOLDER("Terms for platform-native releases."),
      },
      { heading: "Takedown & Removal", body: PLACEHOLDER("How content may be removed.") },
      { heading: "Explicit Content Labeling", body: PLACEHOLDER("Label explicit content.") },
      {
        heading: "Royalty / Accounting",
        body: PLACEHOLDER("Placeholder for future monetization."),
      },
    ],
  },
  {
    id: "producer-terms",
    title: "Producer / Beat Terms",
    route: "/legal/producer-terms",
    category: "music",
    ...META,
    summary: "Terms for uploading and licensing beats as a producer.",
    requiredForFlows: ["beat-upload"],
    relatedDocuments: ["music-upload-terms", "copyright", "creator-terms"],
    contactEmail: "rights@treytv.example",
    contentPlaceholder: [
      {
        heading: "Beat Upload Rights",
        body: PLACEHOLDER("You must own or control the rights to this beat."),
      },
      { heading: "Licensing", body: PLACEHOLDER("Exclusive/non-exclusive options placeholder.") },
      {
        heading: "Samples & Loops",
        body: PLACEHOLDER("No stolen loops/samples without clearance."),
      },
      {
        heading: "Collaboration & Credit",
        body: PLACEHOLDER("Collaboration rules and producer credit."),
      },
      { heading: "Takedown", body: PLACEHOLDER("Takedown process.") },
    ],
  },
  {
    id: "dj-broadcast-terms",
    title: "DJ / Broadcast Terms",
    route: "/legal/dj-broadcast-terms",
    category: "creator",
    ...META,
    summary: "Rules for live broadcasting, mixes, and hosting on Tradio.",
    requiredForFlows: ["dj-broadcast"],
    relatedDocuments: ["copyright", "song-wars-rules", "moderation-appeals"],
    contactEmail: "broadcast@treytv.example",
    contentPlaceholder: [
      { heading: "Live Broadcast Conduct", body: PLACEHOLDER("Show conduct and standards.") },
      {
        heading: "Music Rights Responsibility",
        body: PLACEHOLDER("You are responsible for rights to broadcast material."),
      },
      {
        heading: "Ads & Listener Requests",
        body: PLACEHOLDER("Ad/commercial slot and listener-request placeholders."),
      },
      {
        heading: "Replays & Moderation",
        body: PLACEHOLDER("Replay rules; broadcast access may be revoked."),
      },
    ],
  },
  {
    id: "song-wars-rules",
    title: "Song Wars Rules",
    route: "/legal/song-wars-rules",
    category: "creator",
    ...META,
    summary: "Eligibility, consent, voting, and conduct rules for Song Wars battles.",
    requiredForFlows: ["song-wars"],
    relatedDocuments: ["community-guidelines", "dj-broadcast-terms"],
    contactEmail: "songwars@treytv.example",
    contentPlaceholder: [
      {
        heading: "Eligibility & Consent",
        body: PLACEHOLDER("Battle eligibility and artist consent."),
      },
      {
        heading: "Submission Rules",
        body: PLACEHOLDER("Song submission requirements and authorization."),
      },
      { heading: "Voting & Anti-Cheat", body: PLACEHOLDER("Voting rules; no vote manipulation.") },
      { heading: "Chat & Conduct", body: PLACEHOLDER("Fan chat rules.") },
      {
        heading: "Winners, Replays & Disqualification",
        body: PLACEHOLDER(
          "Winner display, replay/archive consent, moderation, and disqualification.",
        ),
      },
    ],
  },
  {
    id: "copyright",
    title: "Copyright Policy",
    route: "/legal/copyright",
    category: "copyright",
    ...META,
    summary: "How copyright is respected and enforced across uploads, beats, and broadcasts.",
    requiredForFlows: [],
    relatedDocuments: ["dmca", "music-upload-terms", "producer-terms"],
    contactEmail: "dmca@treytv.example",
    contentPlaceholder: [
      {
        heading: "Upload Responsibility",
        body: PLACEHOLDER("Uploaders are responsible for the rights to their content."),
      },
      {
        heading: "Music, Beat & Mix Rights",
        body: PLACEHOLDER(
          "Music rights disclaimer, producer beat ownership disclaimer, and DJ mix rights notice.",
        ),
      },
      { heading: "Reporting Infringement", body: PLACEHOLDER("See the DMCA Policy.") },
    ],
  },
  {
    id: "dmca",
    title: "DMCA Policy",
    route: "/legal/dmca",
    category: "copyright",
    ...META,
    summary: "The notice-and-takedown and counter-notice process for copyright claims.",
    requiredForFlows: [],
    relatedDocuments: ["copyright"],
    contactEmail: "dmca@treytv.example",
    contentPlaceholder: [
      {
        heading: "Takedown Process",
        body: PLACEHOLDER("How copyright owners submit takedown notices."),
      },
      { heading: "Counter-Notice Process", body: PLACEHOLDER("How to submit a counter-notice.") },
      {
        heading: "Repeat Infringer Policy",
        body: PLACEHOLDER("Consequences for repeat infringement."),
      },
      { heading: "DMCA Agent Contact", body: PLACEHOLDER("Designated agent contact placeholder.") },
    ],
  },

  // ── AI & Recommendation Transparency ─────────────────────────────────────
  {
    id: "ai-disclosure",
    title: "AI Disclosure",
    route: "/legal/ai-disclosure",
    category: "ai",
    ...META,
    summary: "Where and how AI is used across recommendations, station generation, and search.",
    requiredForFlows: ["ai-panel"],
    relatedDocuments: ["prescribe-me", "tradio-prescription-radio", "privacy"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Where AI Is Used",
        body: PLACEHOLDER(
          "Recommendations, station generation, show planning, search refinement, and Prescribe Me.",
        ),
      },
      {
        heading: "Limitations",
        body: PLACEHOLDER("AI suggestions may be imperfect; no guarantee of outcomes."),
      },
      {
        heading: "Controls & Human Review",
        body: PLACEHOLDER("User controls, feedback, and human review where required."),
      },
      { heading: "Privacy Boundaries", body: PLACEHOLDER("How AI data use respects privacy.") },
    ],
  },
  {
    id: "prescribe-me",
    title: "Prescribe Me Explanation",
    route: "/legal/prescribe-me",
    category: "ai",
    ...META,
    summary: "How the Prescribe Me recommendation system works and how to control it.",
    requiredForFlows: ["ai-panel"],
    relatedDocuments: ["ai-disclosure", "tradio-prescription-radio"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Parent & Child Systems",
        body: PLACEHOLDER("Trey TV Prescribe Me and the child Tradio Prescribe Me."),
      },
      { heading: "Signals Used", body: PLACEHOLDER("What signals may inform recommendations.") },
      {
        heading: "Rewrite & Refine",
        body: PLACEHOLDER("How users can rewrite or refine recommendations."),
      },
      {
        heading: "Respectful Language & Controls",
        body: PLACEHOLDER("How we avoid “creepy” language and the controls available."),
      },
    ],
  },
  {
    id: "tradio-prescription-radio",
    title: "Tradio Prescription Radio",
    route: "/legal/tradio-prescription-radio",
    category: "ai",
    ...META,
    summary: "How Tradio’s prescription radio generates personalized listening.",
    requiredForFlows: [],
    relatedDocuments: ["prescribe-me", "ai-disclosure"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      { heading: "How It Works", body: PLACEHOLDER("Prescription radio generation and feedback.") },
    ],
  },
  {
    id: "automated-recommendation-notice",
    title: "Automated Recommendation Notice",
    route: "/legal/automated-recommendation-notice",
    category: "ai",
    ...META,
    summary: "A notice about automated recommendation systems and your controls.",
    requiredForFlows: [],
    relatedDocuments: ["ai-disclosure", "prescribe-me"],
    contactEmail: "privacy@treytv.example",
    contentPlaceholder: [
      {
        heading: "Automated Decisions",
        body: PLACEHOLDER("Notice and user controls for automated recommendations."),
      },
    ],
  },

  // ── Payments / Commercial ─────────────────────────────────────────────────
  {
    id: "subscriptions",
    title: "Subscription Terms",
    route: "/legal/subscriptions",
    category: "payments",
    ...META,
    summary: "Subscriptions are not active yet. Future billing terms will appear here.",
    requiredForFlows: [],
    relatedDocuments: ["refund-policy", "creator-monetization"],
    contactEmail: "billing@treytv.example",
    contentPlaceholder: [
      { heading: "Status", body: PLACEHOLDER("Subscriptions are not active yet.") },
      {
        heading: "Future Billing Terms",
        body: PLACEHOLDER("Billing, renewal, and cancellation terms placeholder."),
      },
    ],
  },
  {
    id: "refund-policy",
    title: "Refund Policy",
    route: "/legal/refund-policy",
    category: "payments",
    ...META,
    summary: "Refund and cancellation terms (placeholder until payments are active).",
    requiredForFlows: [],
    relatedDocuments: ["subscriptions"],
    contactEmail: "billing@treytv.example",
    contentPlaceholder: [
      {
        heading: "Refunds & Cancellation",
        body: PLACEHOLDER("Refund and cancellation policy placeholder."),
      },
    ],
  },
  {
    id: "creator-monetization",
    title: "Creator Monetization Terms",
    route: "/legal/creator-monetization",
    category: "payments",
    ...META,
    summary: "Future terms for creator monetization and payouts.",
    requiredForFlows: [],
    relatedDocuments: ["creator-terms", "subscriptions"],
    contactEmail: "billing@treytv.example",
    contentPlaceholder: [
      { heading: "Monetization", body: PLACEHOLDER("Creator monetization terms placeholder.") },
    ],
  },
  {
    id: "ads-sponsorships",
    title: "Advertising & Sponsorship Disclosure",
    route: "/legal/ads-sponsorships",
    category: "payments",
    ...META,
    summary: "How sponsored content, paid partnerships, and ads are disclosed.",
    requiredForFlows: [],
    relatedDocuments: ["community-guidelines", "creator-terms"],
    contactEmail: "ads@treytv.example",
    contentPlaceholder: [
      {
        heading: "Sponsored Content Labels",
        body: PLACEHOLDER("Sponsored content and paid partnerships must be labeled."),
      },
      {
        heading: "Creator Brand Deals & Affiliates",
        body: PLACEHOLDER("Brand deals, ad placement, and affiliate-link disclosure placeholder."),
      },
      {
        heading: "Influencer Disclosure Responsibility",
        body: PLACEHOLDER("Creators are responsible for required disclosures."),
      },
    ],
  },
  {
    id: "promotions-rules",
    title: "Promotions / Contest Rules",
    route: "/legal/promotions-rules",
    category: "payments",
    ...META,
    summary: "Rules governing promotions and contests on the platform.",
    requiredForFlows: [],
    relatedDocuments: ["ads-sponsorships", "song-wars-rules"],
    contactEmail: "legal@treytv.example",
    contentPlaceholder: [
      {
        heading: "Promotions & Contests",
        body: PLACEHOLDER("Eligibility, entry, and prize rules placeholder."),
      },
    ],
  },

  // ── Support / Operations ──────────────────────────────────────────────────
  {
    id: "accessibility",
    title: "Accessibility Statement",
    route: "/legal/accessibility",
    category: "operations",
    ...META,
    summary: "Our commitment to an accessible experience and how to give feedback.",
    requiredForFlows: [],
    relatedDocuments: ["contact"],
    contactEmail: "accessibility@treytv.example",
    contentPlaceholder: [
      { heading: "Our Commitment", body: PLACEHOLDER("Commitment to accessibility.") },
      {
        heading: "Known Limitations & Assistive Tech",
        body: PLACEHOLDER("Known limitations and assistive-technology support placeholders."),
      },
      { heading: "Feedback", body: PLACEHOLDER("Contact accessibility@treytv.example.") },
    ],
  },
  {
    id: "law-enforcement",
    title: "Law Enforcement Request Info",
    route: "/legal/law-enforcement",
    category: "operations",
    ...META,
    summary: "Information for law enforcement requests (placeholder).",
    requiredForFlows: [],
    relatedDocuments: ["privacy"],
    contactEmail: "legal@treytv.example",
    contentPlaceholder: [
      {
        heading: "Requests",
        body: PLACEHOLDER("Process for handling law enforcement requests placeholder."),
      },
    ],
  },
  {
    id: "open-source-licenses",
    title: "Open Source Licenses",
    route: "/legal/open-source-licenses",
    category: "operations",
    ...META,
    summary: "Acknowledgements and licenses for open source software used in the app.",
    requiredForFlows: [],
    relatedDocuments: [],
    contactEmail: "legal@treytv.example",
    contentPlaceholder: [
      { heading: "Acknowledgements", body: PLACEHOLDER("Open source license list placeholder.") },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    route: "/legal/contact",
    category: "support",
    ...META,
    summary: "How to reach support, privacy, copyright, and legal teams.",
    requiredForFlows: [],
    relatedDocuments: ["accessibility"],
    contactEmail: "support@treytv.example",
    contentPlaceholder: [
      { heading: "Support", body: PLACEHOLDER("support@treytv.example") },
      { heading: "Privacy", body: PLACEHOLDER("privacy@treytv.example") },
      { heading: "Copyright / DMCA", body: PLACEHOLDER("dmca@treytv.example") },
      { heading: "Legal", body: PLACEHOLDER("legal@treytv.example") },
    ],
  },
];

export const LEGAL_DOCUMENT_MAP: Record<string, LegalDocument> = Object.fromEntries(
  LEGAL_DOCUMENTS.map((doc) => [doc.id, doc]),
);

export const getLegalDocument = (id: string): LegalDocument | undefined => LEGAL_DOCUMENT_MAP[id];

export const CATEGORY_LABELS: Record<LegalCategory, string> = {
  privacy: "Privacy & Data",
  terms: "Platform Rules",
  safety: "Safety",
  copyright: "Copyright",
  creator: "Creator",
  music: "Music",
  ai: "AI & Transparency",
  payments: "Payments & Commercial",
  support: "Support",
  operations: "Operations",
};

/** A link on the Legal Center home — points at a document or a form. */
export interface LegalLink {
  label: string;
  target: string; // doc id, or `form:<formId>`
}

export interface LegalHomeGroup {
  id: string;
  title: string;
  description: string;
  links: LegalLink[];
}

export const LEGAL_HOME_GROUPS: LegalHomeGroup[] = [
  {
    id: "privacy",
    title: "Privacy & Data",
    description: "How your data is handled and the controls you have.",
    links: [
      { label: "Privacy Policy", target: "privacy" },
      { label: "Notice at Collection", target: "notice-at-collection" },
      { label: "Cookie Policy", target: "cookies" },
      { label: "Your Privacy Choices", target: "privacy-choices" },
      { label: "Data Request", target: "form:data-rights" },
      { label: "Delete Account", target: "form:delete-account" },
      { label: "Data Retention", target: "data-retention" },
    ],
  },
  {
    id: "rules",
    title: "Platform Rules",
    description: "The rules that keep the community safe.",
    links: [
      { label: "Terms of Service", target: "terms" },
      { label: "Community Guidelines", target: "community-guidelines" },
      { label: "Acceptable Use Policy", target: "acceptable-use" },
      { label: "Moderation & Appeals", target: "moderation-appeals" },
      { label: "Safety Rules", target: "safety" },
      { label: "Minors Policy", target: "minors" },
    ],
  },
  {
    id: "creator",
    title: "Creator & Music Rules",
    description: "Rights and rules for creators.",
    links: [
      { label: "Creator Terms", target: "creator-terms" },
      { label: "Music Upload Terms", target: "music-upload-terms" },
      { label: "Producer / Beat Terms", target: "producer-terms" },
      { label: "DJ / Broadcast Terms", target: "dj-broadcast-terms" },
      { label: "Song Wars Rules", target: "song-wars-rules" },
      { label: "Copyright Policy", target: "copyright" },
      { label: "DMCA Policy", target: "dmca" },
    ],
  },
  {
    id: "ai",
    title: "AI & Recommendation Transparency",
    description: "How AI and Prescribe Me work.",
    links: [
      { label: "AI Disclosure", target: "ai-disclosure" },
      { label: "Prescribe Me Explanation", target: "prescribe-me" },
      { label: "Tradio Prescription Radio", target: "tradio-prescription-radio" },
      { label: "Automated Recommendation Notice", target: "automated-recommendation-notice" },
    ],
  },
  {
    id: "payments",
    title: "Payments / Commercial",
    description: "Subscriptions, refunds, ads, and monetization.",
    links: [
      { label: "Subscription Terms", target: "subscriptions" },
      { label: "Refund Policy", target: "refund-policy" },
      { label: "Promotions / Contest Rules", target: "promotions-rules" },
      { label: "Advertising & Sponsorship Disclosure", target: "ads-sponsorships" },
      { label: "Creator Monetization", target: "creator-monetization" },
    ],
  },
  {
    id: "support",
    title: "Support / Operations",
    description: "Contact, reporting, and operational info.",
    links: [
      { label: "Contact Support", target: "form:contact-support" },
      { label: "Report Content", target: "form:report-content" },
      { label: "Report Copyright", target: "form:report-copyright" },
      { label: "Appeal Moderation", target: "form:moderation-appeal" },
      { label: "Accessibility Statement", target: "accessibility" },
      { label: "Law Enforcement Request Info", target: "law-enforcement" },
      { label: "Open Source Licenses", target: "open-source-licenses" },
    ],
  },
];

export const LEGAL_STATUS_META: Record<LegalStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "border-white/15 bg-white/[0.05] text-white/60" },
  pending_review: {
    label: "Pending Legal Review",
    tone: "border-amber-300/30 bg-amber-500/10 text-amber-200",
  },
  approved: { label: "Approved", tone: "border-cyan-300/30 bg-cyan-500/10 text-cyan-200" },
  active: { label: "Active", tone: "border-emerald-300/30 bg-emerald-500/10 text-emerald-200" },
  archived: { label: "Archived", tone: "border-white/12 bg-white/[0.04] text-white/45" },
};
