import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { cn } from '../components/primitives';

export const TranceAccountButton: React.FC = () => {
  const { isAuthed, profile, signOut } = useAuth();
  const [menu, setMenu] = React.useState(false);
  const navigate = useNavigate();

  if (!isAuthed) {
    return (
      <button onClick={() => navigate('/login')}
        className="flex items-center gap-1.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3.5 py-2 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/20">
        <LogIn className="w-4 h-4" /> Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setMenu((m) => !m)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-400">
        {profile?.avatar
          ? <img src={profile.avatar} className="w-full h-full object-cover" alt="me" />
          : <span className="grid place-items-center w-full h-full bg-white/10"><UserIcon className="w-5 h-5" /></span>}
      </button>
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
          <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-[#0a0612]/95 backdrop-blur-xl p-2 z-50 shadow-xl">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <div className="text-sm font-black text-white truncate">{profile?.displayName}</div>
              <div className="text-[11px] text-fuchsia-300 truncate">{profile?.handle}</div>
            </div>
            <button onClick={() => { setMenu(false); signOut(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-white/10">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

import { useNavigate } from '../hooks/router-compat';

// Reusable full-screen gate for auth-protected screens (Builder, Studio).
export const AuthGate: React.FC<{ title: string; message: string; children: React.ReactNode }> =
  ({ title, message, children }) => {
    const { isAuthed, loading } = useAuth();
    const navigate = useNavigate();
    if (loading) return null;
    if (isAuthed) return <>{children}</>;
    return (
      <div className={cn('min-h-screen grid place-items-center px-6 text-center')}>
        <div className="max-w-sm">
          <div className="font-black text-4xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 mb-3">TRANCE</div>
          <div className="w-16 h-16 rounded-2xl mx-auto bg-white/5 border border-white/10 grid place-items-center mb-4 text-fuchsia-300">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white mb-1">{title}</h2>
          <p className="text-sm text-white/50 mb-5">{message}</p>
          <button onClick={() => navigate('/login')}
            className="rounded-xl font-bold px-6 py-3 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white shadow-[0_0_24px_-4px_rgba(217,70,239,0.6)]">
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  };
