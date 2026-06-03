// Generates a shareable 1080x1920 Instagram-Story-ready ending poster as a PNG blob.
import { IMAGES, CHARACTERS_BY_ID } from "./storyData";
import { Ending, Branch, RelationshipImpactType, Tone } from "./storyTypes";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const tryLoadImage = async (src: string): Promise<HTMLImageElement | null> => {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/**
 * Render the official "ending unlocked" poster.
 *
 * @param ending          The unlocked ending metadata (name + tagline).
 * @param imageUrl        Hero background image â€” usually the last chapter image.
 * @param castIds         Optional ordered list of character IDs to feature as a cast strip.
 *                        These should be the most narratively important characters in the branch.
 */
export async function renderEndingPoster(
  ending: Ending,
  imageUrl?: string,
  castIds: string[] = [],
): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background fill
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Hero image (cover-fit)
  try {
    const img = await loadImage(imageUrl || IMAGES.twinsCover);
    const ir = img.width / img.height;
    const cr = W / H;
    let dw: number, dh: number, dx: number, dy: number;
    if (ir > cr) {
      dh = H;
      dw = H * ir;
      dx = (W - dw) / 2;
      dy = 0;
    } else {
      dw = W;
      dh = W / ir;
      dx = 0;
      dy = (H - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } catch {
    /* keep black background */
  }

  // Top dim
  const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H * 0.4);

  // Bottom dramatic gradient
  const bottomGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
  bottomGrad.addColorStop(0.55, "rgba(0,0,0,0.85)");
  bottomGrad.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H * 0.35, W, H * 0.65);

  // "NEW ENDING UNLOCKED" badge
  ctx.fillStyle = "#f59e0b";
  const badgeText = "âœ¦ NEW ENDING UNLOCKED";
  ctx.font = "700 32px Inter, system-ui, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 60;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 110;
  ctx.beginPath();
  if ("roundRect" in ctx && typeof ctx.roundRect === "function")
    ctx.roundRect(badgeX, badgeY, badgeW, 60, 30);
  else ctx.rect(badgeX, badgeY, badgeW, 60);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, W / 2, badgeY + 32);

  // "SWITCH KICKS" eyebrow
  ctx.fillStyle = "#fbbf24";
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SWITCH KICKS", W / 2, H - 580);

  // Ending name (big display)
  ctx.fillStyle = "#fff";
  ctx.font = '900 140px "Anton Impact", Impact, sans-serif';
  ctx.textBaseline = "top";
  const nameLines = wrapText(ctx, ending.name.toUpperCase(), W - 120);
  let nameY = H - 510;
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 20;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, nameY);
    nameY += 150;
  }
  ctx.shadowBlur = 0;

  // Tagline
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = 'italic 400 44px "Crimson Pro", Georgia, serif';
  const taglineLines = wrapText(ctx, ending.tagline, W - 160);
  let tagY = nameY + 50;
  for (const line of taglineLines) {
    ctx.fillText(line, W / 2, tagY);
    tagY += 60;
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // CAST STRIP â€” render up to 5 character face circles above the footer
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const uniqueCastIds = Array.from(new Set(castIds)).slice(0, 5);
  if (uniqueCastIds.length > 0) {
    const avatarSize = 140;
    const gap = 28;
    const stripWidth = uniqueCastIds.length * avatarSize + (uniqueCastIds.length - 1) * gap;
    const stripStartX = (W - stripWidth) / 2;
    const stripY = H - 250;

    // "STARRING" label
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "800 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Â· STARRING Â·", W / 2, stripY - 38);

    for (let i = 0; i < uniqueCastIds.length; i++) {
      const id = uniqueCastIds[i];
      const character = CHARACTERS_BY_ID[id];
      if (!character) continue;

      const cx = stripStartX + i * (avatarSize + gap) + avatarSize / 2;
      const cy = stripY + avatarSize / 2;
      const r = avatarSize / 2;

      // Try official portrait first, fall back to canonical scene image
      let portrait = await tryLoadImage(character.image);
      if (!portrait) portrait = await tryLoadImage(character.fallbackImage);

      // Clipped circle for the face
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (portrait) {
        // Cover-fit, focus toward top of image so face stays in frame
        const ir = portrait.width / portrait.height;
        let dw: number, dh: number, dx: number, dy: number;
        if (ir > 1) {
          dh = avatarSize;
          dw = avatarSize * ir;
          dx = cx - dw / 2;
          dy = cy - dh / 2;
        } else {
          dw = avatarSize;
          dh = avatarSize / ir;
          dx = cx - dw / 2;
          // bias toward top of image to keep faces visible
          dy = cy - dh / 2 - dh * 0.1;
        }
        ctx.drawImage(portrait, dx, dy, dw, dh);
      } else {
        // Neutral placeholder
        ctx.fillStyle = "#1f1f23";
        ctx.fillRect(cx - r, cy - r, avatarSize, avatarSize);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 56px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character.firstName[0], cx, cy);
      }

      ctx.restore();

      // Gold ring
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.stroke();

      // First-name caption under each face
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "800 20px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(character.firstName.toUpperCase(), cx, cy + r + 12);
    }
  }

  // Footer: Trey TV branding (now uses the official logo image)
  const logo = await tryLoadImage(
    "https://d64gsuwffb70l.cloudfront.net/6a060641815889c4c7c610fd_1778783806509_ab6fb4ed.png",
  );
  if (logo) {
    const logoH = 78;
    const ratio = logo.width / logo.height;
    const logoW = logoH * ratio;
    ctx.drawImage(logo, (W - logoW) / 2, H - 110, logoW, logoH);
  } else {
    // Fallback text if logo PNG is unreachable
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "700 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("TREY TV  â€¢  STORY BY TREY TRIZZY", W / 2, H - 60);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to render poster"));
      },
      "image/png",
      0.95,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Pick the most narratively important characters to feature on an ending poster
 * based on which characters appear most often across the branch's chapters.
 */
