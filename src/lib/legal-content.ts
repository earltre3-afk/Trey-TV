/**
 * Centralized legal & policy content for Trey TV.
 * Edit copy here — all routes render from this single source of truth.
 *
 * NOTE: This content is drafted in plain language and is intended for
 * attorney review prior to going live. Do not represent any of this text
 * as legal advice or as having been reviewed/approved by counsel.
 */

export const LEGAL_LAST_UPDATED = "May 9, 2026";
export const LEGAL_CONTACT_EMAIL = "[legal contact email]";
export const SUPPORT_CONTACT = "[support contact placeholder]";
export const COMPANY_NAME = "Trey TV";

export type LegalSection = {
  id: string;
  heading: string;
  body?: string[];
  list?: string[];
};

export type LegalPolicy = {
  slug: string;
  title: string;
  summary: string;
  category: "core" | "creator" | "user" | "ai" | "support";
  icon?: string;
  sections: LegalSection[];
};

export const POLICY_INDEX: {
  slug: string;
  title: string;
  summary: string;
  category: LegalPolicy["category"];
  icon: string;
}[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    summary: "The agreement between you and Trey TV.",
    category: "core",
    icon: "FileText",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What we collect and how it's used.",
    category: "core",
    icon: "ShieldCheck",
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    summary: "How we keep Trey TV welcoming and safe.",
    category: "user",
    icon: "Users",
  },
  {
    slug: "content-policy",
    title: "Content Policy",
    summary: "Rules for posts, episodes, and uploads.",
    category: "user",
    icon: "Film",
  },
  {
    slug: "creator-terms",
    title: "Creator Terms",
    summary: "Specific terms for creators on Trey TV.",
    category: "creator",
    icon: "Crown",
  },
  {
    slug: "risk-disclosure",
    title: "Risk Disclosure",
    summary: "Risks of using a live, social platform.",
    category: "user",
    icon: "AlertTriangle",
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    summary: "Cookies, local storage, and session tools.",
    category: "core",
    icon: "Cookie",
  },
  {
    slug: "dmca",
    title: "Copyright / DMCA Policy",
    summary: "Copyright complaints and takedown process.",
    category: "core",
    icon: "Copyright",
  },
  {
    slug: "accessibility",
    title: "Accessibility Statement",
    summary: "Our commitment to an accessible app.",
    category: "support",
    icon: "Accessibility",
  },
  {
    slug: "data-deletion",
    title: "Data Deletion Request",
    summary: "Request deletion, export, or correction.",
    category: "support",
    icon: "Trash2",
  },
  {
    slug: "subscription-terms",
    title: "Subscription & Digital Purchase Terms",
    summary: "Subscriptions, gifts, and rewards.",
    category: "core",
    icon: "CreditCard",
  },
  {
    slug: "ai-disclosure",
    title: "Trey-I / AI Assistant Disclosure",
    summary: "How Trey-I works and its limits.",
    category: "ai",
    icon: "Sparkles",
  },
];

