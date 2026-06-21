import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const AuthMenu: React.FC = () => {
  const { user, signIn, signOut } = useAuth();

  if (user) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10 text-white/80 text-sm font-semibold hover:bg-white/15 transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
        title={user.name ?? user.handle ?? 'Trey TV profile'}
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden md:inline max-w-[140px] truncate">{user.name ?? user.handle ?? 'Sign out'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('user')}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-[1.03] transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
    >
      <User className="w-4 h-4" />
      <span>Sign In</span>
      <LogIn className="w-4 h-4" />
    </button>
  );
};

export default AuthMenu;
