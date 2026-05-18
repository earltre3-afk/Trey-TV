// TRUNO Original Card System - Trey TV Original Game
// Pure data, no React deps

export type TrunoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black';
export type TrunoSymbol = 'number' | 'reverse' | 'skip' | 'draw_two' | 'wild' | 'wild_draw_four';

export interface TrunoCard {
  id: string;
  color: TrunoColor;
  symbol: TrunoSymbol;
  value?: number;
  label: string;
}

export const COLOR_STYLES: Record<TrunoColor, {
  glow: string;
  border: string;
  bg: string;
  text: string;
  hex: string;
  energy: string;
}> = {
  red:    { glow: 'shadow-[0_0_30px_rgba(255,51,102,0.6)]', border: 'border-red-500',    bg: 'from-red-900/80 to-red-950',    text: 'text-red-300',    hex: '#FF3366', energy: 'flame' },
  blue:   { glow: 'shadow-[0_0_30px_rgba(0,217,255,0.6)]',  border: 'border-cyan-400',   bg: 'from-blue-900/80 to-blue-950',  text: 'text-cyan-300',   hex: '#00D9FF', energy: 'lightning' },
  green:  { glow: 'shadow-[0_0_30px_rgba(0,255,136,0.6)]',  border: 'border-emerald-400',bg: 'from-emerald-900/80 to-emerald-950', text: 'text-emerald-300', hex: '#00FF88', energy: 'current' },
  yellow: { glow: 'shadow-[0_0_30px_rgba(255,215,0,0.6)]',  border: 'border-amber-400',  bg: 'from-amber-900/80 to-amber-950', text: 'text-amber-300',  hex: '#FFD700', energy: 'crown' },
  purple: { glow: 'shadow-[0_0_30px_rgba(157,78,221,0.7)]', border: 'border-purple-500', bg: 'from-purple-900/80 to-purple-950', text: 'text-purple-300', hex: '#9D4EDD', energy: 'chaos' },
  black:  { glow: 'shadow-[0_0_40px_rgba(255,0,128,0.5)]',  border: 'border-fuchsia-500',bg: 'from-zinc-900 to-black',        text: 'text-fuchsia-300',hex: '#FF0080', energy: 'spectrum' },
};

export function sampleHand(): TrunoCard[] {
  return [
    { id: 'h1', color: 'purple', symbol: 'wild_draw_four', value: 4, label: '+4' },
    { id: 'h2', color: 'red',    symbol: 'number',         value: 2, label: '2' },
    { id: 'h3', color: 'yellow', symbol: 'number',         value: 7, label: '7' },
    { id: 'h4', color: 'green',  symbol: 'reverse',                  label: 'R' },
    { id: 'h5', color: 'blue',   symbol: 'draw_two',       value: 2, label: '+2' },
    { id: 'h6', color: 'red',    symbol: 'skip',                     label: 'S' },
    { id: 'h7', color: 'black',  symbol: 'wild',                     label: 'W' },
  ];
}

export const RANK_TIERS = [
  { key: 'rookie',   name: 'Spectrum Rookie',   color: 'text-zinc-300' },
  { key: 'player',   name: 'Spectrum Player',   color: 'text-cyan-300' },
  { key: 'elite',    name: 'Spectrum Elite',    color: 'text-blue-400' },
  { key: 'master',   name: 'Spectrum Master',   color: 'text-purple-400' },
  { key: 'champion', name: 'Spectrum Champion', color: 'text-fuchsia-400' },
  { key: 'legend',   name: 'Spectrum Legend',   color: 'text-amber-400' },
];
