import React from 'react';
import SongWarsArena from '../songwars/arena/SongWarsArena';
import type { Contestant, SongWar } from '../../../data/mockData';

interface Props {
  war: SongWar;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onClose: () => void;
  onPlay: (c: Contestant) => void;
}

export default function LiveArenaScreen(props: Props) {
  return <SongWarsArena {...props} />;
}
