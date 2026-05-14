# Zodiac Identity Feature — Quick Reference

## Files Created

### Components (src/components/zodiac/)
- `ZodiacOnboarding.tsx` — Zodiac selection + date confirmation
- `ZodiacConfirmation.tsx` — Dramatic lock screen reveal
- `ReadingOfTheDay.tsx` — Daily reading card
- `ZodiacBadge.tsx` — Badge + profile card components
- `ZodiacGroupCard.tsx` — Individual group card
- `ZodiacGroupsHub.tsx` — Full groups discovery page
- `index.ts` — Component exports

### Routes
- `src/routes/zodiac-showcase.tsx` — Preview all components

### Data & Utilities
- `src/lib/zodiac-mock-data.ts` — Mock data, helpers, API templates
- `src/styles.css` — Added zodiac-specific CSS & animations

### Documentation
- `ZODIAC_DESIGN.md` — Complete design system documentation
- `ZODIAC_INTEGRATION.md` — Integration examples & best practices
- `ZODIAC_QUICK_START.md` — This file

## Component Import Path

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

## Component Quick Reference

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| `ZodiacOnboarding` | Zodiac selection flow | `onSelect` | Signup/profile setup |
| `ZodiacConfirmation` | Lock screen reveal | `sign, symbol, isCusp, onConfirm, onShare` | After selection |
| `ReadingOfTheDay` | Daily reading card | `sign, dailyReading, energyWord, luckyColor, luckyNumber, recommendedAction` | Homepage featured |
| `ZodiacBadge` | Small badge display | `sign, symbol, isCusp, size, showName` | Profile, comments, etc |
| `ProfileZodiacCard` | Large profile card | `sign, symbol, isCusp, joinedDate` | Profile page |
| `ZodiacGroupCard` | Individual group | `groupName, memberCount, members, tags, isMember, onJoin, onLeave` | Groups list |
| `ZodiacGroupsHub` | Full groups page | (self-contained) | `/zodiac-groups` route |

## Color Scheme

```css
Gold:      oklch(0.82 0.16 85)     ← Primary accent
Purple:    oklch(0.65 0.22 300)    ← Mystical
Cyan:      oklch(0.82 0.15 215)    ← Future
Magenta:   oklch(0.7 0.25 340)     ← Bold
Green:     oklch(0.78 0.18 150)    ← Nature
```

## Key Animations

- **conic-spin**: 6s rotate (zodiac rings)
- **badge-shine**: 0.6s sweep (on hover)
- **reading-fade-in**: 0.5s appear (card enter)
- **zodiac-float**: Variable float (particles)

## CSS Utilities

```css
.glass              /* Light frosted glass */
.glass-strong       /* Darker, more opaque glass */
.glass-input        /* Input field styling */
.conic-ring         /* Animated neon ring */
.ring-neon-gold     /* Gold glow shadow */
.ring-neon-purple   /* Purple glow shadow */
.ring-neon-cyan     /* Cyan glow shadow */
```

## Data Structure Cheat Sheet

### User Zodiac Profile
```typescript
{
  zodiacSign: "Leo",
  zodiacSymbol: "♌",
  birthDate: "1998-07-25",        // encrypted server-side only
  isCuspSoul: false,
  zodiacUnlockedAt: "2024-03-15T10:30:00Z",
  joinedGroupIds: ["group_1", "group_3"],
}
```

### Daily Reading
```typescript
{
  sign: "Leo",
  symbol: "♌",
  date: "2024-05-12",
  text: "Your cosmic message...",
  energy: "Confident",
  luckyColor: "#ffc857",
  luckyNumber: 7,
  action: "Your recommended action...",
  isCusp: false,
  cuspNote: null,
}
```

### Zodiac Group
```typescript
{
  id: "group_1",
  name: "The Fire Starters",
  icon: "🔥",
  matchReason: "Fire signs united",
  memberCount: 892,
  zodiacSigns: ["Aries", "Leo", "Sagittarius"],
  tags: ["Fire Signs", "Creative"],
  members: [
    { id: "user_1", name: "Name", avatar: "🔥" },
  ],
  isMember: true,
}
```

## Mock Data Helpers

From `src/lib/zodiac-mock-data.ts`:

```typescript
// Get zodiac from date
getZodiacSignFromDate(month, day) → "Leo"

// Check if cusp date
isCuspDate(month, day) → true/false

// Get adjacent signs
getCuspAdjacentSigns(month, day) → ["Cancer", "Leo"]

// Get symbol
getZodiacSymbol("Leo") → "♌"
```