export function pickCastFromBranch(branch: Branch | null, limit = 5): string[] {
  if (!branch) return ["malik-carter", "micah-carter"];
  const counts: Record<string, number> = {};
  const allIds = Object.keys(CHARACTERS_BY_ID);
  for (const id of allIds) counts[id] = 0;

  for (const ch of branch.chapters) {
    const blob =
      `${ch.title || ""} ${ch.summary || ""} ${ch.choiceMade?.text || ""} ${ch.prose || ""}`.toLowerCase();
    for (const id of allIds) {
      const c = CHARACTERS_BY_ID[id];
      if (
        new RegExp(`\\b${c.firstName}\\b`, "i").test(blob) ||
        new RegExp(`\\b${c.name}\\b`, "i").test(blob)
      ) {
        counts[id] += 1;
      }
    }
  }

  // Always include the twins as anchors
  const ranked = allIds.sort((a, b) => counts[b] - counts[a]);
  const top = ranked.filter((id) => counts[id] > 0).slice(0, limit);
  if (!top.includes("malik-carter")) top.unshift("malik-carter");
  if (!top.includes("micah-carter")) top.splice(1, 0, "micah-carter");
  return top.slice(0, limit);
}

/**
 * Map a chapter Tone to its dominant relationship impact dimension.
 * Used to "color" a branch tile by the kind of pressure the user keeps applying.
 */
const TONE_TO_IMPACT: Record<Tone, RelationshipImpactType> = {
  Risky: "Tension",
  Safe: "Trust",
  Romantic: "Bond",
  Funny: "Loyalty",
  Bold: "Pressure",
};

/**
 * Determine the dominant relationship impact for a branch by combining:
 *   1) the user's tone history across chapters (primary signal)
 *   2) the cast composition (secondary nudge â€” e.g. heavy Coach Bridges â†’ Respect,
 *      heavy Ari â†’ Bond, heavy Compliance Officer â†’ Pressure, heavy Reggie â†’ Loyalty).
 *
 * Returns null only if the branch has no chapters yet.
 */

export function pickDominantImpactFromBranch(branch: Branch | null): RelationshipImpactType | null {
  if (!branch || branch.chapters.length === 0) return null;

  // 1) Tone tally â†’ impact tally
  const impactCounts: Record<RelationshipImpactType, number> = {
    Trust: 0,
    Tension: 0,
    Loyalty: 0,
    Respect: 0,
    Pressure: 0,
    Distance: 0,
    Bond: 0,
    Rivalry: 0,
  };

  for (const ch of branch.chapters) {
    if (ch.toneTag) {
      const mapped = TONE_TO_IMPACT[ch.toneTag];
      if (mapped) impactCounts[mapped] += 2; // weighted heavier than cast nudge
    }
    // Also honor any explicit choiceMade tone (chapter-level redundancy)
    if (ch.choiceMade?.tone) {
      const mapped = TONE_TO_IMPACT[ch.choiceMade.tone];
      if (mapped) impactCounts[mapped] += 1;
    }
  }

  // 2) Cast nudges â€” light bias so the same tone history reads differently
  //    when the branch is dominated by certain characters.
  const cast = pickCastFromBranch(branch, 4);
  const top3 = new Set(cast.slice(0, 3));
  if (top3.has("coach-bridges")) impactCounts.Respect += 2;
  if (top3.has("compliance-officer")) impactCounts.Pressure += 2;
  if (top3.has("ms-valentina")) impactCounts.Pressure += 1;
  if (top3.has("ari")) impactCounts.Bond += 2;
  if (top3.has("reggie")) impactCounts.Loyalty += 1;
  if (top3.has("dante-reeves")) impactCounts.Rivalry += 1;
  if (top3.has("denise-carter")) impactCounts.Tension += 1;

  // 3) Pick the winner; tie-breaker favors higher-signal dimensions
  const order: RelationshipImpactType[] = [
    "Bond",
    "Tension",
    "Pressure",
    "Trust",
    "Loyalty",
    "Respect",
    "Rivalry",
    "Distance",
  ];
  let winner: RelationshipImpactType = "Trust";
  let best = -1;
  for (const k of order) {
    if (impactCounts[k] > best) {
      best = impactCounts[k];
      winner = k;
    }
  }
  return best > 0 ? winner : null;
}
