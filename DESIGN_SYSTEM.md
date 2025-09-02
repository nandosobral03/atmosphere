# Wallpaper App UI/UX Design Document

Based on the two design references, here's a comprehensive design system for your wallpaper application:

## 🎨 Color Palette

### Primary Colors
- **Background Base**: `#F5E6E0` (Soft peachy pink)
- **Background Gradient**: `linear-gradient(135deg, #F5E6E0 0%, #E8D5D0 100%)`
- **Primary Orange**: `#FF6B35` (Vibrant coral-orange for CTAs)
- **Secondary Orange**: `#FF8A65` (Lighter orange for hover states)

### Neutral Colors
- **Card Background**: `#FFFFFF` with `opacity: 0.95` (Semi-transparent white)
- **Text Primary**: `#2C2C2C` (Dark charcoal)
- **Text Secondary**: `#6B7280` (Medium gray)
- **Text Tertiary**: `#9CA3AF` (Light gray)
- **Border**: `#E5E7EB` with `opacity: 0.3`

### Accent Colors (from Image #2)
- **Yellow**: `#F59E0B` (Warm golden yellow)
- **Coral**: `#F87171` (Soft coral red)
- **Purple**: `#8B5CF6` (Soft purple)
- **Cyan**: `#06B6D4` (Current app color - keep for continuity)
- **Green**: `#84CC16` (Fresh lime green)

### Dark Mode Adaptations
- **Background**: `#1F1F23` (Deep dark with slight warmth)
- **Card Background**: `#2C2C30` with `opacity: 0.8`
- **Text Primary**: `#FFFFFF`
- **Accent adjustments**: Increase saturation by 10% for dark mode

## 🎭 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', system-ui, sans-serif
```

### Font Weights & Sizes
- **Display**: 32px, font-weight: 700 (Bold)
- **Heading 1**: 24px, font-weight: 600 (Semibold)
- **Heading 2**: 20px, font-weight: 600 (Semibold)
- **Body Large**: 16px, font-weight: 400 (Regular)
- **Body**: 14px, font-weight: 400 (Regular)
- **Body Small**: 12px, font-weight: 400 (Regular)
- **Caption**: 11px, font-weight: 500 (Medium)

### Line Heights
- Display: 1.1 (tight)
- Headings: 1.2 (tight)
- Body text: 1.5 (comfortable)

## 🔘 Border Radius & Shapes

### Radius System
- **Small**: `8px` (small UI elements, badges)
- **Medium**: `12px` (buttons, small cards)
- **Large**: `16px` (main cards, modals)
- **Extra Large**: `20px` (hero sections, major containers)
- **Pills**: `100px` (filter buttons, tags)

### Shape Language
- **Organic background elements**: Flowing, curved shapes with `border-radius: 50px 100px 75px 25px`
- **Cards**: Consistent 16px radius with subtle elevation
- **Buttons**: Pill-shaped (100px radius) for primary actions

## 🎴 Image Treatment

### Image Styles
- **Aspect Ratios**: 16:10 for wallpaper previews, 1:1 for thumbnails
- **Corner Radius**: 12px for image containers
- **Overlay Gradients**: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)` for text readability
- **Hover Effects**: `transform: scale(1.02)` with smooth transition

### Image Loading
- **Skeleton**: Animated shimmer effect with base color `#F3F4F6`
- **Fallback**: Soft gradient background while loading
- **Error State**: Icon placeholder with neutral background

## 🚀 Animation & Transitions

### Micro-interactions
- **Hover Scale**: `transform: scale(1.02)` (duration: 200ms)
- **Button Press**: `transform: scale(0.98)` (duration: 100ms)
- **Card Hover**: Elevation increase + subtle scale
- **Icon Hover**: `transform: scale(1.1)` (duration: 150ms)

### Transition Timing
- **Fast**: `100ms ease-out` (button presses, immediate feedback)
- **Normal**: `200ms ease-in-out` (hover states, small movements)
- **Slow**: `300ms ease-in-out` (page transitions, large movements)

### Easing Functions
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- **Bounce**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (playful interactions)

## 📐 Spacing & Layout

### Spacing Scale (Tailwind-inspired)
- **xs**: `4px`
- **sm**: `8px`
- **md**: `12px`
- **lg**: `16px`
- **xl**: `24px`
- **2xl**: `32px`
- **3xl**: `48px`

### Grid System
- **Container**: `max-width: 480px` (mobile-first)
- **Gutters**: 16px horizontal padding
- **Vertical Spacing**: 24px between major sections

### Card Layouts
- **Padding**: 16px internal padding
- **Gap**: 12px between cards in grids
- **Hero Cards**: 24px internal padding

## 🎯 UX Patterns & Principles

