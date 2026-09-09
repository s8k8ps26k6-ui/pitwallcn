# Homepage recovery QA — 2026-09-09

## Browser evidence

Chromium live React fixture (actual HomepageV3, CircuitField, ResizeObserver and
CSS; only navigation wrappers substituted). Production selector is not imported
or modified by the fixture. Generated fixture output is excluded from the commit.

Madrid, Monza, Suzuka, Monaco and Silverstone were checked at every size:
390×844, 414×896, 844×390, 812×375, 1440×900, 320×740 and 375×812.
35 combinations: complete geometry with stroke/shadow budget, no circuit-field
intersection with identity/header/metrics/session/season, no horizontal overflow.
Dynamic previous/current/next rounds and navigation are present.

Both landscape sizes: Header display:flex, visibility:visible, opacity:1, top=4px
at scrollY=0. Frame resize portrait→landscape→portrait also retained Header.
This is actual component runtime testing, not a static DOM screenshot, but it is
NOT native mobile-device rotation or browser-chrome emulation. Desktop scrollbars
can reduce visualViewport width relative to iframe innerWidth.

Additional runtime checks: empty outline, missing metrics and long title at
320×740 and 844×390; 200% root font at 320×740, 390×844, 812×375 and 1440×900.
All retain circuit containment and non-overlapping structural areas. Height may
grow naturally; the season continuation can be below the initial portrait fold.

## Limits

UNRESOLVED — REAL MOBILE LANDSCAPE VERIFICATION REQUIRED

The earlier phone screenshot's missing Header cause was not reproducible with
the available browser. No speculative fixed-position/z-index/display patch was
added. Safari/WebKit, Windows Edge, physical safe-area insets and Safari chrome
expanded/collapsed remain unverified. SVG flags remove the emoji dependency but
cross-platform visual parity still needs device testing. Reduced-motion is
checked at stylesheet level; native OS media emulation is unavailable.

The available browser cannot open a Vercel preview for deployment QA. Preview
commit association must be checked through GitHub deployment/status records;
the screenshots represent this checkout's live component fixture.

## Reproduce fixture

```sh
node src/components/homepage-v3/__fixtures__/build.mjs
```

Use the existing supervised development preview and open
`/homepage-fixture/index.html`. Select events/sizes using the visible controls,
click Check layout for measured rectangles, and use Rotate without reload to
exercise ResizeObserver. Remove generated `public/homepage-fixture` before build,
lint or commit. No fixture route is added to the production app.

## Engineering gates

Run `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test:unit`,
`node --test scripts/homepage-recovery.test.mjs`, and `git diff --check`.
Homepage unit coverage includes five geometries and seven field sizes, uniform
scale, visual padding, rigid rotation, invalid geometry, all season countries,
unknown-country fallback, partial/invalid metrics, dynamic rounds and the
unchanged production event selector.
