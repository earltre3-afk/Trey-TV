// TRUNO avatar registry — portrait photo URLs for the cast.
export type TrunoCastName =
  | "Trey-1"
  | "Trey-I"
  | "Zay"
  | "Maya"
  | "Lena"
  | "QueenMaya"
  | "AceTheGreat"
  | "KingNova"
  | "ShadowPlay"
  | "Ghost"
  | "Default";

const RU = (g: "men" | "women", n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

export const TRUNO_AVATARS: Record<TrunoCastName, string> = {
  "Trey-1": RU("men", 32),
  "Trey-I": RU("men", 22),
  Zay: RU("women", 68),
  Maya: RU("women", 65),
  Lena: RU("women", 72),
  QueenMaya: RU("women", 79),
  AceTheGreat: RU("men", 85),
  KingNova: RU("women", 90),
  ShadowPlay: RU("men", 76),
  Ghost: RU("men", 45),
  Default: RU("men", 32),
};

export function avatarFor(name?: string | null): string {
  if (!name) return TRUNO_AVATARS.Default;
  if (name in TRUNO_AVATARS) return TRUNO_AVATARS[name as TrunoCastName];
  const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const isWoman = seed % 2 === 0;
  return RU(isWoman ? "women" : "men", (seed % 89) + 1);
}

export const CURRENT_USER_NAME = "Trey-1";
export const CURRENT_USER_AVATAR = TRUNO_AVATARS["Trey-1"];
