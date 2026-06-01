/**
 * Creator render server functions — the editor calls these to render an
 * EditRecipe into a finished video via the managed render engine (Shotstack).
 *
 * submitRender:    recipe -> Shotstack render job -> renderId
 * getRenderStatus: renderId -> { status, url }
 *
 * The render output is currently the Shotstack-hosted MP4 URL. Ingesting that
 * into Cloudflare Stream (so publish uses a Stream asset) is the next step and
 * is gated on CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_STREAM_API_TOKEN.
 */
import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser } from "@/lib/trey-i/onboarding.server";
import { recipeToShotstack } from "@/lib/creator-studio/render/shotstackAdapter";
import { submitShotstackRender, getShotstackStatus } from "@/lib/creator-studio/render/shotstack.server";
import type { EditRecipe } from "@/lib/creator-studio/editRecipe";

type Rpc<T> = ({ ok: true } & T) | { ok: false; error: string };

export const submitRender = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; recipe: EditRecipe }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    recipe: input?.recipe,
  }))
  .handler(async ({ data }): Promise<Rpc<{ renderId: string }>> => {
    if (!data.recipe || !Array.isArray(data.recipe.tracks)) return { ok: false, error: "missing_recipe" };
    try {
      await verifyTreyIUser(data.accessToken);
    } catch {
      return { ok: false, error: "unauthorized" };
    }
    const edit = recipeToShotstack(data.recipe);
    if (edit.timeline.tracks.length === 0) return { ok: false, error: "empty_timeline" };
    const res = await submitShotstackRender(edit);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, renderId: res.id };
  });

export const getRenderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; renderId: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    renderId: typeof input?.renderId === "string" ? input.renderId.slice(0, 80) : "",
  }))
  .handler(async ({ data }): Promise<Rpc<{ status: string; url: string | null }>> => {
    if (!data.renderId) return { ok: false, error: "missing_render_id" };
    try {
      await verifyTreyIUser(data.accessToken);
    } catch {
      return { ok: false, error: "unauthorized" };
    }
    const res = await getShotstackStatus(data.renderId);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, status: res.status, url: res.url };
  });
