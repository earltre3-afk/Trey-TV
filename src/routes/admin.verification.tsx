import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { BadgeCheck, Check, X } from "lucide-react";

const supabaseAny = supabase as any;

export const Route = createFileRoute("/admin/verification")({
  component: Verification,
  head: () => ({ meta: [{ title: "Verification Review - Admin" }] }),
});

function verificationLinks(data: any) {
  return [
    data?.link_website,
    data?.link_instagram,
    data?.link_tiktok,
    data?.link_youtube,
    data?.link_spotify,
    data?.link_apple_music,
    data?.link_imdb,
    data?.link_linkedin,
    data?.link_press_1,
    data?.link_press_2,
    data?.link_press_3,
    data?.link_other,
  ].filter(Boolean) as string[];
}

function Verification() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const { data } = useQuery({
    queryKey: ["admin", "verification-apps"],
    queryFn: async () => {
      const { data } = await supabaseAny
        .from("creator_applications")
        .select("*")
        .eq("application_type", "verification")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const review = async (
    id: string,
    userId: string,
    category: string,
    status: "approved" | "rejected" | "needs_more_info",
  ) => {
    const reason = status !== "approved" ? (prompt("Reason / notes:") ?? "") : "";
    const { error } = await supabase
      .from("creator_applications")
      .update({
        status,
        review_notes: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    if (status === "approved") {
      await supabase
        .from("profiles")
        .update({
          gold_verified: true,
          gold_verified_at: new Date().toISOString(),
          verification_category: category,
        })
        .eq("id", userId);
    }
    await logAdminAction({
      action: `verification_${status}`,
      target_type: "verification_application",
      target_id: id,
      reason,
    });
    toast.success(`Verification ${status}`);
    qc.invalidateQueries({ queryKey: ["admin", "verification-apps"] });
  };

  return (
    <AdminShell
      title="Gold Verification Review"
      subtitle="Notable people, creators, businesses, and public figures."
    >
      <div className="space-y-2">
        {(data?.length ?? 0) === 0 ? (
          <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <BadgeCheck className="size-6 text-primary" />
            No pending verification applications.
          </div>
        ) : (
          data!.map((a: any) => {
            const v = a.verification_data ?? {};
            const category = v.applying_as ?? v.profile_title ?? "verification";
            const links = verificationLinks(v);

            return (
              <div key={a.id} className="p-4 rounded-2xl liquid-glass border border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] tracking-[0.25em] text-primary">
                        {a.status.toUpperCase()} - {category}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-bold mt-1 truncate">
                      {v.display_name || `User ${a.user_id.slice(0, 8)}...`}
                    </div>
                    {v.recognition_description && (
                      <div className="text-xs text-foreground/80 mt-1">
                        {v.recognition_description}
                      </div>
                    )}
                    {v.why_gold_badge && (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        "{v.why_gold_badge}"
                      </div>
                    )}
                    {links.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
                        {links.slice(0, 3).map((l, i) => (
                          <a
                            key={i}
                            href={l}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate hover:text-primary"
                          >
                            {l}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {a.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => review(a.id, a.user_id, category, "approved")}
                        className="size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center hover:bg-primary/25"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={() => review(a.id, a.user_id, category, "rejected")}
                        className="size-9 rounded-xl bg-[oklch(0.65_0.24_15_/_0.15)] text-[oklch(0.65_0.24_15)] border border-[oklch(0.65_0.24_15_/_0.4)] grid place-items-center hover:bg-[oklch(0.65_0.24_15_/_0.25)]"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}
