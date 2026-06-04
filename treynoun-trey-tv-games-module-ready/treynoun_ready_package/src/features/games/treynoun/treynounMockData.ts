import { NounType, TreynounLeaderboardEntry, TreynounTeam } from './treynounTypes';

export const SOLO_TARGETS: Record<NounType, string[]> = {
  person: ['teacher', 'barber', 'singer', 'grandma', 'coach', 'nurse', 'security guard', 'rapper', 'chef', 'pastor'],
  place: ['airport', 'studio', 'school', 'church', 'coffee shop', 'barbershop', 'hospital', 'mall', 'stage', 'gym'],
  thing: ['microphone', 'phone', 'toothbrush', 'camera', 'headphones', 'wallet', 'remote', 'speaker', 'chair', 'backpack'],
};

// Pre-written signal trails so solo/AI nouns feel rich.
export const NOUN_SIGNALS: Record<string, [string, string, string]> = {
  // person
  teacher: ['classroom or school', 'helps people learn', 'students and parents'],
  barber: ['barbershop or salon', 'cuts and styles hair', 'clients and walk-ins'],
  singer: ['stages and studios', 'performs songs', 'fans and bandmates'],
  grandma: ['at home, family events', 'cooks, tells stories, spoils kids', 'grandkids and family'],
  coach: ['gyms, fields, courts', 'trains and motivates a team', 'athletes and players'],
  nurse: ['hospitals and clinics', 'cares for the sick', 'patients and doctors'],
  'security guard': ['malls, events, buildings', 'watches and protects', 'visitors and staff'],
  rapper: ['studios and concerts', 'writes bars and performs', 'fans and producers'],
  chef: ['kitchens and restaurants', 'cooks delicious meals', 'diners and waiters'],
  pastor: ['churches', 'preaches and guides', 'the congregation'],
  // place
  airport: ['travelers, pilots, workers', 'check in, wait, board flights', 'planes, luggage, tickets, gates'],
  studio: ['artists, hosts, producers', 'record, film, create', 'mics, cameras, lights'],
  school: ['students, teachers, staff', 'learn and study', 'desks, books, boards'],
  church: ['worshippers and pastors', 'pray, sing, gather', 'pews, candles, bibles'],
  'coffee shop': ['customers and baristas', 'order, sip, hang out', 'cups, beans, espresso machine'],
  barbershop: ['clients and barbers', 'cut and style hair', 'chairs, clippers, mirrors'],
  hospital: ['patients, nurses, doctors', 'heal and treat', 'beds, machines, medicine'],
  mall: ['shoppers and workers', 'shop, eat, browse', 'stores, escalators, food court'],
  stage: ['performers and crew', 'sing, dance, perform', 'lights, mics, speakers'],
  gym: ['athletes and trainers', 'work out and lift', 'weights, machines, mats'],
  // thing
  microphone: ['singers, hosts, podcasters', 'stages, studios, events', 'talk, sing, record'],
  phone: ['almost everyone', 'pockets, desks, hands', 'call, text, scroll'],
  toothbrush: ['everyone with teeth', 'bathrooms', 'brush and clean'],
  camera: ['photographers and creators', 'studios, events, trips', 'capture and film'],
  headphones: ['music lovers and gamers', 'ears, commutes, desks', 'listen privately'],
  wallet: ['adults and shoppers', 'pockets and bags', 'hold cash and cards'],
  remote: ['TV watchers', 'living rooms, couches', 'change channels'],
  speaker: ['party hosts and DJs', 'rooms, events, cars', 'play loud music'],
  chair: ['almost everyone', 'homes, offices, schools', 'sit and rest'],
  backpack: ['students and travelers', 'backs, schools, trips', 'carry stuff'],
};

export const SOLO_TARGETS_BY_DIFFICULTY: Record<string, number> = {
  easy: 400,
  normal: 650,
  hard: 900,
  expert: 1200,
};

