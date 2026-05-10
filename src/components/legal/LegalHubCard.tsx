import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function LegalHubCard({
  slug,
  title,
  summary,
  icon = "FileText",
}: {
  slug: string;
  title: string;
  summary: string;
  icon?: string;
}) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.FileText;
  return (
    <Link
      to={"/legal/$slug" as any}
      params={{ slug } as any}
      className="group relative block rounded-2xl liquid-glass border border-white/10 p-5 hover:border-white/25 transition-all overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[oklch(0.82_0.15_215/0.08)] via-transparent to-[oklch(0.82_0.16_85/0.06)] pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 ring-1 ring-primary/20">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold leading-tight">{title}</h3>
            <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </div>
    </Link>
  );
}
