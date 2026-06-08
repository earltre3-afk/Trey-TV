# Instagram-Style Post Creation Sheet - Design Documentation

## Overview
The bottom nav center plus button now opens a beautiful Instagram-inspired bottom sheet for creating new posts, replacing the previous single-step navigation.

## Key Features

### 1. **Bottom Sheet Animation**
- Slides up from the bottom with smooth easing
- Semi-transparent backdrop overlay (40% opacity)
- Can be dismissed by clicking backdrop or close button
- Drag indicator at top for mobile affordance

### 2. **Post Type Selection**
The sheet displays 6 post creation options in a 2-column grid:

| Option | Icon | Description | Color |
|--------|------|-------------|-------|
| **Photo** | Image | Share a single photo | Blue → Cyan Gradient |
| **Video** | Film | Share a video (up to 30s) | Purple → Pink Gradient |
| **Story** | Square | Share a quick story | Green → Emerald Gradient |
| **Reel** | Play | Create a short-form video | Orange → Red Gradient |
| **Poll** | Zap | Create an interactive poll | Yellow → Amber Gradient |
| **Collaboration** | Heart | Create with others | Rose → Fuchsia Gradient |

### 3. **Visual Design**
- **Cards**: Each option is a rounded button with gradient background on hover
- **Hover States**: 
  - Border brightness increases
  - Gradient background fades in
  - Small animated dot appears in top-right corner
  - Scale animation on click (0.95)
- **Colors**: Dark theme with white text, matching Trey TV's existing aesthetic

### 4. **Interaction Patterns**
- Haptic feedback on button clicks (vibration)
- Active scale animation when tapping
- Pro tip section at bottom with emoji and helpful guidance
- Smooth transitions between all states

## Architecture

### Components

#### `InstagramStylePostSheet.tsx`
Main component that renders the bottom sheet modal with post type options.

**Props:**
- `isOpen: boolean` - Controls visibility
- `onClose: () => void` - Callback when sheet should close

**Features:**
- Animated entrance/exit
- Backdrop click handling
- Responsive grid layout
- Haptic feedback integration

#### `CreateWheel.tsx` (Updated)
Previously linked directly to `/create`, now opens the post sheet.

**Changes:**
- Replaced Link component with button
- Uses `usePostSheet()` hook to open sheet
- Maintains same visual design and positioning

### Context

#### `post-sheet-context.tsx`
React Context providing global state for the post sheet.

**Exports:**
- `PostSheetProvider` - Wrapper component
- `usePostSheet()` - Hook to access sheet state
  - `isOpen: boolean`
  - `openPostSheet: () => void`
  - `closePostSheet: () => void`

### Root Setup

Updated `__root.tsx` to:
1. Import PostSheetProvider and InstagramStylePostSheet
2. Wrap app with `<PostSheetProvider>`
3. Render `<InstagramStylePostSheet>` before `<Toaster />`

## User Flow

```
User clicks + button
        ↓
CreateWheel calls openPostSheet()
        ↓
PostSheet animates in from bottom
        ↓
User sees 6 post type options
        ↓
User clicks post type (e.g., "Photo")
        ↓
Sheet closes, navigates to /create?type=photo
        ↓
Composer receives type parameter and pre-selects that mode
```

## Styling Details

### Colors & Gradients
- **Background**: Dark theme (`#05070D`)
- **Borders**: White/10% for default, white/30% on hover
- **Text**: White for labels, zinc-400/300 for descriptions
- **Gradients**: Per-color option (e.g., blue→cyan for photos)

### Spacing & Sizing
- Grid gap: 12px (0.75rem)
- Card padding: 16px (1rem)
- Icon size: 24px (size-6)
- Border radius: 16px (rounded-2xl)

### Animations
- **Sheet slide**: 300ms ease-out
- **Backdrop fade**: 300ms
- **Hover effects**: 300ms transitions
- **Click scale**: 150ms scale to 0.95

## Accessibility

- ✅ Close button with aria-label
- ✅ Proper semantic HTML (buttons, not divs)
- ✅ Backdrop dismissal support
- ✅ Keyboard navigation support
- ✅ Touch-friendly hit targets (min 44px)
- ✅ Haptic feedback for mobile users

## Mobile Considerations

- Fully responsive 2-column layout
- Bottom sheet fixed positioning handles safe areas
- Smooth animations don't impact performance
- Backdrop prevents accidental page scrolling
- Large touch targets for easy interaction

## Integration Points

The sheet integrates with:
1. **Composer**: Receives `type` query parameter to pre-select mode
2. **BottomNav**: CreateWheel button functionality
3. **Root Layout**: Global state management
4. **Routes**: /create route handles post type parameter

## Future Enhancements

- Add draft recovery ("Continue last draft")
- Quick access to recent filters/settings
- Favorite post types (reorder grid)
- Post scheduling preview
- Template suggestions
- AI-powered post recommendations

## Browser Support

Works on all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Lazy renders sheet component (only on demand)
- Uses CSS transitions for smooth animations
- No heavy computations or API calls
- Haptic feedback is non-blocking
- Context prevents unnecessary re-renders