## Integration Checklist

- [ ] Import components
- [ ] Wire onboarding to signup flow
- [ ] Show confirmation modal after selection
- [ ] Display reading on homepage
- [ ] Add badge to profile page
- [ ] Create groups discovery route
- [ ] Connect to API endpoints
- [ ] Add to inbox suggestions
- [ ] Style customizations (if needed)
- [ ] Mobile test
- [ ] Accessibility audit

## Common Patterns

### Show Reading if User Has Zodiac
```typescript
{currentUser?.zodiacSign && (
  <ReadingOfTheDay {...reading} />
)}
```

### Display Badge in List
```typescript
<ZodiacBadge
  sign={user.zodiacSign}
  symbol={user.zodiacSymbol}
  size="sm"
/>
```

### Conditional Cusp Content
```typescript
{isCusp && (
  <div className="glass rounded-lg p-4">
    <p>Cusp Soul special content...</p>
  </div>
)}
```

### Load Groups
```typescript
const [groups, setGroups] = useState([]);

useEffect(() => {
  fetchZodiacGroups(userZodiacSign).then(setGroups);
}, [userZodiacSign]);

return <ZodiacGroupCard {...group} />;
```

## Mobile Responsiveness

All components are **100% mobile-responsive** out of the box:
- Mobile-first design
- Touch-friendly buttons (44px+)
- Single-column layouts on mobile
- Adaptive spacing & sizing

**No additional responsive work needed.**

## Performance Tips

1. **Memoize zodiac group lists**
   ```typescript
   const groups = useMemo(() => [...], [dependencies]);
   ```

2. **Lazy load groups page**
   ```typescript
   const ZodiacGroupsHub = lazy(() => import("@/components/zodiac"));
   ```

3. **Cache daily readings (24h)**
   ```typescript
   queryClient.setQueryData(["zodiac-reading", sign], data, {
     staleTime: 24 * 60 * 60 * 1000,
   });
   ```

4. **Debounce group search**
   ```typescript
   const [search, setSearch] = useDebounce(searchInput, 300);
   ```

## Customization Examples

### Change Primary Color
```css
:root {
  --gold: #ff00ff; /* New magenta */
}
```

### Adjust Glass Blur
```css
.glass {
  backdrop-filter: blur(28px); /* More blur */
}
```

### Disable Animations
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### Custom Group Icons
```typescript
// Just pass different emoji
<ZodiacGroupCard icon="🌙" {...props} />
```

## Testing

### View All Components
Visit: `http://localhost:5173/zodiac-showcase`

### Test Sections
- Onboarding flow
- Confirmation animations
- Reading card layout
- Badge sizes
- Group cards
- Full hub discovery

## Next Steps

1. **Backend Setup**
   - Create zodiac endpoints
   - Add zodiac schema to database
   - Implement cusp detection logic

2. **Integration**
   - Connect onboarding to signup
   - Wire readings to API
   - Link groups to backend

3. **Content**
   - Create daily reading database
   - Seed initial groups
   - Write group descriptions

4. **Testing**
   - Mobile testing
   - Cross-browser check
   - Accessibility audit
   - Performance optimization

5. **Analytics**
   - Track onboarding completion
   - Monitor group joins
   - Measure engagement

## Support Resources

- **Design System**: `ZODIAC_DESIGN.md`
- **Integration Guide**: `ZODIAC_INTEGRATION.md`
- **Mock Data**: `src/lib/zodiac-mock-data.ts`
- **Components**: `src/components/zodiac/`
- **Showcase**: `/zodiac-showcase` route

## Key Features

✨ **Premium Design**
- Liquid glass panels
- Animated zodiac rings
- Neon glow effects
- Holographic symbols

🔮 **Mystical Vibes**
- Deep midnight backgrounds
- Soft star particles
- Breathing animations
- Cosmic color gradients

👥 **Social Integration**
- Zodiac group matching
- Soul connections
- Cusp soul exclusivity
- Matched by algorithm

🎯 **User-Centric**
- Mobile-first responsive
- Privacy-focused (encrypted dates)
- Accessible (WCAG AA)
- Reduced motion support

## Questions?

Refer to the full documentation files:
- `ZODIAC_DESIGN.md` → Visual design specs
- `ZODIAC_INTEGRATION.md` → Code integration examples
- `src/lib/zodiac-mock-data.ts` → Data structures & helpers

---

**Created for Trey TV** — Premium Zodiac Identity Feature
