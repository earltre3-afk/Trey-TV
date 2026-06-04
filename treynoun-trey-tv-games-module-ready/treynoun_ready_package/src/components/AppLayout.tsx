import React from 'react';
import GamesHome from '@/features/games/GamesHome';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-[#0A0E27] shadow-2xl">
      <GamesHome />
    </div>
  );
};

export default AppLayout;
