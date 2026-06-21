import React from 'react';
import aiBallCutout from '@/assets/ai-ball.png';

/**
 * Spinning Tradio AI Ball — the iconic floating orb from the pass12 shell.
 * Displays a rotating, glowing sphere with pulsing aura effect.
 * Standalone component — no shell dependency.
 */
export default function TradioAIBall({
  size = 'md',
  onClick,
  label = 'AI',
}: {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  label?: string;
}) {
  const px = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      aria-label={onClick ? label : undefined}
      aria-hidden={onClick ? undefined : true}
      className="group relative flex items-center justify-center select-none active:scale-95 transition-all duration-300"
      style={{ width: 'fit-content', height: 'fit-content' }}
    >
      {/* Soft pulsing aura */}
      <span className="absolute inset-0 rounded-full bg-amber-400/20 blur-lg animate-pulse-orb-slow" />

      {/* The ball */}
      <div className={`relative ${px}`}>
        <img
          src={aiBallCutout}
          alt=""
          className={`${px} object-contain pointer-events-none animate-slow-spin group-hover:animate-orb-spin`}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.55))',
          }}
        />
      </div>
    </Component>
  );
}
