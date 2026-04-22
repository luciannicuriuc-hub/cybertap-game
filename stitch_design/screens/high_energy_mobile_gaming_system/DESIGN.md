---
name: High-Energy Mobile Gaming System
colors:
  surface: '#1a0b2e'
  surface-dim: '#1a0b2e'
  surface-bright: '#413257'
  surface-container-lowest: '#150629'
  surface-container-low: '#231437'
  surface-container: '#27183b'
  surface-container-high: '#322346'
  surface-container-highest: '#3d2e52'
  on-surface: '#eddcff'
  on-surface-variant: '#d1c6ab'
  inverse-surface: '#eddcff'
  inverse-on-surface: '#38294d'
  outline: '#999077'
  outline-variant: '#4d4632'
  surface-tint: '#ecc200'
  primary: '#fff2d1'
  on-primary: '#3b2f00'
  primary-container: '#ffd200'
  on-primary-container: '#705b00'
  inverse-primary: '#725c00'
  secondary: '#edb1ff'
  on-secondary: '#520070'
  secondary-container: '#6e208c'
  on-secondary-container: '#e498ff'
  tertiary: '#ffefea'
  on-tertiary: '#561f00'
  tertiary-container: '#ffcbb4'
  on-tertiary-container: '#9e3f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe07c'
  primary-fixed-dim: '#ecc200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#564500'
  secondary-fixed: '#f9d8ff'
  secondary-fixed-dim: '#edb1ff'
  on-secondary-fixed: '#320046'
  on-secondary-fixed-variant: '#6e208c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7a3000'
  background: '#1a0b2e'
  on-background: '#eddcff'
  surface-variant: '#3d2e52'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  safe-margin: 24px
---

## Brand & Style

This design system is engineered for high-engagement mobile gaming, focusing on tactile satisfaction and visual "juice." The brand personality is hyper-energetic, friendly, and unapologetically playful, targeting a demographic that values instant feedback and vibrant aesthetics. 

The design style is a hybrid of **Tactile Skeuomorphism** and **High-Contrast Bold**. It moves away from flat design, instead embracing "squishy" physics, glossy surfaces, and thick outlines that make every UI element feel like a physical toy. The goal is to evoke a sense of fun and urgency, ensuring that every tap provides a hit of visual dopamine through movement, depth, and saturated color.

## Colors

The palette is built on high-chroma contrasts to ensure legibility in various lighting conditions and to drive user focus toward "Tap" actions. 

- **Primary (Electric Yellow):** Reserved for the most important interactive elements, such as the main game currency or primary call-to-action buttons.
- **Secondary (Vibrant Purple):** Used for containers, navigation backgrounds, and secondary features to provide a deep, rich contrast to the yellow.
- **Tertiary (Neon Orange):** Used for progress indicators, sale badges, and energetic accents.
- **Neutral (Midnight Purple):** A very dark, desaturated purple replaces standard blacks or greys to maintain the "cartoon" atmosphere while providing a solid foundation for the vibrant foreground elements.

All interactive elements should utilize 3-step linear gradients (Top: Light, Middle: Base, Bottom: Dark) to simulate 3D volume.

## Typography

This design system uses a two-tier typography strategy to balance character with clarity. 

**Plus Jakarta Sans** is the headline workhorse. Its rounded terminals and geometric structure perfectly mirror the "bubbly" UI elements. For maximum impact, headlines should always be rendered in Bold or Extra Bold weights, often paired with a subtle 2px outside stroke in the neutral color to ensure they pop against busy game backgrounds.

**Be Vietnam Pro** handles all functional text. It provides the necessary legibility for game descriptions, item stats, and settings menus. Its contemporary feel keeps the game looking modern rather than dated. Letter spacing should be slightly tightened for headlines to increase visual density and energy.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model optimized for mobile portrait view (9:16 or 19.5:9 aspect ratios). 

- **The 8px Rhythm:** All spacing and sizing must be multiples of 8px to maintain a consistent visual beat.
- **Safe Areas:** A generous 24px margin is maintained on the left and right edges to prevent fingers from obscuring content during gameplay.
- **Vertical Stacking:** Content is prioritized from top to bottom, with the "Primary Action Zone" located in the lower third of the screen for easy thumb reach.
- **Dynamic Padding:** Containers use internal padding of 20px (md) to ensure the "chunky" borders have enough breathing room.

## Elevation & Depth

Depth is not achieved through realistic shadows, but through **Cartoon Physics and Bold Borders**.

- **Thick Outlines:** Every card, button, and icon features a solid 4px to 6px border in a darker shade of the element's base color or the Neutral Purple.
- **Hard Drop Shadows:** Instead of soft ambient blurs, use "Block Shadows." These are solid offsets (usually 4px or 8px down) that create a 3D "lifted" effect.
- **Glossy Overlays:** Every interactive element should have a "sheen" — a semi-transparent white gradient overlay on the top half of the element to simulate a curved, plastic-like surface.
- **Active State Depth:** When pressed, buttons should lose their bottom shadow and shift 4px down on the Y-axis, simulating a physical button being pushed into the screen.

## Shapes

The shape language is strictly **Rounded**. Sharp corners are prohibited as they contradict the friendly, "safe" brand personality. 

- **Default Elements:** 16px (1rem) corner radius for most cards and containers.
- **Buttons:** 24px (1.5rem) or fully pill-shaped to emphasize their "tappability."
- **Progress Bars:** Fully rounded (pill) ends. 
- **Icons:** Enclosed in circular or "squircle" containers with thick borders to ensure they feel like collectible tokens or stickers.

## Components

### Buttons
Buttons must be "chunky." Use a base color (e.g., Primary Yellow), a 6px bottom border in a darker shade to represent the button side, and a white glossy "highlight" on the top edge. Labels should be uppercase Plus Jakarta Sans.

### Progress Bars
Bars are ultra-thick (minimum 24px height). The track is a dark, recessed version of the background, while the fill is a vibrant gradient (Orange to Yellow) with a "segmented" overlay pattern to show incremental progress clearly.

### Cards & Modals
Cards use a 4px solid border. Modals should appear with a "bounce" easing animation, popping from the center. Backgrounds for cards should use a subtle inner-glow to make them feel hollowed out from the UI.

### Icons
Expressive and illustrative. Use thick, consistent line weights that match the button borders. Icons should never be monochromatic; they should use the full brand palette to feel like integrated game assets.

### Haptic Feedback & Transitions
While not visual, the UI components are designed for movement. Use "overshoot" transitions (scaling up to 1.1x before settling at 1.0x) for any element appearing on screen to maintain high-energy engagement.