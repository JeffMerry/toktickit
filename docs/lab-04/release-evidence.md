# Lab 4 Release Evidence

Feature-branch verification on 2026-10-06 for `feature/24-lab4-final-verification` (commits `d7b4ef0`, `0c2c3fe`). This is **not** evidence that the final `lab4-staging` to `main` PR has been approved or merged.

## Test evidence

- Server tests: 17 files / 60 tests passed on an isolated PostgreSQL database. The test command uses one worker because integration suites share mutable fixtures.
- Client tests: 9 files / 20 tests passed; server and client production builds passed.
- Chromium browser regression: 7 journeys passed (4 Lab 3, 3 Lab 4).
- Fresh database migration passed; running the Lab 4 seed twice kept User/Ticket/Action Taken counts at `10/8/7`.
- Screenshot capture passed: 12 images, with no horizontal overflow at 1440, 768, and 320 px.

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

1. Open a PR from `feature/24-lab4-final-verification` to `lab4-staging` and obtain peer review.
2. After merge, rerun tests/builds on the actual `lab4-staging` head and record the commit and outputs in [tests.md](tests.md).
3. Review keyboard navigation/focus and the remaining browser scenarios called out as partial in the test matrix.
4. Open the final `lab4-staging` to `main` PR, obtain approval, and merge only after checks pass.
