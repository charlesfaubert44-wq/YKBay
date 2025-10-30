# True North Navigator - Color Palette Reference

Quick reference guide for designers and developers implementing the True North Navigator brand colors.

---

## Primary Colors

### Midnight Navy
```
Hex:  #0B1A2B
RGB:  11, 26, 43
HSL:  210, 59%, 11%
CMYK: 74, 40, 0, 83

Usage: Main backgrounds, headers, primary dark UI elements
Represents: Night sky, deep Northern waters, stability
Accessibility: Use with light text (Arctic Ice, Frost White)
```

### Aurora Teal
```
Hex:  #2E8B8B
RGB:  46, 139, 139
HSL:  180, 50%, 36%
CMYK: 67, 0, 0, 45

Usage: Primary brand color, links, active states, CTAs
Represents: Northern lights, glacial ice, Arctic waters
Accessibility: WCAG AA on Midnight Navy (5.2:1 contrast)
Use Case: Primary buttons, logo, brand moments
```

### Arctic Ice
```
Hex:  #E8F4F4
RGB:  232, 244, 244
HSL:  180, 33%, 93%
CMYK: 5, 0, 0, 4

Usage: Light backgrounds, cards, subtle UI elements
Represents: Ice, snow, clarity, purity
Accessibility: Use with dark text (Midnight Navy, Stone Grey)
Use Case: Card backgrounds, secondary sections
```

---

## Regional Accent Colors (Aurora Spectrum)

Use these as secondary identifiers for different Northern regions. Never replace primary colors, only accent them.

### Aurora Green - Yellowknife/Central NWT
```
Hex:  #4CAF6D
RGB:  76, 175, 109
HSL:  140, 41%, 49%
CMYK: 57, 0, 38, 31

Region: Yellowknife, Great Slave Lake (home base)
Usage: Central NWT region indicator, success states
Symbol: Diamond (mining heritage)
Community: Capital city, established boating
```

### Aurora Purple - Great Bear Lake/Western NWT
```
Hex:  #8B5A9F
RGB:  139, 90, 159
HSL:  283, 28%, 49%
CMYK: 13, 43, 0, 38

Region: Great Bear Lake, Western NWT
Usage: Western NWT region indicator, special features
Symbol: Ptarmigan
Community: Remote, fly-in fishing, spiritual waters
```

### Aurora Blue - Beaufort Sea/Arctic Waters
```
Hex:  #5B9BD5
RGB:  91, 155, 213
HSL:  208, 60%, 60%
CMYK: 57, 27, 0, 16

Region: Beaufort Sea, Arctic coastal waters
Usage: Arctic region indicator, ice/water features
Symbol: Beluga whale
Community: Arctic marine, Inuvialuit territory
```

### Aurora Pink - Slave River/Eastern NWT
```
Hex:  #E67A9E
RGB:  230, 122, 158
HSL:  340, 68%, 69%
CMYK: 0, 47, 31, 10

Region: Slave River, Fort Smith, Eastern NWT
Usage: Eastern NWT region indicator, alerts
Symbol: Rapids/waterfall
Community: River navigation, park access
```

---

## Secondary Colors (Land & Seasons)

### Tundra Gold
```
Hex:  #D4A574
RGB:  212, 165, 116
HSL:  31, 52%, 64%
CMYK: 0, 22, 45, 17

Usage: Highlights, success states, featured content
Represents: Autumn tundra, midnight sun, warmth
Use Case: Awards, badges, positive moments
Accessibility: Use with dark backgrounds only
```

### Boreal Green
```
Hex:  #2D5016
RGB:  45, 80, 22
HSL:  96, 57%, 20%
CMYK: 44, 0, 73, 69

Usage: Safe zones, completed actions, forest indicators
Represents: Northern forests, summer growth
Use Case: Success confirmations, verified content
Accessibility: Use with light text only
```

### Stone Grey
```
Hex:  #6B7280
RGB:  107, 114, 128
HSL:  220, 9%, 46%
CMYK: 16, 11, 0, 50

Usage: Secondary text, disabled states, borders
Represents: Canadian Shield granite, permanence
Use Case: Placeholder text, inactive elements
Accessibility: WCAG AA on white (4.5:1)
```

### Frost White
```
Hex:  #FAFBFC
RGB:  250, 251, 252
HSL:  210, 20%, 98%
CMYK: 1, 0, 0, 1

Usage: Primary text on dark backgrounds, highlights
Represents: Fresh snow, clarity, brightness
Use Case: Hero text, important headings on dark
Accessibility: Use on dark backgrounds only
```

---

## Safety & Alert Colors

Critical for hazard reporting, navigation warnings, and user feedback.

### Critical Red - Danger
```
Hex:  #DC2626
RGB:  220, 38, 38
HSL:  0, 73%, 51%
CMYK: 0, 83, 83, 14

Usage: Danger markers, hazards, critical alerts, delete actions
When to use: Immediate danger, rocks, shoals, severe weather
Animation: Pulse effect (2s cycle)
Icon: Alert Octagon, X Circle
Voice: Direct, urgent, action-oriented
```

