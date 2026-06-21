import React, { createContext, useContext, useState, useMemo } from 'react';

export type TradioRole = 'fan' | 'artist' | 'producer' | 'dj' | 'admin';

export interface TradioIdentity {
  role: TradioRole;
  displayName: string;
  username: string;
  avatarUrl: string;
  badgeLabel: string;
  badgeTone: string;
  genres?: string[];
  uid: string;
}

export const MOCK_IDENTITIES: Record<TradioRole, TradioIdentity> = {
  fan: {
    role: 'fan',
    displayName: 'Jordan R.',
    username: 'jordanlistens',
    avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384778774_addd7d75.jpg',
    badgeLabel: 'Top Fan',
    badgeTone: 'cyan',
    uid: 'TTV-JORDAN-001',
  },
  artist: {
    role: 'artist',
    displayName: 'Mila Rain',
    username: 'milarain',
    avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384782418_d8d85510.jpg',
    badgeLabel: 'Verified Artist',
    badgeTone: 'fuchsia',
    genres: ['R&B', 'Soul'],
    uid: 'TTV-MILA-RAIN',
  },
  producer: {
    role: 'producer',
    displayName: 'Darius Cole',
    username: 'dariusmakesbeats',
    avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384780222_ce710d13.jpg',
    badgeLabel: 'Beat Maker',
    badgeTone: 'purple',
    genres: ['Trap Soul', 'Lo-Fi'],
    uid: 'TTV-DARIUS-COLE',
  },
  dj: {
    role: 'dj',
    displayName: 'DJ Midnight Spin',
    username: 'midnightspin',
    avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384820143_01755bef.jpg',
    badgeLabel: 'Radio Host',
    badgeTone: 'amber',
    genres: ['Hip-Hop', 'House'],
    uid: 'TTV-DJ-MIDNIGHT',
  },
  admin: {
    role: 'admin',
    displayName: 'Trizzy Trey',
    username: 'trizzytrey',
    avatarUrl: 'https://d64gsuwffb70l.cloudfront.net/6a2dc9d344393226c14988a8_1781386155114_dcc0441a.png',
    badgeLabel: 'Platform Owner',
    badgeTone: 'red',
    uid: 'TTV-OWNER-ROOT',
  },
};

interface IdentityContextType {
  role: TradioRole;
  identity: TradioIdentity;
  setRole: (role: TradioRole) => void;
  updateAvatar: (username: string, url: string) => void;
}

const TradioIdentityContext = createContext<IdentityContextType | undefined>(undefined);

export function TradioIdentityProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<TradioRole>(() => {
    try {
      const saved = localStorage.getItem('tradio_user_role') as TradioRole;
      return saved && MOCK_IDENTITIES[saved] ? saved : 'fan';
    } catch {
      return 'fan';
    }
  });

  const [avatarUpdates, setAvatarUpdates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('tradio_artist_avatars');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const setRole = (newRole: TradioRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('tradio_user_role', newRole);
    } catch { /* ignore */ }
  };

  const updateAvatar = (username: string, url: string) => {
    setAvatarUpdates((prev) => {
      const next = { ...prev, [username]: url };
      try {
        localStorage.setItem('tradio_artist_avatars', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  const identity = useMemo(() => {
    const base = MOCK_IDENTITIES[role];
    if (avatarUpdates[base.username]) {
      return { ...base, avatarUrl: avatarUpdates[base.username] };
    }
    return base;
  }, [role, avatarUpdates]);

  return (
    <TradioIdentityContext.Provider value={{ role, identity, setRole, updateAvatar }}>
      {children}
    </TradioIdentityContext.Provider>
  );
}

export function useTradioIdentity() {
  const context = useContext(TradioIdentityContext);
  if (!context) {
    throw new Error('useTradioIdentity must be used within a TradioIdentityProvider');
  }
  return context;
}
