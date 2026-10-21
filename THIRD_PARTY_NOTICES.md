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

## Assets with provenance requiring confirmation

The following tracked images do not have a matching source/usage-rights record identified during this repository pass:

- `public/images/driver-redbull.jpg`
- `public/images/feature-ferrari.jpg`
- `public/images/hero.jpg`

**These three photographs are NOT covered by the project's MIT grant.** Ownership and redistribution rights have not been established. Do not redistribute them based on the repository LICENSE. Locate the original creators and usage terms; document actual permissions or replace/remove these assets before distributing a complete application bundle that includes them.

## External dependencies

JavaScript packages, type declarations and any externally sourced fonts remain under their respective licenses. Use the package lock and dependency license inventory to verify conditions when releasing or redistributing bundles.

## Status and outstanding rights review

- [x] Repository owner approved MIT for original source code; standard LICENSE added on the OSS readiness branch.
- [x] Third-party graphics, photographs, textures, data and other materials explicitly excluded from the project's original-code MIT grant.
- [ ] Confirm rights for the three listed `public/images` photographs before redistributing them in a bundle.
- [ ] Review NASA media usage guidance, data-provider attribution, trade dress and logo use.
- [ ] Verify notices and redistribution permissions for any additional third-party materials.
- [ ] Merge reviewed changes into the default branch and verify GitHub's license identification.

An MIT license for original code does **not** mean that all repository assets can be freely reused, nor that an external bundled release has passed rights review.
