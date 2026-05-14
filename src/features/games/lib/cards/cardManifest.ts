// Trey TV Custom Deck — Card Manifest
// Maps gameplay identity (rank + suit) to visual display (custom Trey TV suit names)
// Blades = Spades, Soul = Hearts, Crowns = Diamonds, Sparks = Clubs

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardDef {
  id: string;
  rank: Rank;
  suit: Suit;
  displaySuit: 'Blades' | 'Soul' | 'Crowns' | 'Sparks';
  assetPath: string;
  spadesValue: number; // rank order for trick comparison (A high)
  blackjackValue: number; // 2-10 face value, JQK=10, A=11 (handled soft)
}

export const SUIT_DISPLAY: Record<Suit, { name: string; symbol: string; color: string; glow: string; gameplay: string }> = {
  spades:   { name: 'Blades',  symbol: '♠', color: '#A855F7', glow: 'rgba(168,85,247,0.55)', gameplay: 'Spades (Trump)' },
  hearts:   { name: 'Soul',    symbol: '♥', color: '#EF4444', glow: 'rgba(239,68,68,0.55)',  gameplay: 'Hearts' },
  diamonds: { name: 'Crowns',  symbol: '♦', color: '#00B7FF', glow: 'rgba(0,183,255,0.55)',  gameplay: 'Diamonds' },
  clubs:    { name: 'Sparks',  symbol: '♣', color: '#22C55E', glow: 'rgba(34,197,94,0.55)',  gameplay: 'Clubs' },
};

const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUIT_LETTER: Record<Suit, string> = { spades:'S', hearts:'H', diamonds:'D', clubs:'C' };
const SUIT_FOLDER: Record<Suit, string> = { spades:'spades', hearts:'hearts', diamonds:'diamonds', clubs:'clubs' };

const SUIT_TO_DISPLAY: Record<Suit, CardDef['displaySuit']> = {
  spades: 'Blades', hearts: 'Soul', diamonds: 'Crowns', clubs: 'Sparks',
};

function spadesRankValue(rank: Rank): number {
  return RANKS.indexOf(rank) + 2; // 2 -> 2, A -> 14
}

function blackjackRankValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return parseInt(rank, 10);
}

export const CARD_MANIFEST: CardDef[] = (['spades','hearts','diamonds','clubs'] as Suit[])
  .flatMap(suit =>
    RANKS.map<CardDef>(rank => ({
      id: `${rank}${SUIT_LETTER[suit]}`,
      rank,
      suit,
      displaySuit: SUIT_TO_DISPLAY[suit],
      assetPath: `/assets/games/cards/trey-tv-deck/${SUIT_FOLDER[suit]}/${rank}${SUIT_LETTER[suit]}.png`,
      spadesValue: spadesRankValue(rank),
      blackjackValue: blackjackRankValue(rank),
    }))
  );

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(
  CARD_MANIFEST.map(c => [c.id, c])
);

export function getCard(id: string): CardDef {
  const c = CARD_BY_ID[id];
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
}

export const FULL_DECK_IDS: string[] = CARD_MANIFEST.map(c => c.id);

export function shuffledDeck(seed?: number): string[] {
  const ids = [...FULL_DECK_IDS];
  // Fisher-Yates
  let rand = seed ?? Math.floor(Math.random() * 1e9);
  const rng = () => { rand = (rand * 1664525 + 1013904223) % 4294967296; return rand / 4294967296; };
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor((seed !== undefined ? rng() : Math.random()) * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
