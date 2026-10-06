# Lab 4 Release Evidence

Feature-branch verification was completed on 2026-10-06 for `feature/24-lab4-final-verification` (commits `d7b4ef0`, `0c2c3fe`). Integrated verification was then completed on `lab4-staging` source commit `4ac723d54ccf3478d1a378de6c7e497188515c12`. This is **not** evidence that the final `lab4-staging` to `main` PR has been approved or merged.

## Test evidence

- Server tests: 17 files / 60 tests passed on an isolated PostgreSQL database. The test command uses one worker because integration suites share mutable fixtures.
- Client tests: 9 files / 20 tests passed; server and client production builds passed.
- Chromium browser regression: 7 journeys passed (4 Lab 3, 3 Lab 4).
- Fresh database migration passed; running the Lab 4 seed twice kept User/Ticket/Action Taken counts at `10/8/7`.
- Screenshot capture passed: 12 images, with no horizontal overflow at 1440, 768, and 320 px.

On the integrated staging commit, a separate empty PostgreSQL database accepted all 7 migrations; two seed runs kept User/Ticket/Action Taken counts at `10/8/7`. Server tests passed 17 files / 60 tests, client tests passed 9 files / 20 tests, both production builds passed, and the reseeded Chromium E2E suite passed 7/7 journeys. The screenshots above were captured on the feature branch and were not recaptured for this staging run.

On the focus-fix code later committed as `3ec883c`, the Lab 4 SQL migrations preserved synthetic populated Lab 3 records and relationships. A newly added Chromium keyboard-focus check exposed missing focus movement in the Actions Taken panels and focus loss after save caused by a full parent-detail refresh. After focus management and an in-place refresh fix, client tests and build passed, and the full browser suite passed 8/8 journeys, including open/Cancel/Save/status focus checks. The developer reported that a manual local-browser keyboard/focus review of Dashboard and Actions Taken passed on 2026-10-06; no screenshot was supplied. Migration of a real Lab 3 database snapshot remains pending.

See [tests.md](tests.md) for commands, traceability, and untested portions.

## Screenshot index

Each row links to desktop, tablet, and mobile captures, in that order.

| View | 1440 px | 768 px | 320 px |
| :--- | :--- | :--- | :--- |
| Requester dashboard | [Desktop](../../artifacts/lab-04/screenshots/requester-dashboard-desktop.png) | [Tablet](../../artifacts/lab-04/screenshots/requester-dashboard-tablet.png) | [Mobile](../../artifacts/lab-04/screenshots/requester-dashboard-mobile.png) |
| Requester Actions Taken (read-only) | [Desktop](../../artifacts/lab-04/screenshots/requester-actions-read-only-desktop.png) | [Tablet](../../artifacts/lab-04/screenshots/requester-actions-read-only-tablet.png) | [Mobile](../../artifacts/lab-04/screenshots/requester-actions-read-only-mobile.png) |
| IT Staff dashboard | [Desktop](../../artifacts/lab-04/screenshots/staff-dashboard-desktop.png) | [Tablet](../../artifacts/lab-04/screenshots/staff-dashboard-tablet.png) | [Mobile](../../artifacts/lab-04/screenshots/staff-dashboard-mobile.png) |
| IT Staff Actions Taken (operational) | [Desktop](../../artifacts/lab-04/screenshots/staff-actions-operational-desktop.png) | [Tablet](../../artifacts/lab-04/screenshots/staff-actions-operational-tablet.png) | [Mobile](../../artifacts/lab-04/screenshots/staff-actions-operational-mobile.png) |

The screenshots use seeded demonstration accounts only. They are recreated with `npm run capture:lab4-evidence` after selecting the intended disposable database. Capture on the regular local database is discouraged because the login flow changes seed passwords.

## Before final release

1. If a real pre-Lab-4 database snapshot is available, test migration on a recoverable copy; the synthetic fixture check does not prove every historical data shape.
2. Review the remaining browser scenarios called out as partial in the test matrix; the developer-reported manual keyboard/focus check is recorded above.
3. Open the final `lab4-staging` to `main` PR, obtain approval, and merge after the required checks pass.
4. After merging, record verification on the actual `main` commit in [tests.md](tests.md).