### Navigation Design
1. **Bottom Tab Bar**: Pill-shaped active indicators
2. **Breadcrumbs**: Subtle with arrow separators
3. **Back Buttons**: Consistent positioning (top-left)

### Content Organization
1. **Card-based Layout**: Everything lives in cards for consistency
2. **Visual Hierarchy**: Size, color, and spacing to guide attention
3. **Grouping**: Related items clustered with clear boundaries

### Interactive Elements
1. **Primary CTAs**: Orange pill buttons with high contrast
2. **Secondary Actions**: Subtle buttons with border/outline
3. **Filter Pills**: Dark background, white text, rounded full
4. **Toggle States**: Clear visual feedback with color/shape changes

### Feedback Systems
1. **Loading States**: Skeleton screens and shimmer effects
2. **Error States**: Friendly messaging with recovery actions
3. **Success Feedback**: Subtle checkmarks and color changes
4. **Empty States**: Helpful illustrations and clear next steps

## 🔄 State Management

### Interactive States
- **Default**: Base styling
- **Hover**: Subtle scale + shadow increase
- **Active/Pressed**: Slight scale down (0.98)
- **Focus**: Orange outline (2px solid #FF6B35)
- **Disabled**: 50% opacity + no pointer events

### Data States
- **Loading**: Skeleton UI with shimmer animation
- **Empty**: Centered illustration with helpful text
- **Error**: Red accent with retry button
- **Success**: Green checkmark with fade-out

## 🎪 Background Design

### Organic Shapes
- **Position**: Fixed background elements
- **Opacity**: 0.1 for subtle presence
- **Animation**: Slow floating motion (20s duration)
- **Colors**: Soft versions of accent colors
- **Blur**: `backdrop-filter: blur(100px)` for dreamy effect

## 📋 Implementation Priority

### Phase 1: Foundation (Core System)
1. **Update CSS Variables** - Color palette and spacing
2. **Background Redesign** - Peach gradient with organic shapes
3. **Card System** - Consistent rounded corners and shadows
4. **Typography Scale** - Font sizes and weights

### Phase 2: Components (Interactive Elements)
1. **Button System** - Pill-shaped primary buttons
2. **Icon Integration** - Consistent sizing and colors
3. **Input Fields** - Rounded design with proper focus states
4. **Navigation** - Updated tab styling

### Phase 3: Layouts (Page Structure)
1. **Homepage Cards** - Bento-box style layout
2. **Collections Grid** - Card-based wallpaper display
3. **Settings Page** - Organized sections with proper spacing
4. **Status Displays** - Enhanced visual feedback

### Phase 4: Polish (Micro-interactions)
1. **Hover Effects** - Scale and shadow animations
2. **Loading States** - Skeleton screens
3. **Transitions** - Smooth page changes
4. **Error Handling** - Friendly feedback messages

## 🎨 CSS Variable Definitions

```css
:root {
  /* Colors */
  --color-bg-primary: #F5E6E0;
  --color-bg-secondary: #E8D5D0;
  --color-bg-gradient: linear-gradient(135deg, #F5E6E0 0%, #E8D5D0 100%);
  
  --color-primary: #FF6B35;
  --color-primary-hover: #FF8A65;
  --color-primary-focus: #FF6B35;
  
  --color-card: rgba(255, 255, 255, 0.95);
  --color-text-primary: #2C2C2C;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-border: rgba(229, 231, 235, 0.3);
  
  /* Accents */
  --color-yellow: #F59E0B;
  --color-coral: #F87171;
  --color-purple: #8B5CF6;
  --color-cyan: #06B6D4;
  --color-green: #84CC16;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 48px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 100px;
  
  /* Typography */
  --font-display: 700;
  --font-heading: 600;
  --font-body: 400;
  --font-caption: 500;
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1F1F23;
    --color-bg-secondary: #17171A;
    --color-card: rgba(44, 44, 48, 0.8);
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #D1D5DB;
    --color-text-tertiary: #9CA3AF;
    --color-border: rgba(75, 85, 99, 0.3);
    
    /* Enhanced accents for dark mode */
    --color-yellow: #FCD34D;
    --color-coral: #FCA5A5;
    --color-purple: #A78BFA;
    --color-cyan: #22D3EE;
    --color-green: #A3E635;
  }
}
```

## 🔧 Component Examples

### Button Component
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-pill);
  padding: 12px 24px;
  font-weight: var(--font-heading);
  transition: all var(--transition-normal) var(--ease-default);
  transform-origin: center;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.25);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### Card Component
```css
.card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal) var(--ease-default);
}

.card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}
```

---

*This design system provides a comprehensive foundation for creating a modern, cohesive, and delightful wallpaper application interface.*