# Lab 3 Release Evidence

## Integrated Verification

- Integrated source commit tested: `8bd18a9` (`lab3-staging`)
- Test date: 2026-09-17 (Asia/Bangkok)
- Server production build: Pass
- Server automated suite: Pass — 14 files, 48 tests
- Client production build: Pass
- Client automated suite: Pass — 6 files, 9 tests

The exact commands and results are recorded in [tests.md](tests.md). No failing automated test was skipped or hidden in this run.

## Final Release-Candidate Verification

- Release-candidate commit tested: `a51b474` (`feature/17-lab3-final-evidence`)
- Test date: 2026-09-18 (Asia/Bangkok)
- Seeded local fixtures before server/client verification and again before E2E
- Server build: Pass; server suite: Pass — 14 files, 48 tests
- Client build: Pass; client suite: Pass — 6 files, 9 tests
- Playwright E2E: Pass — 4 Chromium role-journey tests in 21.1 seconds

The E2E suite intentionally creates local test data and changes seeded
temporary passwords. It is therefore run last, after the clean server/client
verification. A separate Chromium capture run was performed from a freshly
seeded local database; its real UI screenshots are listed below.

After the capture-tool separation, `npm run test:e2e` was repeated from a
fresh seed on 2026-09-18 and passed all 4 regression journeys in 23.4 seconds.

Review follow-up verification ran on 2026-09-19 after adding Staff Ticket
Detail tablet and mobile evidence: `npm run capture:lab3-evidence` passed its
single capture flow in 12.4 seconds, and `npm run test:e2e` passed all 4
regression journeys in 18.9 seconds from a freshly seeded database.

## Merged Feature Evidence

| Feature | Issue | Pull Request | Merge target | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| Specification and test plan | #11 | [#26](https://github.com/JeffMerry/toktickit/pull/26) | `lab3-staging` | Merged |
| User database | #12 | [#28](https://github.com/JeffMerry/toktickit/pull/28) | `lab3-staging` | Merged |
| Authentication and role shell | #13 | [#30](https://github.com/JeffMerry/toktickit/pull/30) | `lab3-staging` | Merged |
| Staff Ticket Workflow | #31 | [#32](https://github.com/JeffMerry/toktickit/pull/32) | `lab3-staging` | Merged |
| User Management | #33 | [#35](https://github.com/JeffMerry/toktickit/pull/35) | `lab3-staging` | Merged |

Detailed review comments, responses, and outcomes are recorded in [reviewer.md](reviewer.md).

## Final Screenshot and Accessibility Evidence

Captured on 2026-09-18 (Asia/Bangkok) with `npm run capture:lab3-evidence`
against the local Chromium application. The command is deliberately separate
from the regression E2E suite and writes the images below under
`artifacts/lab-03/screenshots/`.

| Screen / scenario | Desktop | Tablet | Mobile | Keyboard / feedback check | Evidence location | Status |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| Login and invalid-sign-in message | Captured | Captured | Captured | Labels, focus, safe error | `authentication/login-invalid-{desktop,tablet,mobile}.png` | Captured; keyboard review remains manual |
| Mandatory password change | Captured | Optional | Captured | Focus order, blocked navigation | `authentication/change-password-{desktop,mobile}.png` | Captured; keyboard review remains manual |
| Requester Ticket detail and comments | Captured | Optional | Captured | No Internal Notes shown | `requester-ticket-detail/requester-detail-{desktop,mobile}.png` | Captured; keyboard review remains manual |
| Staff Queue and Ticket workflow | Captured | Captured | Captured | Queue filters, badges, controls | `staff-queue/queue-{desktop,tablet,mobile}.png`, `staff-ticket-detail/staff-detail-{desktop,tablet,mobile}.png` | Captured; keyboard review remains manual |
| Administrator User Management | Captured | Optional | Captured | Form labels, safety conflict, no overflow | `user-management/users-{desktop,mobile}.png` | Captured; keyboard review remains manual |

## Release PR Gate

Before opening `lab3-staging` to `main`:

1. Pull the current `lab3-staging` tip and re-run every build/test command in `tests.md`, including `npm run test:e2e` after explicitly seeding the intended local test database.
2. Replace the tested SHA above with that release-candidate SHA if application code changed.
3. Capture the manual evidence in the matrix and link it in the PR.
4. Complete the Release Pull Request table in `reviewer.md` after the PR exists and receives peer review.
5. Leave an unresolved item visible in the PR if a required check cannot run; do not mark it as passing without evidence.
