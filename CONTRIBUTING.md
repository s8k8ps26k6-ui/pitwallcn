# Contributing to LAPMETRY

Thanks for your interest in LAPMETRY. This is an independently maintained, unofficial motorsport data and visualization project. Contributions should improve data integrity, usability, performance, accessibility, or documentation rather than create artificial engagement.

> **Licensing status:** The maintainer has not yet selected an open-source license for this repository. A public GitHub repository is not automatically open source. Please discuss substantial external code contributions in an issue **before** submitting them; no permission beyond GitHub's standard platform terms is implied until a license is adopted.

## Before opening a pull request

1. Check existing issues and pull requests for overlapping work.
2. For larger changes, open an issue stating the problem, a proposed approach, affected routes, and known trade-offs.
3. Keep changes focused. Avoid unrelated visual redesigns, API changes, or dependency updates.
4. Never commit secrets, access tokens, real credentials, personal information, or third-party assets without redistribution rights.
5. Respect the project's source attribution and the trademarks of Formula 1, FIA, their teams and drivers.

## Development

- Use a current Node.js 22 LTS environment and npm.
- Install pinned dependencies with `npm ci`.
- Copy `.env.example` to `.env.local` only if you need environment overrides.
- Start locally with `npm run dev`.

Suggested validation:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Browser tests are available with:

```bash
npm run test:e2e:install
npm run test:e2e
```

These commands describe expected checks, not a claim that all branches currently pass them.

## Pull request checklist

- Explain **why** the change is needed, not just what changed.
- Link a related issue when one exists.
- State which checks were run and their actual results; do not mark unrun checks as passed.
- For UI work, attach genuine before/after screenshots, including mobile behavior where relevant.
- For data work, document sources, caching choices, error states, and whether data is live, delayed, static or mocked.
- Document breaking changes and new configuration requirements.
- Identify any third-party code, fonts, images, maps, datasets or trademarks that need independent rights review.

The maintainer may ask for revisions or decline work that conflicts with the project's product direction. Reviews and merge decisions are made on technical merit, not Star counts.
