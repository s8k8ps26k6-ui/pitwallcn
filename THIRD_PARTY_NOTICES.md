# Third-party sources and rights review

LAPMETRY is unofficial, independent fan software. This inventory is for maintainer review; it does **not** itself grant rights to reuse, relicense, distribute or imply endorsement of external content.

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

**Do not assume these photographs are owned by the maintainer or redistributable.** Locate their originals, confirm the creator and license, and either document permission/attribution, substitute owned or appropriately licensed imagery, or remove them before publishing an open-source license that could appear to cover them.

## External dependencies

JavaScript packages, type declarations and any externally sourced fonts remain under their respective licenses. Use the package lock and dependency license inventory to verify conditions when releasing or redistributing bundles.

## Required before open-source licensing

- [ ] Choose and approve an OSI-recognized code license as repository owner.
- [ ] Decide and document whether graphics, photographs and other assets have separate terms or are excluded.
- [ ] Confirm rights for the three listed `public/images` photographs.
- [ ] Review NASA media usage rules, provider attribution, trade dress and logo use.
- [ ] Verify all notices and permissions are compatible with planned redistribution.

Do not represent this repository as fully open source until these decisions are made and the license is merged to the default branch.
