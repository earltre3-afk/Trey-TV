/**
 * pixiAssets.ts
 * Centralized asset loading and texture cache for Trey TV game tables.
 * All textures are loaded once and reused across scenes.
 */
import { Assets, Texture } from 'pixi.js';

export const CARD_BACK_URL = '/assets/games/cards/trey-tv-luxury/card-back.png';

export interface GameTextures {
  cardBack: Texture | null;
  /** map of cardId → face texture */
  cardFaces: Map<string, Texture>;
}

let _sharedBack: Texture | null = null;
let _backLoading: Promise<Texture | null> | null = null;

/** Load (or return cached) the official Trey TV card-back texture */
export async function loadCardBack(): Promise<Texture | null> {
  if (_sharedBack) return _sharedBack;
  if (_backLoading) return _backLoading;
  _backLoading = Assets.load(CARD_BACK_URL)
    .then((t: Texture) => { _sharedBack = t; return t; })
    .catch(() => null);
  return _backLoading;
}

/**
 * Map a cardId (e.g. "AH", "KD", "10S", "3C") to the correct PNG URL.
 * Deck is split into 4 suits:
 *   Spades  (S) → /blades/
 *   Hearts  (H) → /soul/
 *   Diamonds(D) → /flame/
 *   Clubs   (C) → /keys/
 */
const SUIT_DIRS: Record<string, string> = {
  S: 'blades',
  H: 'soul',
  D: 'flame',
  C: 'keys',
};

export function cardIdToUrl(cardId: string): string | null {
  if (!cardId || cardId.length < 2) return null;
  const suit = cardId.slice(-1).toUpperCase();
  const rank = cardId.slice(0, -1).toUpperCase();
  const dir = SUIT_DIRS[suit];
  if (!dir) return null;
  return `/assets/games/cards/trey-tv-luxury/${dir}/${rank}${suit}.png`;
}

/** Load a set of card face textures. Returns a map cardId → Texture. */
export async function loadCardFaces(cardIds: string[]): Promise<Map<string, Texture>> {
  const result = new Map<string, Texture>();
  const toLoad = cardIds.filter(id => cardIdToUrl(id) !== null);

  await Promise.all(
    toLoad.map(async (id) => {
      const url = cardIdToUrl(id)!;
      try {
        const t = await Assets.load(url);
        result.set(id, t);
      } catch {
        // face not available — caller falls back to procedural card
      }
    }),
  );

  return result;
}
