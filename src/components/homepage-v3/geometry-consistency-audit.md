# Circuit geometry consistency audit — 2026-09-09

Baseline: a90ef94839f6827c43dbcfe4c23bf9a7147afbfe.
Root cause: fitCircuit selected a viewport-dependent quarter-turn. The previous
uniform-distance test allowed rotations; it did not prove fixed orientation or
bounding aspect. No additional CSS stretch was found. CircuitField uses one SVG,
ResizeObserver dimensions and xMidYMid meet; its only layer transforms are depth
translations (0,6) and (0,12). Homepage passes outline and circuit key unchanged.

Fix: canonicalCircuit applies existing traceable source aspect and Y inversion
once, independent of viewport. fitCircuit only translates and uniformly scales.
No CSS, layout, production selector, Atlas registry or metadata changes.

Chromium actual React fixture: 5 circuits × 3 viewport sizes. Native scrollbars
consume 15 CSS pixels (e.g. 390 innerWidth, 375 visualViewport). This is not native
Mobile Safari emulation. Geometry includes centerline bounds below; visual padding
is separately checked (32 left/right/top, 48 bottom). All 15 cases: contained,
no field/content intersections, no horizontal overflow, visible header, unchanged
ordered closed topology. Browser DOM geometry uses float precision: relative
scale tolerance 1e-6, aspect tolerance 1e-6, normalized vertex tolerance 1e-6.
Pure helper tests use 1e-8. All checks passed.

## Raw and canonical source bounds (x, y, width, height)

- madrid: raw `{'x': 0.0005, 'y': 0, 'width': 0.9995, 'height': 0.999}` (aspect 1.000500501); canonical `{'x': 0.0003103681292211272, 'y': 0.0010000000000000009, 'width': 0.6204258903130332, 'height': 0.999}`.
- italy: raw `{'x': 0, 'y': 0, 'width': 1, 'height': 1}` (aspect 1.000000000); canonical `{'x': 0, 'y': 0, 'width': 0.5793860593878998, 'height': 1}`.
- japan: raw `{'x': 0.0006, 'y': 0, 'width': 0.9993, 'height': 0.9965}` (aspect 1.002809834); canonical `{'x': 0.001123832706506528, 'y': 0.0034999999999999476, 'width': 1.8717433726866224, 'height': 0.9965}`.
- monaco: raw `{'x': 0, 'y': 0.0015, 'width': 1, 'height': 0.9953000000000001}` (aspect 1.004722194); canonical `{'x': 0, 'y': 0.0031999999999999806, 'width': 0.7551333485058475, 'height': 0.9953000000000001}`.
- great-britain: raw `{'x': 0.0008, 'y': 0, 'width': 0.9992, 'height': 0.9988}` (aspect 1.000400481); canonical `{'x': 0.00047895970034542146, 'y': 0.0011999999999999789, 'width': 0.5982206657314314, 'height': 0.9988}`.

## Actual browser measurements

| Circuit | viewport | field W×H | fitted W×H | canonical aspect | final aspect | scaleX | scaleY |
|---|---|---|---|---|---|---|---|
| madrid | 390×844 | 327.000000 × 354.468750 | 170.457993 × 274.468750 | 0.621046937 | 0.621046996 | 274.743519 | 274.743493 |
| madrid | 844×390 | 307.796875 × 250.000000 | 105.578003 × 170.000000 | 0.621046937 | 0.621047076 | 170.170208 | 170.170170 |
| madrid | 1440×900 | 956.250000 × 414.000000 | 207.429688 × 334.000000 | 0.621046937 | 0.621046969 | 334.334351 | 334.334334 |
| italy | 390×844 | 327.000000 × 354.468750 | 159.023376 × 274.468750 | 0.579386059 | 0.579386092 | 274.468765 | 274.468750 |
| italy | 844×390 | 307.796875 × 250.000000 | 98.495605 × 170.000000 | 0.579386059 | 0.579385915 | 169.999957 | 170.000000 |
| italy | 1440×900 | 956.250000 × 414.000000 | 193.514923 × 334.000000 | 0.579386059 | 0.579385997 | 333.999964 | 334.000000 |
| japan | 390×844 | 327.000000 × 354.468750 | 263.000000 × 140.018921 | 1.878317484 | 1.878317575 | 140.510715 | 140.510708 |
| japan | 844×390 | 307.796875 × 250.000000 | 243.796875 × 129.795349 | 1.878317484 | 1.878317495 | 130.251229 | 130.251228 |
| japan | 1440×900 | 956.250000 × 414.000000 | 627.358032 × 334.000000 | 1.878317484 | 1.878317462 | 335.173102 | 335.173106 |
| monaco | 390×844 | 327.000000 × 354.468750 | 208.239243 × 274.468750 | 0.758699235 | 0.758699278 | 275.764861 | 275.764845 |
| monaco | 844×390 | 307.796875 × 250.000000 | 128.978882 × 170.000000 | 0.758699235 | 0.758699305 | 170.802789 | 170.802773 |
| monaco | 1440×900 | 956.250000 × 414.000000 | 253.405518 × 334.000000 | 0.758699235 | 0.758699154 | 335.577177 | 335.577213 |
| great-britain | 390×844 | 327.000000 × 354.468750 | 164.390137 × 274.468750 | 0.598939393 | 0.598939357 | 274.798492 | 274.798508 |
| great-britain | 844×390 | 307.796875 × 250.000000 | 101.819702 × 170.000000 | 0.598939393 | 0.598939424 | 170.204254 | 170.204245 |
| great-britain | 1440×900 | 956.250000 × 414.000000 | 200.045776 × 334.000000 | 0.598939393 | 0.598939450 | 334.401313 | 334.401282 |

All path screen CTM linear components: a=1, b=0, c=0, d=1. Thus no outer scale/skew/rotation. Maximum normalized point error: 1.849793380692688e-07.
