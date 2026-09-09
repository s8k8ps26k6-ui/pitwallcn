# Post-geometry composition refinement

Baseline: 590317ef8c1440378350fa1ecad932dc8f37c896.

Desktop circuit spans the identity and details rows, recovering vertical room.
The title and session share an axis beside it. A bounded 700px maximum field
width keeps tall geometry close to the information; every circuit still uses
the unchanged canonical geometry and uniform fit. Season spacing is tightened.
Landscape uses a compact 32px header and smaller row gaps, reserving more height
and width for the central field. Portrait styles are unchanged.

Wide-screen connectors sample the already fitted SVG centerline to approach the
session from its nearest point. They do not change the renderer or geometry.
Existing ResizeObserver/MutationObserver updates are retained.

Chromium React fixture QA: all 20 combinations below passed containment,
field/content separation, header presence and no horizontal overflow. Canonical
aspect, ordered topology and normalized vertices remain invariant (browser
floating-point tolerance 1e-6). Native Safari not tested in this environment.

Madrid/Monza desktop centerline height grows from 334 to 620px (1.856x linear,
3.446x bounding area). Madrid 844x390 grows from 170 to 220px (1.294x linear,
1.675x bounding area). These quantify scale, not a perceptual approval claim.

| Circuit | viewport | fitted W×H | canonical aspect | final aspect | scaleX | scaleY |
|---|---|---|---|---|---|---|
| madrid | 390×844 | 170.458×274.469 | 0.621047 | 0.621047 | 274.743519 | 274.743493 |
| madrid | 844×390 | 136.630×220.000 | 0.621047 | 0.621047 | 220.220243 | 220.220220 |
| madrid | 812×375 | 127.315×205.000 | 0.621047 | 0.621047 | 205.205228 | 205.205205 |
| madrid | 1440×900 | 385.049×620.000 | 0.621047 | 0.621047 | 620.620574 | 620.620621 |
| italy | 390×844 | 159.023×274.469 | 0.579386 | 0.579386 | 274.468765 | 274.468750 |
| italy | 844×390 | 127.465×220.000 | 0.579386 | 0.579386 | 220.000057 | 220.000000 |
| italy | 812×375 | 118.774×205.000 | 0.579386 | 0.579386 | 205.000048 | 205.000000 |
| italy | 1440×900 | 359.219×620.000 | 0.579386 | 0.579386 | 620.000006 | 620.000000 |
| japan | 390×844 | 263.000×140.019 | 1.878317 | 1.878318 | 140.510715 | 140.510708 |
| japan | 844×390 | 285.656×152.081 | 1.878317 | 1.878317 | 152.615072 | 152.615085 |
| japan | 812×375 | 270.953×144.253 | 1.878317 | 1.878317 | 144.759762 | 144.759772 |
| japan | 1440×900 | 636.000×338.601 | 1.878317 | 1.878318 | 339.790171 | 339.790126 |
| monaco | 390×844 | 208.239×274.469 | 0.758699 | 0.758699 | 275.764861 | 275.764845 |
| monaco | 844×390 | 166.914×220.000 | 0.758699 | 0.758699 | 221.038865 | 221.038883 |
| monaco | 812×375 | 155.533×205.000 | 0.758699 | 0.758699 | 205.968066 | 205.968050 |
| monaco | 1440×900 | 470.394×620.000 | 0.758699 | 0.758699 | 622.927799 | 622.927760 |
| great-britain | 390×844 | 164.390×274.469 | 0.598939 | 0.598939 | 274.798492 | 274.798508 |
| great-britain | 844×390 | 131.767×220.000 | 0.598939 | 0.598939 | 220.264311 | 220.264317 |
| great-britain | 812×375 | 122.783×205.000 | 0.598939 | 0.598939 | 205.246324 | 205.246296 |
| great-britain | 1440×900 | 371.342×620.000 | 0.598939 | 0.598939 | 620.744866 | 620.744894 |
