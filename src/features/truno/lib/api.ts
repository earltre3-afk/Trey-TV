// TRUNO Supabase data layer
import { supabase } from '@/lib/supabase';

export interface TrunoRoomRow {
  id: string;
  room_code: string;
  host_user_id: string | null;
  room_type: string;
  visibility: string;
  status: string;
  max_players: number;
  current_players: number;
  rule_set: any;
  settings: any;
  club_id: string | null;
  tournament_id: string | null;
  created_at: string;
}

export interface TrunoTournamentRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  prize_pool: number;
  entry_fee: number;
  max_players: number;
  registered_players: number;
  starts_at: string;
  ends_at: string | null;
  rule_set: any;
  settings: any;
}

export interface TrunoClubRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  visibility: string;
  member_count: number;
  online_count: number;
}

// ---- ROOMS ----
export async function listOpenPublicRooms(limit = 12): Promise<TrunoRoomRow[]> {
  const { data, error } = await supabase
    .from('truno_rooms')
    .select('*')
    .eq('visibility', 'public')
    .eq('status', 'open')
    .order('current_players', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[truno] listOpenPublicRooms error', error);
    return [];
  }
  return (data ?? []) as TrunoRoomRow[];
}

export function subscribeOpenRooms(onChange: () => void) {
  const channel = supabase
    .channel('truno_rooms_public')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'truno_rooms' },
      () => onChange()
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ---- TOURNAMENTS ----
export async function listUpcomingTournaments(limit = 10): Promise<TrunoTournamentRow[]> {
  const { data, error } = await supabase
    .from('truno_tournaments')
    .select('*')
    .in('status', ['upcoming', 'registering', 'live'])
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) {
    console.error('[truno] listUpcomingTournaments error', error);
    return [];
  }
  return (data ?? []) as TrunoTournamentRow[];
}

export async function getTournament(id: string): Promise<TrunoTournamentRow | null> {
  const { data, error } = await supabase
    .from('truno_tournaments').select('*').eq('id', id).maybeSingle();
  if (error) { console.error('[truno] getTournament', error); return null; }
  return data as TrunoTournamentRow | null;
}

export function subscribeTournaments(onChange: () => void) {
  const channel = supabase
    .channel('truno_tournaments_live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'truno_tournaments' },
      () => onChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'truno_tournament_entries' },
      () => onChange()
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ---- CLUBS ----
export async function listPublicClubs(limit = 20): Promise<TrunoClubRow[]> {
  const { data, error } = await supabase
    .from('truno_clubs')
    .select('*')
    .eq('visibility', 'public')
    .order('online_count', { ascending: false })
    .limit(limit);
  if (error) { console.error('[truno] listPublicClubs', error); return []; }
  return (data ?? []) as TrunoClubRow[];
}

// ---- Tournament join (RLS-enforced) ----
export async function joinTournament(tournamentId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in to join a tournament.' };
  const { error } = await supabase.from('truno_tournament_entries').insert({
    tournament_id: tournamentId,
    user_id: user.id,
    status: 'registered',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---- Helpers ----
export function tableLabelFromRoom(r: TrunoRoomRow): string {
  return (r.rule_set?.label as string) || r.room_code;
}

export function tableTagFromRoom(r: TrunoRoomRow): string | null {
  return (r.rule_set?.tag as string) || null;
}

export function ruleSummaryFromRoom(r: TrunoRoomRow): string {
  const rs = r.rule_set || {};
  if (rs.wild_rules) return 'Wild Rules';
  if (rs.action_heavy) return 'Action Only';
  return 'Classic';
}

export function formatCountdown(startsAt: string): string {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
