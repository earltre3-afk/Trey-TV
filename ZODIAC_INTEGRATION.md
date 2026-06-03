# Zodiac Identity Feature — Integration Guide

## Quick Start

All zodiac components are located in `src/components/zodiac/` and can be imported from the index:

```typescript
import {
  ZodiacOnboarding,
  ZodiacConfirmation,
  ReadingOfTheDay,
  ZodiacBadge,
  ProfileZodiacCard,
  ZodiacGroupCard,
  ZodiacGroupsHub,
} from "@/components/zodiac";
```

## Component Usage

### 1. Zodiac Onboarding

Show during signup or profile setup to collect zodiac information.

```typescript
import { ZodiacOnboarding } from "@/components/zodiac";

export function SignupStep() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <ZodiacOnboarding
        onSelect={(sign, birthDate, isCusp) => {
          console.log("User selected:", { sign, birthDate, isCusp });
          // Save to database
        }}
      />
    </div>
  );
}
```

**Props**:

- `onSelect?: (sign: string, birthDate?: string, isCusp?: boolean) => void` — Called when user confirms selection

### 2. Zodiac Confirmation (Lock Screen)

Show as celebratory modal after onboarding completes.

```typescript
import { ZodiacConfirmation } from "@/components/zodiac";

export function ConfirmationModal() {
  return (
    <ZodiacConfirmation
      sign="Taurus"
      symbol="♉"
      isCusp={false}
      onConfirm={() => navigate("/home")}
      onShare={() => {
        // Share to social media or copy link
      }}
    />
  );
}
```

**Props**:

- `sign: string` — Zodiac sign name (e.g., "Leo")
- `symbol: string` — Zodiac symbol (e.g., "♌")
- `isCusp?: boolean` — Whether user is born on cusp
- `onConfirm?: () => void` — Called when user confirms
- `onShare?: () => void` — Called when user clicks share

### 3. Reading of the Day Card

Display on homepage above feed or as featured card.

```typescript
import { ReadingOfTheDay } from "@/components/zodiac";

export function HomepageReading() {
  const [reading, setReading] = useState(null);

  useEffect(() => {
    // Fetch today's reading from backend
    fetchDailyReading(userZodiacSign).then(setReading);
  }, [userZodiacSign]);

  if (!reading) return <LoadingSkeleton />;

  return (
    <ReadingOfTheDay
      sign={reading.sign}
      symbol={reading.symbol}
      dailyReading={reading.text}
      energyWord={reading.energy}
      luckyColor={reading.color}
      luckyNumber={reading.number}
      recommendedAction={reading.action}
      isCusp={reading.isCusp}
      cuspNote={reading.cuspInsight}
    />
  );
}
```

**Props**:

- `sign: string` — User's zodiac sign
- `symbol: string` — Zodiac symbol emoji
- `dailyReading: string` — The daily cosmic message (2–3 sentences)
- `energyWord: string` — Single word (e.g., "Confident", "Grounded + Curious")
- `luckyColor: string` — Hex or CSS color value (e.g., "#ffc857")
- `luckyNumber: string | number` — Lucky number for the day
- `recommendedAction: string` — Action recommendation (1–2 sentences)
- `isCusp?: boolean` — If true, shows cusp note section
- `cuspNote?: string` — Special insight for cusp users

### 4. Zodiac Badge

Display user's zodiac in profile or anywhere their cosmic identity appears.

**Icon Only**:

```typescript
import { ZodiacBadge } from "@/components/zodiac";

<ZodiacBadge
  sign="Leo"
  symbol="♌"
  size="md"
  showName={false}
/>
```

**With Name**:

```typescript
<ZodiacBadge
  sign="Taurus"
  symbol="♉"
  isCusp={true}
  size="md"
  showName={true}
/>
```

**Badge Props**:

- `sign: string` — Zodiac sign name
- `symbol: string` — Zodiac symbol
- `isCusp?: boolean` — Show "Cusp Soul" indicator
- `size?: "sm" | "md" | "lg"` — Badge size (default: "md")
- `showName?: boolean` — Show name/label next to badge
- `interactive?: boolean` — Add hover scale effect
- `onClick?: () => void` — Click handler

### 5. Profile Zodiac Card

Display prominent zodiac identity on user profile.

```typescript
import { ProfileZodiacCard } from "@/components/zodiac";

export function ProfilePage({ userId }) {
  const user = useUser(userId);

  return (
    <div className="space-y-6">
      {/* Profile header... */}
      <ProfileZodiacCard
        sign={user.zodiacSign}
        symbol={user.zodiacSymbol}
        isCusp={user.isCuspSoul}
        joinedDate={formatDate(user.zodiacJoinedAt)}
      />
    </div>
  );
}
```

**Props**:

- `sign: string` — Zodiac sign
- `symbol: string` — Symbol emoji
- `isCusp?: boolean` — Cusp soul status
- `joinedDate?: string` — When user unlocked zodiac identity

