# Hallmark homepage preview

This branch is intentionally non-destructive.

- Current production homepage: `/`
- Hallmark comparison route: `/preview/hallmark-home`
- Existing `src/app/page.tsx`, `HomepageV3`, global CSS, data logic, Atlas rendering, and `MobileRaceDock` remain untouched.
- The preview keeps the LAPMETRY dark race-data identity while reducing decorative HUD layers, compressing the next-session area into telemetry, and using a simpler information hierarchy.

No production replacement is implied by this branch. The preview exists only for visual A/B evaluation before any selective migration.
