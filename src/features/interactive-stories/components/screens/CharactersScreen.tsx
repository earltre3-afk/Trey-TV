import React, { useMemo, useState } from 'react';
import { X, ShieldAlert, Sparkles, TrendingUp, TrendingDown, Minus, Heart, Activity, Clock } from 'lucide-react';
import { CHARACTERS } from '../../lib/storyData';
import { getInstalledStoryPackage } from '../../lib/treyStoryPackage';
import { Branch, ChapterRecord } from '../../lib/storyTypes';
import { MeterBar } from '../MeterBar';
import { CharacterAvatar } from '../CharacterAvatar';

interface Props {
 branch: Branch | null;
}

interface Character {
 id: string;
 mapKey: string;
 relationshipKey: string;
 name: string;
 firstName: string;
 role: string;
 canon?: 'canonical' | 'app-expanded' | 'installed';
 canonNote?: string;
 image: string;
 fallbackImage: string;
 discipline: number;
 emotionalIQ: number;
 secrets: number;
 description: string;
 quote: string;
}

const relationshipKeyForCharacterId = (characterId: string) => {
 const key = characterId.toLowerCase();
 if (key.includes('malik')) return 'malik';
 if (key.includes('micah')) return 'micah';
 if (key.includes('ari')) return 'ari';
 if (key.includes('dante')) return 'dante';
 if (key.includes('denise') || key.includes('mom') || key.includes('mother')) return 'mom';
 if (key.includes('coach') || key.includes('bridges')) return 'coach';
 if (key.includes('valentina')) return 'valentina';
 if (key.includes('reggie')) return 'reggie';
 if (key.includes('compliance') || key.includes('officer')) return 'compliance';
 return characterId;
};

