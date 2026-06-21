import React from 'react';
import { Heart } from 'lucide-react';
import { useSaved, SavedKind } from '../saved';

interface Props {
  id: string;
  kind: SavedKind;
  size?: 'sm' | 'md';
}

const SaveButton: React.FC<Props> = ({ id, kind, size = 'sm' }) => {
  const { has, toggle } = useSaved();
  const saved = has(id);
  const box = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const ic = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle(id, kind);
      }}
      aria-label={saved ? 'Remove from library' : 'Save to library'}
      className={`${box} grid place-items-center rounded-full backdrop-blur transition-all ${
        saved
          ? 'bg-fuchsia-500 text-white shadow-[0_0_18px_rgba(217,70,239,0.7)]'
          : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
      }`}
    >
      <Heart className={`${ic} ${saved ? 'fill-white' : ''}`} />
    </button>
  );
};

export default SaveButton;