export const POLICIES: Record<string, LegalPolicy> = {
  terms: {
    slug: "terms",
    title: "Terms of Service",
    category: "core",
    summary:
      "These Terms govern your access to and use of Trey TV. By creating an account or using the app, you agree to these Terms.",
    sections: [
      {
        id: "acceptance",
        heading: "Acceptance of Terms",
        body: [
          `By accessing or using ${COMPANY_NAME}, you agree to be bound by these Terms of Service and all referenced policies, including our Privacy Policy, Community Guidelines, Content Policy, and any product-specific terms. If you do not agree, do not use the platform.`,
          `We may update these Terms from time to time. Material changes will be communicated in-app or by email where reasonably possible.`,
        ],
      },
      {
        id: "eligibility",
        heading: "Eligibility & Age Requirements",
        body: [
          `You must be at least the minimum age required in your jurisdiction to enter a binding contract and to use a social media or entertainment service. Some features may require you to be 18+.`,
          `You agree to provide accurate information when creating your account and keep that information current.`,
        ],
      },
      {
        id: "registration",
        heading: "Account Registration",
        body: [
          `You are responsible for maintaining the security of your login credentials. You are responsible for all activity under your account. Notify us immediately if you suspect unauthorized access.`,
        ],
      },
      {
        id: "responsibilities",
        heading: "User Responsibilities",
        body: [
          `You agree to use Trey TV in compliance with applicable laws, these Terms, and our Community Guidelines. You will not misuse the service, attempt to disrupt it, or use it to harm others.`,
        ],
      },
      {
        id: "ugc",
        heading: "User-Generated Content",
        body: [
          `You retain ownership of content you post, upload, or share. By submitting content to Trey TV, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, modify (for technical purposes such as transcoding and resizing), publicly display, and distribute that content as needed to operate, promote, and improve the service.`,
          `You represent that you have the rights necessary to grant this license, and that your content does not violate the rights of others or applicable law.`,
        ],
      },
      {
        id: "creator-uploads",
        heading: "Creator Uploads & Episode Content",
        body: [
          `If you publish episodes, shows, livestreams, or premium content, you are responsible for ensuring you own or have permission to use all elements of that content, including music, footage, talent likeness, and trademarks. Additional rules apply under the Creator Terms and Content Policy.`,
        ],
      },
      {
        id: "license-to-treytv",
        heading: "Content Ownership & License to Trey TV",
        body: [
          `You own your content. The license you grant Trey TV is limited to what is reasonably needed to operate, secure, moderate, market, and improve the service, and survives termination only to the extent necessary for these purposes (for example, backups, anti-abuse, and legal preservation).`,
        ],
      },
      {
        id: "prohibited",
        heading: "Prohibited Conduct",
        list: [
          "Harassment, threats, hate speech, or targeted abuse",
          "Sexual content involving minors or any exploitation of minors",
          "Doxing, stalking, or sharing private information without consent",
          "Impersonation or deceptive identity",
          "Spam, scams, fake engagement, or inflated metrics",
          "Uploading malware, attempting to breach security, or scraping the service",
          "Infringing intellectual property, publicity, or privacy rights",
          "Illegal activity or content that violates applicable law",
        ],
      },
      {
        id: "interactions",
        heading: "Community Interactions",
        body: [
          `Comments, reactions, messaging, and other social features must follow our Community Guidelines. We may moderate, limit, hide, or remove interactions that violate our policies.`,
        ],
      },
      {
        id: "rewards",
        heading: "Rewards, Points, Gifts & Digital Features",
        body: [
          `Rewards, points, gifts, and other digital features have no cash value unless we expressly state otherwise. Additional terms apply under our Subscription & Digital Purchase Terms.`,
        ],
      },
      {
        id: "changes",
        heading: "Platform Changes & Availability",
        body: [
          `We may modify, suspend, or discontinue features at any time. We strive for high uptime but do not guarantee uninterrupted availability.`,
        ],
      },
      {
        id: "termination",
        heading: "Account Suspension or Termination",
        body: [
          `We may suspend or terminate accounts that violate these Terms or our policies, or where required by law. You may close your account at any time using the in-app settings or our Data Deletion request.`,
        ],
      },
      {
        id: "disclaimers",
        heading: "Disclaimers",
        body: [
          `The service is provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.`,
        ],
      },
      {
        id: "liability",
        heading: "Limitation of Liability",
        body: [
          `To the maximum extent permitted by law, Trey TV will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of or in connection with the service.`,
        ],
      },
      {
        id: "indemnification",
        heading: "Indemnification",
        body: [
          `You agree to defend, indemnify, and hold harmless Trey TV and its affiliates, officers, employees, and agents from any claim arising out of your content, your use of the service, or your violation of these Terms or applicable law.`,
        ],
      },
      {
        id: "disputes",
        heading: "Dispute Resolution",
        body: [
          `[Dispute resolution placeholder — to be finalized by counsel. May include informal resolution, arbitration, class action waiver, and venue.]`,
        ],
      },
      {
        id: "governing-law",
        heading: "Governing Law",
        body: [`[Governing law placeholder — to be finalized by counsel.]`],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [`Questions about these Terms? Reach us at ${LEGAL_CONTACT_EMAIL}.`],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    category: "core",
    summary:
      "This Privacy Policy explains what information Trey TV collects, how we use it, who we share it with, and the choices you have.",
    sections: [
      {
        id: "collected",
        heading: "Information We Collect",
        body: [
          `We collect information you provide directly, information generated through your use of the service, and information from third parties (such as service providers and authentication partners).`,
        ],
      },
      {
        id: "account",
        heading: "Account & Profile Information",
        list: [
          "Name, username, email address, password",
          "Profile details such as display name, avatar, banner, bio, location, and links",
          "Role (viewer, creator) and verification status where applicable",
        ],
      },
      {
        id: "dob-location",
        heading: "Date of Birth & Broad Location",
        body: [
          `We may collect your date of birth to confirm eligibility, enforce age-restricted features, and personalize your experience. We may use broad/approximate location (such as country or region) to tailor content and comply with legal requirements. We do not require precise GPS location for core features.`,
        ],
      },
      {
        id: "preferences",
        heading: "Content Preferences & Prescribe Me Selections",
        body: [
          `Your topic selections, follow lists, watch history, ratings, reactions, and Prescribe Me inputs help us recommend shows, episodes, and creators. You can adjust these in Settings.`,
        ],
      },
      {
        id: "uploads",
        heading: "Uploaded Photos, Videos, Posts, Comments & Reactions",
        body: [
          `Content you upload — including photos, banners, episode files, posts, comments, and reactions — is stored to operate the service, deliver it to viewers, and enable safety/moderation tooling.`,
        ],
      },
      {
        id: "trey-i",
        heading: "Trey-I Voice / Chat Onboarding Data",
        body: [
          `If you use Trey-I to set up your profile or receive recommendations, we may process your voice or chat input to provide that feature. You can review and edit information before it is saved to your profile. See our Trey-I / AI Assistant Disclosure for details.`,
        ],
      },
      {
        id: "device",
        heading: "Device, Usage, Analytics & Log Data",
        list: [
          "Device type, operating system, browser, app version",
          "IP address (used in part for broad geolocation and security)",
          "Pages and screens viewed, features used, performance and crash logs",
          "Referring URLs and timestamps",
        ],
      },
      {
        id: "cookies",
        heading: "Cookies, Local Storage & Session Technologies",
        body: [
          `We use cookies, local storage, and similar technologies for authentication, preferences, analytics, and abuse prevention. See our Cookie Policy for details.`,
        ],
      },
      {
        id: "use",
        heading: "How We Use Information",
        list: [
          "To provide, maintain, secure, and improve the service",
          "To personalize content, recommendations, and notifications",
          "To enforce our Terms and policies and prevent abuse",
          "To communicate with you about updates, support, and legal notices",
          "To comply with legal obligations and respond to lawful requests",
        ],
      },
      {
        id: "sharing",
        heading: "How We Share Information",
        body: [
          `We share information with service providers that help us run the platform (hosting, analytics, payments, communications, moderation), with creators and other users when you publicly post or interact, and as required by law.`,
          `We do not sell personal information for monetary consideration. Some sharing may be considered "sharing" under certain state laws; see "Privacy Choices" below.`,
        ],
      },
      {
        id: "providers",
        heading: "Service Providers",
        body: [
          `Service providers process information on our behalf under contractual obligations and only as needed to deliver their services to us.`,
        ],
      },
      {
        id: "creator-visibility",
        heading: "Creator & Public Profile Visibility",
        body: [
          `Profiles, posts, episodes, and creator pages may be publicly visible. Be mindful of what you choose to display publicly.`,
        ],
      },
      {
        id: "choices",
        heading: "Privacy Choices",
        list: [
          "Update your profile and preferences in Settings",
          "Manage notifications, content preferences, and visibility",
          "Use the in-app Data Deletion form to request deletion or export",
        ],
      },
      {
        id: "rights",
        heading: "Data Access, Correction, Deletion & Export",
        body: [
          `Depending on your jurisdiction, you may have the right to access, correct, delete, port, or restrict processing of your personal information. To make a request, use our Data Deletion Request page.`,
        ],
      },
      {
        id: "minors",
        heading: "Children & Minors",
        body: [
          `Trey TV is not directed to children under the minimum age permitted in your jurisdiction. We do not knowingly collect personal information from children under that age. If you believe a child has provided us information, contact ${LEGAL_CONTACT_EMAIL}.`,
        ],
      },
      {
        id: "security",
        heading: "Security Practices",
        body: [
          `We use administrative, technical, and physical safeguards designed to protect personal information. No method of transmission or storage is 100% secure.`,
        ],
      },
      {
        id: "retention",
        heading: "Retention",
        body: [
          `We retain information for as long as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements. We may retain certain information after account deletion when required by law or for legitimate safety/security purposes.`,
        ],
      },
      {
        id: "international",
        heading: "International & State Privacy Rights",
        body: [
          `[International / state privacy rights placeholder — to be finalized by counsel. May include EEA/UK/Swiss rights, US state rights such as CA, CO, CT, VA, UT, and others, and applicable transfer mechanisms.]`,
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [`Privacy questions or requests can be sent to ${LEGAL_CONTACT_EMAIL}.`],
      },
    ],
  },

  "community-guidelines": {
    slug: "community-guidelines",
    title: "Community Guidelines",
    category: "user",
    summary:
      "Trey TV is built for entertainment, creativity, and real connection. These guidelines keep the community welcoming and safe.",
    sections: [
      {
        id: "respect",
        heading: "Respect Everyone",
        body: [
          `Trey TV is for all kinds of viewers and creators. Treat others the way you want to be treated. Disagreement is fine; cruelty is not.`,
        ],
      },
      {
        id: "no-harm",
        heading: "Zero Tolerance Behavior",
        list: [
          "Harassment, threats, or targeted abuse",
          "Hate speech or discrimination based on protected characteristics",
          "Sexual exploitation, especially involving minors",
          "Stalking, doxing, or sharing private information",
          "Impersonation or deceptive identity",
          "Spam, scams, fake engagement, or manipulated metrics",
          "Promotion of illegal activity or violence",
        ],
      },
      {
        id: "content",
        heading: "Content Standards",
        body: [
          `Posts, comments, messages, episodes, profile content, and live interactions must follow our Content Policy. Some content may be age-gated; some content is not allowed at all.`,
        ],
      },
      {
        id: "reporting",
        heading: "Reporting Content",
        body: [
          `If you see something that violates our policies, use the in-app report button. Reports are reviewed by our moderation team. We may take action on content, accounts, or both.`,
        ],
      },
      {
        id: "moderation",
        heading: "Moderation Actions",
        list: [
          "Content removal or labeling",
          "Limits on visibility or distribution",
          "Temporary feature limits",
          "Account warnings, suspensions, or termination",
        ],
      },
      {
        id: "appeals",
        heading: "Appeals",
        body: [
          `If you believe a moderation action was made in error, you may submit an appeal. [Appeal flow placeholder — final intake details to be confirmed.]`,
        ],
      },
      {
        id: "creators",
        heading: "Creator Conduct Expectations",
        body: [
          `Creators have an outsized influence on the community. We expect creators to model the behavior they want to see, respect their audiences, and follow Creator Terms and Content Policy.`,
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [`Questions about a moderation decision: ${SUPPORT_CONTACT}.`],
      },
    ],
  },

  "content-policy": {
    slug: "content-policy",
    title: "Content Policy",
    category: "user",
    summary: "Rules for what can be posted, uploaded, and broadcast on Trey TV.",
    sections: [
      {
        id: "creator-uploads",
        heading: "Creator Uploads",
        body: [
          `Creators are responsible for everything they upload, including video, audio, thumbnails, episode metadata, descriptions, and titles.`,
        ],
      },
      {
        id: "episodes",
        heading: "Episodes & Show Content",
        body: [
          `Episodes must comply with this Content Policy and applicable law. Episodes that violate our rules may be removed, age-restricted, or demonetized.`,
        ],
      },
      {
        id: "copyright",
        heading: "Copyright Ownership",
        body: [
          `Only upload content that you own or are licensed to use. This includes background music, clips, voiceovers, b-roll, and any third-party material.`,
        ],
      },
      {
        id: "third-party",
        heading: "Music, Footage, Likeness & Trademarks",
        body: [
          `You must have the rights to all music, footage, talent likeness, and trademarks featured in your uploads. Failure to clear rights may result in content removal and account action under our Copyright / DMCA Policy.`,
        ],
      },
      {
        id: "mature",
        heading: "Mature Content Labeling",
        body: [
          `Some content may require age-restriction or labeling. Creators must accurately label mature content. Sexual content involving minors is strictly prohibited and will be reported to authorities.`,
        ],
      },
      {
        id: "prohibited",
        heading: "Prohibited Content",
        list: [
          "Illegal content or content that promotes illegal acts",
          "Sexual content involving minors",
          "Content depicting graphic violence, gore, or animal cruelty",
          "Doxing or sharing private information",
          "Content designed to manipulate elections, defraud users, or impersonate public officials",
        ],
      },
      {
        id: "misleading",
        heading: "Misleading Content",
        body: [
          `Do not post deceptive content that could cause real-world harm, including health misinformation, deceptive deepfakes, and fraudulent claims.`,
        ],
      },
      {
        id: "ai",
        heading: "AI-Assisted Content Disclosure",
        body: [
          `If your content is materially generated or altered by AI in a way that a reasonable viewer would want to know, disclose it. Synthetic depictions of real people require their consent where required by law.`,
        ],
      },
      {
        id: "review",
        heading: "Platform Review & Removal Rights",
        body: [
          `Trey TV may review, label, restrict, or remove content that violates this policy or is otherwise unlawful or harmful.`,
        ],
      },
      {
        id: "fake-engagement",
        heading: "No Fake Engagement",
        body: [
          `Do not buy, sell, or coordinate fake views, follows, reactions, comments, or any other engagement metric.`,
        ],
      },
      {
        id: "first-two-free",
        heading: "First-Two-Free Episode Policy",
        body: [
          `Where applicable, the first two episodes of a series may be made freely available to viewers as part of show discovery. Creators participating in this discovery experience agree to this preview availability.`,
        ],
      },
      {
        id: "contact",
        heading: "Contact",
        body: [`Report violations using the in-app report flow or email ${SUPPORT_CONTACT}.`],
      },
    ],
  },

  "creator-terms": {
    slug: "creator-terms",
    title: "Creator Terms",
    category: "creator",
    summary:
      "These terms apply to creators who publish content, run shows, or use Creator Studio on Trey TV.",
    sections: [
      {
        id: "eligibility",
        heading: "Creator Eligibility",
        body: [
          `To publish as a creator, you must meet the minimum age requirement, hold a valid Trey TV account in good standing, and follow our Terms, Community Guidelines, and Content Policy.`,
        ],
      },
      {
        id: "application",
        heading: "Application & Review",
        body: [
          `Creator status may require an application or review. We may approve, deny, or revoke creator status at our discretion, including based on content history, identity verification, and compliance with our policies.`,
        ],
      },
      {
        id: "rights",
        heading: "Upload Rights & Ownership",
        body: [
          `You retain ownership of your content. By uploading, you grant Trey TV the license described in our Terms of Service to host, distribute, and promote your content on the platform.`,
        ],
      },
      {
        id: "responsibility",
        heading: "Creator Responsibility for Content",
        body: [
          `You are solely responsible for the content you publish, including securing all necessary rights, releases, clearances, and consents. You agree to defend Trey TV from claims arising out of your content.`,
        ],
      },
      {
        id: "interactions",
        heading: "Viewer Interaction Expectations",
        body: [
          `Treat your audience with respect. Do not encourage harassment, dogpiling, or behavior that violates our Community Guidelines.`,
        ],
      },
      {
        id: "publishing",
        heading: "Show & Episode Publishing Rules",
        body: [
          `Episodes must include accurate metadata. Mature content must be properly labeled. Submissions may be queued for moderation and may be edited (for example, thumbnails or labels) where required for compliance.`,
        ],
      },
      {
        id: "studio",
        heading: "Creator Studio Usage",
        body: [
          `Creator Studio is provided to help you manage uploads, schedules, analytics, and monetization tools. You agree not to misuse Studio features, scrape data, or abuse APIs.`,
        ],
      },
      {
        id: "moderation",
        heading: "Moderation & Removal",
        body: [
          `We may remove, restrict, or label content that violates our policies or applicable law. Repeat violations may result in suspension or termination of creator status.`,
        ],
      },
      {
        id: "no-guarantees",
        heading: "No Guarantees",
        body: [
          `Trey TV does not guarantee fame, audience growth, views, monetization, payouts, approval, placement, promotion, or any specific outcome from publishing on the platform.`,
        ],
      },
      {
        id: "monetization",
        heading: "Subscriptions, Gifts, Rewards & Monetization",
        body: [
          `Monetization features such as subscriptions, gifts, rewards, and payouts are governed by additional product terms, including our Subscription & Digital Purchase Terms. [Detailed monetization terms placeholder.]`,
        ],
      },
      {
        id: "license",
        heading: "License to Display & Distribute",
        body: [
          `As described in our Terms of Service, you grant Trey TV a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, modify (for technical purposes), publicly display, and distribute your content as part of operating and promoting the service.`,
        ],
      },
      {
        id: "termination",
        heading: "Account Termination",
        body: [
          `We may suspend or terminate creator status for policy violations, legal reasons, or risk to users. You may stop publishing or close your account at any time.`,
        ],
      },
      {
        id: "contact",
        heading: "Contact / Support",
        body: [`Creator support: ${SUPPORT_CONTACT}.`],
      },
    ],
  },

  "risk-disclosure": {
    slug: "risk-disclosure",
    title: "Risk Disclosure",
    category: "user",
    summary:
      "Using a live, social, creator-driven platform involves real-world risks. Please read this disclosure carefully.",
    sections: [
      {
        id: "ugc",
        heading: "User-Generated Content Risk",
        body: [
          `Trey TV hosts content created by users and creators. We do not pre-screen all content and cannot guarantee its accuracy, safety, legality, or quality.`,
        ],
      },
      {
        id: "creator",
        heading: "Creator Content Themes",
        body: [
          `Creator content may include opinion, entertainment, emotional or mature themes, and dramatic presentation. Use viewer discretion.`,
        ],
      },
      {
        id: "discretion",
        heading: "Viewer Discretion",
        body: [
          `You are responsible for what you choose to watch, follow, share, and engage with. Use age-restriction, mute, block, and report tools as needed.`,
        ],
      },
      {
        id: "no-success",
        heading: "No Guarantee of Creator Success",
        body: [
          `We do not guarantee creator success, audience growth, income, approval, visibility, rewards value, or content performance.`,
        ],
      },
      {
        id: "social",
        heading: "Social Interaction Risks",
        body: [
          `Comments, messaging, and live interactions can be unpredictable. Block, mute, and report tools are available; not all interactions can be moderated in real time.`,
        ],
      },
      {
        id: "ai",
        heading: "Trey-I / AI Assistant Limitations",
        body: [
          `Trey-I is a helpful assistant, not a substitute for professional advice. Outputs can be inaccurate or incomplete. Verify important details on your own.`,
        ],
      },
      {
        id: "availability",
        heading: "Technical Availability",
        body: [
          `The service may be temporarily unavailable due to maintenance, outages, or factors outside our control.`,
        ],
      },
      {
        id: "third-party",
        heading: "Third-Party Services",
        body: [
          `Trey TV integrates with third-party services for hosting, payments, analytics, and more. Their terms and risks apply to their portions of the service.`,
        ],
      },
      {
        id: "rewards",
        heading: "Digital Rewards & Subscriptions",
        body: [
          `Digital rewards, gifts, and points have no cash value unless we expressly state otherwise. Features may change. See Subscription & Digital Purchase Terms.`,
        ],
      },
      {
        id: "responsibility",
        heading: "Your Responsibility",
        body: [
          `You are responsible for what you post, upload, buy, watch, share, and rely on through Trey TV.`,
        ],
      },
    ],
  },

  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    category: "core",
    summary: "How Trey TV uses cookies, local storage, and similar technologies.",
    sections: [
      {
        id: "what",
        heading: "What Cookies & Local Storage Are",
        body: [
          `Cookies and local storage are small pieces of data stored on your device by the app or your browser. We use these technologies to keep you signed in, remember preferences, measure performance, and prevent abuse.`,
        ],
      },
      {
        id: "essential",
        heading: "Essential Cookies",
        body: [
          `Required for core functionality such as authentication, session management, and security. The service cannot function without these.`,
        ],
      },
      {
        id: "analytics",
        heading: "Analytics & Performance",
        body: [
          `Used to understand how the app is used, measure performance, and improve features. May be disabled where required by law.`,
        ],
      },
      {
        id: "preferences",
        heading: "Preferences & Session Storage",
        body: [
          `Used to remember your settings, theme, and recent activity to make the experience smoother.`,
        ],
      },
      {
        id: "auth",
        heading: "Authentication / Session Usage",
        body: [
          `We use cookies/local storage to keep you signed in and to detect and prevent unauthorized access to your account.`,
        ],
      },
      {
        id: "manage",
        heading: "How You Can Manage Cookies",
        body: [
          `Most browsers let you block or delete cookies. Some app settings let you control non-essential storage. Disabling essential cookies may break parts of Trey TV.`,
        ],
      },
      {
        id: "controls",
        heading: "Browser Controls",
        body: [
          `Refer to your browser or device documentation for instructions on managing cookies and local storage.`,
        ],
      },
      { id: "contact", heading: "Contact", body: [`Cookie questions: ${LEGAL_CONTACT_EMAIL}.`] },
    ],
  },

  dmca: {
    slug: "dmca",
    title: "Copyright / DMCA Policy",
    category: "core",
    summary: "How to report copyright infringement on Trey TV and how we handle takedown notices.",
    sections: [
      {
        id: "process",
        heading: "Copyright Complaint Process",
        body: [
          `If you believe content on Trey TV infringes your copyright, you may submit a written takedown notice to our designated agent.`,
        ],
      },
      {
        id: "required",
        heading: "Required Information for a Takedown Notice",
        list: [
          "Your name, address, telephone number, and email",
          "Identification of the copyrighted work claimed to be infringed",
          "Identification of the material claimed to be infringing and where it is located",
          "A statement that you have a good-faith belief the use is not authorized",
          "A statement, under penalty of perjury, that the information is accurate and you are authorized to act",
          "Your physical or electronic signature",
        ],
      },
      {
        id: "counter",
        heading: "Counter-Notification",
        body: [
          `If your content was removed and you believe it was a mistake or misidentification, you may submit a counter-notification. [Counter-notification details placeholder.]`,
        ],
      },
      {
        id: "repeat",
        heading: "Repeat Infringer Policy",
        body: [
          `We terminate accounts of users determined to be repeat infringers in appropriate circumstances.`,
        ],
      },
      {
        id: "creator",
        heading: "Creator Responsibility",
        body: [
          `Creators are responsible for clearing rights to all elements of uploaded content. See our Content Policy and Creator Terms.`,
        ],
      },
      {
        id: "contact",
        heading: "Designated Copyright Contact",
        body: [`Send copyright notices to ${LEGAL_CONTACT_EMAIL}.`],
      },
    ],
  },

  accessibility: {
    slug: "accessibility",
    title: "Accessibility Statement",
    category: "support",
    summary: "Trey TV is committed to building an accessible, inclusive entertainment experience.",
    sections: [
      {
        id: "commitment",
        heading: "Our Commitment",
        body: [
          `We strive to make Trey TV usable by as many people as possible, regardless of ability or technology. Accessibility is an ongoing effort, and we welcome feedback.`,
        ],
      },
      {
        id: "goals",
        heading: "Supported Accessibility Goals",
        list: [
          "Meaningful color contrast and readable typography",
          "Keyboard navigation across primary flows",
          "Focus indicators on interactive elements",
          "Screen-reader-friendly labels for key controls",
          "Captions or subtitles where supported",
          "Reduced-motion considerations for users who prefer less animation",
        ],
      },
      {
        id: "feedback",
        heading: "Feedback & Contact",
        body: [
          `If you encounter an accessibility barrier, please tell us at ${SUPPORT_CONTACT}. Your feedback directly informs improvements.`,
        ],
      },
      {
        id: "ongoing",
        heading: "Ongoing Improvement",
        body: [
          `Accessibility work is never finished. We continue to test, fix, and add features to make Trey TV more accessible over time.`,
        ],
      },
    ],
  },

  "data-deletion": {
    slug: "data-deletion",
    title: "Data Deletion Request",
    category: "support",
    summary:
      "Use this page to request deletion, export, correction, or other data action on your Trey TV account.",
    sections: [
      {
        id: "how",
        heading: "How to Request",
        body: [
          `Submit the form on this page and we will follow up using the contact information you provide. You may also email ${LEGAL_CONTACT_EMAIL}.`,
        ],
      },
      {
        id: "deleted",
        heading: "What May Be Deleted",
        list: [
          "Profile information",
          "Posts, comments, reactions, and uploaded media",
          "Watch history and recommendation signals",
          "Saved settings and preferences",
        ],
      },
      {
        id: "retained",
        heading: "What May Be Retained",
        body: [
          `We may retain limited information for legal, safety, security, or fraud-prevention reasons, or where required by law. Backups may persist for a limited window before being overwritten.`,
        ],
      },
      {
        id: "verification",
        heading: "Verification",
        body: [
          `For your protection, we may need to verify your identity before processing certain requests.`,
        ],
      },
    ],
  },

  "subscription-terms": {
    slug: "subscription-terms",
    title: "Subscription & Digital Purchase Terms",
    category: "core",
    summary:
      "Terms for Trey TV Plus, subscriptions, creator gifts, rewards, and other digital purchases.",
    sections: [
      {
        id: "plus",
        heading: "Trey TV Plus",
        body: [
          `Trey TV Plus [placeholder] is a paid membership that may include premium features, perks, and content. Specific benefits, pricing, and availability may vary by region and over time.`,
        ],
      },
      {
        id: "subscriptions",
        heading: "Subscriptions",
        body: [
          `Subscriptions renew automatically until canceled. You can manage or cancel your subscription in Settings or via the app store/payment platform you used to subscribe.`,
        ],
      },
      {
        id: "gifts",
        heading: "Creator Gifts",
        body: [
          `Gifts are digital items used to support creators or unlock interactions. Gifts have no cash value unless explicitly stated.`,
        ],
      },
      {
        id: "rewards",
        heading: "Rewards & Points",
        body: [
          `Rewards and points are promotional features that may be earned, redeemed, or expire under their associated rules. They are not currency, are not transferable except where allowed, and have no cash value unless explicitly stated.`,
        ],
      },
      {
        id: "digital-only",
        heading: "Digital-Only Purchases",
        body: [
          `Digital purchases are non-tangible and are typically delivered immediately. Refund availability depends on jurisdiction and platform of purchase.`,
        ],
      },
      {
        id: "no-cash",
        heading: "No Cash Value",
        body: [
          `Unless we expressly state otherwise, digital items, points, gifts, and rewards have no cash value and are non-transferable outside the platform.`,
        ],
      },
      {
        id: "refunds",
        heading: "Refund Policy",
        body: [
          `[Refund policy placeholder — final terms to be confirmed by counsel and aligned with payment platforms and applicable consumer law.]`,
        ],
      },
      {
        id: "cancellation",
        heading: "Cancellation",
        body: [
          `Cancel any time before your renewal date. Access to subscription benefits typically continues until the end of the paid period.`,
        ],
      },
      {
        id: "renewal",
        heading: "Renewal",
        body: [
          `By subscribing, you authorize recurring charges using your selected payment method until you cancel.`,
        ],
      },
      {
        id: "failed",
        heading: "Failed Payments",
        body: [
          `If a payment fails, we may attempt to reprocess and may suspend access to paid features until payment is resolved.`,
        ],
      },
      {
        id: "store",
        heading: "App Store / Third-Party Payments",
        body: [
          `Purchases made through an app store or third-party payment platform are also subject to the terms of that platform.`,
        ],
      },
      { id: "contact", heading: "Contact", body: [`Billing questions: ${SUPPORT_CONTACT}.`] },
    ],
  },

  "ai-disclosure": {
    slug: "ai-disclosure",
    title: "Trey-I / AI Assistant Disclosure",
    category: "ai",
    summary: "How Trey-I works, what data it processes, and what it should not be used for.",
    sections: [
      {
        id: "what",
        heading: "What Trey-I Does",
        body: [
          `Trey-I is an in-app assistant that can help you set up your profile, find shows and creators you'll love, and explore the app conversationally.`,
        ],
      },
      {
        id: "onboarding",
        heading: "Onboarding & Profile Help",
        body: [
          `Trey-I may help collect onboarding and profile information. You can review, edit, and confirm anything before it is saved to your profile.`,
        ],
      },
      {
        id: "review",
        heading: "Review Before Publishing",
        body: [
          `Suggestions from Trey-I are drafts. You decide what is published, kept, or discarded.`,
        ],
      },
      {
        id: "not-advice",
        heading: "Not Legal, Medical, Financial, or Emergency Advice",
        body: [
          `Trey-I is not a substitute for professional advice. Do not rely on Trey-I for legal, medical, financial, or emergency decisions. In an emergency, contact your local emergency services.`,
        ],
      },
      {
        id: "voice-data",
        heading: "Voice & Chat Data",
        body: [
          `When you use Trey-I, your voice or chat input may be processed to provide the feature, including transcription and recommendation generation. See our Privacy Policy.`,
        ],
      },
      {
        id: "sensitive",
        heading: "Avoid Sharing Sensitive Information",
        body: [
          `Do not share information you would not want processed by an AI feature, such as government IDs, payment details, or sensitive personal data unrelated to setting up your profile.`,
        ],
      },
      {
        id: "availability",
        heading: "Availability",
        body: [
          `Trey-I features may vary by device, region, account type, or time. We may add, change, or remove capabilities.`,
        ],
      },
      {
        id: "contact",
        heading: "Privacy Requests",
        body: [`Privacy questions related to Trey-I: ${LEGAL_CONTACT_EMAIL}.`],
      },
    ],
  },
};

export function getPolicy(slug: string): LegalPolicy | undefined {
  return POLICIES[slug];
}
