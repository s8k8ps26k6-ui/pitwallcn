# Third-party sources and rights review

LAPMETRY is unofficial, independent fan software. The [MIT License](LICENSE) applies only to source code and documentation whose copyright is held by the LAPMETRY maintainer(s) or duly licensed to LAPMETRY under MIT. **Third-party images, textures, datasets, fonts, trademarks and independently licensed dependencies are excluded from that license grant** and remain subject to their owners' rights and terms. This inventory does not itself grant rights to reuse, relicense, distribute or imply endorsement of external content.

## Documented inputs

| Material | Reference in the repository | Source / further rights checks |
| --- | --- | --- |
| NASA Blue Marble day imagery | `public/atlas-v2/earth-day.png`, `public/atlas-v2/earth-day-8192.png` | See `public/atlas-v2/SOURCES.md` and NASA media usage guidance |
| NASA Earth Observatory night lights | `public/atlas-v2/earth-night.jpg` | See `public/atlas-v2/SOURCES.md` |
| NASA cloud imagery | `public/atlas-v2/earth-clouds.jpg` | See `public/atlas-v2/SOURCES.md` |
| Natural Earth geography | `src/lib/atlas/europe-50m.json` | Natural Earth 1:50m, noted as public domain in `public/atlas-v2/SOURCES.md` |
| Race-session data | API integration in `src/lib/` | OpenF1 and any upstream data terms, attribution and quotas must be observed |
| Formula 1 event/calendar references | `src/lib/atlas/`, `src/lib/race-calendar.ts` | Names, trademarks, schedule sources and data rights require separate review |

Original source URLs and the sources already recorded for the Atlas are in [public/atlas-v2/SOURCES.md](public/atlas-v2/SOURCES.md).

## Original project photography — not MIT licensed

On 2026-10-21, the repository maintainer confirmed that the following three photographs were **personally taken by them**:

- `public/images/driver-redbull.jpg`
- `public/images/feature-ferrari.jpg`
- `public/images/hero.jpg`

**Photo copyright:** © the LAPMETRY repository maintainer / photographer. **All rights reserved.** These photos are made available for display as part of the LAPMETRY website, but the project's MIT software license **does not** grant third parties permission to copy, redistribute, sell, modify or separately use these photos. Contact the copyright holder for permission before reusing them.

This authorship record is based on the maintainer's declaration, not an independent verification of original files or metadata. Ownership of the photography does not necessarily grant rights to third-party logos, event footage, trademarks, artwork, or recognizable individuals depicted in a photo. Any event, venue and commercial-use restrictions still apply where relevant.

For an independently distributable version of the website, either obtain permission to redistribute these photos or replace them with redistributable assets. Their presence in a publicly accessible repository is not itself an invitation to republish them.

## External dependencies

JavaScript packages, type declarations and any externally sourced fonts remain under their respective licenses. Use the package lock and dependency license inventory to verify conditions when releasing or redistributing bundles.

## Status and outstanding rights review

- [x] Repository owner approved MIT for original source code; standard LICENSE added on the OSS readiness branch.
- [x] Third-party graphics, photographs, textures, data and other materials explicitly excluded from the project's original-code MIT grant.
- [x] Record maintainer's authorship declaration for three `public/images` photographs; keep photography outside MIT under separate all-rights-reserved terms.
- [ ] Obtain additional permission (or replace images) before third parties redistribute the photography as part of a bundled application.
- [ ] Review NASA media usage guidance, data-provider attribution, trade dress and logo use.
- [ ] Verify notices and redistribution permissions for any additional third-party materials.
- [ ] Merge reviewed changes into the default branch and verify GitHub's license identification.

An MIT license for original code does **not** mean that all repository assets can be freely reused, nor that an external bundled release has passed rights review.