### 6. Zodiac Group Card

Display individual group in lists or suggestions.

```typescript
import { ZodiacGroupCard } from "@/components/zodiac";

<ZodiacGroupCard
  groupName="The Fire Starters"
  matchReason="Aries, Leo, Sagittarius creators pushing boundaries"
  memberCount={892}
  members={[
    { id: "1", name: "User1", avatar: "🔥" },
    { id: "2", name: "User2", avatar: "⚡" },
  ]}
  tags={["Fire Signs", "Creative", "High Energy"]}
  zodiacSigns={["♈ Aries", "♌ Leo", "♐ Sagittarius"]}
  icon="🔥"
  isMember={false}
  onClick={() => navigate("/groups/fire-starters")}
  onJoin={() => joinGroup("fire-starters")}
/>
```

**Props**:

- `groupName: string` — Group name (max 40 chars recommended)
- `matchReason: string` — Why this group is matched (2 lines max)
- `memberCount: number` — Total members
- `members: GroupMember[]` — Array with id, name, avatar
- `tags: string[]` — Interest/location tags
- `zodiacSigns?: string[]` — Zodiac signs in group
- `icon?: string` — Emoji icon (default: "👥")
- `isMember?: boolean` — If user is already in group
- `onJoin?: () => void` — Join button callback
- `onLeave?: () => void` — Leave button callback
- `onClick?: () => void` — Card click callback

### 7. Zodiac Groups Hub

Full discovery page for all groups.

```typescript
import { ZodiacGroupsHub } from "@/components/zodiac";

export const Route = createFileRoute("/zodiac-groups")({
  component: ZodiacGroupsPage,
});

function ZodiacGroupsPage() {
  return (
    <AppShell>
      <div className="p-4 max-w-6xl mx-auto">
        <ZodiacGroupsHub />
      </div>
    </AppShell>
  );
}
```

The `ZodiacGroupsHub` component is self-contained with search, filtering, and group management built-in. Backend integration would involve:

1. Replace sample data with API fetch
2. Connect search to backend search
3. Wire join/leave buttons to group API

```typescript
// Inside ZodiacGroupsHub, replace SAMPLE_GROUPS:
const [groups, setGroups] = useState([]);

useEffect(() => {
  fetchZodiacGroups(userZodiacSign).then(setGroups);
}, [userZodiacSign]);

// Then use `groups` instead of SAMPLE_GROUPS in render
```

## Homepage Integration Example

Insert `ReadingOfTheDay` as a featured card on the For You feed:

```typescript
// src/routes/for-you.tsx

import { ReadingOfTheDay } from "@/components/zodiac";

export function Home() {
  const [tab, setTab] = useState("for-you");
  const { posts: userPosts } = useFeed();
  const [dailyReading, setDailyReading] = useState(null);

  useEffect(() => {
    // Fetch reading from backend
    if (currentUser?.zodiacSign) {
      fetchDailyZodiacReading(currentUser.zodiacSign).then(setDailyReading);
    }
  }, [currentUser?.zodiacSign]);

  return (
    <AppShell activeTab={tab} onTabChange={setTab} wide>
      {/* Tabs... */}

      <div className="space-y-6">
        {/* Featured Reading Card */}
        {dailyReading && (
          <div className="max-w-2xl mx-auto">
            <ReadingOfTheDay
              sign={dailyReading.sign}
              symbol={dailyReading.symbol}
              dailyReading={dailyReading.text}
              energyWord={dailyReading.energy}
              luckyColor={dailyReading.luckyColor}
              luckyNumber={dailyReading.luckyNumber}
              recommendedAction={dailyReading.action}
              isCusp={currentUser?.isCuspSoul}
              cuspNote={dailyReading.cuspNote}
            />
          </div>
        )}

        {/* Feed content... */}
      </div>
    </AppShell>
  );
}
```

## Profile Integration Example

Add zodiac card to user profile:

```typescript
// src/components/profile/ProfilePageShell.tsx

import { ProfileZodiacCard } from "@/components/zodiac";

export function ProfilePageShell({
  profile,
  profileType,
  viewerRole,
  isOwner,
  children,
}: Props) {
  return (
    <div className="profile-shell space-y-6">
      {/* Banner, identity card, etc... */}

      {/* Zodiac Identity Section */}
      {profile.zodiacSign && (
        <section className="max-w-2xl mx-auto px-4">
          <ProfileZodiacCard
            sign={profile.zodiacSign}
            symbol={profile.zodiacSymbol}
            isCusp={profile.isCuspSoul}
            joinedDate={formatDate(profile.zodiacUnlockedAt)}
          />
        </section>
      )}

      {/* Rest of profile... */}
      {children}
    </div>
  );
}
```

## Inbox Group Suggestions Example

Show zodiac group suggestions in inbox/messages:

