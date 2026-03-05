# PayOnRain Figma Design System

## Overview
Modern, clean weather insurance application running on Solana. Target: sophisticated, trustworthy, tech-forward with premium finishes.

---

## 1. COLOR PALETTE

### Primary Colors
- **Accent Green** `#00A878` — Action buttons, success states, connected wallet
- **Accent Pink/Red** `#E91E63` — Secondary CTA, hover states
- **Solana Purple** `#9945FF` — Blockchain themeing, highlights

### Neutral
- **Text Primary** `#1a1714` — Headlines, body
- **Text Secondary** `#6b6b6b` — Muted labels, hints
- **Text Muted** `#999999` — Disabled states
- **Surface Light** `#f5f1e8` — Main background
- **Surface** `#ffffff` — Cards, containers
- **Surface Dark** `#0f1724` — Code blocks, dark accents
- **Border** `#e0dcd4` — Dividers, input borders

### Status
- **Success** `#6ee7b7` (soft green)
- **Warning** `#fbbf24` (amber)
- **Error** `#f87171` (soft red)

### Gradients
- **Hero Gradient** `linear-gradient(135deg, #00A878 0%, #E91E63 100%)`
- **Shimmer** `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` (for loading)

---

## 2. TYPOGRAPHY

### Font Family
- **Primary:** Inter or Poppins (clean, modern)
- **Monospace:** Cascadia Code or Fira Code (for wallet addresses, tx hashes)

### Type Scale
| Level | Size | Weight | Line Height | Use |
|-------|------|--------|------------|-----|
| H1 | 48px | 700 | 1.2 | Page heap, hero title |
| H2 | 36px | 700 | 1.25 | Section titles |
| H3 | 24px | 600 | 1.4 | Card titles, step headings |
| Body L | 18px | 400 | 1.6 | Large body text |
| Body M | 16px | 400 | 1.6 | Standard body, labels |
| Body S | 14px | 400 | 1.5 | Secondary copy, hints |
| Label | 12px | 600 | 1.4 | Form labels, badges |
| Code | 12px | 400 | 1.5 | Monospace addresses |

---

## 3. COMPONENT LIBRARY

### Buttons

**Primary Button** (CTA)
- Background: `#00A878`
- Text: White, 16px Bold
- Padding: 12px 24px
- Border Radius: 8px
- Hover: `#008060` (darker)
- Active: `#006b4b`
- Disabled: Gray `#d1d1d1`, opacity 0.5

**Secondary Button**
- Background: transparent
- Border: 2px `#E91E63`
- Text: `#E91E63`, 16px
- Padding: 10px 22px
- Border Radius: 8px
- Hover: Background `rgba(233, 30, 99, 0.1)`

**Ghost Button** (minimal)
- Background: transparent
- Text: `#00A878`, 14px Bold
- Padding: 8px 12px
- Hover: Underline
- No border

**Loading State**
- Use spin animation (continuous 360° rotation)
- Icon: ⟳ (rotate-refresh)
- Color: Accent Green

**Wallet Button** (special)
- Background: `rgba(233, 30, 99, 0.08)` (pink tint)
- Border: 1px `#E91E63`
- Text: `#E91E63`, 12px Bold
- Padding: 6px 16px
- Border Radius: 20px (pill shape)
- Hover: Background → full pink, text white
- Connected state: Border `#00A878`, background `rgba(0, 168, 120, 0.08)`, text green

### Input Fields

**Text Input** (city, threshold, payout)
- Background: `#ffffff`
- Border: 1px `#e0dcd4`
- Text: `#1a1714`, 16px
- Padding: 12px 16px
- Border Radius: 6px
- Focus: Border `#00A878`, shadow `0 0 0 3px rgba(0, 168, 120, 0.1)`
- Placeholder: `#999999`
- Font: Inter

**Label** (above input)
- Text: `#6b6b6b`, 14px Bold
- Margin Bottom: 6px

### Cards

**Policy Card** (Step 1, 2, 3)
- Background: `#ffffff`
- Border: 1px `#e0dcd4`
- Border Radius: 12px
- Padding: 28px 32px
- Box Shadow: `0 2px 8px rgba(0,0,0,0.04)`
- Hover: Shadow → `0 4px 16px rgba(0,0,0,0.08)`

**Weather Box** (inline, inside card)
- Background: `rgba(249, 240, 255, 0.5)` (light purple tint)
- Border: 1px `#e0dcd4`
- Border Radius: 8px
- Padding: 16px
- Display: grid, 2 columns

**Weather Row**
- Display: Flex, justify-between
- Padding: 10px 0
- Border Bottom: 1px `#f0f0f0`
- Label: `#6b6b6b`, 14px
- Value: `#1a1714`, 16px Bold

