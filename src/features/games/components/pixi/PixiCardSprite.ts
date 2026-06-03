/**
 * PixiCardSprite.ts
 * Creates a premium card sprite with:
 *   - Official Trey TV card-back texture (never a white box or generic T)
 *   - Card face texture from the luxury deck
 *   - Procedural fallback that still looks premium
 *   - Drop shadow, gloss layer, and depth effect
 *   - Selection lift with smooth easing
 */
import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export interface CardSpriteOptions {
  cardW: number;
  cardH: number;
  radius?: number;
  /** If true, show card back. If false, show face. */
  faceDown?: boolean;
  /** Face texture (from loaded assets). If null, shows a premium procedural face. */
  faceTex?: Texture | null;
  /** Gameplay card id, used to keep procedural fallback readable while textures load. */
  cardId?: string;
  /** Back texture — must be the official Trey TV card-back */
  backTex?: Texture | null;
  /** Accent color for procedural mode */
  accent?: number;
  /** 0–1 dim factor for non-playable cards */
  dimFactor?: number;
}

/**
 * Make a single card Container with the official Trey TV luxury look.
 * The Container origin is centered on the card.
 */
export function makeCardSprite(opts: CardSpriteOptions): Container {
  const {
    cardW,
    cardH,
    radius = cardW * 0.1,
    faceDown = true,
    faceTex = null,
    cardId,
    backTex = null,
    accent = 0x00b7ff,
    dimFactor = 1,
  } = opts;

  const root = new Container();

  // Shadow layer (drawn below card)
  const shadow = new Graphics();
  shadow
    .roundRect(-cardW / 2 + 3, -cardH / 2 + 6, cardW - 4, cardH - 4, radius + 2)
    .fill({ color: 0x000000, alpha: 0.55 });
  shadow.filters = []; // pixi v8: we use alpha blending instead of BlurFilter for perf
  shadow.y = 4;
  root.addChild(shadow);

  // Card body
  const body = new Container();
  root.addChild(body);

  if (faceDown && backTex) {
    // Official logo card back — full texture, no distortion
    const sprite = new Sprite(backTex);
    sprite.anchor.set(0.5);
    sprite.width = cardW;
    sprite.height = cardH;
    body.addChild(sprite);
  } else if (!faceDown && faceTex) {
    // Face texture from the luxury deck
    const sprite = new Sprite(faceTex);
    sprite.anchor.set(0.5);
    sprite.width = cardW;
    sprite.height = cardH;
    body.addChild(sprite);
  } else {
    // Premium procedural fallback — dark glass card
    const cardBg = new Graphics();
    cardBg
      .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, radius)
      .fill({ color: 0x07111f, alpha: 0.96 })
      .stroke({ color: accent, alpha: 0.6, width: 1.4 });
    body.addChild(cardBg);

    if (faceDown) {
      // Official-look card back in procedural mode (no texture available yet)
      const backBg = new Graphics();
      backBg
        .roundRect(-cardW / 2 + 3, -cardH / 2 + 3, cardW - 6, cardH - 6, radius * 0.7)
        .fill({ color: 0x040c1a, alpha: 1 })
        .stroke({ color: 0x00b7ff, alpha: 0.28, width: 0.8 });
      body.addChild(backBg);

      // Diamond pattern border
      const pattern = new Graphics();
      const pw = cardW - 10;
      const ph = cardH - 10;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const px = -pw / 2 + col * (pw / 2) + pw / 4;
          const py = -ph / 2 + row * (ph / 4);
          pattern.rect(px - 2, py - 2, 4, 4).fill({ color: 0x00b7ff, alpha: 0.15 });
        }
      }
      body.addChild(pattern);

      // Center logo ring
      const ring = new Graphics();
      ring
        .circle(0, 0, cardW * 0.25)
        .fill({ color: 0x000d1a, alpha: 0.9 })
        .stroke({ color: 0x00b7ff, alpha: 0.55, width: 1.2 });
      body.addChild(ring);

      // "T" letterform in accent
      const letter = new Graphics();
      const tw = cardW * 0.14;
      const th = cardH * 0.14;
      letter.rect(-tw / 2, -th * 0.5, tw, th * 0.2).fill({ color: 0x00b7ff, alpha: 0.8 });
      letter.rect(-tw * 0.1, -th * 0.3, tw * 0.2, th * 0.8).fill({ color: 0x00b7ff, alpha: 0.8 });
      body.addChild(letter);
    } else {
      // Procedural face — rank + suit symbols
      const cardMeta = parseCardId(cardId);
      const suitFill =
        cardMeta.suit === "H"
          ? 0xef4444
          : cardMeta.suit === "D"
            ? 0x00b7ff
            : cardMeta.suit === "C"
              ? 0x22c55e
              : cardMeta.suit === "S"
                ? 0xa855f7
                : accent;

      const rankGfx = new Graphics();
      rankGfx
        .roundRect(-cardW / 2, -cardH / 2, cardW, cardH, radius)
        .fill({ color: 0x0e1f30, alpha: 1 });
      body.addChild(rankGfx);

      // Decorative center diamond
      const diamond = new Graphics();
      const ds = cardW * 0.22;
      diamond
        .poly([0, -ds, ds, 0, 0, ds, -ds, 0])
        .fill({ color: suitFill, alpha: 0.25 })
        .stroke({ color: suitFill, alpha: 0.7, width: 1 });
      body.addChild(diamond);

      const rankStyle = {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: Math.max(10, cardW * 0.22),
        fontWeight: "900" as const,
        fill: 0xf8fafc,
      };
      const suitStyle = {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: Math.max(10, cardW * 0.18),
        fontWeight: "900" as const,
        fill: suitFill,
      };

      const topRank = new Text({ text: cardMeta.rank, style: rankStyle });
      topRank.anchor.set(0, 0);
      topRank.x = -cardW / 2 + cardW * 0.1;
      topRank.y = -cardH / 2 + cardH * 0.07;
      body.addChild(topRank);

      const topSuit = new Text({ text: cardMeta.suit, style: suitStyle });
      topSuit.anchor.set(0, 0);
      topSuit.x = topRank.x;
      topSuit.y = topRank.y + cardH * 0.13;
      body.addChild(topSuit);

      const centerSuit = new Text({
        text: cardMeta.suit,
        style: { ...suitStyle, fontSize: Math.max(16, cardW * 0.34) },
      });
      centerSuit.anchor.set(0.5);
      centerSuit.x = 0;
      centerSuit.y = 0;
      body.addChild(centerSuit);

      const bottomRank = new Text({ text: cardMeta.rank, style: rankStyle });
      bottomRank.anchor.set(1, 1);
      bottomRank.rotation = Math.PI;
      bottomRank.x = cardW / 2 - cardW * 0.1;
      bottomRank.y = cardH / 2 - cardH * 0.07;
      body.addChild(bottomRank);

      const bottomSuit = new Text({ text: cardMeta.suit, style: suitStyle });
      bottomSuit.anchor.set(1, 1);
      bottomSuit.rotation = Math.PI;
      bottomSuit.x = bottomRank.x;
      bottomSuit.y = bottomRank.y - cardH * 0.13;
      body.addChild(bottomSuit);
    }
  }

  // Gloss highlight (top sheen — always applied for depth)
  const gloss = new Graphics();
  gloss
    .roundRect(-cardW / 2 + 2, -cardH / 2 + 2, cardW - 4, cardH * 0.38, radius * 0.8)
    .fill({ color: 0xffffff, alpha: 0.1 });
  root.addChild(gloss);

  // Dim overlay for non-playable cards
  if (dimFactor < 1) {
    root.alpha = 0.45 + dimFactor * 0.55;
  }

  return root;
}

/**
 * Animate a card lifting (selected state).
 * Returns the new scale and offset applied to the container — caller drives this.
 */
export function getCardLiftTransform(selected: boolean): { scaleY: number; dy: number } {
  return selected ? { scaleY: 1.05, dy: -cardLiftPx() } : { scaleY: 1.0, dy: 0 };
}

function cardLiftPx() {
  return 10;
}

function parseCardId(cardId?: string): { rank: string; suit: string } {
  if (!cardId || cardId.length < 2) return { rank: "?", suit: "?" };
  return {
    rank: cardId.slice(0, -1).toUpperCase(),
    suit: cardId.slice(-1).toUpperCase(),
  };
}