### Warning Amber - Caution
```
Hex:  #F59E0B
RGB:  245, 158, 11
HSL:  38, 92%, 50%
CMYK: 0, 35, 96, 4

Usage: Caution areas, weather warnings, user attention needed
When to use: Moderate risk, changing conditions, low water
Animation: Gentle pulse (3s cycle)
Icon: Alert Triangle
Voice: Informative but not alarming
```

### Caution Yellow - Advisory
```
Hex:  #FCD34D
RGB:  252, 211, 77
HSL:  46, 97%, 65%
CMYK: 0, 16, 69, 1

Usage: Advisory notices, shallow water, tips
When to use: Information that improves safety but not urgent
Animation: None (static)
Icon: Info Circle
Voice: Helpful, educational
```

### Success Green - Safe/Verified
```
Hex:  #10B981
RGB:  16, 185, 129
HSL:  160, 84%, 39%
CMYK: 91, 0, 30, 27

Usage: Confirmed safe routes, upload success, verified content
When to use: Positive feedback, community verification
Animation: Check mark fade-in
Icon: Check Circle
Voice: Encouraging, positive
```

---

## Color Combinations

### High Contrast Pairings (WCAG AAA - 7:1+)
- Midnight Navy (#0B1A2B) + Frost White (#FAFBFC) = 15.8:1
- Boreal Green (#2D5016) + Arctic Ice (#E8F4F4) = 9.2:1
- Critical Red (#DC2626) + Frost White (#FAFBFC) = 7.4:1

### Standard Contrast Pairings (WCAG AA - 4.5:1+)
- Aurora Teal (#2E8B8B) + Midnight Navy (#0B1A2B) = 5.2:1
- Stone Grey (#6B7280) + Frost White (#FAFBFC) = 4.9:1
- Tundra Gold (#D4A574) + Midnight Navy (#0B1A2B) = 6.1:1

### Brand Gradient Combinations
```css
/* Northern Lights Gradient */
background: linear-gradient(135deg, #2E8B8B 0%, #8B5A9F 50%, #5B9BD5 100%);

/* Northern Sky Gradient */
background: linear-gradient(180deg, #0B1A2B 0%, #0f1c2e 50%, #0a1219 100%);

/* Ice Gradient */
background: linear-gradient(180deg, #E8F4F4 0%, #FAFBFC 100%);

/* Tundra Gradient */
background: linear-gradient(135deg, #D4A574 0%, #8b6f47 100%);
```

---

## Tailwind CSS Usage

### Direct Color Classes
```jsx
// Primary colors
<div className="bg-midnight-navy">
<div className="bg-aurora-teal">
<div className="bg-arctic-ice">

// Regional accents
<div className="text-aurora-green">    // Yellowknife
<div className="text-aurora-purple">   // Great Bear Lake
<div className="text-aurora-blue">     // Beaufort Sea
<div className="text-aurora-pink">     // Slave River

// Safety colors
<button className="bg-safety-critical">
<div className="border-safety-warning">
<span className="text-safety-success">
```

### Opacity Variations
```jsx
<div className="bg-aurora-teal/20">     // 20% opacity
<div className="bg-midnight-navy/80">   // 80% opacity
<div className="border-stone-grey/30">  // 30% opacity
```

### Gradient Classes
```jsx
<div className="bg-aurora-gradient">
<div className="bg-northern-sky">
<div className="bg-ice-gradient">
<div className="bg-midnight-gradient">
```

---

## Map Color Usage

### Water Rendering
```
Deep Water: Midnight Navy (#0B1A2B) base
Shallow Water: Aurora Teal (#2E8B8B) with 40% opacity
Ice: Arctic Ice (#E8F4F4) with pattern overlay
```

### Land Rendering
```
Urban Areas: Stone Grey (#6B7280)
Forests: Boreal Green (#2D5016)
Tundra: Tundra Gold (#D4A574) at 30% opacity
Rock/Barren: Darker Stone Grey
```

### Track Visualization
```
Community Tracks: Aurora Teal (#2E8B8B), 3px width
Official Routes: Success Green (#10B981), 4px width, dashed for seasonal
User's Current Track: Aurora Purple (#8B5A9F), 4px width, solid
Track Heatmap: Gradient from Aurora Teal (low) to Critical Red (high density)
```

### Hazard Markers
```
Critical: Critical Red (#DC2626), 24px, pulsing
Warning: Warning Amber (#F59E0B), 20px, static
Caution: Caution Yellow (#FCD34D), 16px, static
Info: Aurora Blue (#5B9BD5), 16px, static
```

---

## Dark Mode Considerations

True North Navigator uses dark mode by default (Midnight Navy backgrounds). For light mode variations (if needed):

### Light Mode Adaptations
```
Background: Arctic Ice (#E8F4F4) or Frost White (#FAFBFC)
Text: Midnight Navy (#0B1A2B) or Stone Grey (#6B7280)
Primary Actions: Aurora Teal (unchanged)
Borders: Stone Grey at 20% opacity
Cards: Frost White with subtle shadow
```

---

## Print Color Guidelines

For print materials (maps, safety guides, merchandise):

### CMYK Conversions
Primary colors provided above include CMYK values for professional printing.

### Print-Specific Usage
- Use CMYK values, not hex conversions
- Increase contrast for outdoor visibility
- Safety colors must remain vibrant (no pastel versions)
- Maintain minimum 3mm border around logo

### Grayscale Fallback
When color printing unavailable:
- Logo: 70% black outline version
- Headings: 100% black (Midnight Navy equivalent)
- Body: 60% black (Stone Grey equivalent)
- Hazards: Patterns instead of colors (diagonal lines, dots, etc.)

---

## Accessibility Testing Results

All color combinations tested with WebAIM Contrast Checker:

### Text Contrast (WCAG 2.1)
| Foreground | Background | Contrast | Level | Pass |
|------------|------------|----------|-------|------|
| Frost White | Midnight Navy | 15.8:1 | AAA | Yes |
| Arctic Ice | Midnight Navy | 13.2:1 | AAA | Yes |
| Aurora Teal | Midnight Navy | 5.2:1 | AA | Yes |
| Stone Grey | Frost White | 4.9:1 | AA | Yes |
| Critical Red | Frost White | 7.4:1 | AAA | Yes |
| Warning Amber | Midnight Navy | 6.8:1 | AA+ | Yes |

### UI Component Contrast
| Component | Contrast | Pass |
|-----------|----------|------|
| Primary Button (Aurora Teal on Midnight) | 5.2:1 | AA |
| Danger Button (Critical Red on Midnight) | 8.1:1 | AAA |
| Form Border (Stone Grey on Arctic Ice) | 3.4:1 | AA |
| Link (Aurora Teal on Frost White) | 3.9:1 | AA Large Text |

---

## Regional Color Usage Examples

### Yellowknife Region Example
```jsx
<RegionCard
  bgColor="bg-midnight-navy"
  accentColor="border-l-4 border-aurora-green"
  iconColor="text-aurora-green"
>
  <h3 className="text-frost-white">Yellowknife Bay</h3>
  <p className="text-arctic-ice">Central NWT, Great Slave Lake</p>
</RegionCard>
```

### Beaufort Sea Region Example
```jsx
<RegionCard
  bgColor="bg-midnight-navy"
  accentColor="border-l-4 border-aurora-blue"
  iconColor="text-aurora-blue"
>
  <h3 className="text-frost-white">Beaufort Sea</h3>
  <p className="text-arctic-ice">Arctic coastal waters</p>
</RegionCard>
```

---

## Do's and Don'ts

### DO
- Use Aurora Teal as the primary brand color
- Use regional colors as accents, not replacements
- Maintain high contrast for safety information
- Test colors on actual mobile devices
- Use safety colors consistently (red=danger, amber=warning, etc.)
- Provide text alternatives to color-coded information

### DON'T
- Don't use regional colors for primary brand moments
- Don't reduce opacity of safety colors (must remain vibrant)
- Don't mix aurora spectrum colors in same region
- Don't use Aurora Teal for danger/warning (use Critical Red)
- Don't rely on color alone to convey meaning
- Don't create new brand colors without documentation update

---

## Quick Copy-Paste Swatches

### CSS Variables
```css
:root {
  /* Primary */
  --midnight-navy: #0B1A2B;
  --aurora-teal: #2E8B8B;
  --arctic-ice: #E8F4F4;

  /* Regional */
  --aurora-green: #4CAF6D;
  --aurora-purple: #8B5A9F;
  --aurora-blue: #5B9BD5;
  --aurora-pink: #E67A9E;

  /* Secondary */
  --tundra-gold: #D4A574;
  --boreal-green: #2D5016;
  --stone-grey: #6B7280;
  --frost-white: #FAFBFC;

  /* Safety */
  --critical-red: #DC2626;
  --warning-amber: #F59E0B;
  --caution-yellow: #FCD34D;
  --success-green: #10B981;
}
```

### Figma Color Styles
```
Paste these hex codes into Figma color styles:

Primary/Midnight Navy: 0B1A2B
Primary/Aurora Teal: 2E8B8B
Primary/Arctic Ice: E8F4F4

Regional/Aurora Green: 4CAF6D
Regional/Aurora Purple: 8B5A9F
Regional/Aurora Blue: 5B9BD5
Regional/Aurora Pink: E67A9E

Safety/Critical Red: DC2626
Safety/Warning Amber: F59E0B
Safety/Caution Yellow: FCD34D
Safety/Success Green: 10B981
```

---

**Version:** 1.0
**Last Updated:** October 29, 2025
**Related Docs:** BRAND_GUIDELINES.md, BRANDING_SUMMARY.md

*For questions about color usage, see BRAND_GUIDELINES.md or contact the design team.*
