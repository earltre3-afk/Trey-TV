import { Link } from "@tanstack/react-router";

/** Reusable inline consent text with linked policy names. */
export function LegalConsentText({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[12px] leading-relaxed text-foreground/80 ${className}`}>
      I agree to the{" "}
      <Link
        to="/legal/$slug"
        params={{ slug: "terms" }}
        className="text-primary font-semibold hover:underline"
      >
        Terms of Service
      </Link>
      ,{" "}
      <Link
        to="/legal/$slug"
        params={{ slug: "privacy" }}
        className="text-primary font-semibold hover:underline"
      >
        Privacy Policy
      </Link>
      , and{" "}
      <Link
        to="/legal/$slug"
        params={{ slug: "community-guidelines" }}
        className="text-primary font-semibold hover:underline"
      >
        Community Guidelines
      </Link>
      .
    </span>
  );
}

export function CreatorUploadConsentText({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[12px] leading-relaxed text-foreground/80 ${className}`}>
      I confirm I own or have permission to use the content I upload, and I agree to the{" "}
      <Link
        to="/legal/$slug"
        params={{ slug: "creator-terms" }}
        className="text-primary font-semibold hover:underline"
      >
        Creator Terms
      </Link>{" "}
      and{" "}
      <Link
        to="/legal/$slug"
        params={{ slug: "content-policy" }}
        className="text-primary font-semibold hover:underline"
      >
        Content Policy
      </Link>
      .
    </span>
  );
}