```typescript
// src/routes/inbox.tsx

import { ZodiacGroupCard } from "@/components/zodiac";

export function InboxPage() {
  const [groupSuggestions, setGroupSuggestions] = useState([]);

  useEffect(() => {
    fetchZodiacGroupSuggestions(currentUser.id).then(setGroupSuggestions);
  }, [currentUser.id]);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Conversations... */}

        {/* Suggested Groups Section */}
        {groupSuggestions.length > 0 && (
          <section className="px-4 space-y-4">
            <h2 className="text-xl font-bold">Discover Zodiac Communities</h2>
            <div className="grid gap-4">
              {groupSuggestions.map((group) => (
                <ZodiacGroupCard
                  key={group.id}
                  groupName={group.name}
                  matchReason={group.matchReason}
                  memberCount={group.memberCount}
                  members={group.members}
                  tags={group.tags}
                  zodiacSigns={group.zodiacSigns}
                  icon={group.icon}
                  isMember={group.isMember}
                  onJoin={() => joinZodiacGroup(group.id)}
                  onLeave={() => leaveZodiacGroup(group.id)}
                  onClick={() => navigate(`/zodiac-groups/${group.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
```

## Styling Customization

All components use Trey TV's existing CSS variables. To customize neon colors:

```css
:root {
  --gold: oklch(0.82 0.16 85); /* Change all gold accents */
  --neon-cyan: oklch(0.82 0.15 215); /* Change cyan */
  --neon-purple: oklch(0.65 0.22 300); /* Change purple */
  --neon-magenta: oklch(0.7 0.25 340); /* Change magenta */
  --neon-green: oklch(0.78 0.18 150); /* Change green */
}
```

Glass blur intensity can be adjusted in individual component classes or globally:

```css
.glass {
  backdrop-filter: blur(24px) saturate(140%); /* Increase from 18px */
}
```

## Testing

Visit `/zodiac-showcase` to preview all components:

```
http://localhost:5173/zodiac-showcase
```

The showcase includes tabs for each component with various states and configurations.

## Data Structure Reference

### User Zodiac Profile

```typescript
interface UserZodiacProfile {
  zodiacSign: string; // "Leo"
  zodiacSymbol: string; // "♌"
  birthDate: string; // ISO date (encrypted server-side)
  isCuspSoul: boolean;
  cuspAdjacentSigns?: [string, string]; // ["Cancer", "Leo"]
  zodiacUnlockedAt: string; // ISO date
  joinedGroupIds: string[];
}
```

### Daily Reading

```typescript
interface DailyReading {
  sign: string;
  symbol: string;
  date: string;
  text: string; // Main reading
  energy: string;
  luckyColor: string;
  luckyNumber: number;
  action: string;
  isCusp?: boolean;
  cuspNote?: string;
}
```

### Zodiac Group

```typescript
interface ZodiacGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  matchReason: string;
  memberCount: number;
  zodiacSigns: string[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}
```

## Backend Considerations

### API Endpoints Needed

- `POST /api/zodiac/set-sign` — Save user's zodiac
- `GET /api/zodiac/reading/{sign}` — Fetch daily reading
- `GET /api/zodiac/groups` — List groups for user
- `POST /api/zodiac/groups/{id}/join` — Join group
- `DELETE /api/zodiac/groups/{id}/leave` — Leave group
- `GET /api/zodiac/groups/suggested` — Get suggestions
- `GET /api/user/{id}/zodiac` — Get user's zodiac profile

### Security Notes

1. Birth dates should never be exposed to client
2. Cusp Soul status can be public but indicates private data
3. Only show zodiac sign + badge + matched groups
4. Validate cusp detection server-side

## Mobile Responsiveness

All components are mobile-first and fully responsive:

- **Mobile**: Single column, full padding, touch-optimized
- **Tablet**: 2-column grids, balanced spacing
- **Desktop**: Multi-column, expanded interactions

No additional media query modifications needed — components handle responsive layout internally via `grid grid-cols-3 sm:gap-4` etc.

## Accessibility

All components include:

- WCAG AA color contrast
- Keyboard navigation
- Focus indicators
- Reduced motion support
- ARIA labels (for buttons & icons)

Components respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

## Performance Tips

1. Lazy-load `ZodiacGroupsHub` (large component)
2. Memoize zodiac group lists to prevent re-renders
3. Debounce search in `ZodiacGroupsHub`
4. Cache daily readings (refresh once per day)
5. Use React Query/SWR for data fetching

```typescript
import { useSuspenseQuery } from "@tanstack/react-query";

export function DailyReadingCard() {
  const { data: reading } = useSuspenseQuery({
    queryKey: ["zodiac-reading", userSign],
    queryFn: () => fetchDailyReading(userSign),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  return <ReadingOfTheDay {...reading} />;
}
```

## Next Steps

1. **Connect to backend API** — Wire components to real data
2. **Set up database** — Store user zodiac profiles & readings
3. **Create admin dashboard** — Manage daily readings content
4. **Email notifications** — Send daily reading summaries
5. **Analytics** — Track group joins, engagement
6. **A/B testing** — Test different group matching algorithms
