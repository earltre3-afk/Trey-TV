import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import { a as useCurrentUser } from "./router-BtgGywEC.mjs";
import { s as supabase } from "./supabase-BQ18xbNk.mjs";
import { u as useTvRemoteMode, a as useTvRemoteInput } from "./useTvRemoteInput-3UKI_f2s.mjs";
import { A as ArrowLeft, O as Search, at as UserPlus, a5 as Users, k as Check, f as Send, aF as Trash2, ak as ChevronDown, aw as Trophy, ah as EllipsisVertical, S as Sparkles, aB as RotateCw, a9 as Clock, a4 as Play, P as Plus, e as Mic, aM as MessageSquare, bG as Shuffle, t as Crown, bI as Layers, bE as Spade, bN as Ban, Y as Flame, Z as Zap } from "../_libs/lucide-react.mjs";
const OFFICIAL_TREY_TV_LOGO_URL = treyTvLogo;
function getTreyTvLogoSrc() {
  if (typeof window !== "undefined") {
    const injected = window.__TREY_TV_LOGO_SRC__;
    if (injected) return injected;
  }
  return OFFICIAL_TREY_TV_LOGO_URL;
}
const TreyBrandMark = ({
  size = 56,
  className,
  style,
  glow = true,
  variant = "full"
}) => {
  const isMark = variant === "mark";
  const height = isMark ? size : size;
  const width = isMark ? size * 1.7 : size * 1.7;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src: getTreyTvLogoSrc(),
      alt: "Trey TV",
      draggable: false,
      className,
      style: {
        display: "block",
        width,
        height,
        objectFit: "contain",
        // GUARANTEE no white box: image PNG already has transparency,
        // we never apply any background here.
        background: "transparent",
        // Premium soft glow so the logo reads on dark glass without
        // adding any plate behind it.
        filter: glow ? "drop-shadow(0 0 6px rgba(0,183,255,0.35)) drop-shadow(0 0 14px rgba(168,85,247,0.28)) drop-shadow(0 0 18px rgba(255,200,87,0.18))" : "none",
        userSelect: "none",
        pointerEvents: "none",
        ...style
      }
    }
  );
};
const ID_KEY = "trey_game_user_id";
const NAME_KEY = "trey_game_display_name";
function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
function randomHex(n) {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
const NAMES = [
  "Neon Ace",
  "Velvet Wolf",
  "Midnight King",
  "Silver Spade",
  "Echo Queen",
  "Glass Bishop",
  "Storm Joker",
  "Crown Drift",
  "Vapor Knight",
  "Lux Phantom",
  "Onyx Reign",
  "Ember Sage",
  "Cobalt Lyric",
  "Soul Marquis",
  "Pulse Heir"
];
function getOrCreateIdentity() {
  if (!canUseStorage()) {
    return { userId: `guest-${randomHex(12)}`, displayName: "Trey TV Guest", publicProfileUid: null, avatarUrl: null };
  }
  let userId = localStorage.getItem(ID_KEY);
  let displayName = localStorage.getItem(NAME_KEY);
  if (!userId) {
    userId = `guest-${randomHex(12)}`;
    localStorage.setItem(ID_KEY, userId);
  }
  if (!displayName) {
    displayName = NAMES[Math.floor(Math.random() * NAMES.length)];
    localStorage.setItem(NAME_KEY, displayName);
  }
  return { userId, displayName, publicProfileUid: null, avatarUrl: null };
}
function identityFromTreyUser(user) {
  const fallback = getOrCreateIdentity();
  if (!user) return fallback;
  const userId = user.userId || user.id || user.publicProfileUid || user.public_profile_uid || user.site_uid || fallback.userId;
  const displayName = user.displayName || user.name || user.username || fallback.displayName;
  const publicProfileUid = user.publicProfileUid || user.public_profile_uid || user.site_uid || null;
  const avatarUrl = user.avatarUrl || user.avatar_url || user.profileImageUrl || null;
  return {
    userId: String(userId),
    displayName: String(displayName).trim().slice(0, 32) || fallback.displayName,
    publicProfileUid: publicProfileUid ? String(publicProfileUid) : null,
    avatarUrl: avatarUrl ? String(avatarUrl) : null
  };
}
function setDisplayName(name) {
  const trimmed = name.trim().slice(0, 24);
  if (trimmed && canUseStorage()) localStorage.setItem(NAME_KEY, trimmed);
}
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
const SUIT_DISPLAY = {
  spades: { name: "Blades", symbol: "♠", color: "#A855F7", glow: "rgba(168,85,247,0.55)", gameplay: "Spades (Trump)" },
  hearts: { name: "Soul", symbol: "♥", color: "#EF4444", glow: "rgba(239,68,68,0.55)", gameplay: "Hearts" },
  diamonds: { name: "Crowns", symbol: "♦", color: "#00B7FF", glow: "rgba(0,183,255,0.55)", gameplay: "Diamonds" },
  clubs: { name: "Sparks", symbol: "♣", color: "#22C55E", glow: "rgba(34,197,94,0.55)", gameplay: "Clubs" }
};
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUIT_LETTER = { spades: "S", hearts: "H", diamonds: "D", clubs: "C" };
const SUIT_FOLDER = { spades: "blades", hearts: "soul", diamonds: "flame", clubs: "keys" };
const SUIT_TO_DISPLAY = {
  spades: "Blades",
  hearts: "Soul",
  diamonds: "Crowns",
  clubs: "Sparks"
};
function spadesRankValue(rank) {
  return RANKS.indexOf(rank) + 2;
}
function blackjackRankValue(rank) {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return parseInt(rank, 10);
}
const CARD_MANIFEST = ["spades", "hearts", "diamonds", "clubs"].flatMap(
  (suit) => RANKS.map((rank) => ({
    id: `${rank}${SUIT_LETTER[suit]}`,
    rank,
    suit,
    displaySuit: SUIT_TO_DISPLAY[suit],
    assetPath: `/assets/games/cards/trey-tv-luxury/${SUIT_FOLDER[suit]}/${rank}${SUIT_LETTER[suit]}.png`,
    spadesValue: spadesRankValue(rank),
    blackjackValue: blackjackRankValue(rank)
  }))
);
const CARD_BY_ID = Object.fromEntries(
  CARD_MANIFEST.map((c) => [c.id, c])
);
function getCard(id) {
  const c = CARD_BY_ID[id];
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
}
const FULL_DECK_IDS = CARD_MANIFEST.map((c) => c.id);
function shuffledDeck(seed) {
  const ids = [...FULL_DECK_IDS];
  let rand = seed ?? Math.floor(Math.random() * 1e9);
  const rng = () => {
    rand = (rand * 1664525 + 1013904223) % 4294967296;
    return rand / 4294967296;
  };
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor((seed !== void 0 ? rng() : Math.random()) * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
function teamOf(seat) {
  return seat % 2;
}
function newSpadesGame(playerNames, targetScore = 500) {
  const deck = shuffledDeck();
  const hands = [[], [], [], []];
  deck.forEach((c, i) => hands[i % 4].push(c));
  hands.forEach((h) => h.sort(sortCardCmp));
  const players = [0, 1, 2, 3].map((seat) => ({
    seat,
    name: playerNames[seat] || `Player ${seat + 1}`,
    isBot: seat !== 0,
    hand: hands[seat],
    bid: null,
    tricksWon: 0
  }));
  return {
    phase: "bidding",
    players,
    currentSeat: 0,
    leadSeat: 0,
    trick: [],
    ledSuit: null,
    spadesBroken: false,
    teamScores: [0, 0],
    teamBags: [0, 0],
    teamRoundBids: [0, 0],
    teamRoundTricks: [0, 0],
    round: 1,
    targetScore,
    lastTrickWinner: null,
    log: ["Round 1 — Place your bids."]
  };
}
function sortCardCmp(a, b) {
  const ca = getCard(a), cb = getCard(b);
  const order = ["clubs", "diamonds", "hearts", "spades"];
  if (ca.suit !== cb.suit) return order.indexOf(ca.suit) - order.indexOf(cb.suit);
  return ca.spadesValue - cb.spadesValue;
}
function legalCards(state, seat) {
  const p = state.players[seat];
  if (state.phase !== "playing" || state.currentSeat !== seat) return [];
  const hand = p.hand;
  if (state.trick.length === 0) {
    const nonSpades = hand.filter((c) => getCard(c).suit !== "spades");
    if (!state.spadesBroken && nonSpades.length > 0) return nonSpades;
    return [...hand];
  }
  const led = state.ledSuit;
  const followers = hand.filter((c) => getCard(c).suit === led);
  if (followers.length > 0) return followers;
  return [...hand];
}
function placeBid(state, seat, bid) {
  if (state.phase !== "bidding") return state;
  if (state.currentSeat !== seat) return state;
  if (bid < 0 || bid > 13) return state;
  const next = JSON.parse(JSON.stringify(state));
  next.players[seat].bid = bid;
  next.log = [...next.log, `${next.players[seat].name} bids ${bid}.`];
  const nextSeat = (seat + 1) % 4;
  if (next.players.every((p) => p.bid !== null)) {
    next.phase = "playing";
    next.teamRoundBids = [
      next.players[0].bid + next.players[2].bid,
      next.players[1].bid + next.players[3].bid
    ];
    next.currentSeat = next.leadSeat;
    next.log.push(`Bidding complete. Team We: ${next.teamRoundBids[0]} | Team Them: ${next.teamRoundBids[1]}`);
  } else {
    next.currentSeat = nextSeat;
  }
  return next;
}
function playCard(state, seat, cardId) {
  if (state.phase !== "playing") return state;
  if (state.currentSeat !== seat) return state;
  const legal = legalCards(state, seat);
  if (!legal.includes(cardId)) return state;
  const next = JSON.parse(JSON.stringify(state));
  const p = next.players[seat];
  p.hand = p.hand.filter((c2) => c2 !== cardId);
  next.trick.push({ seat, cardId });
  const c = getCard(cardId);
  if (next.trick.length === 1) next.ledSuit = c.suit;
  if (c.suit === "spades") next.spadesBroken = true;
  if (next.trick.length === 4) {
    const winnerSeat = resolveTrick(next.trick, next.ledSuit);
    next.players[winnerSeat].tricksWon += 1;
    next.teamRoundTricks[teamOf(winnerSeat)] += 1;
    next.lastTrickWinner = winnerSeat;
    next.log.push(`${next.players[winnerSeat].name} wins the trick.`);
    next.trick = [];
    next.ledSuit = null;
    next.leadSeat = winnerSeat;
    next.currentSeat = winnerSeat;
    if (next.players.every((pp) => pp.hand.length === 0)) {
      scoreRound(next);
      if (next.teamScores[0] >= next.targetScore || next.teamScores[1] >= next.targetScore) {
        next.phase = "game-over";
        const winner = next.teamScores[0] > next.teamScores[1] ? 0 : 1;
        next.log.push(`Game over. Team ${winner === 0 ? "We" : "Them"} wins!`);
      } else {
        next.phase = "round-end";
      }
    }
  } else {
    next.currentSeat = (seat + 1) % 4;
  }
  return next;
}
function resolveTrick(trick, led) {
  let bestSeat = trick[0].seat;
  let bestCard = getCard(trick[0].cardId);
  for (let i = 1; i < trick.length; i++) {
    const cur = getCard(trick[i].cardId);
    const bestIsSpade = bestCard.suit === "spades";
    const curIsSpade = cur.suit === "spades";
    if (curIsSpade && !bestIsSpade) {
      bestSeat = trick[i].seat;
      bestCard = cur;
      continue;
    }
    if (!curIsSpade && bestIsSpade) continue;
    if (curIsSpade && bestIsSpade) {
      if (cur.spadesValue > bestCard.spadesValue) {
        bestSeat = trick[i].seat;
        bestCard = cur;
      }
      continue;
    }
    if (cur.suit === led && bestCard.suit === led) {
      if (cur.spadesValue > bestCard.spadesValue) {
        bestSeat = trick[i].seat;
        bestCard = cur;
      }
    } else if (cur.suit === led && bestCard.suit !== led) {
      bestSeat = trick[i].seat;
      bestCard = cur;
    }
  }
  return bestSeat;
}
function scoreRound(s) {
  for (let t = 0; t < 2; t++) {
    const bid = s.teamRoundBids[t];
    const tricks = s.teamRoundTricks[t];
    if (tricks >= bid) {
      const overs = tricks - bid;
      s.teamScores[t] += bid * 10 + overs;
      s.teamBags[t] += overs;
      if (s.teamBags[t] >= 10) {
        s.teamScores[t] -= 100;
        s.teamBags[t] -= 10;
        s.log.push(`Team ${t === 0 ? "We" : "Them"} bag penalty: -100`);
      }
    } else {
      s.teamScores[t] -= bid * 10;
    }
  }
  s.log.push(`Round ${s.round} scored. We: ${s.teamScores[0]} | Them: ${s.teamScores[1]}`);
}
function startNextRound(state) {
  if (state.phase !== "round-end") return state;
  const next = JSON.parse(JSON.stringify(state));
  const deck = shuffledDeck();
  const hands = [[], [], [], []];
  deck.forEach((c, i) => hands[i % 4].push(c));
  hands.forEach((h) => h.sort(sortCardCmp));
  next.players.forEach((p, i) => {
    p.hand = hands[i];
    p.bid = null;
    p.tricksWon = 0;
  });
  next.teamRoundBids = [0, 0];
  next.teamRoundTricks = [0, 0];
  next.trick = [];
  next.ledSuit = null;
  next.spadesBroken = false;
  next.round += 1;
  next.phase = "bidding";
  next.currentSeat = next.leadSeat = (next.round - 1) % 4;
  next.log.push(`Round ${next.round} — Place your bids.`);
  return next;
}
function botBid(state, seat) {
  const hand = state.players[seat].hand.map(getCard);
  let expected = 0;
  for (const c of hand) {
    if (c.suit === "spades") {
      if (c.rank === "A") expected += 1;
      else if (c.rank === "K") expected += 0.85;
      else if (c.rank === "Q") expected += 0.65;
      else if (c.rank === "J") expected += 0.45;
      else expected += 0.2;
    } else {
      if (c.rank === "A") expected += 0.85;
      else if (c.rank === "K") expected += 0.55;
      else if (c.rank === "Q") expected += 0.25;
    }
  }
  return Math.max(1, Math.min(7, Math.round(expected)));
}
function botPlay(state, seat) {
  const legal = legalCards(state, seat);
  if (legal.length === 1) return legal[0];
  const cards = legal.map(getCard);
  if (state.trick.length === 0) {
    const low = [...cards].sort((a, b) => a.spadesValue - b.spadesValue);
    return low[0].id;
  }
  const led = state.ledSuit;
  const follow = cards.filter((c) => c.suit === led);
  const trick = state.trick.map((t) => getCard(t.cardId));
  const currentBest = trick.reduce((best, c) => {
    if (!best) return c;
    if (best.suit === "spades" && c.suit !== "spades") return best;
    if (c.suit === "spades" && best.suit !== "spades") return c;
    if (c.suit === best.suit && c.spadesValue > best.spadesValue) return c;
    return best;
  }, null);
  if (follow.length) {
    const winners = follow.filter((c) => c.spadesValue > currentBest.spadesValue && currentBest.suit !== "spades");
    if (winners.length) return winners.sort((a, b) => a.spadesValue - b.spadesValue)[0].id;
    return follow.sort((a, b) => a.spadesValue - b.spadesValue)[0].id;
  }
  const nonSpade = cards.filter((c) => c.suit !== "spades").sort((a, b) => a.spadesValue - b.spadesValue);
  if (nonSpade.length) return nonSpade[0].id;
  return cards.sort((a, b) => a.spadesValue - b.spadesValue)[0].id;
}
function newBlackjackGame(balance = 1e3) {
  return {
    phase: "betting",
    shoe: buildShoe(6),
    player: [],
    dealer: [],
    bet: 0,
    balance,
    result: null,
    message: "Place your virtual chips to begin. Free-play points only.",
    doubled: false
  };
}
function buildShoe(decks) {
  let shoe = [];
  for (let i = 0; i < decks; i++) shoe = shoe.concat(shuffledDeck(Date.now() + i));
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}
function handValue(hand) {
  let total = 0, aces = 0;
  for (const id of hand) {
    const c = getCard(id);
    total += c.blackjackValue;
    if (c.rank === "A") aces += 1;
  }
  let soft = aces > 0 && total <= 21;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  soft = aces > 0 && total <= 21;
  return { total, soft };
}
function placeBet(state, bet) {
  if (state.phase !== "betting") return state;
  if (bet <= 0 || bet > state.balance) return state;
  const next = { ...state, shoe: [...state.shoe] };
  if (next.shoe.length < 20) next.shoe = buildShoe(6);
  next.bet = bet;
  next.balance -= bet;
  next.player = [next.shoe.pop(), next.shoe.pop()];
  next.dealer = [next.shoe.pop(), next.shoe.pop()];
  next.phase = "player";
  next.result = null;
  next.doubled = false;
  const pv = handValue(next.player).total;
  const dv = handValue(next.dealer).total;
  if (pv === 21 && dv === 21) {
    next.phase = "settled";
    next.result = "push";
    next.balance += next.bet;
    next.message = "Push — both blackjack.";
  } else if (pv === 21) {
    next.phase = "settled";
    next.result = "blackjack";
    next.balance += Math.floor(next.bet * 2.5);
    next.message = "Blackjack! Pays 3 to 2.";
  } else if (dv === 21) {
    next.phase = "settled";
    next.result = "lose";
    next.message = "Dealer blackjack.";
  } else {
    next.message = "Your move. Hit, Stand, or Double.";
  }
  return next;
}
function hit(state) {
  if (state.phase !== "player") return state;
  const next = { ...state, shoe: [...state.shoe], player: [...state.player] };
  next.player.push(next.shoe.pop());
  const { total } = handValue(next.player);
  if (total > 21) {
    next.phase = "settled";
    next.result = "bust";
    next.message = "Bust.";
  } else if (total === 21) {
    return stand(next);
  } else {
    next.message = `Hand: ${total}. Hit or Stand?`;
  }
  return next;
}
function doubleDown(state) {
  if (state.phase !== "player" || state.player.length !== 2 || state.balance < state.bet) return state;
  const next = { ...state, balance: state.balance - state.bet, bet: state.bet * 2, doubled: true, shoe: [...state.shoe], player: [...state.player] };
  next.player.push(next.shoe.pop());
  const { total } = handValue(next.player);
  if (total > 21) {
    next.phase = "settled";
    next.result = "bust";
    next.message = "Doubled and busted.";
    return next;
  }
  return stand(next);
}
function stand(state) {
  if (state.phase !== "player") return state;
  const next = { ...state, shoe: [...state.shoe], dealer: [...state.dealer] };
  next.phase = "dealer";
  while (true) {
    const { total } = handValue(next.dealer);
    if (total >= 17 && true) break;
    next.dealer.push(next.shoe.pop());
    if (next.dealer.length > 11) break;
  }
  const pv = handValue(next.player).total;
  const dv = handValue(next.dealer).total;
  next.phase = "settled";
  if (dv > 21 || pv > dv) {
    next.result = "win";
    next.balance += next.bet * 2;
    next.message = `You win with ${pv}!`;
  } else if (pv === dv) {
    next.result = "push";
    next.balance += next.bet;
    next.message = `Push at ${pv}.`;
  } else {
    next.result = "lose";
    next.message = `Dealer wins with ${dv}.`;
  }
  return next;
}
function nextHand(state) {
  return { ...state, phase: "betting", player: [], dealer: [], bet: 0, result: null, doubled: false, message: "Place your virtual chips for the next hand." };
}
const RANK_ORDER = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
function newBullshitGame(playerNames) {
  const n = playerNames.length;
  const deck = shuffledDeck();
  const hands = Array.from({ length: n }, () => []);
  deck.forEach((c, i) => hands[i % n].push(c));
  hands.forEach((h) => h.sort((a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank)));
  const players = playerNames.map((name, seat) => ({ seat, name, isBot: seat !== 0, hand: hands[seat] }));
  return {
    phase: "playing",
    players,
    pile: [],
    currentSeat: 0,
    expectedRank: "A",
    lastClaim: null,
    winner: null,
    log: [`Bullshit start. ${players[0].name} leads with Aces.`],
    reveal: null
  };
}
function makeClaim(state, seat, cardIds, claimedRank) {
  if (state.phase !== "playing") return state;
  if (state.currentSeat !== seat) return state;
  if (cardIds.length < 1 || cardIds.length > 4) return state;
  if (claimedRank !== state.expectedRank) return state;
  const player = state.players[seat];
  if (!cardIds.every((id) => player.hand.includes(id))) return state;
  const next = JSON.parse(JSON.stringify(state));
  next.players[seat].hand = next.players[seat].hand.filter((c) => !cardIds.includes(c));
  next.pile.push(...cardIds);
  next.lastClaim = { seat, rank: claimedRank, count: cardIds.length, cardIds };
  next.log.push(`${player.name} claims ${cardIds.length} × ${claimedRank}.`);
  next.phase = "awaiting-challenge";
  return next;
}
function passChallenge(state) {
  if (state.phase !== "awaiting-challenge" || !state.lastClaim) return state;
  return advanceTurn$1(state, false);
}
function callBullshit(state, callerSeat) {
  if (state.phase !== "awaiting-challenge" || !state.lastClaim) return state;
  const claim = state.lastClaim;
  if (callerSeat === claim.seat) return state;
  const next = JSON.parse(JSON.stringify(state));
  const truthful = claim.cardIds.every((id) => getCard(id).rank === claim.rank);
  const loserSeat = truthful ? callerSeat : claim.seat;
  next.players[loserSeat].hand.push(...next.pile);
  next.players[loserSeat].hand.sort((a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank));
  next.reveal = { liar: !truthful, cards: claim.cardIds, loserSeat };
  next.log.push(
    truthful ? `${next.players[callerSeat].name} called BS — claim was TRUE. ${next.players[callerSeat].name} takes the pile.` : `${next.players[callerSeat].name} called BS — BLUFF! ${next.players[claim.seat].name} takes the pile.`
  );
  next.pile = [];
  return advanceTurn$1(next, true, loserSeat);
}
function advanceTurn$1(state, fromChallenge, loserSeat) {
  const next = JSON.parse(JSON.stringify(state));
  for (const p of next.players) {
    if (p.hand.length === 0) {
      next.winner = p.seat;
      next.phase = "game-over";
      next.log.push(`${p.name} wins Bullshit!`);
      return next;
    }
  }
  const start = next.currentSeat;
  let nextSeat = (start + 1) % next.players.length;
  if (fromChallenge && loserSeat !== void 0) {
    nextSeat = loserSeat;
  }
  next.currentSeat = nextSeat;
  const idx = RANK_ORDER.indexOf(next.expectedRank);
  next.expectedRank = RANK_ORDER[(idx + 1) % RANK_ORDER.length];
  next.phase = "playing";
  next.log.push(`${next.players[nextSeat].name}'s turn. Claim ${next.expectedRank}.`);
  return next;
}
function botClaim(state, seat) {
  const p = state.players[seat];
  const truthful = p.hand.filter((id) => getCard(id).rank === state.expectedRank);
  if (truthful.length > 0) {
    return { cardIds: truthful.slice(0, Math.min(truthful.length, 3)), rank: state.expectedRank };
  }
  const sorted = [...p.hand].sort((a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank));
  const n = Math.random() < 0.7 ? 1 : 2;
  return { cardIds: sorted.slice(0, Math.min(n, sorted.length)), rank: state.expectedRank };
}
function botShouldCall(state, seat) {
  if (!state.lastClaim) return false;
  if (state.lastClaim.seat === seat) return false;
  const base = state.lastClaim.count >= 3 ? 0.45 : 0.18;
  return Math.random() < base;
}
const COLORS = ["red", "blue", "green", "yellow"];
const BOT_NAMES$1 = ["Aaliyah", "Marcus", "Jamal", "Zion", "Nova", "Drei", "Lyric", "Sage"];
function createTrunoGame(players = defaultPlayers()) {
  const deck = shuffle(createDeck());
  const gamePlayers = players.slice(0, 8).map((p, seat) => ({
    id: p.id,
    name: p.name,
    isBot: !!p.isBot,
    seat,
    hand: deck.splice(0, 7)
  }));
  let topCard2 = deck.shift();
  while (topCard2.color === "black" || topCard2.color === "purple") {
    deck.push(topCard2);
    topCard2 = deck.shift();
  }
  return {
    players: gamePlayers,
    deck,
    discardPile: [topCard2],
    currentColor: topCard2.color,
    currentPlayerIndex: 0,
    direction: 1,
    phase: "playing",
    winnerId: null,
    message: `${gamePlayers[0]?.name ?? "Player"} starts.`,
    turn: 1,
    lastMoveId: "start",
    trunoCalledBy: null,
    pendingDrawPlayCardId: null
  };
}
function isPlayableCard(card2, state) {
  const top = topCard(state);
  if (!top || card2.color === "black" || card2.color === "purple") return true;
  return card2.color === state.currentColor || card2.symbol === top.symbol || card2.symbol === "number" && top.symbol === "number" && card2.value === top.value;
}
function applyPlayerMove(state, move) {
  if (state.phase === "ended") return state;
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (!player || player.id !== move.playerId) {
    return { ...next, message: "Wait for your turn." };
  }
  if (move.type === "call-truno") {
    next.trunoCalledBy = player.id;
    next.message = player.hand.length === 1 ? `${player.name} called TRUNO.` : "Call TRUNO when you have one card left.";
    next.lastMoveId = `${next.turn}:call:${player.id}`;
    return next;
  }
  if (move.type === "keep") {
    next.pendingDrawPlayCardId = null;
    next.message = `${player.name} kept the drawn card.`;
    advanceTurn(next);
    stamp(next, `keep:${player.id}`);
    return next;
  }
  if (move.type === "draw") {
    next.pendingDrawPlayCardId = null;
    if (next.deck.length === 0) recycleDiscard(next);
    const drawn = next.deck.shift();
    if (drawn) {
      player.hand.push(drawn);
      const playable = isPlayableCard(drawn, next);
      if (playable) {
        next.pendingDrawPlayCardId = drawn.id;
        next.message = `${player.name} drew a playable card: ${describeCard(drawn)}. Play or keep it?`;
        stamp(next, `draw_pending:${player.id}:${drawn.id}`);
      } else {
        next.message = `${player.name} drew a card.`;
        advanceTurn(next);
        stamp(next, `draw:${player.id}`);
      }
    } else {
      next.message = `${player.name} tried to draw but the deck was empty.`;
      advanceTurn(next);
      stamp(next, `draw:${player.id}`);
    }
    return next;
  }
  const cardIndex = player.hand.findIndex((c) => c.id === move.cardId);
  if (cardIndex < 0) return { ...next, message: "Card is no longer in your hand." };
  const card2 = player.hand[cardIndex];
  if (next.pendingDrawPlayCardId && next.pendingDrawPlayCardId !== card2.id) {
    return { ...next, message: "You must play the drawn card or keep it." };
  }
  if (!isPlayableCard(card2, next)) return { ...next, message: "That card is not playable right now." };
  player.hand.splice(cardIndex, 1);
  next.discardPile.push(card2);
  next.currentColor = normalizeColor(card2, move.wildColor);
  next.trunoCalledBy = null;
  next.pendingDrawPlayCardId = null;
  if (player.hand.length === 0) {
    next.phase = "ended";
    next.winnerId = player.id;
    next.message = `${player.name} wins the table.`;
    stamp(next, `win:${player.id}`);
    return next;
  }
  applyCardEffect(next, card2, player.name);
  stamp(next, `play:${player.id}:${card2.id}`);
  return next;
}
function applyBotMove(state) {
  if (state.phase !== "playing") return null;
  const bot = currentPlayer(state);
  if (!bot?.isBot) return null;
  let move;
  if (state.pendingDrawPlayCardId) {
    const cardId = state.pendingDrawPlayCardId;
    const card2 = bot.hand.find((c) => c.id === cardId);
    if (card2 && isPlayableCard(card2, state)) {
      move = { type: "play", playerId: bot.id, cardId, wildColor: chooseBotColor(bot) };
    } else {
      move = { type: "keep", playerId: bot.id };
    }
  } else {
    const playable = bot.hand.find((card2) => isPlayableCard(card2, state));
    move = playable ? { type: "play", playerId: bot.id, cardId: playable.id, wildColor: chooseBotColor(bot) } : { type: "draw", playerId: bot.id };
  }
  const next = applyPlayerMove(state, move);
  return { state: next, event: describeMoveEvent(state, move, next) };
}
function describeMoveEvent(before, move, after) {
  const player = before.players.find((p) => p.id === move.playerId) ?? currentPlayer(before);
  const playerName = player?.name ?? "Player";
  const base = {
    kind: move.type,
    playerId: move.playerId,
    playerName
  };
  if (move.type === "keep") {
    return {
      ...base,
      message: `${playerName} kept the drawn card.`
    };
  }
  if (move.type === "draw") {
    const msg = after.pendingDrawPlayCardId ? `${playerName} drew a playable card and is deciding...` : `${playerName} drew a card.`;
    return {
      ...base,
      message: msg
    };
  }
  if (move.type === "call-truno") {
    return {
      ...base,
      message: after.message || `${playerName} called TRUNO.`
    };
  }
  const card2 = player?.hand.find((c) => c.id === move.cardId);
  if (!card2) {
    return {
      ...base,
      message: after.message || `${playerName} played a card.`
    };
  }
  const target = actionTarget(before, card2);
  const effect = effectForCard(card2, after);
  let message = `${playerName} played ${describeCard(card2)}.`;
  if (effect === "skip" && target) message = `${playerName} played ${describeCard(card2)}. ${target.name} was skipped.`;
  if (effect === "reverse") message = `${playerName} played ${describeCard(card2)}. Reverse.`;
  if (effect === "draw_two" && target) message = `${playerName} played ${describeCard(card2)}. ${target.name} drew two.`;
  if (effect === "wild_draw_four" && target) message = `${playerName} played ${describeCard(card2)}. ${target.name} drew four.`;
  if (effect === "wild") message = `${playerName} played ${describeCard(card2)} and chose ${after.currentColor}.`;
  if (after.phase === "ended" && after.winnerId === move.playerId) message = `${playerName} played ${describeCard(card2)} and won the table.`;
  return {
    ...base,
    card: card2,
    effect,
    targetPlayerId: target?.id,
    targetPlayerName: target?.name,
    color: after.currentColor,
    message
  };
}
function describeCard(card2) {
  const color = card2.color === "black" || card2.color === "purple" ? "Wild" : titleCase(card2.color);
  if (card2.symbol === "number") return `${color} ${card2.value ?? card2.label}`;
  if (card2.symbol === "draw_two") return `${color} Draw Two`;
  if (card2.symbol === "wild_draw_four") return "Wild Draw Four";
  if (card2.symbol === "reverse") return `${color} Reverse`;
  if (card2.symbol === "skip") return `${color} Skip`;
  if (card2.symbol === "wild") return "Wild";
  return `${color} ${card2.label}`;
}
function currentPlayer(state) {
  return state.players[state.currentPlayerIndex] ?? null;
}
function topCard(state) {
  return state.discardPile[state.discardPile.length - 1] ?? null;
}
function defaultPlayers() {
  return [
    { id: "human-0", name: "You", isBot: false },
    { id: "bot-1", name: BOT_NAMES$1[0], isBot: true },
    { id: "bot-2", name: BOT_NAMES$1[1], isBot: true },
    { id: "bot-3", name: BOT_NAMES$1[2], isBot: true }
  ];
}
function createDeck() {
  const deck = [];
  for (const color of COLORS) {
    deck.push(card(color, "number", 0));
    for (let value = 1; value <= 9; value++) {
      deck.push(card(color, "number", value), card(color, "number", value));
    }
    for (const symbol of ["skip", "reverse", "draw_two"]) {
      deck.push(card(color, symbol), card(color, symbol));
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild-${i}`, color: "black", symbol: "wild", label: "W" });
    deck.push({ id: `wild-draw-four-${i}`, color: "black", symbol: "wild_draw_four", value: 4, label: "+4" });
  }
  return deck;
}
function card(color, symbol, value) {
  const label = symbol === "number" ? String(value) : symbol === "draw_two" ? "+2" : symbol === "skip" ? "S" : "R";
  return { id: `${color}-${symbol}-${value ?? "x"}-${Math.random().toString(36).slice(2, 8)}`, color, symbol, value, label };
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function cloneState(state) {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, hand: p.hand.map((c) => ({ ...c })) })),
    deck: state.deck.map((c) => ({ ...c })),
    discardPile: state.discardPile.map((c) => ({ ...c }))
  };
}
function drawCards(state, player, count) {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) recycleDiscard(state);
    const drawn = state.deck.shift();
    if (drawn) player.hand.push(drawn);
  }
}
function recycleDiscard(state) {
  const top = state.discardPile.pop();
  state.deck = shuffle(state.discardPile);
  state.discardPile = top ? [top] : [];
}
function applyCardEffect(state, card2, name) {
  if (card2.symbol === "reverse") {
    state.direction = state.direction === 1 ? -1 : 1;
    state.message = `${name} reversed the table.`;
    advanceTurn(state, state.players.length === 2 ? 2 : 1);
    return;
  }
  if (card2.symbol === "skip") {
    state.message = `${name} skipped the next player.`;
    advanceTurn(state, 2);
    return;
  }
  if (card2.symbol === "draw_two" || card2.symbol === "wild_draw_four") {
    advanceTurn(state);
    const target = currentPlayer(state);
    if (target) drawCards(state, target, card2.symbol === "draw_two" ? 2 : 4);
    state.message = `${target?.name ?? "Next player"} drew ${card2.symbol === "draw_two" ? "two" : "four"} cards.`;
    advanceTurn(state);
    return;
  }
  state.message = `${name} played ${card2.label}.`;
  advanceTurn(state);
}
function actionTarget(state, card2) {
  if (!["skip", "draw_two", "wild_draw_four"].includes(card2.symbol)) return null;
  const total = state.players.length;
  if (total === 0) return null;
  const targetIndex = (state.currentPlayerIndex + state.direction + total) % total;
  return state.players[targetIndex] ?? null;
}
function effectForCard(card2, after) {
  if (after.phase === "ended") return "win";
  if (card2.symbol === "skip") return "skip";
  if (card2.symbol === "reverse") return "reverse";
  if (card2.symbol === "draw_two") return "draw_two";
  if (card2.symbol === "wild_draw_four") return "wild_draw_four";
  if (card2.symbol === "wild") return "wild";
  return void 0;
}
function advanceTurn(state, steps = 1) {
  const total = state.players.length;
  for (let i = 0; i < steps; i++) {
    state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + total) % total;
  }
}
function normalizeColor(card2, wildColor) {
  if (card2.color !== "black" && card2.color !== "purple") return card2.color;
  return COLORS.includes(wildColor) ? wildColor : "red";
}
function chooseBotColor(bot) {
  const counts = COLORS.map((color) => ({ color, n: bot.hand.filter((c) => c.color === color).length }));
  counts.sort((a, b) => b.n - a.n);
  return counts[0]?.color ?? "red";
}
function stamp(state, id) {
  state.turn += 1;
  state.lastMoveId = `${state.turn}:${id}`;
}
function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
const BOT_NAMES = ["Aaliyah", "Marcus", "Jamal", "Zion", "Nova", "Drei", "Lyric", "Sage"];
const MAX_PLAYERS_BY_GAME = {
  spades: 4,
  blackjack: 1,
  bullshit: 4,
  truno: 4
};
const STALE_PLAYER_MS$1 = 3e4;
async function createRoom(opts) {
  const max = MAX_PLAYERS_BY_GAME[opts.gameType];
  let lastErr = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase.from("game_rooms").insert({
      room_code: code,
      game_type: opts.gameType,
      status: "waiting",
      host_user_id: opts.identity.userId,
      host_display_name: opts.identity.displayName,
      max_players: max,
      current_players: 1,
      is_private: opts.isPrivate,
      target_score: opts.targetScore ?? 500
    }).select().single();
    if (!error && data) {
      const room = data;
      const { data: pData, error: pErr } = await supabase.from("game_room_players").insert({
        room_id: room.id,
        user_id: opts.identity.userId,
        display_name: opts.identity.displayName,
        seat_index: 0,
        team_index: opts.gameType === "spades" ? 0 : null,
        is_bot: false,
        is_host: true,
        is_ready: true,
        is_connected: true
      }).select().single();
      if (pErr) throw pErr;
      return { room, player: pData };
    }
    lastErr = error;
  }
  throw lastErr || new Error("Failed to create room");
}
async function findRoomByCode(code) {
  const { data, error } = await supabase.from("game_rooms").select("*").eq("room_code", code.toUpperCase()).maybeSingle();
  if (error) throw error;
  return data;
}
async function joinRoomByCode(code, identity) {
  const room = await findRoomByCode(code);
  if (!room) throw new Error("Room not found");
  if (room.status === "ended" || room.status === "abandoned") throw new Error("Room is closed");
  const { data: existing } = await supabase.from("game_room_players").select("*").eq("room_id", room.id).eq("user_id", identity.userId).maybeSingle();
  if (existing) {
    await supabase.from("game_room_players").update({ is_connected: true, last_seen_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", existing.id);
    return { room, player: existing };
  }
  const { data: seated } = await supabase.from("game_room_players").select("*").eq("room_id", room.id).order("seat_index");
  const taken = new Set((seated || []).map((p) => p.seat_index));
  let seat = -1;
  for (let i = 0; i < room.max_players; i++) {
    if (!taken.has(i)) {
      seat = i;
      break;
    }
  }
  if (seat === -1) {
    const bot = (seated || []).find((p) => p.is_bot);
    if (!bot) throw new Error("Room is full");
    await supabase.from("game_room_players").delete().eq("id", bot.id);
    seat = bot.seat_index;
  }
  const { data: pData, error: pErr } = await supabase.from("game_room_players").insert({
    room_id: room.id,
    user_id: identity.userId,
    display_name: identity.displayName,
    seat_index: seat,
    team_index: room.game_type === "spades" ? seat % 2 : null,
    is_bot: false,
    is_host: false,
    is_ready: true,
    is_connected: true
  }).select().single();
  if (pErr) throw pErr;
  const { count } = await supabase.from("game_room_players").select("*", { count: "exact", head: true }).eq("room_id", room.id);
  await supabase.from("game_rooms").update({ current_players: count ?? 1, last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", room.id);
  return { room, player: pData };
}
async function fillSeatsWithBots(roomId, gameType) {
  const { data: room } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();
  if (!room) return;
  const { data: seated } = await supabase.from("game_room_players").select("seat_index").eq("room_id", roomId);
  const taken = new Set((seated || []).map((p) => p.seat_index));
  const max = room.max_players;
  const inserts = [];
  let nameIdx = 0;
  for (let i = 0; i < max; i++) {
    if (!taken.has(i)) {
      inserts.push({
        room_id: roomId,
        user_id: `bot-${roomId.slice(0, 6)}-${i}`,
        display_name: BOT_NAMES[nameIdx++ % BOT_NAMES.length],
        seat_index: i,
        team_index: gameType === "spades" ? i % 2 : null,
        is_bot: true,
        is_ready: true,
        is_connected: true,
        is_host: false
      });
    }
  }
  if (inserts.length) {
    await supabase.from("game_room_players").insert(inserts);
    await supabase.from("game_rooms").update({ current_players: max, last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", roomId);
  }
}
async function startGameSession(roomId, gameType) {
  const { data: players } = await supabase.from("game_room_players").select("*").eq("room_id", roomId).order("seat_index");
  const seatNames = (players || []).map((p) => p.display_name);
  let state;
  let phase;
  let currentSeat;
  let round = 1;
  if (gameType === "spades") {
    const padded = [...seatNames];
    while (padded.length < 4) padded.push(`Bot ${padded.length + 1}`);
    const s = newSpadesGame(padded.slice(0, 4));
    state = s;
    phase = s.phase;
    currentSeat = s.currentSeat;
    round = s.round;
  } else if (gameType === "blackjack") {
    state = newBlackjackGame(2500);
    phase = state.phase;
    currentSeat = 0;
  } else if (gameType === "bullshit") {
    const padded = seatNames.length >= 2 ? seatNames : [...seatNames, "Bot 1", "Bot 2"];
    const s = newBullshitGame(padded);
    state = s;
    phase = s.phase;
    currentSeat = s.currentSeat;
  } else {
    const orderedPlayers = (players || []).map((p) => ({
      id: p.user_id,
      name: p.display_name,
      isBot: !!p.is_bot
    }));
    while (orderedPlayers.length < 2) {
      const seat = orderedPlayers.length;
      orderedPlayers.push({ id: `bot-${roomId.slice(0, 6)}-${seat}`, name: `Bot ${seat + 1}`, isBot: true });
    }
    const s = createTrunoGame(orderedPlayers);
    state = s;
    phase = s.phase;
    currentSeat = s.currentPlayerIndex;
    round = s.turn;
  }
  await supabase.from("game_sessions").update({ status: "ended" }).eq("room_id", roomId).eq("status", "active");
  const { data, error } = await supabase.from("game_sessions").insert({
    room_id: roomId,
    game_type: gameType,
    status: "active",
    current_turn_seat: currentSeat,
    round_number: round,
    phase,
    state_json: state
  }).select().single();
  if (error) throw error;
  await supabase.from("game_rooms").update({ status: "active", last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", roomId);
  return data;
}
async function updateSessionState(sessionId, state, currentSeat, phase, round) {
  const patch = {
    state_json: state,
    current_turn_seat: currentSeat,
    phase,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (round !== void 0) patch.round_number = round;
  await supabase.from("game_sessions").update(patch).eq("id", sessionId);
}
async function endSession(sessionId, roomId) {
  await supabase.from("game_sessions").update({ status: "ended", phase: "game-over" }).eq("id", sessionId);
  await supabase.from("game_rooms").update({ status: "ended", last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", roomId);
}
async function recordMove(sessionId, playerId, seatIndex, moveType, payload, moveNumber) {
  await supabase.from("game_moves").insert({
    session_id: sessionId,
    player_id: playerId,
    seat_index: seatIndex,
    move_type: moveType,
    move_payload: payload,
    move_number: moveNumber
  });
}
async function leaveRoom(roomId, userId) {
  await supabase.from("game_room_players").update({ is_connected: false, last_seen_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("room_id", roomId).eq("user_id", userId);
}
async function heartbeat(roomId, userId) {
  await supabase.from("game_room_players").update({ is_connected: true, last_seen_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("room_id", roomId).eq("user_id", userId);
}
async function replaceDisconnectedPlayersWithBots(roomId, staleMs = STALE_PLAYER_MS$1) {
  const players = await getRoomPlayers(roomId);
  const cutoff = Date.now() - staleMs;
  const stalePlayers = players.filter((p) => {
    if (p.is_bot) return false;
    if (!p.is_connected) return true;
    return new Date(p.last_seen_at).getTime() < cutoff;
  });
  if (stalePlayers.length === 0) return [];
  const updates = stalePlayers.map((p, index) => {
    const displayName = BOT_NAMES[(p.seat_index + index) % BOT_NAMES.length];
    return supabase.from("game_room_players").update({
      user_id: `bot-${roomId.slice(0, 6)}-${p.seat_index}`,
      display_name: displayName,
      is_bot: true,
      is_connected: true,
      is_ready: true,
      is_host: false,
      last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", p.id);
  });
  await Promise.all(updates);
  await supabase.from("game_rooms").update({ last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", roomId);
  return stalePlayers.map((p) => p.seat_index);
}
async function listActiveRooms() {
  const { data, error } = await supabase.from("game_rooms").select("*").in("status", ["waiting", "active", "abandoned"]).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}
async function closeRoom(roomId) {
  await supabase.from("game_rooms").update({ status: "ended" }).eq("id", roomId);
}
async function clearAbandoned() {
  await supabase.from("game_rooms").delete().eq("status", "abandoned");
}
async function getRoomPlayers(roomId) {
  const { data } = await supabase.from("game_room_players").select("*").eq("room_id", roomId).order("seat_index");
  return data || [];
}
async function getActiveSession(roomId) {
  const { data } = await supabase.from("game_sessions").select("*").eq("room_id", roomId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}
function isGameBackendEnabled() {
  const value = void 0;
  return value === "true";
}
const STALE_PLAYER_MS = 3e4;
function useRealtimeRoom(roomId, identity, applyMove, extractMeta) {
  const [data, setData] = reactExports.useState({
    room: null,
    players: [],
    session: null,
    state: null,
    mySeat: null,
    isHost: false,
    loading: !!roomId,
    error: null
  });
  const moveCounter = reactExports.useRef(0);
  const dataRef = reactExports.useRef(data);
  dataRef.current = data;
  const pollTimer = reactExports.useRef(null);
  const hbTimer = reactExports.useRef(null);
  const staleTimer = reactExports.useRef(null);
  const loadAll = reactExports.useCallback(async (rid) => {
    try {
      const [{ data: roomRow }, players, session] = await Promise.all([
        supabase.from("game_rooms").select("*").eq("id", rid).single(),
        getRoomPlayers(rid),
        getActiveSession(rid)
      ]);
      const room = roomRow;
      const me = players.find((p) => p.user_id === identity.userId);
      setData((prev) => ({
        room,
        players,
        session: session ?? prev.session,
        // Prefer the freshest local state if its updated_at is newer than DB's;
        // otherwise take DB state. This avoids clobbering an optimistic move
        // with a stale poll response.
        state: pickFreshestState(prev, session),
        mySeat: me ? me.seat_index : prev.mySeat,
        isHost: isTableRunner(players, me),
        loading: false,
        error: null
      }));
    } catch (e) {
      setData((d) => ({ ...d, loading: false, error: e?.message || "Failed to load room" }));
    }
  }, [identity.userId]);
  reactExports.useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    loadAll(roomId);
    const tick = async () => {
      if (cancelled) return;
      try {
        await loadAll(roomId);
      } catch {
      }
    };
    pollTimer.current = setInterval(tick, 2e3);
    hbTimer.current = setInterval(() => {
      heartbeat(roomId, identity.userId).catch(() => {
      });
    }, 15e3);
    staleTimer.current = setInterval(() => {
      const current = dataRef.current;
      if (!current.room || !current.isHost) return;
      replaceDisconnectedPlayersWithBots(roomId).then((replaced) => {
        if (replaced.length > 0) loadAll(roomId);
      }).catch(() => {
      });
    }, 5e3);
    return () => {
      cancelled = true;
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (hbTimer.current) clearInterval(hbTimer.current);
      if (staleTimer.current) clearInterval(staleTimer.current);
      pollTimer.current = null;
      hbTimer.current = null;
      staleTimer.current = null;
    };
  }, [roomId, identity.userId, loadAll]);
  const sendMove = reactExports.useCallback(async (move) => {
    const current = dataRef.current;
    if (!current.room || !current.session || !current.state) return;
    try {
      const nextState = applyMove(current.state, move);
      const meta = extractMeta(nextState);
      setData((d) => ({ ...d, state: nextState }));
      await updateSessionState(current.session.id, nextState, meta.currentSeat, meta.phase, meta.round);
      await recordMove(
        current.session.id,
        identity.userId,
        move.seat,
        move.type,
        move.payload || {},
        ++moveCounter.current
      );
      if (meta.ended) await endSession(current.session.id, current.room.id);
    } catch (e) {
      console.warn("sendMove failed", e);
    }
  }, [identity.userId, applyMove, extractMeta]);
  const setHostState = reactExports.useCallback(async (nextState) => {
    const current = dataRef.current;
    if (!current.session) return;
    const meta = extractMeta(nextState);
    setData((d) => ({ ...d, state: nextState }));
    await updateSessionState(current.session.id, nextState, meta.currentSeat, meta.phase, meta.round);
    if (meta.ended && current.room) await endSession(current.session.id, current.room.id);
  }, [extractMeta]);
  return { ...data, sendMove, setHostState, reload: () => roomId && loadAll(roomId) };
}
function pickFreshestState(prev, dbSession) {
  if (!dbSession) return prev.state ?? null;
  if (!prev.session || !prev.state) return dbSession.state_json ?? null;
  const prevUpdated = new Date(prev.session.updated_at).getTime();
  const dbUpdated = new Date(dbSession.updated_at).getTime();
  return dbUpdated >= prevUpdated ? dbSession.state_json ?? prev.state : prev.state;
}
function isTableRunner(players, me) {
  if (!me || me.is_bot || !me.is_connected) return false;
  if (me.is_host) return true;
  const cutoff = Date.now() - STALE_PLAYER_MS;
  const connectedHost = players.find((p) => p.is_host && !p.is_bot && p.is_connected && new Date(p.last_seen_at).getTime() >= cutoff);
  if (connectedHost) return false;
  const connectedRealPlayers = players.filter((p) => !p.is_bot && p.is_connected).sort((a, b) => a.seat_index - b.seat_index);
  return connectedRealPlayers[0]?.id === me.id;
}
const GAME_LABEL = {
  spades: { name: "Spades", color: "#00B7FF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 14 }) },
  blackjack: { name: "Blackjack", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 14 }) },
  bullshit: { name: "Bullshit", color: "#A855F7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }) },
  truno: { name: "Truno", color: "#D946EF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 14 }) }
};
const FriendInviteCenter = ({ identity, onBack, defaultGame = "spades", roomId, roomCode }) => {
  const [friends, setFriends] = reactExports.useState([]);
  const [game, setGame] = reactExports.useState(defaultGame);
  const [search, setSearch] = reactExports.useState("");
  const [adding, setAdding] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("Come join the table.");
  const [sentTo, setSentTo] = reactExports.useState(/* @__PURE__ */ new Set());
  const [feedback, setFeedback] = reactExports.useState(null);
  const backendEnabled = isGameBackendEnabled();
  reactExports.useEffect(() => {
    return;
  }, [backendEnabled, identity.userId]);
  const filtered = friends.filter(
    (f) => !search.trim() || f.friend_display_name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const handleAddFriend = async () => {
    {
      setFeedback("Friend search will be available after the Trey TV game database migration is enabled.");
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
  };
  const handleInvite = async (f) => {
    {
      setFeedback("Invites will be available after the Trey TV game database migration is enabled.");
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
  };
  const handleRemove = async (f) => {
    {
      setFeedback("Friend management will be available after the Trey TV game database migration is enabled.");
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
  };
  const gm = GAME_LABEL[game];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white relative overflow-hidden", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 opacity-60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(0,183,255,0.22) 0%, transparent 70%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 backdrop-blur-2xl border-b", style: { background: "rgba(5,7,13,0.78)", borderColor: "rgba(0,183,255,0.18)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "p-2 -ml-2 rounded-xl hover:bg-white/5 transition", "aria-label": "Back", title: "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 28, glow: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-px bg-white/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold", style: { color: "#00B7FF" }, children: "FRIENDS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate", children: "Invite Center" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-3xl mx-auto px-4 py-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl border p-4 md:p-5 backdrop-blur-md trey-queue-card",
          style: { background: "rgba(8,17,31,0.65)", borderColor: gm.color + "40", boxShadow: `0 0 40px ${gm.color}18` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold mb-3", style: { color: gm.color }, children: "INVITE TO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["spades", "blackjack", "bullshit", "truno"].map((g) => {
              const meta = GAME_LABEL[g];
              const active = game === g;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setGame(g),
                  className: "rounded-2xl px-3 py-3 border text-left transition",
                  style: {
                    background: active ? meta.color + "22" : "rgba(5,7,13,0.55)",
                    borderColor: active ? meta.color + "90" : "rgba(255,255,255,0.10)",
                    boxShadow: active ? `0 0 24px ${meta.color}50` : "none",
                    color: active ? meta.color : "#CBD5E1"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-bold", children: [
                      meta.icon,
                      " GAME"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black mt-1 truncate", children: meta.name })
                  ]
                },
                g
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold text-slate-500 mb-1.5", children: "MESSAGE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: message,
                  onChange: (e) => setMessage(e.target.value),
                  maxLength: 140,
                  className: "w-full rounded-xl px-3 py-2.5 text-sm bg-black/40 border outline-none focus:border-cyan-400 transition",
                  style: { borderColor: "rgba(255,255,255,0.10)" },
                  placeholder: "Say something to your crew…"
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl border p-4 backdrop-blur-md trey-queue-card",
          style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(0,183,255,0.25)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    placeholder: "Search friends or add by display name",
                    className: "w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-black/40 border outline-none focus:border-cyan-400 transition",
                    style: { borderColor: "rgba(255,255,255,0.10)" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleAddFriend,
                  disabled: adding || !search.trim(),
                  className: "px-3 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 disabled:opacity-50",
                  style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: "0 0 20px rgba(0,183,255,0.4)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
                    " Add"
                  ]
                }
              )
            ] }),
            feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-3 py-2", children: feedback })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl border backdrop-blur-md p-4 trey-queue-card",
          style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(168,85,247,0.25)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold text-slate-500", children: "YOUR CREW" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black tracking-tight flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "text-purple-300" }),
                " Friends (",
                friends.length,
                ")"
              ] })
            ] }) }),
            filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 py-6 text-center", children: "Friend invites will connect after the Trey TV game database migration is enabled." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((f) => {
              const sent = sentTo.has(f.friend_user_id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-3 rounded-2xl px-3 py-2.5 border trey-glass-panel",
                  style: { background: "rgba(5,7,13,0.6)", borderColor: "rgba(255,255,255,0.08)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0",
                        style: { background: "linear-gradient(135deg, rgba(0,183,255,0.25), rgba(168,85,247,0.25))", border: "1px solid rgba(255,255,255,0.12)" },
                        children: f.friend_display_name.slice(0, 1).toUpperCase()
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate", children: f.friend_display_name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500", children: "Trey TV player" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => handleInvite(),
                        disabled: sent,
                        className: "px-3 py-2 rounded-xl text-[11px] font-black inline-flex items-center gap-1.5 transition",
                        style: {
                          background: sent ? "rgba(34,197,94,0.18)" : gm.color + "22",
                          color: sent ? "#86EFAC" : gm.color,
                          border: "1px solid " + (sent ? "rgba(34,197,94,0.5)" : gm.color + "60")
                        },
                        children: sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
                          " Sent"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 12 }),
                          " Invite"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemove(), className: "p-2 rounded-xl hover:bg-rose-500/10 transition", title: "Remove friend", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13, className: "text-rose-300" }) })
                  ]
                },
                f.id
              );
            }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 text-center max-w-md mx-auto leading-relaxed", children: "Invites land in your friend's Game Requests inbox. They have 15 minutes to accept." })
    ] })
  ] });
};
const COLOR_STYLES = {
  red: { glow: "shadow-[0_0_30px_rgba(255,51,102,0.6)]", border: "border-red-500", bg: "from-red-900/80 to-red-950", text: "text-red-300", hex: "#FF3366", energy: "flame" },
  blue: { glow: "shadow-[0_0_30px_rgba(0,217,255,0.6)]", border: "border-cyan-400", bg: "from-blue-900/80 to-blue-950", text: "text-cyan-300", hex: "#00D9FF", energy: "lightning" },
  green: { glow: "shadow-[0_0_30px_rgba(0,255,136,0.6)]", border: "border-emerald-400", bg: "from-emerald-900/80 to-emerald-950", text: "text-emerald-300", hex: "#00FF88", energy: "current" },
  yellow: { glow: "shadow-[0_0_30px_rgba(255,215,0,0.6)]", border: "border-amber-400", bg: "from-amber-900/80 to-amber-950", text: "text-amber-300", hex: "#FFD700", energy: "crown" },
  purple: { glow: "shadow-[0_0_30px_rgba(157,78,221,0.7)]", border: "border-purple-500", bg: "from-purple-900/80 to-purple-950", text: "text-purple-300", hex: "#9D4EDD", energy: "chaos" },
  black: { glow: "shadow-[0_0_40px_rgba(255,0,128,0.5)]", border: "border-fuchsia-500", bg: "from-zinc-900 to-black", text: "text-fuchsia-300", hex: "#FF0080", energy: "spectrum" }
};
const sizeMap = {
  xs: "w-10 h-14 text-xs rounded-lg",
  sm: "w-14 h-20 text-sm rounded-xl",
  md: "w-20 h-28 text-xl rounded-2xl",
  lg: "w-28 h-40 text-3xl rounded-2xl"
};
const EnergyIcon = ({ color, size = 24 }) => {
  if (color === "red") return /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size, className: "text-red-300", strokeWidth: 2.5 });
  if (color === "blue") return /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size, className: "text-cyan-200", strokeWidth: 2.5, fill: "currentColor" });
  if (color === "green") return /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size, className: "text-emerald-200", strokeWidth: 2.5 });
  if (color === "yellow") return /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size, className: "text-amber-200", strokeWidth: 2.5 });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumSwirl, { size });
};
const SpectrumSwirl = ({ size = 24 }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 40 40", className: "drop-shadow-[0_0_8px_rgba(255,0,128,0.8)]", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "spec", x1: "0", y1: "0", x2: "1", y2: "1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FF0080" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "33%", stopColor: "#9D4EDD" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "66%", stopColor: "#00D9FF" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00FF88" })
  ] }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      d: "M20 4 C28 4 36 12 36 20 C36 26 32 30 26 30 C22 30 18 26 18 22 C18 19 20 17 22 17",
      fill: "none",
      stroke: "url(#spec)",
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "22", cy: "17", r: "2.5", fill: "url(#spec)" })
] });
const TrunoCard = ({ card: card2, size = "md", playable, selected, faceDown, onClick, className = "" }) => {
  const style = COLOR_STYLES[card2.color];
  if (faceDown) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick,
        className: `${sizeMap[size]} relative flex items-center justify-center overflow-hidden cursor-pointer
          bg-gradient-to-br from-zinc-900 via-purple-950 to-black border-2 border-fuchsia-500/40
          shadow-[0_0_20px_rgba(157,78,221,0.5)] ${className}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-30", style: {
            background: "radial-gradient(circle at center, rgba(255,0,128,0.4), transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumSwirl, { size: size === "lg" ? 40 : size === "md" ? 28 : 18 })
        ]
      }
    );
  }
  const renderSymbol = () => {
    if (card2.symbol === "number") return card2.value;
    if (card2.symbol === "reverse") return /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "w-1/2 h-1/2", strokeWidth: 2.5 });
    if (card2.symbol === "skip") return /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-1/2 h-1/2", strokeWidth: 2.5 });
    if (card2.symbol === "draw_two") return "+2";
    if (card2.symbol === "wild_draw_four") return "+4";
    if (card2.symbol === "wild") return /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumSwirl, { size: size === "lg" ? 56 : 36 });
    return card2.label;
  };
  const isWild = card2.color === "black" || card2.color === "purple" && card2.symbol === "wild_draw_four";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: `${sizeMap[size]} relative flex flex-col items-center justify-between p-2 overflow-hidden
        bg-gradient-to-br ${style.bg} border-2 ${style.border} ${style.glow}
        transition-all duration-200 cursor-pointer
        ${playable ? "hover:-translate-y-3 hover:scale-105" : "opacity-60 saturate-50"}
        ${selected ? "-translate-y-4 scale-110 ring-4 ring-white/60" : ""}
        ${className}`,
      style: {
        background: card2.color === "black" ? "radial-gradient(circle at center, rgba(40,10,60,0.95), #000)" : void 0
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `self-start text-[0.6em] font-black ${style.text} leading-none`, children: card2.symbol === "number" ? card2.value : card2.symbol === "draw_two" ? "+2" : card2.symbol === "wild_draw_four" ? "+4" : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 flex items-center justify-center font-black ${style.text} drop-shadow-[0_0_10px_currentColor]`, children: renderSymbol() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "self-end opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EnergyIcon, { color: isWild ? "black" : card2.color, size: size === "lg" ? 22 : size === "md" ? 16 : 12 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" })
      ]
    }
  );
};
const RU = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const TRUNO_AVATARS = {
  "Trey-1": RU("men", 32),
  "Trey-I": RU("men", 22),
  "Zay": RU("women", 68),
  "Maya": RU("women", 65),
  "Lena": RU("women", 72),
  "QueenMaya": RU("women", 79),
  "AceTheGreat": RU("men", 85),
  "KingNova": RU("women", 90),
  "ShadowPlay": RU("men", 76),
  "Ghost": RU("men", 45),
  "Default": RU("men", 32)
};
function avatarFor(name) {
  if (!name) return TRUNO_AVATARS.Default;
  if (name in TRUNO_AVATARS) return TRUNO_AVATARS[name];
  const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const isWoman = seed % 2 === 0;
  return RU(isWoman ? "women" : "men", seed % 89 + 1);
}
const HUMAN_AFTER_PLAY_DELAY_MS = 450;
const BOT_THINK_MIN_MS = 700;
const BOT_THINK_MAX_MS = 1200;
const BOT_AFTER_ACTION_DELAY_MS = 650;
const ACTION_EFFECT_MS = 900;
const MAX_VISIBLE_BOT_STEPS = 16;
const CARD_DOUBLE_TAP_MS = 320;
const CARD_PLAY_GUARD_MS = 700;
const MatchScreen = ({ onNavigate, identity, roomId = null, mode = "quick" }) => {
  const currentUser = useCurrentUser();
  const [localState, setLocalState] = reactExports.useState(() => createTrunoGame([
    { id: identity.userId, name: identity.displayName, isBot: false },
    { id: "local-bot-1", name: "Aaliyah", isBot: true },
    { id: "local-bot-2", name: "Marcus", isBot: true },
    ...mode === "ai" ? [] : [{ id: "local-bot-3", name: "Nova", isBot: true }]
  ]));
  const [selected, setSelected] = reactExports.useState(null);
  const [voice, setVoice] = reactExports.useState(false);
  const [chat, setChat] = reactExports.useState(false);
  const [chatDraft, setChatDraft] = reactExports.useState("");
  const [localChat, setLocalChat] = reactExports.useState([]);
  const [notice, setNotice] = reactExports.useState(null);
  const [turnNotice, setTurnNotice] = reactExports.useState("Your turn.");
  const [actionLog, setActionLog] = reactExports.useState([]);
  const [thinkingPlayerId, setThinkingPlayerId] = reactExports.useState(null);
  const [tableEffect, setTableEffect] = reactExports.useState(null);
  const [discardPulse, setDiscardPulse] = reactExports.useState(0);
  const [drawPulse, setDrawPulse] = reactExports.useState(0);
  const [pulsePlayerId, setPulsePlayerId] = reactExports.useState(null);
  const [invalidCardId, setInvalidCardId] = reactExports.useState(null);
  const [remoteTarget, setRemoteTarget] = reactExports.useState("hand");
  const [pendingWildCardId, setPendingWildCardId] = reactExports.useState(null);
  const tvRemoteMode = useTvRemoteMode();
  const tapRef = reactExports.useRef({ cardId: null, at: 0 });
  const playGuardRef = reactExports.useRef({ cardId: null, at: 0 });
  const sequencerRef = reactExports.useRef({
    running: false,
    token: 0,
    lastKey: null
  });
  const timeoutsRef = reactExports.useRef([]);
  const observedMoveRef = reactExports.useRef(null);
  const applyRoomMove = reactExports.useCallback((state2, move) => {
    const player = state2.players[move.seat];
    if (!player) return state2;
    if (move.type === "play") {
      return applyPlayerMove(state2, { type: "play", playerId: player.id, cardId: move.payload?.cardId, wildColor: move.payload?.wildColor });
    }
    if (move.type === "draw") return applyPlayerMove(state2, { type: "draw", playerId: player.id });
    if (move.type === "keep") return applyPlayerMove(state2, { type: "keep", playerId: player.id });
    if (move.type === "call-truno") return applyPlayerMove(state2, { type: "call-truno", playerId: player.id });
    return state2;
  }, []);
  const extractMeta = reactExports.useCallback((state2) => ({
    currentSeat: state2.currentPlayerIndex,
    phase: state2.phase,
    round: state2.turn,
    ended: state2.phase === "ended"
  }), []);
  const room = useRealtimeRoom(roomId, identity, applyRoomMove, extractMeta);
  const state = roomId ? room.state : localState;
  const clearSequencer = reactExports.useCallback(() => {
    sequencerRef.current.token += 1;
    sequencerRef.current.running = false;
    setThinkingPlayerId(null);
    timeoutsRef.current.forEach((timer) => clearTimeout(timer));
    timeoutsRef.current = [];
  }, []);
  reactExports.useEffect(() => () => clearSequencer(), [clearSequencer]);
  const sleep = reactExports.useCallback((ms) => new Promise((resolve) => {
    const timer = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((item) => item !== timer);
      resolve();
    }, ms);
    timeoutsRef.current.push(timer);
  }), []);
  const showMoveEvent = reactExports.useCallback((event, moveId) => {
    if (moveId) observedMoveRef.current = moveId;
    const tone = event.effect ? "effect" : event.kind === "draw" ? "draw" : event.kind === "keep" ? "keep" : event.kind === "play" ? "play" : "system";
    const label = logLabelFromEvent(event);
    setTurnNotice(event.message);
    setActionLog((prev) => [
      {
        id: `${Date.now()}:${event.playerId}:${event.kind}`,
        text: event.message,
        tone,
        label
      },
      ...prev
    ].slice(0, 5));
    if (event.kind === "play") setDiscardPulse((count) => count + 1);
    if (event.kind === "draw") setDrawPulse((count) => count + 1);
    if (event.kind === "draw") setPulsePlayerId(event.playerId);
    if (event.effect === "draw_two" || event.effect === "wild_draw_four") setPulsePlayerId(event.targetPlayerId ?? null);
    const effect = effectFromEvent(event);
    if (effect) {
      setTableEffect(effect);
      const timer = setTimeout(() => setTableEffect(null), ACTION_EFFECT_MS);
      timeoutsRef.current.push(timer);
    }
    const pulseTimer = setTimeout(() => setPulsePlayerId(null), ACTION_EFFECT_MS);
    timeoutsRef.current.push(pulseTimer);
  }, []);
  const roomSetHostState = room.setHostState;
  const seatedHostCanRunBots = room.players.some((player) => player.user_id === identity.userId && player.is_host && !player.is_bot);
  const engineHostCanRunBots = !!roomId && state?.players[0]?.id === identity.userId;
  const isRoomHost = room.isHost || seatedHostCanRunBots || engineHostCanRunBots;
  const runBotSequence = reactExports.useCallback(async (startState, token) => {
    let workingState = startState;
    let steps = 0;
    await sleep(HUMAN_AFTER_PLAY_DELAY_MS);
    while (sequencerRef.current.token === token && workingState.phase === "playing" && currentPlayer(workingState)?.isBot && steps < MAX_VISIBLE_BOT_STEPS) {
      const bot = currentPlayer(workingState);
      setThinkingPlayerId(bot.id);
      setTurnNotice(`${bot.name} is thinking...`);
      await sleep(randomBetween(BOT_THINK_MIN_MS, BOT_THINK_MAX_MS));
      if (sequencerRef.current.token !== token) return;
      const result = applyBotMove(workingState);
      if (!result || result.state.lastMoveId === workingState.lastMoveId) break;
      showMoveEvent(result.event, result.state.lastMoveId);
      workingState = result.state;
      if (roomId) {
        await roomSetHostState(result.state);
      } else {
        setLocalState(result.state);
      }
      await sleep(BOT_AFTER_ACTION_DELAY_MS);
      steps++;
    }
    if (sequencerRef.current.token !== token) return;
    const nextActive = currentPlayer(workingState);
    setThinkingPlayerId(null);
    sequencerRef.current.running = false;
    if (workingState.phase === "ended") {
      setTurnNotice(workingState.message);
    } else if (nextActive?.isBot && steps >= MAX_VISIBLE_BOT_STEPS) {
      setNotice("The table paused bot play to keep the turn sequence safe.");
    } else if (nextActive?.id === identity.userId || !roomId && !nextActive?.isBot) {
      setTurnNotice("Your turn.");
    } else if (nextActive) {
      setTurnNotice(`Waiting for ${nextActive.name}.`);
    }
  }, [identity.userId, roomId, roomSetHostState, showMoveEvent, sleep]);
  reactExports.useEffect(() => {
    if (!state || state.phase === "ended") return;
    const active = currentPlayer(state);
    if (!active?.isBot) return;
    if (roomId && !isRoomHost) return;
    const key = `${state.lastMoveId}:${state.currentPlayerIndex}:${active.id}`;
    if (sequencerRef.current.running || sequencerRef.current.lastKey === key) return;
    sequencerRef.current.running = true;
    sequencerRef.current.lastKey = key;
    const token = sequencerRef.current.token + 1;
    sequencerRef.current.token = token;
    void runBotSequence(state, token);
  }, [isRoomHost, roomId, runBotSequence, state]);
  reactExports.useEffect(() => {
    if (!roomId || isRoomHost) return;
    if (!state || state.lastMoveId === observedMoveRef.current || state.lastMoveId === "start") return;
    observedMoveRef.current = state.lastMoveId;
    setTurnNotice(state.message);
    setActionLog((prev) => [
      { id: `${Date.now()}:${state.lastMoveId}`, text: state.message, tone: "system", label: "TABLE" },
      ...prev
    ].slice(0, 5));
  }, [isRoomHost, roomId, state]);
  reactExports.useEffect(() => {
    playGuardRef.current = { cardId: null, at: 0 };
  }, [state?.currentPlayerIndex, state?.turn]);
  if (!state) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[60vh] flex items-center justify-center text-zinc-400", children: "Loading Truno table..." });
  }
  const activePlayer = currentPlayer(state);
  const mySeat = roomId ? room.mySeat ?? 0 : state.players.findIndex((p) => !p.isBot);
  const bottomSeat = mySeat >= 0 ? mySeat : 0;
  const me = state.players[bottomSeat] ?? state.players.find((p) => !p.isBot) ?? state.players[0];
  const botIsThinking = !!thinkingPlayerId || !!activePlayer?.isBot;
  const myTurn = activePlayer?.id === me.id && state.phase === "playing" && !sequencerRef.current.running;
  const top = topCard(state);
  const selectedCard = me.hand.find((card2) => card2.id === selected) ?? null;
  const canPlaySelected = !!selectedCard && myTurn && isPlayableCard(selectedCard, state);
  const roomCode = room.room?.room_code ?? (roomId ? "Loading" : mode === "ai" ? "AI MATCH" : "QUICK PLAY");
  const tableLabel = roomId ? "PRIVATE TABLE" : mode === "ai" ? "AI PRACTICE TABLE" : "QUICK PLAY TABLE";
  const waitingLabel = myTurn ? "YOUR TURN" : botIsThinking && activePlayer ? `${activePlayer.name} THINKING` : `${activePlayer?.name ?? "Table"} TURN`;
  const winner = state.winnerId ? state.players.find((p) => p.id === state.winnerId) ?? null : null;
  const handSpread = Math.max(29, Math.min(44, 330 / Math.max(me.hand.length, 1)));
  const isPendingDrawPlayMe = !!(state.pendingDrawPlayCardId && myTurn && me.hand.some((c) => c.id === state.pendingDrawPlayCardId));
  reactExports.useEffect(() => {
    if (state?.pendingDrawPlayCardId && myTurn) {
      const hasCard = me.hand.some((c) => c.id === state.pendingDrawPlayCardId);
      if (hasCard) {
        setSelected(state.pendingDrawPlayCardId);
      }
    }
  }, [state?.pendingDrawPlayCardId, myTurn, me.hand]);
  const commitMove = async (move) => {
    setNotice(null);
    if (!state) return;
    const next = applyPlayerMove(state, move);
    const event = describeMoveEvent(state, move, next);
    if (next.lastMoveId === state.lastMoveId && next.message !== state.message) {
      setNotice(next.message);
      return;
    }
    showMoveEvent(event, next.lastMoveId);
    if (roomId) {
      await room.sendMove({
        type: move.type,
        seat: mySeat,
        payload: move.type === "play" ? { cardId: move.cardId, wildColor: move.wildColor } : {}
      });
      setSelected(null);
      return;
    }
    setLocalState(next);
    setSelected(null);
  };
  const flashInvalidCard = (cardId, message) => {
    setInvalidCardId(cardId);
    setNotice(message);
    const timer = setTimeout(() => setInvalidCardId(null), 400);
    timeoutsRef.current.push(timer);
  };
  const handleSelectWildColor = (color) => {
    if (!pendingWildCardId) return;
    void commitMove({ type: "play", playerId: me.id, cardId: pendingWildCardId, wildColor: color });
    setPendingWildCardId(null);
  };
  const attemptPlayCard = (cardId) => {
    const card2 = me.hand.find((c) => c.id === cardId);
    if (!card2) return;
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? "the table"}.`);
      return;
    }
    if (state.pendingDrawPlayCardId && state.pendingDrawPlayCardId !== cardId) {
      setNotice("You must play the drawn card or keep it.");
      return;
    }
    if (!isPlayableCard(card2, state)) {
      setSelected(null);
      flashInvalidCard(cardId, "That card does not match the current color, number, or action.");
      return;
    }
    const now = Date.now();
    if (playGuardRef.current.cardId === cardId && now - playGuardRef.current.at < CARD_PLAY_GUARD_MS) return;
    playGuardRef.current = { cardId, at: now };
    if (card2.color === "black") {
      setPendingWildCardId(cardId);
      return;
    }
    void commitMove({ type: "play", playerId: me.id, cardId, wildColor: mostCommonColor(me.hand) });
  };
  const handleCardTap = (cardId) => {
    if (state.pendingDrawPlayCardId && state.pendingDrawPlayCardId !== cardId) {
      setNotice("You must play the drawn card or keep it.");
      return;
    }
    const now = Date.now();
    const isDoubleTap = tapRef.current.cardId === cardId && now - tapRef.current.at < CARD_DOUBLE_TAP_MS;
    tapRef.current = { cardId, at: now };
    if (isDoubleTap) {
      attemptPlayCard(cardId);
      return;
    }
    const card2 = me.hand.find((c) => c.id === cardId);
    if (!card2) return;
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? "the table"}.`);
      return;
    }
    if (!isPlayableCard(card2, state)) {
      setSelected(null);
      flashInvalidCard(cardId, "That card does not match the current color, number, or action.");
      return;
    }
    setSelected((prev) => prev === cardId ? null : cardId);
  };
  const handlePlay = () => {
    if (!selectedCard) return;
    if (!canPlaySelected) {
      setNotice("Select a playable card first.");
      return;
    }
    if (state.pendingDrawPlayCardId && state.pendingDrawPlayCardId !== selectedCard.id) {
      setNotice("You must play the drawn card or keep it.");
      return;
    }
    if (selectedCard.color === "black") {
      setPendingWildCardId(selectedCard.id);
      return;
    }
    commitMove({ type: "play", playerId: me.id, cardId: selectedCard.id, wildColor: mostCommonColor(me.hand) });
  };
  const handleDraw = () => {
    if (!myTurn) {
      setNotice(`Waiting on ${activePlayer?.name ?? "the table"}.`);
      return;
    }
    commitMove({ type: "draw", playerId: me.id });
  };
  const handleCallTruno = () => {
    if (!myTurn) {
      setNotice("Call TRUNO on your turn.");
      return;
    }
    commitMove({ type: "call-truno", playerId: me.id });
  };
  const handleSendChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    if (roomId) {
      setNotice("Room chat persistence is coming soon.");
    } else {
      setLocalChat((prev) => [...prev.slice(-3), text]);
    }
    setChatDraft("");
  };
  const handleLeaveMatch = () => {
    clearSequencer();
    onNavigate(roomId ? "room" : "home", roomId ? { roomId, suppressActiveSession: true } : void 0);
  };
  const handleBackToTruno = () => {
    clearSequencer();
    onNavigate("home");
  };
  const handlePlayAgain = async () => {
    const next = createTrunoGame(state.players.map((player) => ({
      id: player.id,
      name: player.name,
      isBot: player.isBot
    })));
    setSelected(null);
    setNotice(null);
    setActionLog([]);
    setTableEffect(null);
    setTurnNotice(`${next.players[0]?.name ?? "Player"} starts.`);
    observedMoveRef.current = next.lastMoveId;
    if (roomId) {
      if (!isRoomHost) {
        setNotice("The room host can start the next table.");
        return;
      }
      await roomSetHostState(next);
      return;
    }
    setLocalState(next);
  };
  useTvRemoteInput((action) => {
    if (action === "BACK") {
      handleLeaveMatch();
      return;
    }
    if (action === "MENU") {
      setNotice("Table menu is coming soon.");
      return;
    }
    if (state.phase === "ended") {
      if (action === "SELECT") void handlePlayAgain();
      return;
    }
    if (isPendingDrawPlayMe) {
      if (action === "LEFT" || action === "RIGHT" || action === "UP" || action === "DOWN") {
        setRemoteTarget((prev) => prev === "hand" ? "actions" : "hand");
        setNotice(remoteTarget === "hand" ? "Place Down action selected. Press Select to play." : "Keep Card & Pass action selected. Press Select to pass.");
        return;
      }
      if (action === "SELECT") {
        if (remoteTarget === "hand") {
          attemptPlayCard(state.pendingDrawPlayCardId);
        } else {
          commitMove({ type: "keep", playerId: me.id });
        }
        return;
      }
    }
    if (action === "UP") {
      setRemoteTarget("draw");
      setNotice("Draw pile selected. Press Select to draw.");
      return;
    }
    if (action === "DOWN") {
      setRemoteTarget("hand");
      if (!selected && me.hand.length) setSelected(me.hand[0].id);
      return;
    }
    if (action === "LEFT" || action === "RIGHT") {
      setRemoteTarget("hand");
      if (!me.hand.length) return;
      const currentIndex = Math.max(0, me.hand.findIndex((card2) => card2.id === selected));
      const delta = action === "LEFT" ? -1 : 1;
      const nextIndex = (currentIndex + delta + me.hand.length) % me.hand.length;
      setSelected(me.hand[nextIndex].id);
      return;
    }
    if (action === "SELECT") {
      if (remoteTarget === "draw") {
        handleDraw();
        return;
      }
      if (selected) {
        attemptPlayCard(selected);
        return;
      }
      setNotice(myTurn ? "Select a card with Left or Right first." : `Waiting on ${activePlayer?.name ?? "the table"}.`);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes truno-pop { 0% { transform: scale(0.92); filter: brightness(1); } 45% { transform: scale(1.1); filter: brightness(1.4); } 100% { transform: scale(1); filter: brightness(1); } }
        @keyframes truno-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 75% { transform: translateX(-3px); } }
        @keyframes truno-float { 0% { opacity: 0; transform: translateY(14px) scale(0.92); } 20%, 80% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-16px) scale(1.04); } }
        @keyframes truno-ring { 0%, 100% { transform: scale(1); opacity: 0.45; } 50% { transform: scale(1.12); opacity: 0.9; } }
        @keyframes truno-thinking { 0%, 100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLeaveMatch, className: "w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "rotate-90 text-zinc-300", size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 12, className: "text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-400 font-semibold", children: "Room ID" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white", children: roomCode })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleLeaveMatch,
            className: "min-h-10 px-3 sm:px-4 py-2 rounded-xl border border-pink-500/50 text-pink-300 text-xs sm:text-sm font-bold hover:bg-pink-500/10",
            children: "Leave Match"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNotice("Table menu is coming soon."), className: "w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { size: 16, className: "text-zinc-300" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mx-auto max-w-full w-fit rounded-full bg-zinc-950/80 border px-4 py-1.5 mb-4 flex items-center gap-3 ${myTurn ? "border-emerald-400/50 shadow-[0_0_22px_rgba(52,211,153,0.25)]" : "border-fuchsia-500/30"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-fuchsia-300", children: tableLabel }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-500", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-300 truncate", children: turnNotice || state.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: "radial-gradient(circle, transparent 35%, rgba(157,78,221,0.15) 50%, transparent 65%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-8 rounded-full border border-purple-500/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-16 rounded-full border border-fuchsia-500/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-24 rounded-full border border-blue-500/20" }),
      state.players.map((player, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablePlayer,
        {
          player,
          relativeIndex: (index - bottomSeat + state.players.length) % state.players.length,
          playerCount: state.players.length,
          active: activePlayer?.id === player.id,
          thinking: thinkingPlayerId === player.id,
          pulsing: pulsePlayerId === player.id || tableEffect?.targetPlayerId === player.id,
          isYou: player.id === me.id,
          avatar: player.id === me.id ? currentUser.avatar : void 0
        },
        player.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: drawPulse ? "animate-[truno-pop_0.45s_ease-out]" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: { id: "deck", color: "black", symbol: "wild", label: "W" }, faceDown: true, size: "md" }) }, drawPulse),
        top && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: discardPulse ? "animate-[truno-pop_0.45s_ease-out]" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: top, size: "md", playable: true }) }, `${top.id}:${discardPulse}`)
      ] }),
      tableEffect && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 px-5 py-2 rounded-full border text-xl font-black tracking-widest animate-[truno-float_0.9s_ease-out_both] ${effectClass(tableEffect.tone)}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
        tableEffect.tone === "wild" || tableEffect.tone === "win" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 18 }) : null,
        tableEffect.label
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1/2 -translate-x-1/2 bottom-1/4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-400", children: "Current Color" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] ${colorClass(state.currentColor)}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-500", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 12, className: `text-cyan-300 ${state.direction === -1 ? "-scale-x-100" : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-300", children: state.direction === 1 ? "Clockwise" : "Counter" })
      ] }),
      pendingWildCardId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-50 flex flex-col items-center justify-center rounded-full bg-zinc-950/90 backdrop-blur-md border border-purple-500/30 p-6 text-center animate-[truno-pop_0.3s_ease-out]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-300 text-xs font-black tracking-[0.24em] mb-1", children: "WILD CARD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white text-lg font-black mb-4", children: "CHOOSE PILE COLOR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 w-48", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectWildColor("red"),
              className: "min-h-12 rounded-2xl border border-red-500/50 bg-red-500/20 text-red-200 font-bold hover:bg-red-500/35 hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center justify-center",
              children: "Red"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectWildColor("blue"),
              className: "min-h-12 rounded-2xl border border-cyan-400/50 bg-cyan-400/20 text-cyan-200 font-bold hover:bg-cyan-400/35 hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(34,211,238,0.25)] flex items-center justify-center",
              children: "Blue"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectWildColor("green"),
              className: "min-h-12 rounded-2xl border border-emerald-400/50 bg-emerald-400/20 text-emerald-200 font-bold hover:bg-emerald-400/35 hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(52,211,153,0.25)] flex items-center justify-center",
              children: "Green"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectWildColor("yellow"),
              className: "min-h-12 rounded-2xl border border-amber-300/50 bg-amber-300/20 text-amber-200 font-bold hover:bg-amber-300/35 hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(251,191,36,0.25)] flex items-center justify-center",
              children: "Yellow"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setPendingWildCardId(null),
            className: "mt-4 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition",
            children: "Cancel Play"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `min-h-9 flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold ${myTurn ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.2)]" : botIsThinking ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200" : "bg-zinc-900/80 border-zinc-800 text-zinc-400"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, className: "rotate-180" }),
        " ",
        waitingLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
        " Turn ",
        state.turn
      ] })
    ] }),
    actionLog.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/65 p-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black tracking-wider text-zinc-500", children: "RECENT MOVES" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-600", children: "real table actions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1", children: actionLog.slice(0, 3).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-[3.25rem_1fr] items-center gap-2 text-[11px] rounded-lg px-2 py-1.5 border ${logClass(item.tone)}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black tracking-wider opacity-80", children: item.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.text })
      ] }, item.id)) })
    ] }),
    state.phase === "ended" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-3xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-zinc-950 p-4 text-center shadow-[0_0_34px_rgba(251,191,36,0.14)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-2 w-12 h-12 rounded-full border border-amber-400/60 bg-amber-400/15 flex items-center justify-center text-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 24 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black tracking-[0.24em] text-amber-300", children: "TABLE COMPLETE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-black text-white", children: winner?.id === me.id ? "You win the table" : `${winner?.name ?? "A player"} wins the table` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-400", children: "Start a clean rematch when everyone is ready." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-4 grid gap-2 ${roomId ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handlePlayAgain, className: "min-h-11 rounded-2xl border border-emerald-400/50 bg-emerald-500/10 text-emerald-200 text-sm font-black hover:bg-emerald-500/15", children: "Play Again" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToTruno, className: "min-h-11 rounded-2xl border border-fuchsia-500/45 bg-fuchsia-500/10 text-fuchsia-200 text-sm font-black hover:bg-fuchsia-500/15", children: "Back to Truno" }),
        roomId && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLeaveMatch, className: "min-h-11 rounded-2xl border border-pink-500/45 bg-pink-500/10 text-pink-200 text-sm font-black hover:bg-pink-500/15", children: "Leave Room" })
      ] })
    ] }),
    notice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-center text-xs text-fuchsia-200", children: notice }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 relative flex justify-center items-end overflow-visible", style: { height: 150 }, children: me.hand.map((c, i) => {
      const mid = Math.floor(me.hand.length / 2);
      const offset = i - mid;
      const isSel = selected === c.id;
      const playable = myTurn && isPlayableCard(c, state);
      const remoteFocused = tvRemoteMode && remoteTarget === "hand" && isSel;
      const invalid = invalidCardId === c.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `absolute transition-transform duration-200 ${invalid ? "animate-[truno-shake_0.35s_ease-in-out]" : ""}`,
          style: {
            transform: `translateX(${offset * handSpread}px) translateY(${Math.abs(offset) * 3}px) rotate(${offset * 4}deg) ${isSel ? "translateY(-28px) scale(1.12)" : ""}`,
            zIndex: isSel ? 100 : 10 + i
          },
          children: [
            isSel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider whitespace-nowrap ${remoteFocused ? "border-amber-300/70 bg-amber-400/20 text-amber-100" : "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"}`, children: remoteFocused ? "TV FOCUS" : "SELECTED" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TrunoCard,
              {
                card: c,
                size: "sm",
                playable,
                onClick: () => handleCardTap(c.id),
                selected: isSel,
                className: `${playable ? "ring-2 ring-cyan-300/25" : ""} ${remoteFocused ? "ring-4 ring-amber-300/80 shadow-[0_0_28px_rgba(251,191,36,0.45)]" : ""} ${invalid ? "ring-4 ring-pink-400/70" : ""}`
              }
            )
          ]
        },
        c.id
      );
    }) }),
    isPendingDrawPlayMe ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 rounded-3xl border border-emerald-500/35 bg-emerald-950/15 p-3 backdrop-blur-sm shadow-[0_0_25px_rgba(52,211,153,0.1)] animate-[truno-pop_0.35s_ease-out]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => commitMove({ type: "keep", playerId: me.id }),
          disabled: state.phase === "ended",
          className: "min-h-14 rounded-2xl border border-purple-500/40 bg-zinc-950/80 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 transition",
          children: "Keep Card & Pass"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => attemptPlayCard(state.pendingDrawPlayCardId),
          disabled: state.phase === "ended",
          className: "min-h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 15 }),
            " Place Down"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2 rounded-3xl border border-zinc-800/80 bg-black/35 p-2 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDraw, disabled: !myTurn || state.phase === "ended", className: `min-h-14 rounded-2xl border border-purple-500/40 bg-zinc-950/80 py-3 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed ${tvRemoteMode && remoteTarget === "draw" ? "ring-4 ring-amber-300/70 shadow-[0_0_28px_rgba(251,191,36,0.45)]" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " Draw"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleCallTruno, disabled: !myTurn || state.phase === "ended", className: "min-h-14 rounded-2xl py-3 font-black text-sm relative overflow-hidden group disabled:opacity-50 disabled:saturate-50 disabled:cursor-not-allowed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 blur-md opacity-70 group-hover:opacity-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white text-base leading-none", children: "CALL TRUNO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-fuchsia-100 mt-0.5", children: "If you have 1 card left" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handlePlay,
          disabled: !canPlaySelected || state.phase === "ended",
          className: `min-h-14 rounded-2xl border py-3 font-bold text-sm flex items-center justify-center gap-2 transition ${canPlaySelected ? "border-cyan-500/40 bg-zinc-950/80 text-cyan-300 hover:bg-cyan-500/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]" : "border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 15 }),
            " Play Card"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVoice(!voice), className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-7 h-7 rounded-full ${voice ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-zinc-800"} flex items-center justify-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 14, className: voice ? "text-emerald-300" : "text-zinc-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-zinc-300", children: [
          "Voice: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: voice ? "text-emerald-300 font-bold" : "text-zinc-500", children: voice ? "On" : "Off" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setChat(!chat), className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-7 h-7 rounded-full ${chat ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-zinc-800"} flex items-center justify-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14, className: chat ? "text-cyan-300" : "text-zinc-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-zinc-300", children: [
          "Chat: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chat ? "text-cyan-300 font-bold" : "text-zinc-500", children: chat ? "On" : "Off" })
        ] })
      ] })
    ] }),
    chat && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-zinc-300", children: "Table Chat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-500", children: roomId ? "Persistence coming soon" : "Local only" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 max-h-32 overflow-y-auto", children: localChat.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500 py-4 text-center", children: "No chat messages yet." }) : localChat.map((msg, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.avatar || avatarFor(me.name), alt: me.name, className: "w-6 h-6 rounded-full object-cover flex-shrink-0", referrerPolicy: "no-referrer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-fuchsia-300", children: me.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-300 truncate", children: msg })
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: chatDraft,
            onChange: (e) => setChatDraft(e.target.value),
            placeholder: "Say something...",
            className: "flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-fuchsia-500/50"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendChat, className: "w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 12, className: "text-fuchsia-300" }) })
      ] })
    ] })
  ] });
};
const TablePlayer = ({ player, relativeIndex, playerCount, active, thinking, pulsing, isYou, avatar }) => {
  const position = seatPosition(relativeIndex, playerCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `absolute ${position} flex flex-col items-center transition-all duration-300 ${pulsing ? "scale-105" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center gap-1 mb-1 transition ${pulsing ? "animate-[truno-pop_0.45s_ease-out]" : ""}`, children: Array.from({ length: Math.min(5, player.hand.length) }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-8 rounded-sm border border-purple-500/40", style: { transform: `rotate(${(i - 2) * 4}deg)`, background: "rgba(157,78,221,0.1)" } }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-2 rounded-full border border-emerald-300/50 animate-[truno-ring_1.45s_ease-in-out_infinite]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-14 h-14 rounded-full overflow-hidden ring-2 transition ${active ? "ring-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.58)]" : "ring-fuchsia-500/60 shadow-[0_0_20px_rgba(255,0,128,0.45)]"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar || avatarFor(player.name), alt: player.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-zinc-950 border text-[10px] font-black text-white flex items-center justify-center ${pulsing ? "border-cyan-300 animate-[truno-pop_0.45s_ease-out]" : "border-zinc-700"}`, children: player.hand.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${active ? "bg-emerald-400" : "bg-zinc-500"}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 text-[11px] font-bold text-white", children: isYou ? "You" : player.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] flex items-center gap-1 ${thinking ? "text-cyan-300" : active ? "text-emerald-300" : "text-amber-400"}`, children: [
        thinking && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex gap-0.5", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_infinite]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_0.15s_infinite]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-cyan-300 animate-[truno-thinking_0.9s_ease-in-out_0.3s_infinite]" })
        ] }),
        thinking ? "THINKING" : active ? "ACTIVE" : player.isBot ? "BOT" : "PLAYER"
      ] })
    ] })
  ] });
};
function colorClass(color) {
  if (color === "red") return "bg-red-500 text-red-400";
  if (color === "blue") return "bg-cyan-400 text-cyan-400";
  if (color === "green") return "bg-emerald-400 text-emerald-400";
  return "bg-amber-300 text-amber-300";
}
function mostCommonColor(hand) {
  const colors = ["red", "blue", "green", "yellow"];
  const ranked = colors.map((color) => ({ color, n: hand.filter((card2) => card2.color === color).length }));
  ranked.sort((a, b) => b.n - a.n);
  return ranked[0]?.color ?? "red";
}
function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
function effectFromEvent(event) {
  if (!event.effect) return null;
  if (event.effect === "skip") return { id: `${Date.now()}:skip`, label: "SKIP", tone: "skip", targetPlayerId: event.targetPlayerId };
  if (event.effect === "reverse") return { id: `${Date.now()}:reverse`, label: "REVERSE", tone: "reverse" };
  if (event.effect === "draw_two") return { id: `${Date.now()}:draw2`, label: "+2", tone: "draw", targetPlayerId: event.targetPlayerId };
  if (event.effect === "wild_draw_four") return { id: `${Date.now()}:draw4`, label: "+4", tone: "wild", targetPlayerId: event.targetPlayerId };
  if (event.effect === "wild") return { id: `${Date.now()}:wild`, label: `${event.color?.toUpperCase() ?? "WILD"}`, tone: "wild" };
  if (event.effect === "win") return { id: `${Date.now()}:win`, label: "TRUNO", tone: "win" };
  return null;
}
function logLabelFromEvent(event) {
  if (event.effect === "skip") return "SKIP";
  if (event.effect === "reverse") return "REVERSE";
  if (event.effect === "draw_two") return "+2";
  if (event.effect === "wild_draw_four") return "+4";
  if (event.effect === "wild") return "WILD";
  if (event.effect === "win") return "WIN";
  if (event.kind === "draw") return "DRAW";
  if (event.kind === "keep") return "KEEP";
  if (event.kind === "call-truno") return "TRUNO";
  return "PLAY";
}
function effectClass(tone) {
  if (tone === "skip") return "border-pink-400/60 bg-pink-500/20 text-pink-200 shadow-[0_0_28px_rgba(236,72,153,0.4)]";
  if (tone === "reverse") return "border-cyan-400/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.4)]";
  if (tone === "draw") return "border-purple-400/60 bg-purple-500/20 text-purple-200 shadow-[0_0_28px_rgba(168,85,247,0.4)]";
  if (tone === "wild") return "border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.35)]";
  return "border-emerald-400/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.4)]";
}
function logClass(tone) {
  if (tone === "effect") return "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-100";
  if (tone === "draw") return "border-purple-500/25 bg-purple-500/10 text-purple-100";
  if (tone === "keep") return "border-purple-500/25 bg-purple-500/10 text-purple-100";
  if (tone === "play") return "border-cyan-500/25 bg-cyan-500/10 text-cyan-100";
  return "border-zinc-800 bg-zinc-900/50 text-zinc-300";
}
function seatPosition(relativeIndex, playerCount) {
  const two = [
    "bottom-0 left-1/2 -translate-x-1/2",
    "top-0 left-1/2 -translate-x-1/2"
  ];
  const three = [
    "bottom-0 left-1/2 -translate-x-1/2",
    "top-1/2 left-0 -translate-y-1/2",
    "top-1/2 right-0 -translate-y-1/2"
  ];
  const fourPlus = [
    "bottom-0 left-1/2 -translate-x-1/2",
    "top-1/2 left-0 -translate-y-1/2",
    "top-0 left-1/2 -translate-x-1/2",
    "top-1/2 right-0 -translate-y-1/2",
    "top-5 left-16",
    "top-5 right-16",
    "bottom-12 left-4",
    "bottom-12 right-4"
  ];
  if (playerCount <= 2) return two[relativeIndex] ?? two[0];
  if (playerCount === 3) return three[relativeIndex] ?? three[0];
  return fourPlus[relativeIndex] ?? fourPlus[0];
}
export {
  stand as A,
  hit as B,
  placeBet as C,
  botClaim as D,
  makeClaim as E,
  FriendInviteCenter as F,
  botShouldCall as G,
  callBullshit as H,
  passChallenge as I,
  newBullshitGame as J,
  legalCards as K,
  handValue as L,
  MatchScreen as M,
  heartbeat as N,
  TrunoCard as O,
  avatarFor as P,
  SUIT_DISPLAY as S,
  TreyBrandMark as T,
  getActiveSession as a,
  getRoomPlayers as b,
  createRoom as c,
  clearAbandoned as d,
  closeRoom as e,
  findRoomByCode as f,
  getOrCreateIdentity as g,
  isGameBackendEnabled as h,
  identityFromTreyUser as i,
  joinRoomByCode as j,
  MAX_PLAYERS_BY_GAME as k,
  listActiveRooms as l,
  leaveRoom as m,
  fillSeatsWithBots as n,
  startGameSession as o,
  placeBid as p,
  botBid as q,
  playCard as r,
  setDisplayName as s,
  botPlay as t,
  useRealtimeRoom as u,
  newSpadesGame as v,
  startNextRound as w,
  newBlackjackGame as x,
  nextHand as y,
  doubleDown as z
};
