export function isGameBackendEnabled(): boolean {
  const value = import.meta.env.VITE_TREY_TV_GAMES_BACKEND;
  return value === '1' || value === 'true';
}
