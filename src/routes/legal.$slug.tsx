import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { getPolicy, POLICIES } from "@/lib/legal-content";

export const Route = createFileRoute("/legal/$slug")({
  component: LegalSlugPage,
  beforeLoad: ({ params }) => {
    if (!getPolicy(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const policy = POLICIES[params.slug];
    const title = policy ? `${policy.title} — Trey TV` : "Trey TV — Legal";
    const desc = policy?.summary ?? "Trey TV legal and safety policy.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-md mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold">Policy not found</h1>
      <p className="text-sm text-muted-foreground mt-2">That policy doesn't exist.</p>
    </div>
  ),
});

function LegalSlugPage() {
  const { slug } = useParams({ from: Route.id });
  const policy = getPolicy(slug);
  if (!policy) return null;
  return <LegalLayout policy={policy} />;
}