export const SIGNAL_PROMPTS: Record<NounType, [string, string, string]> = {
  person: ['Where are they usually found?', 'What do they do?', 'Who interacts with them?'],
  place: ['Who goes there?', 'What happens there?', 'What objects are found there?'],
  thing: ['Who uses it?', 'Where is it found?', 'What do people do with it?'],
};

export const TEAM_GLOW: TreynounTeam = {
  id: 'glow',
  name: 'Team Glow',
  accent: '#FF00E5',
  score: 0,
  chaos: 0,
  players: [
    { id: 'g1', name: 'TreyLegend', avatar: 'TL', isHost: true, ready: true },
    { id: 'g2', name: 'NovaQueen', avatar: 'NQ', ready: true },
    { id: 'g3', name: 'WordWizard', avatar: 'WW', ready: true },
    { id: 'g4', name: 'Waiting for player', avatar: '?', ready: false },
  ],
};

export const TEAM_VIBE: TreynounTeam = {
  id: 'vibe',
  name: 'Team Vibe',
  accent: '#00F0FF',
  score: 0,
  chaos: 0,
  players: [
    { id: 'v1', name: 'NounMaster', avatar: 'NM', isHost: true, ready: true },
    { id: 'v2', name: 'LexiPlayz', avatar: 'LP', ready: true },
    { id: 'v3', name: 'GuessKing', avatar: 'GK', ready: true },
    { id: 'v4', name: 'Waiting for player', avatar: '?', ready: false },
  ],
};

export const LEADERBOARD: TreynounLeaderboardEntry[] = [
  { rank: 1, name: 'NounMaster', avatar: 'NM', nounScore: 18400, hotTrail: 12, fastestLock: 3.2, bestCategory: 'thing' },
  { rank: 2, name: 'QueenLexi', avatar: 'QL', nounScore: 15900, hotTrail: 9, fastestLock: 4.1, bestCategory: 'place' },
  { rank: 3, name: 'TreyLegend', avatar: 'TL', nounScore: 14250, hotTrail: 7, fastestLock: 4.8, bestCategory: 'person' },
  { rank: 4, name: 'GuessKing', avatar: 'GK', nounScore: 13100, hotTrail: 6, fastestLock: 5.0, bestCategory: 'place' },
  { rank: 5, name: 'NovaQueen', avatar: 'NQ', nounScore: 11750, hotTrail: 5, fastestLock: 5.4, bestCategory: 'thing' },
  { rank: 6, name: 'WordWizard', avatar: 'WW', nounScore: 10200, hotTrail: 4, fastestLock: 6.1, bestCategory: 'person' },
  { rank: 7, name: 'LexiPlayz', avatar: 'LP', nounScore: 9400, hotTrail: 4, fastestLock: 6.4, bestCategory: 'thing' },
  { rank: 8, name: 'GameChanger', avatar: 'GC', nounScore: 8800, hotTrail: 3, fastestLock: 6.9, bestCategory: 'place' },
];

export const LIVE_CHAT_SEED = [
  { name: 'QueenLexi', avatar: 'QL', text: 'Is it… SPOON?', age: 23 },
  { name: 'JayFresh', avatar: 'JF', text: "I'm thinking… PLATE!", age: 18 },
  { name: 'NounMaster', avatar: 'NM', text: 'MIXING BOWL maybe?', age: 31 },
  { name: 'TreyLegend', avatar: 'TL', text: 'Good guesses! Keep it coming!', age: 0, host: true },
  { name: 'GameChanger', avatar: 'GC', text: 'FORK!', age: 27 },
];

export const LIVE_GUESS_POOL = ['knife', 'cup', 'pan', 'kettle', 'blender', 'whisk', 'oven', 'fridge', 'toaster', 'spatula'];

export const MOCK_PLAYER = {
  name: 'TreyLegend',
  title: 'Rookie Noun',
  hotTrail: 7,
  rank: 142,
  coins: 12450,
  gems: 255,
};
