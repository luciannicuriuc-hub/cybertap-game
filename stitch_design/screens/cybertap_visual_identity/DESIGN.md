---
name: CyberTap Visual Identity
colors:
  surface: '#11131c'
  surface-dim: '#11131c'
  surface-bright: '#373943'
  surface-container-lowest: '#0c0e17'
  surface-container-low: '#191b25'
  surface-container: '#1d1f29'
  surface-container-high: '#282933'
  surface-container-highest: '#32343f'
  on-surface: '#e1e1ef'
  on-surface-variant: '#c3c5d9'
  inverse-surface: '#e1e1ef'
  inverse-on-surface: '#2e303a'
  outline: '#8d90a2'
  outline-variant: '#434656'
  surface-tint: '#b6c4ff'
  primary: '#b6c4ff'
  on-primary: '#002780'
  primary-container: '#0055ff'
  on-primary-container: '#e3e6ff'
  inverse-primary: '#004dea'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#ecb2ff'
  on-tertiary: '#520071'
  tertiary-container: '#a700e2'
  on-tertiary-container: '#fadeff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#f8d8ff'
  tertiary-fixed-dim: '#ecb2ff'
  on-tertiary-fixed: '#320047'
  on-tertiary-fixed-variant: '#74009f'
  background: '#11131c'
  on-background: '#e1e1ef'
  surface-variant: '#32343f'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
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
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-safe: 20px
---

## Brand & Style

This design system is built on a **High-Contrast / Bold** and **Tactile** aesthetic tailored for the "tap-to-earn" mobile gaming market. It draws heavy inspiration from the expressive, chunky visuals of modern mobile hits, blending them with a futuristic "Cyber-Cartoon" vibe. The goal is to evoke a sense of high energy, immediate reward, and playful immersion.

The visual language uses "Chunky Realism"—elements look like they can be physically pressed, featuring thick 3pt to 4pt outlines that ground the vibrant neon colors against a deep, textured void. The emotional response should be one of "dopamine-driven excitement," utilizing glowing cybernetic patterns to make the interface feel alive and powered-on.

## Colors

The palette is centered around **Electric Blue**, used for primary branding and core interactive containers. The background is a deep, near-black navy (`#0A0B1E`) to allow neon elements to pop. 

- **Primary (Electric Blue):** The core energy of the game.
- **Secondary (Lime Punch):** Reserved exclusively for high-priority CTAs and "Claim" buttons to ensure maximum conversion.
- **Tertiary (Neon Purple):** Used for rare items, special upgrades, or secondary feedback loops.
- **Accent (Cyber Cyan):** Used for data readouts, progress bars, and glowing "active" states.
- **Outline:** Every interactive element must have a thick, solid black outline to maintain the cartoonish, high-definition look.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, approachable, yet modern feel. For display text, we use the ExtraBold (800) weight to create the "impact" required for game scores and headlines. 

Text should often incorporate a subtle drop shadow or a secondary "offset" layer in a darker shade of the font color to mimic the 3D-effect of the components. **Space Grotesk** is used sparingly for technical labels, crypto-wallet addresses, and "hacker" style micro-copy to lean into the cybernetic theme.

## Layout & Spacing

The layout follows a **Fluid Grid** model designed for thumb-centric mobile interaction. Because this is a "tap" game, the central area is reserved for the primary interaction asset.

Spacing is generous to prevent accidental taps. A 4px base unit is used, with a 16px gutter between cards. The bottom navigation is oversized, ensuring the "Play" or "Main Tap" button is easily accessible. Layouts are bottom-weighted, placing the most important functional items within the lower 60% of the screen.

## Elevation & Depth

Depth is not achieved through realistic lighting, but through **Bold Outlines** and **Offset Shadows**. 

1.  **Layer 0 (Background):** Deep navy with a subtle "grid" or "circuitry" texture at low opacity.
2.  **Layer 1 (Cards/Panels):** Electric blue or dark slate with 3pt black borders and a 4px hard-drop shadow (100% opacity) in black.
3.  **Layer 2 (Interactives):** Buttons have a "pressed" state where the 4px hard shadow disappears, and the element shifts 2px down and right.
4.  **Glow FX:** Important assets (like the main tapping object) feature an outer-glow (Bloom effect) using their base color (e.g., a cyan glow for cyan buttons).

## Shapes

The design system uses **Rounded** geometry to keep the aesthetic playful and non-threatening.
- **Main Cards:** 1rem (16px) corner radius.
- **Secondary Buttons:** 1rem (16px) or fully pill-shaped for "Apply" or "Buy" actions.
- **Containers:** 1.5rem (24px) for top-level modal sheets to give them a soft, premium feel as they slide up.
- **Outer Borders:** All shapes must be enclosed by a 3px to 4px solid black border to define the "cartoon" style.

## Components

### Buttons
Primary buttons are chunky, using the Lime Punch (`#CCFF00`) color with a 4px black bottom-border that mimics a 3D side. On tap, the button scales down to 95% and the shadow disappears.

### Chips & Badges
Used for displaying multipliers (e.g., 2x, 5x). These use the Neon Purple (`#BD00FF`) with white ExtraBold text and a heavy black outline.

### Progress Bars
Thick containers with a black background and a Cyan (`#00F0FF`) fill. The fill should have a "scanning" light effect moving across it periodically.

### Cards
Cards are Electric Blue or Dark Surface colors. They must contain a header section with a icon and a distinct body section. Use "inner-glow" borders to make the card appear as if it is a screen within a screen.

### Tapper Asset
The central game element should be the most detailed, featuring multiple layers of outlines, an intense outer glow, and a "squash and stretch" animation when interacted with.

### Modals
Bottom-aligned sheets with a 24px radius. The background should have a backdrop blur of 20px over the main game screen to maintain focus.