# Design — LAPMETRY

A locked design system for LAPMETRY. Data pages share a brand grammar, but each route is structured around its own professional task.

## Genre

Atmospheric, technical and austere. Atmosphere stays in the background; data remains the highest-contrast layer.

## Macrostructure family

- Immersive pages: existing bespoke structures remain protected.
- Data pages: Workbench family. Results = classification sheet; Race Control = event log; Lap Analysis = comparison workbench; Weather = instrument board; Standings = championship ladder; Drivers = paddock roster; Race Weekend = navigation map.
- Content pages: Long Document. Project is a release journal, not a dashboard.

## Theme

- Paper: deep blue-black, `oklch(11% 0.014 255)`.
- Ink: cold white, `oklch(94% 0.012 82)`.
- Accent: restrained champagne gold, `oklch(73% 0.115 78)`, limited to active selection and decisive values.
- Focus: cyan, `oklch(76% 0.13 210)`.
- Status colours are semantic only: positive, warning and danger.

## Typography

- Display: condensed system sans, weight 700, upright.
- Body: neutral system sans, weight 400–600.
- Mono: system monospace for times, positions, codes and identifiers.
- Labels describe data roles; decorative eyebrows are not used on data pages.

## Spacing

4-point named scale in `tokens.css`. Data density may increase, but touch targets remain at least 44px.

## Motion

- No blanket page reveals.
- Hover changes use colour only; pressed controls may move by 1px.
- Data refresh does not pulse continuously.
- Reduced motion collapses spatial changes to an opacity change under 150ms.

## Microinteractions stance

- Native controls where possible.
- Visible `:focus-visible` ring on every control.
- Status changes are quiet and textual; no celebratory effects.
- Loading, unavailable and stale are distinct product states.

## What pages must share

- Edge-aligned LAPMETRY navigation and the same route taxonomy.
- On mobile, route navigation is an explicit menu action; it never occupies the data canvas by default.
- Token palette, type roles, status wording and focus treatment.
- Honest source labels. `LIVE`, `AUTO REFRESH` and pulsing green are reserved for a verified live feed.
- Hairline dividers and mostly square data surfaces; rounded containers are not the default section language.
- A top-level data route starts with its task and context, not a return action or an internal implementation explanation.

## What pages may differ on

- Information structure, density, table behaviour and dominant visual primitive.
- Accent use by task: gold for classification, red/amber for race control, cyan for weather.
- Content pages may use longer measure and larger vertical rhythm.

## Verification stamp

| Gate | Result |
| --- | --- |
| Pre-emit critique | P5 · H5 · E5 · S5 · R5 · V5 |
| Slop test | PASS · 58/58 gates |
| Mobile contract | PASS · 320 / 375 / 414 / 768 CSS px rules audited |
| Data honesty | PASS · no simulated live, standings or race-weekend fallback rows |

## Exports

### tokens.css

The canonical source is `tokens.css` at the repository root.

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(11% 0.014 255);
  --color-paper-2: oklch(15% 0.018 255);
  --color-paper-3: oklch(19% 0.021 255);
  --color-ink: oklch(94% 0.012 82);
  --color-muted: oklch(61% 0.018 255);
  --color-rule: oklch(28% 0.022 255);
  --color-accent: oklch(73% 0.115 78);
  --color-focus: oklch(76% 0.13 210);
  --font-display: "Arial Narrow", "Aptos Display", "Noto Sans SC Variable", sans-serif;
  --font-body: Inter, "Noto Sans SC Variable", system-ui, sans-serif;
  --font-outlier: "SFMono-Regular", Consolas, "Noto Sans SC Variable", monospace;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(11% 0.014 255)", "$type": "color" },
    "ink": { "$value": "oklch(94% 0.012 82)", "$type": "color" },
    "accent": { "$value": "oklch(73% 0.115 78)", "$type": "color" },
    "focus": { "$value": "oklch(76% 0.13 210)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Arial Narrow, Aptos Display, Noto Sans SC Variable, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Inter, Noto Sans SC Variable, system-ui, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "SFMono-Regular, Consolas, Noto Sans SC Variable, monospace", "$type": "fontFamily" }
  },
  "space": {
    "sm": { "$value": "1rem", "$type": "dimension" },
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "lg": { "$value": "2rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 11% 0.014 255;
  --foreground: 94% 0.012 82;
  --card: 15% 0.018 255;
  --card-foreground: 94% 0.012 82;
  --primary: 73% 0.115 78;
  --primary-foreground: 12% 0.02 78;
  --muted: 28% 0.022 255;
  --muted-foreground: 61% 0.018 255;
  --border: 28% 0.022 255;
  --input: 28% 0.022 255;
  --ring: 76% 0.13 210;
  --radius: 0.75rem;
}
```
