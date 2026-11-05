# QA results

| Command | Result |
| --- | --- |
| npm run build | PASS, production compile and route generation |
| npm run typecheck | PASS |
| npm run lint | PASS |
| npm run test:unit | PASS, 26/26 |
| npm run test:e2e -- --max-failures=1 | BLOCKED, Playwright Chromium executable absent; first launch fails, 45 tests not run |
| git diff --check | PASS |

Final logs are alongside this file. An earlier full E2E invocation also could not launch any of its 42 tests. The final run includes 4 newly added prototype cases (46 total). Browser-launch failure is not a passed test or a verified product regression.

Browser: cloud Chromium, desktop viewport 1363×936. WebGL unavailable (`GL_RENDERER = Disabled`). Mobile screenshots are 390×844 and 430×932 CSS containers, not Safari/device tests.

Observed interactions: button collapsed→partial; pointer handle drag partial→full; keyboard ArrowUp partial→full; event picker Japan→SUZUKA with 5.807km / 53 laps; selecting from full lowers sheet to partial; page root and window scroll remain zero after the overflow-clip fix.

Not validated: live Canvas continuity, GPU resources, first frame, node hit testing, globe visibility, real touch conflict, iOS safe area, Safari/WebKit.
