# Homepage geometry provenance

Atlas outline coordinates are independently normalized against longitude and
latitude bounds. Applying `preserveAspectRatio` alone cannot recover their aspect.
The old renderer then mapped X and Y independently into page-specific rectangles.

`geometry-metadata.json` is generated from the MIT-licensed bacinger/f1-circuits
GeoJSON at immutable commit `394d8fbe70ef2c0b0c8d23ff7bee61fa09606055`.
All 22 current-season outlines matched source vertices with maximum normalized
error < 0.000071. Matching is geometric, not a manually maintained name map.
Longitude extent is corrected by cosine of mean latitude (local equirectangular
projection). This recovers traceable approximate ground-plane aspect, not a survey
or elevation model. Existing simplified vertices are retained.

Regenerate from repository root:

```sh
node src/components/homepage-v3/generate-geometry.mjs 394d8fbe70ef2c0b0c8d23ff7bee61fa09606055
```

The generator prints JSON for review; replace the local metadata with its output.
It does not read or write race metrics. No runtime network requests are added.
Unknown future geometry uses normalized shape without pretending its real aspect
is known; add verified generator output when the source becomes available.

The renderer applies the source aspect once, then a **single uniform scale** into
the available viewport. Stroke, depth and bounded Gaussian shadow are included
in visual padding. Every layout uses the same fitting function and SVG.

In wide fields only, the helper chooses a rigid quarter-turn when it improves
uniform scale by more than 10%. This is a geometry/viewport calculation shared by
all events, not manually assigned track rotations. It preserves lengths, angles
and aspect; portrait uses the source north-up orientation.