**TX Box** (transaction details)
- Background: `#0f1724` (dark)
- Border: 1px `#2d3e5f`
- Border Radius: 8px
- Padding: 16px
- Color: `#e0e0e0` (light gray)

**TX Row**
- Display: Flex, justify-between
- Padding: 8px 0
- Font: Monospace, 13px

### Badges

**Network Badge** (top right)
- Background: `rgba(0, 168, 120, 0.1)`
- Border: 1px `#00A878`
- Text: `#00A878`, 12px Bold
- Padding: 5px 12px
- Border Radius: 20px
- Net-dot: Circle, 8px, `#00A878`, animating pulse

**Step Label** (above step heading)
- Text: `#E91E63`, 12px Bold, uppercase
- Letter Spacing: 1px
- Margin Bottom: 8px

### Status Icons

**Success** ✓
- Icon: Checkmark circle
- Color: `#6ee7b7`
- Size: 48px
- Animation: Gentle scale-in (0.4s ease)

**Warning** ⚠
- Icon: Triangle outline
- Color: `#fbbf24`
- Size: 48px

**Error** ✕
- Icon: X circle
- Color: `#f87171`
- Size: 48px

---

## 4. SPACING & LAYOUT

### Spacing Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Grid
- **Base**: 8px
- **Layout Max Width**: 720px
- **Margins**: 60px top/bottom on sections
- **Padding**: 20px on mobile, 0 on desktop (auto-center)

### Layout Structure
```
Header (fixed, 60px)
  ├─ Logo + Title
  ├─ Network Badge
  ├─ Block Counter
  └─ Wallet Button

Main (max 720px, center)
  ├─ Tagline (center, margin 48px)
  ├─ Card (Step 1)
  ├─ Card (Step 2) [locked state]
  ├─ Card (Step 3) [locked state]
  ├─ Explainer Section (comparison grid)
  └─ Footer

Footer (60px, center)
```

---

## 5. LOCKED / UNLOCKED STATES

### Locked Card
- Opacity: 0.5
- Background: `rgba(255, 255, 255, 0.7)`
- All inputs/buttons disabled
- Blur effect: mild 2px
- Pointer: not-allowed
- Text: `#999999`

### Unlocked Card
- Opacity: 1.0
- Fully interactive
- Border: `#e0dcd4` → glow on focus (box-shadow)

---

## 6. ANIMATIONS & INTERACTIONS

### Button Hover
- Duration: 200ms
- Easing: ease-out
- Transform: translateY(-2px) + shadow increase

### Button Click
- Duration: 100ms
- Transform: scale(0.98)
- Feedback: instant

### Loading Spinner
- Duration: 1s
- Easing: linear (infinite)
- Rotation: 360deg
- Icon: ⟳

### Card Unlock
- Duration: 400ms
- Fade in: opacity 0 → 1
- Slide down: translateY(-10px) → 0

### Success Animation
- Icon scale: 0 → 1.2 → 1 (duration: 600ms, spring easing)
- Confetti: (optional) subtle scale/fade

### Weather Row Highlight
- Rainfall ≥ Threshold: Text color → `#6ee7b7` (green)
- Rainfall < Threshold: Text color → `#f87171` (red)
- Transition: 300ms

---

## 7. DARK MODE (Optional Future)

If implementing dark mode:
- **Surface**: `#0a0e1a`
- **Surface Alt**: `#15192a`
- **Text Primary**: `#f0f0f0`
- **Border**: `#2d3e5f`
- **Accent**: same (green/pink)

---

## 8. KEY SCREENS

### Screen 1: Header + Tagline
```
[Logo: PayOnRain] [Solana Devnet] [Block 8,412,047] [✓ 5p3...K2Ls]

  Automated weather insurance running on Solana Devnet.
  Real wallet integration + live transaction verification.
```

### Screen 2: Step 1 - Create Policy
```
[Step 1 — Create Policy & Lock Funds]
Register Insurance Policy

City: [Input: "Nairobi"]
Rain Threshold (mm): [Input: "50"]
Payout ($RALO): [Input: "100"]

[Create Policy Button]
```

### Screen 3: Step 1 - Output (After Click)
```
Policy created on Solana Devnet
Location: Nairobi
Threshold: 50 mm rainfall
Payout: 100 $RALO
User: Wallet3q...
Tx: 5p3KaZk...
```

### Screen 4: Step 2 - Weather Check
```
[Step 2 — Contract Calls Weather API]
Trigger Weather Check

The contract fetches live weather data from OpenWeatherMap.
If rainfall exceeds threshold, a real $RALO token transfer is initiated on Solana.

[Check Live Weather & Evaluate Button]

[Weather Box - Hidden until evaluated]
Location | Nairobi
Rainfall | 62.3 mm (green, exceeded)
Threshold | 50 mm
Condition | Moderate rain
Temperature | 18 °C
```