const firstNameOf = (name: string) => name.split(/\s+/)[0]?.replace(/["“”]/g, '') || name;

const getCharactersForBranch = (branch: Branch | null): Character[] => {
 const installed = branch?.flags?.installed_story ? getInstalledStoryPackage(branch.storyId) : null;
 if (installed?.characters?.length) {
 return installed.characters.map((c): Character => ({
 id: c.character_id.replace(/_/g, '-'),
 mapKey: c.character_id,
 relationshipKey: relationshipKeyForCharacterId(c.character_id),
 name: c.display_name,
 firstName: firstNameOf(c.display_name),
 role: c.role,
 canon: 'installed',
 image: c.portrait || '/placeholder.svg',
 fallbackImage: c.portrait || '/placeholder.svg',
 discipline: 70,
 emotionalIQ: 70,
 secrets: 0,
 description: c.short_description || `${c.display_name} is part of this installed interactive story.`,
 quote: c.voice_key ? `Voice key: ${c.voice_key}` : 'Installed story character.',
 }));
 }
 return CHARACTERS as Character[];
};

// Emotional status labels driven by the current meter value + recent direction.
type StatusKey =
 | 'Trust Rising'
 | 'Loyalty Tested'
 | 'Tension Building'
 | 'Respect Gained'
 | 'Distance Growing'
 | 'Pressure Rising'
 | 'Bond Strengthened'
 | 'Rivalry Heating Up'
 | 'Mentor Trust'
 | 'Family Strain'
 | 'Steady';

const STATUS_STYLE: Record<StatusKey, { ring: string; chip: string; text: string }> = {
 'Trust Rising': { ring: 'ring-cyan-400/60', chip: 'bg-cyan-500/15 border-cyan-500/40', text: 'text-cyan-300' },
 'Loyalty Tested': { ring: 'ring-amber-400/60', chip: 'bg-amber-500/15 border-amber-500/40', text: 'text-amber-300' },
 'Tension Building': { ring: 'ring-orange-400/60', chip: 'bg-orange-500/15 border-orange-500/40',text: 'text-orange-300' },
 'Respect Gained': { ring: 'ring-violet-400/60', chip: 'bg-violet-500/15 border-violet-500/40',text: 'text-violet-300' },
 'Distance Growing': { ring: 'ring-zinc-300/50', chip: 'bg-zinc-500/15 border-zinc-500/40', text: 'text-zinc-300' },
 'Pressure Rising': { ring: 'ring-red-400/60', chip: 'bg-red-500/15 border-red-500/40', text: 'text-red-300' },
 'Bond Strengthened': { ring: 'ring-pink-400/60', chip: 'bg-pink-500/15 border-pink-500/40', text: 'text-pink-300' },
 'Rivalry Heating Up': { ring: 'ring-fuchsia-400/60', chip: 'bg-fuchsia-500/15 border-fuchsia-500/40', text: 'text-fuchsia-300' },
 'Mentor Trust': { ring: 'ring-emerald-400/60', chip: 'bg-emerald-500/15 border-emerald-500/40', text: 'text-emerald-300' },
 'Family Strain': { ring: 'ring-rose-400/60', chip: 'bg-rose-500/15 border-rose-500/40', text: 'text-rose-300' },
 'Steady': { ring: 'ring-white/15', chip: 'bg-white/10 border-white/15', text: 'text-white/70' },
};

interface RelationshipState {
 label: string; // e.g. "Trust Toward You"
 value: number; // 0–100
 status: StatusKey;
 meterColor: 'pink' | 'violet' | 'emerald' | 'amber' | 'red';
}

const statusForCharacter = (key: string, value: number): StatusKey => {
 if (key === 'mom') return value < 60 ? 'Family Strain' : 'Steady';
 if (key === 'coach') return value < 60 ? 'Pressure Rising' : 'Mentor Trust';
 if (key === 'valentina') return value < 60 ? 'Pressure Rising' : 'Mentor Trust';
 if (key === 'compliance') return value < 60 ? 'Pressure Rising' : 'Steady';
 if (key === 'reggie') {
 if (value >= 70) return 'Bond Strengthened';
 if (value <= 40) return 'Rivalry Heating Up';
 return 'Loyalty Tested';
 }
 if (key === 'ari' || key === 'dante') {
 if (value >= 75) return 'Bond Strengthened';
 if (value >= 55) return 'Trust Rising';
 if (value >= 35) return 'Distance Growing';
 return 'Tension Building';
 }
 if (key === 'malik' || key === 'micah') {
 if (value >= 80) return 'Bond Strengthened';
 if (value >= 60) return 'Loyalty Tested';
 return 'Distance Growing';
 }
 return 'Steady';
};

const relationshipFor = (
 key: string,
 branch: Branch | null
): RelationshipState | null => {
 if (!branch) return null;
 const m = branch.meters;
 switch (key) {
 case 'ari':
 return { label: 'Trust Toward You', value: m.trust_ari, status: statusForCharacter('ari', m.trust_ari), meterColor: 'pink' };
 case 'dante':
 return { label: 'Trust Toward You', value: m.trust_dante, status: statusForCharacter('dante', m.trust_dante), meterColor: 'violet' };
 case 'malik':
 return { label: 'Trust in Micah', value: m.trust_malik_to_micah, status: statusForCharacter('malik', m.trust_malik_to_micah), meterColor: 'emerald' };
 case 'micah':
 return { label: 'Trust in Malik', value: m.trust_micah_to_malik, status: statusForCharacter('micah', m.trust_micah_to_malik), meterColor: 'emerald' };
 case 'mom': {
 const v = 100 - m.suspicion_mom;
 return { label: 'Calm (vs Suspicion)', value: v, status: statusForCharacter('mom', v), meterColor: 'amber' };
 }
 case 'coach': {
 const v = 100 - m.suspicion_coach;
 return { label: 'Coach Trust', value: v, status: statusForCharacter('coach', v), meterColor: 'amber' };
 }
 case 'valentina': {
 const v = 100 - m.suspicion_valentina;
 return { label: 'Valentina Trust', value: v, status: statusForCharacter('valentina', v), meterColor: 'amber' };
 }
 case 'reggie': {
 // Reggie absorbs the old "Jordan" tension — friendship dips as risk rises.
 const v = Math.max(0, Math.round((m.trust_micah_to_malik * 0.6) + ((100 - m.risk_level) * 0.4)));
 return { label: 'Friendship (vs Suspicion)', value: v, status: statusForCharacter('reggie', v), meterColor: 'violet' };
 }
 case 'compliance': {
 const v = 100 - Math.max(m.suspicion_mom, m.suspicion_coach);
 return { label: 'Standing at School', value: v, status: statusForCharacter('compliance', v), meterColor: 'amber' };
 }
 default:
 return null;
 }
};


/** Find the most recent chapter that mentions this character (for "Last changed in…"). */
const lastChapterMentioning = (character: Character, chapters: ChapterRecord[]): ChapterRecord | null => {
 for (let i = chapters.length - 1; i >= 0; i--) {
 const ch = chapters[i];
 const blob = `${ch.title || ''} ${ch.summary || ''} ${ch.choiceMade?.text || ''}`.toLowerCase();
 if (new RegExp(`\\b${character.firstName}\\b`, 'i').test(blob)) return ch;
 if (new RegExp(`\\b${character.name}\\b`, 'i').test(blob)) return ch;
 }
 return null;
};

export const CharactersScreen: React.FC<Props> = ({ branch }) => {
 const [selected, setSelected] = useState<Character | null>(null);

 const enriched = useMemo(
 () =>
 getCharactersForBranch(branch).map((c) => ({
 character: c,
 rel: relationshipFor(c.relationshipKey, branch),
 lastChapter: branch ? lastChapterMentioning(c, branch.chapters) : null,
 })),
 [branch]
 );

 return (
 <div className="min-h-screen px-5 pt-10 pb-24">
 <header className="mb-5">
 <div className="flex items-center gap-2 text-violet-400">
 <Activity className="h-4 w-4" />
 <span className="text-xs font-bold uppercase tracking-[0.25em]">Relationship Tracker</span>
 </div>
 <h1 className="mt-1 font-display text-4xl font-black text-white">Cast & Connections</h1>
 <p className="mt-1 text-sm text-white/60">
 How your choices are landing with the people around you.
 </p>
 </header>

 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {enriched.map(({ character: c, rel, lastChapter }) => {
 const status: StatusKey = rel?.status || 'Steady';
 const style = STATUS_STYLE[status];
 // Trend: very rough — derived from value vs 50 baseline
 const trend = rel ? (rel.value >= 60 ? 'up' : rel.value <= 40 ? 'down' : 'flat') : 'flat';

 return (
 <button
 key={c.id}
 onClick={() => setSelected(c)}
 className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/90 p-3 text-left shadow-lg backdrop-blur-md transition-transform hover:border-white/20 active:scale-[0.98]`}
 >
 <div className="flex gap-3">
 <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-white/10 ring-2 ${style.ring} shadow-inner`}>
 {/* Profile circle: centered square crop pulled STRICTLY from CHARACTER_PHOTO_MAP[mapKey] — never a scene still. */}
 <CharacterAvatar character={c} faceCrop />
 </div>

 <div className="flex-1 min-w-0">
 <div className="font-display text-base font-bold leading-tight text-white truncate">{c.name}</div>
 <div className="text-[10px] uppercase tracking-widest text-amber-400">{c.role}</div>

 <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.chip} ${style.text}`}>
 {trend === 'up' && <TrendingUp className="h-2.5 w-2.5" />}
 {trend === 'down' && <TrendingDown className="h-2.5 w-2.5" />}
 {trend === 'flat' && <Minus className="h-2.5 w-2.5" />}
 {status}
 </div>

 {rel && (
 <div className="mt-2">
 <MeterBar label={rel.label} value={rel.value} color={rel.meterColor} compact />
 </div>
 )}
 </div>
 </div>

 {lastChapter && (
 <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 text-[10px] text-white/55">
 <Clock className="h-3 w-3 text-white/40" />
 <span className="truncate">Last changed: Ch. {lastChapter.number} — {lastChapter.title}</span>
 </div>
 )}
 </button>
 );
 })}
 </div>

 {/* Character detail / path modal */}
 {selected && (
 <CharacterPathModal
 character={selected}
 rel={relationshipFor(selected.relationshipKey, branch)}
 branch={branch}
 onClose={() => setSelected(null)}
 />
 )}
 </div>
 );
};

// ---------------------------------------------------------------------------

const CharacterPathModal: React.FC<{
 character: Character;
 rel: RelationshipState | null;
 branch: Branch | null;
 onClose: () => void;
}> = ({ character, rel, branch, onClose }) => {
 // Build a history of moments this character appeared in.
 const history = useMemo(() => {
 if (!branch) return [];
 return branch.chapters
 .map((ch) => {
 const blob = `${ch.title || ''} ${ch.summary || ''} ${ch.choiceMade?.text || ''}`;
 const mentioned =
 new RegExp(`\\b${character.firstName}\\b`, 'i').test(blob) ||
 new RegExp(`\\b${character.name}\\b`, 'i').test(blob);
 return mentioned ? ch : null;
 })
 .filter(Boolean) as ChapterRecord[];
 }, [branch, character]);

 const status: StatusKey = rel?.status || 'Steady';
 const style = STATUS_STYLE[status];

 return (
 <div
 className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
 onClick={onClose}
 >
 <div
 className="relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-violet-500/30 bg-zinc-950 sm:rounded-3xl sm:border"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="relative aspect-[4/5] w-full">
 <div className="absolute inset-0">
 <CharacterAvatar character={character} />
 </div>
 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
 <button
 onClick={onClose}
 className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md"
 >
 <X className="h-4 w-4" />
 </button>
 <div className="absolute bottom-0 left-0 right-0 p-5">
 <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">{character.role}</div>
 <div className="font-display text-3xl font-black text-white">{character.name}</div>
 <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${style.chip} ${style.text}`}>
 <Sparkles className="h-3 w-3" />
 {status}
 </div>
 </div>
 </div>

 <div className="space-y-4 p-5">
 <p className="font-serif text-sm leading-relaxed text-white/80">{character.description}</p>
 <p className="rounded-xl border-l-4 border-violet-500 bg-violet-500/5 p-3 font-serif text-sm italic text-white/70">
 {character.quote}
 </p>

 {rel && (
 <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
 <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
 <span>Relationship Meter</span>
 <span className={style.text}>{rel.value}</span>
 </div>
 <MeterBar label={rel.label} value={rel.value} color={rel.meterColor} />
 </div>
 )}

 <div className="space-y-2">
 <MeterBar label="Discipline" value={character.discipline} color="violet" />
 <MeterBar label="Emotional IQ" value={character.emotionalIQ} color="pink" />
 <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
 <span className="flex items-center gap-2 text-white/80">
 <ShieldAlert className="h-4 w-4 text-amber-400" />
 Secrets
 </span>
 <span className="font-bold text-white">{character.secrets}</span>
 </div>
 </div>

 {/* Character path history */}
 <div>
 <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
 <Heart className="h-3 w-3 text-pink-400" />
 Their Path With You
 </div>
 {history.length === 0 ? (
 <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/50">
 You haven't crossed paths with {character.firstName} in a saved chapter yet.
 </div>
 ) : (
 <ol className="space-y-2">
 {history.map((ch) => (
 <li
 key={ch.number}
 className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-3"
 >
 <div className="flex items-center justify-between">
 <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
 Ch. {ch.number}
 </div>
 {ch.toneTag && (
 <div className="text-[10px] uppercase tracking-widest text-white/40">{ch.toneTag}</div>
 )}
 </div>
 <div className="mt-1 font-display text-sm font-bold text-white">{ch.title}</div>
 {ch.summary && (
 <div className="mt-1 text-xs italic text-white/60 line-clamp-3">{ch.summary}</div>
 )}
 {ch.choiceMade && (
 <div className="mt-1.5 text-[10px] text-white/40">
 Your choice: <span className="text-white/70">{ch.choiceMade.text}</span>
 </div>
 )}
 </li>
 ))}
 </ol>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

