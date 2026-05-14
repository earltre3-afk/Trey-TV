# Zodiac Identity Feature — Trey TV Design System

## Overview

The Zodiac Identity feature creates a premium, futuristic social universe where users' cosmic identities unlock personalized experiences, matched communities, and exclusive content. The design language matches Trey TV's liquid-glass neon aesthetic with deep midnight backgrounds, animated zodiac rings, and holographic elements.

## Visual Language

### Color Palette
- **Deep Midnight**: `oklch(0.13 0.02 270)` — Primary background
- **Neon Gold**: `oklch(0.82 0.16 85)` — Primary accent, premium feel
- **Neon Purple**: `oklch(0.65 0.22 300)` — Mystical, secondary accent
- **Neon Cyan**: `oklch(0.82 0.15 215)` — Cool, future-forward
- **Neon Magenta**: `oklch(0.7 0.25 340)` — Bold, energetic

### Typography
- **Display**: "Orbitron" (futuristic headings)
- **Body**: "Inter" (clean, readable)
- **Weight**: Bold for hierarchy, Medium for emphasis, Regular for body text

### Effects & Materials

#### Glass Panels
```css
.glass {
  background: linear-gradient(180deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02));
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid oklch(1 0 0 / 0.08);
}

.glass-strong {
  background: linear-gradient(180deg, oklch(0.18 0.03 270 / 0.85), oklch(0.13 0.02 270 / 0.85));
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid oklch(1 0 0 / 0.08);
}
```

#### Conic Rings (Animated)
```css
.conic-ring::before {
  background: conic-gradient(from 0deg,
    var(--gold), var(--neon-magenta), var(--neon-purple),
    var(--neon-cyan), var(--neon-green), var(--gold));
  animation: conic-spin 6s linear infinite;
}
```

#### Glow Shadows
- **Gold**: `0 0 24px oklch(0.82 0.16 85 / 0.45), 0 0 1px oklch(0.82 0.16 85 / 0.7)`
- **Purple**: `0 0 28px oklch(0.65 0.22 300 / 0.5)`
- **Cyan**: `0 0 24px oklch(0.82 0.15 215 / 0.45)`

#### Ambient Orbs
Soft blurred gradients creating depth:
```css
radial-gradient(circle, oklch(0.82 0.16 85 / 0.2), transparent 70%);
filter: blur(80px);
```

### Animations

#### Conic Spin (360° rotation)
```
Duration: 6s
Timing: linear infinite
Used on: Zodiac rings, badges
```

#### Badge Shine
```
Duration: 0.6s
Movement: Sweeping left-to-right gradient
Used on: Hover states
```

#### Float & Rise
```
Duration: 5s–8s
Movement: Subtle vertical bob, breathing effect
Used on: Background orbs, floating elements
```

## Component Specifications

### 1. Zodiac Onboarding

**Purpose**: Initial zodiac selection during signup or profile setup

**Layout**:
- Mobile-first: 3-column grid on mobile, 4–6 columns on desktop
- Header with mystical messaging
- 12 zodiac sign cards
- Secondary "confirm date" step

**Card Anatomy**:
```
[Symbol]  ← 2.5rem font
Sign Name
Date Range (smaller)
```

**Interactions**:
- Hover: Slight lift + glow shadow (sign-specific color)
- Selected: Highlighted border + full glow
- Click: Advance to date confirmation

**States**:
- Default: Semi-transparent glass
- Hover: Slightly more opaque, +2px transform
- Selected: Full color glow, border highlight
- Disabled: Reduced opacity

**Color Mapping** (each sign has unique glow):
- Aries, Scorpio, Leo: Magenta
- Taurus, Virgo, Capricorn: Green
- Gemini, Libra, Aquarius: Cyan
- Cancer, Pisces: Purple

### 2. Zodiac Confirmation (Lock Screen)

**Purpose**: Dramatic reveal & validation of cosmic identity

**Layout**:
- Full-screen immersive experience
- Centered content over animated background
- Holographic zodiac ring (conic gradient + blur)
- Info card with cusp detection

**Zodiac Symbol Display**:
```
Outer Ring: Conic gradient (6s spin) with glow
Middle Ring: Blurred ambient glow (8s reverse spin)
Center: Glass sphere with symbol (4rem)
```

**Unlock Slider**:
- Draggable progress (left → right)
- Threshold: 80% drag distance
- Visual feedback on drag progress
- Lock icon animates to sparkles on unlock

**Cusp Treatment**:
- Special gradient background (gold + purple)
- "Cusp Soul" badge with rare styling
- Exclusive messaging about dual energies
- Different info display for cusp users

### 3. Reading of the Day Card

**Purpose**: Daily personalized cosmic reading on homepage

**Layout**:
- Glass-strong container with ambient background orb
- Header with symbol + sign name
- Main reading text (2–3 sentences)
- Energy attributes grid (2 columns on mobile, 4 on desktop)
- Recommended action section with icon
- Cusp note (if applicable)
- Footer CTA buttons

**Header Section**:
```
[Symbol Badge]  Sign Name
                Reading of the Day (label)
                [Sparkle Icon]
```

**Attributes Grid**:
```
[⚡ Energy]     [🔢 Lucky #]
[🎨 Color]      [📍 Action]
```

**Cusp Note Style** (if present):
- Gradient background (gold → purple → cyan)
- Left border accent
- Heart icon
- Smaller text, muted but still readable

**Interactive Elements**:
- "Full Reading" button: Primary gradient CTA
- "Save" button: Secondary glass button

### 4. Zodiac Badge

**Purpose**: User profile identification & collectible status indicator

**Variants**:

#### Badge Only (Icon)
```
Sizes: sm (32px), md (48px), lg (64px)
Glass container, centered symbol
Hover: Scale +10%, glow shadow
```

#### Badge + Name (Horizontal)
```
[Glass Badge] | Name
              | [Cusp indicator if applicable]
Vertical spacing: 0.5rem
```

#### Profile Card (Large)
```
Header (with conic ring):
  [Large Badge with conic-ring] | Name
                                | Status
  
Info Section:
  Joined date
  Cusp explanation (if applicable)
  Explore Groups button
```

**Conic Ring Details**:
- Applied via `.conic-ring` class
- Creates animated neon border
- ::before: conic gradient, 6s spin, drop shadow
- ::after: soft glow, 6s reverse spin, opacity 0.7

### 5. Group Cards (Inbox)

**Purpose**: Suggest & display zodiac-matched social groups

**Layout**:
```
Header Section:
  [Icon]  Group Name
  Match Reason (2 lines)
          [Member Count]

Members Section:
  Member avatars (4 shown, +count if >4)

Tags Section:
  [♈ Zodiac] [Interest] [Location]
  Flex wrap

Footer:
  [Matched by Trey TV] badge (gold)
  [Primary CTA]
  [Secondary CTA] (if member: [Leave])
```

**Group Icons**:
- Zodiac symbols (♈, ♉, etc.)
- Custom emoji (🔥, 🌙, 🎤, etc.)
- Displayed as 3.5rem emoji in glass badge

**Member Avatars**:
- 36px circles with glass container
- Display 4 by default
- +X indicator for remaining
- Slight ring-offset visual depth

**Tags Styling**:
- Zodiac tags: Purple border, smaller font
- Interest/location tags: Default glass
- Scrollable on mobile

**CTA States**:

**If Not Member**:
```
[📍 Join Group] (Primary gradient, full width)
```

**If Member**:
```
[Open Group] →     [⊗ Leave]
(Cyan gradient)    (outline, hover red)
```

**Hover Effects**:
- Card elevation (+2px, larger shadow)
- Glow intensifies
- Icon slight scale up

### 6. Zodiac Groups Hub

**Purpose**: Discovery & management of all zodiac communities

**Layout**:
```
Header:
  [✨ Zodiac Communities]
  Description
  Search bar
  Filter tabs (All | Joined | Discover)

Content:
  Grid of group cards
  Responsive: 1 col mobile, 2 col tablet, 1 col desktop
  Gap: 24px

Footer:
  Stats card (3 columns)
    Groups Joined | Soul Connections | To Discover
```

**Search & Filter**:
- Glass input with search icon
- Filter tabs with gradient active state
- Real-time filtering

**Empty State**:
- Centered message
- Encouraging text
- Glass container styling

## Responsive Design

### Mobile (< 640px)
- Single column layouts
- Reduced padding/margins
- Touch-friendly button sizes (44px min)
- Full-width cards with slight padding

### Tablet (640px - 1024px)
- 2-column grids where applicable
- Increased spacing
- Optimized imagery

### Desktop (> 1024px)
- Multi-column layouts
- Side navigation
- Expanded card details
- Full interactive experiences

## Accessibility

### Color Contrast
- All text meets WCAG AA minimum (4.5:1 on primary text)
- Neon glows are decorative, not semantic
- Alt text for zodiac symbols provided in data

### Motion
- All animations respect `prefers-reduced-motion`
- Can be disabled via CSS

### Interactive Elements
- Minimum 44px touch targets
- Clear focus states
- Keyboard navigation supported
- ARIA labels on buttons & icons

## Privacy & Security

### Data Handling
- Birth dates are encrypted, stored server-side only
- Public UI shows only zodiac sign + badge status
- No public birth chart exposure
- Cusp Soul badge is private indicator (shared only with matched users)

## Implementation Files

- `src/components/zodiac/ZodiacOnboarding.tsx` — Zodiac selection flow
- `src/components/zodiac/ZodiacConfirmation.tsx` — Lock screen experience
- `src/components/zodiac/ReadingOfTheDay.tsx` — Daily reading card
- `src/components/zodiac/ZodiacBadge.tsx` — Badge & profile card components
- `src/components/zodiac/ZodiacGroupCard.tsx` — Individual group card
- `src/components/zodiac/ZodiacGroupsHub.tsx` — Groups discovery hub
- `src/routes/zodiac-showcase.tsx` — Preview/showcase page
- `src/styles.css` — Zodiac-specific CSS & animations

## Integration Points

### Profile Page
- Add `ProfileZodiacCard` below existing profile sections
- Show zodiac badge in header

### Homepage (For You Feed)
- Insert `ReadingOfTheDay` as featured card above feed
- Refresh daily

### Inbox/Messaging
- Add `ZodiacGroupsHub` as dedicated tab or section
- Show `ZodiacGroupCard` items in group suggestions

### Signup/Onboarding
- Insert `ZodiacOnboarding` as optional step after basic profile
- Show `ZodiacConfirmation` as celebratory modal

## Customization

All Trey TV neon colors can be swapped via CSS custom properties:
- `--gold`
- `--neon-cyan`
- `--neon-purple`
- `--neon-magenta`
- `--neon-green`

Animations can be disabled via `prefers-reduced-motion` media query.

Glass blur intensity can be adjusted by modifying `backdrop-filter: blur(18px)` values (higher = more blur).

## Future Enhancements

- Daily reading personalization based on AI
- Real-time cusp soul group notifications
- Zodiac-based content recommendations
- Birthday celebration badges
- Zodiac compatibility matching
- Astrological event calendar integration