### Screen 5: Step 3 - Payout Result
```
[Step 3 — Automatic Payout]
Result

✓ Payout Sent — 100 $RALO
Rainfall (62.3 mm) exceeded threshold (50 mm). 
Funds transferred on Solana Devnet.

Tx Hash | 5p3Ka3k...
Recipient | Wallet...K2Ls
Amount Sent | 100 $RALO
Network | Devnet
Fee | ~0.00025 SOL
Explorer | View on Solana Explorer ↗
```

### Screen 6: How It Works (Bottom Section)
```
How this works on Rialo vs. other chains

[Bad: Other Blockchains]          [Good: Rialo]
• Deploy oracle                   • Write one async HTTP call
• Set up Chainlink node           • Set a condition
• Build keeper bot                • Transfer tokens if true
• Write relay logic
• Pay oracle fees
• Hope nothing syncs
```

---

## 9. VISUAL STYLE GUIDE

### Imagery
- **Hero blob backgrounds**: Soft, organic shapes (SVG)
- **Icons**: Line-based, 24px standard size
- **Photographs**: None (keep minimal, data-focused)

### Rounded Corners
- **Buttons**: 8px
- **Cards**: 12px
- **Inputs**: 6px
- **Badges**: 20px (pill)
- **Icons**: 4px

### Box Shadows
- **Subtle (cards)**: `0 2px 8px rgba(0,0,0,0.04)`
- **Hover (cards)**: `0 4px 16px rgba(0,0,0,0.08)`
- **Focus (inputs)**: `0 0 0 3px rgba(0, 168, 120, 0.1)`
- **Deep (modals, future)**: `0 20px 60px rgba(0,0,0,0.15)`

### Stroke & Border
- **Standard**: 1px `#e0dcd4`
- **Focus**: 2px or glow (no stroke increase, use box-shadow)
- **Disabled**: 1px `#d1d1d1`

---

## 10. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Adjust |
|-----------|-------|--------|
| Mobile | < 640px | 1 column, 20px padding, 24px gaps |
| Tablet | 640–1024px | 90% width, 28px gaps |
| Desktop | > 1024px | 720px fixed, 32px gaps |

---

## 11. ACCESSIBILITY CHECKLIST

- [ ] Color contrast: WCAG AA minimum (4.5:1 for text)
- [ ] Focus visible: Outline or box-shadow on all interactive
- [ ] Button labels: descriptive, no icon-only
- [ ] Form hints: associated labels + placeholder non-required
- [ ] Error messages: clear, inline, color + icon
- [ ] Keyboard nav: tabindex logical, no keyboard traps
- [ ] Screen reader: alt text on images, ARIA labels

---

## 12. IMPLEMENTATION NOTES

### CSS Variables (for easy theming)
```css
:root {
  --color-accent-green: #00A878;
  --color-accent-pink: #E91E63;
  --color-text-primary: #1a1714;
  --color-surface: #ffffff;
  --color-border: #e0dcd4;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 20px;
  
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  
  --transition-fast: 200ms ease-out;
  --transition-base: 300ms ease-out;
}
```

### Figma Setup Tips
1. Create **Components** for: Button, Card, Input, Badge, Weather Row
2. Create **Variants** for: Button (primary/secondary/ghost + hover/active/disabled/loading)
3. Use **Auto Layout** for spacing consistency
4. Create **Text Styles** for each type scale
5. Create **Color Styles** (paint) for each token
6. Use **Frames** for responsive mocking (mobile/tablet/desktop)

---

## 13. DESIGN TOKENS SUMMARY

| Token | Value | Notes |
|-------|-------|-------|
| Primary Color | `#00A878` | Solana green, trust, active |
| Secondary Color | `#E91E63` | Accent, secondary CTA |
| Blockchain Color | `#9945FF` | Solana purple, optional highlights |
| Error | `#f87171` | Soft red, accessible |
| Success | `#6ee7b7` | Soft green, readable |
| Border Radius (std) | 8px | Modern, not too rounded |
| Shadow (focus) | `0 0 0 3px rgba(0,168,120,0.1)` | Soft, accessible |
| Transition | 200-300ms | Snappy, not slow |

---

## Next Steps

1. **Figma File**: Create a new Figma project
2. **Components Library**: Set up Button, Card, Input as main components with variants
3. **Mockups**: Build out all 6 screens above
4. **Handoff**: Export specs + component library
5. **Dev Integration**: Match CSS to Figma specs (use variables for easy updates)

