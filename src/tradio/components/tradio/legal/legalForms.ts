/**
 * TREY TV / TRADIO — Legal & Operations form configs.
 *
 * Frontend-only placeholders. None of these submit to a backend yet; on submit
 * they show a confirmation state and log intent. Real intake (storage, email,
 * audit, admin review queue) is planned for Legal Pass 2.
 */

export type LegalFieldType = "text" | "email" | "textarea" | "select" | "url" | "checkbox";

export interface LegalFormField {
  name: string;
  label: string;
  type: LegalFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  help?: string;
}

export interface LegalFormConfig {
  id: string;
  title: string;
  route: string;
  summary: string;
  submitLabel: string;
  /** Related legal document id for context. */
  relatedDocument?: string;
  fields: LegalFormField[];
  /** Extra acknowledgement shown above submit. */
  acknowledgement?: string;
}

export const LEGAL_FORMS: Record<string, LegalFormConfig> = {
  "contact-support": {
    id: "contact-support",
    title: "Contact Support",
    route: "/legal/contact",
    summary: "Reach the support team. We’ll route your message to the right place.",
    submitLabel: "Send Message",
    relatedDocument: "contact",
    fields: [
      {
        name: "email",
        label: "Your email",
        type: "email",
        required: true,
        placeholder: "you@example.com",
      },
      {
        name: "topic",
        label: "Topic",
        type: "select",
        required: true,
        options: ["General", "Account", "Privacy", "Billing", "Bug", "Other"],
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        required: true,
        placeholder: "How can we help?",
      },
    ],
  },
  "report-content": {
    id: "report-content",
    title: "Report Content",
    route: "/legal/report-content",
    summary: "Report content that may violate our Community Guidelines.",
    submitLabel: "Submit Report",
    relatedDocument: "community-guidelines",
    fields: [
      { name: "email", label: "Your email", type: "email", required: true },
      {
        name: "contentUrl",
        label: "Content link / location",
        type: "text",
        required: true,
        placeholder: "Where is the content?",
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        required: true,
        options: [
          "Harassment",
          "Hate/Abuse",
          "Violence",
          "Sexual content",
          "Spam/Scam",
          "Impersonation",
          "Illegal",
          "Other",
        ],
      },
      { name: "details", label: "Details", type: "textarea", required: true },
    ],
  },
  "report-copyright": {
    id: "report-copyright",
    title: "Report Copyright Infringement",
    route: "/legal/report-copyright",
    summary:
      "Report content you believe infringes your copyright. For formal DMCA, use the DMCA notice form.",
    submitLabel: "Submit Report",
    relatedDocument: "copyright",
    fields: [
      { name: "email", label: "Your email", type: "email", required: true },
      { name: "workDescription", label: "Your copyrighted work", type: "textarea", required: true },
      { name: "infringingUrl", label: "Infringing content link", type: "text", required: true },
      { name: "details", label: "Details", type: "textarea" },
    ],
  },
  "dmca-notice": {
    id: "dmca-notice",
    title: "Submit DMCA Notice",
    route: "/legal/dmca",
    summary:
      "Formal notice of claimed copyright infringement. Submitting a false claim may have legal consequences.",
    submitLabel: "Submit DMCA Notice",
    relatedDocument: "dmca",
    acknowledgement:
      "I have a good-faith belief that the use is not authorized, and the information is accurate. (Placeholder — pending legal review.)",
    fields: [
      { name: "fullName", label: "Full legal name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "rightsHolder", label: "Rights holder", type: "text", required: true },
      { name: "work", label: "Copyrighted work(s)", type: "textarea", required: true },
      {
        name: "infringingUrl",
        label: "Infringing material location(s)",
        type: "textarea",
        required: true,
      },
      {
        name: "signature",
        label: "Electronic signature (type your name)",
        type: "text",
        required: true,
      },
    ],
  },
  "dmca-counter-notice": {
    id: "dmca-counter-notice",
    title: "Submit DMCA Counter-Notice",
    route: "/legal/dmca",
    summary:
      "Dispute a takedown of your content. Submitting a false counter-notice may have legal consequences.",
    submitLabel: "Submit Counter-Notice",
    relatedDocument: "dmca",
    acknowledgement:
      "I consent to the applicable jurisdiction and have a good-faith belief the material was removed by mistake. (Placeholder — pending legal review.)",
    fields: [
      { name: "fullName", label: "Full legal name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "removedContent",
        label: "Removed content / location",
        type: "textarea",
        required: true,
      },
      { name: "reason", label: "Why it should be restored", type: "textarea", required: true },
      {
        name: "signature",
        label: "Electronic signature (type your name)",
        type: "text",
        required: true,
      },
    ],
  },
  "data-rights": {
    id: "data-rights",
    title: "Data Request",
    route: "/legal/data-rights",
    summary:
      "Request access to, correction, deletion, or export of your data, or opt out where applicable.",
    submitLabel: "Submit Request",
    relatedDocument: "privacy-choices",
    fields: [
      { name: "email", label: "Account email", type: "email", required: true },
      {
        name: "requestType",
        label: "Request type",
        type: "select",
        required: true,
        options: [
          "Access my data",
          "Correct my data",
          "Delete my data",
          "Export my data",
          "Opt out of sale/share",
          "Appeal a privacy decision",
        ],
      },
      { name: "details", label: "Details", type: "textarea" },
    ],
  },
  "moderation-appeal": {
    id: "moderation-appeal",
    title: "Appeal Moderation Action",
    route: "/legal/moderation-appeals",
    summary: "Appeal a content removal or account/role restriction.",
    submitLabel: "Submit Appeal",
    relatedDocument: "moderation-appeals",
    fields: [
      { name: "email", label: "Account email", type: "email", required: true },
      {
        name: "actionType",
        label: "Action being appealed",
        type: "select",
        required: true,
        options: ["Content removed", "Account restricted", "Role access restricted", "Other"],
      },
      { name: "reference", label: "Reference / content link", type: "text" },
      {
        name: "reason",
        label: "Why should this be reconsidered?",
        type: "textarea",
        required: true,
      },
    ],
  },
  "role-appeal": {
    id: "role-appeal",
    title: "Appeal Role Access Decision",
    route: "/legal/moderation-appeals",
    summary: "Appeal a denied or restricted creator role request.",
    submitLabel: "Submit Appeal",
    relatedDocument: "creator-terms",
    fields: [
      { name: "email", label: "Account email", type: "email", required: true },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: ["Artist", "Producer", "DJ / Host", "Broadcast", "Verification"],
      },
      {
        name: "reason",
        label: "Why should this be reconsidered?",
        type: "textarea",
        required: true,
      },
    ],
  },
  "report-safety": {
    id: "report-safety",
    title: "Report a Safety Issue",
    route: "/legal/safety",
    summary:
      "Report a safety concern. If someone is in immediate danger, contact local emergency services.",
    submitLabel: "Submit Report",
    relatedDocument: "safety",
    fields: [
      { name: "email", label: "Your email", type: "email" },
      { name: "issue", label: "What happened?", type: "textarea", required: true },
      { name: "reference", label: "User / content reference", type: "text" },
    ],
  },
  "report-impersonation": {
    id: "report-impersonation",
    title: "Report Impersonation",
    route: "/legal/community-guidelines",
    summary: "Report an account impersonating you or someone else.",
    submitLabel: "Submit Report",
    relatedDocument: "community-guidelines",
    fields: [
      { name: "email", label: "Your email", type: "email", required: true },
      {
        name: "impersonatingAccount",
        label: "Impersonating account",
        type: "text",
        required: true,
      },
      {
        name: "whoImpersonated",
        label: "Who is being impersonated?",
        type: "text",
        required: true,
      },
      { name: "details", label: "Details", type: "textarea" },
    ],
  },
  "report-unauthorized-music": {
    id: "report-unauthorized-music",
    title: "Report Unauthorized Music Upload",
    route: "/legal/music-upload-terms",
    summary: "Report music uploaded without the proper rights.",
    submitLabel: "Submit Report",
    relatedDocument: "music-upload-terms",
    fields: [
      { name: "email", label: "Your email", type: "email", required: true },
      { name: "trackUrl", label: "Track / release link", type: "text", required: true },
      { name: "rightsBasis", label: "Your rights / basis", type: "textarea", required: true },
    ],
  },
};

export const getLegalForm = (id: string): LegalFormConfig | undefined => LEGAL_FORMS[id];
