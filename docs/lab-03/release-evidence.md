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

## Verification on Merged `main`

- Release Pull Request: [#39](https://github.com/JeffMerry/toktickit/pull/39), approved by THN4 and merged on 2026-09-19
- Reviewed source commit: `f2c9976` (`lab3-staging`)
- Merged `main` commit verified: `79807cd`
- Verification date: 2026-09-20 (Asia/Bangkok)
- Verification branch: `docs/lab3-final-submission`, created directly from `79807cd` with no application code changes
- Seed: Pass before the server/client checks and again immediately before E2E
- Server production build: Pass; server suite: Pass - 14 files, 48 tests
- Client production build: Pass; client suite: Pass - 6 files, 9 tests
- Playwright E2E: Pass - 4 Chromium role journeys in 27.6 seconds

The exact commands and observed summaries are in [tests.md](tests.md). Existing
screenshots were captured before the merge and are included unchanged in the
merged `main` commit. The `Planned` Requester resolution-indication action/API
coverage, migration regression, and keyboard/focus coverage in the test plan
are still pending; these passing results do not claim that coverage.

## Merged Feature Evidence

| Feature | Issue | Pull Request | Merge target | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| Specification and test plan | #11 | [#26](https://github.com/JeffMerry/toktickit/pull/26) | `lab3-staging` | Merged |
| User database | #12 | [#28](https://github.com/JeffMerry/toktickit/pull/28) | `lab3-staging` | Merged |
| Authentication and role shell | #13 | [#30](https://github.com/JeffMerry/toktickit/pull/30) | `lab3-staging` | Merged |
| Staff Ticket Workflow | #31 | [#32](https://github.com/JeffMerry/toktickit/pull/32) | `lab3-staging` | Merged |
| User Management | #33 | [#35](https://github.com/JeffMerry/toktickit/pull/35) | `lab3-staging` | Merged |
| Release integration documentation | #34 | [#36](https://github.com/JeffMerry/toktickit/pull/36) | `lab3-staging` | Merged |
| Final automated and visual evidence | #34 | [#37](https://github.com/JeffMerry/toktickit/pull/37) | `lab3-staging` | Merged |
| Reviewer and AI-use records | #34 | [#38](https://github.com/JeffMerry/toktickit/pull/38) | `lab3-staging` | Merged |
| Final Lab 3 release | #34 | [#39](https://github.com/JeffMerry/toktickit/pull/39) | `main` | Approved and merged |

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

## Final Submission Follow-up

1. Include this release record, the [reviewer record](reviewer.md), and readable
   screenshots in the single PDF organized as `Answer Part 1` through
   `Answer Part 9`.
2. Attach the complete passing console output from the merged `main` check to
   the submission evidence. Preserve the `Planned` entries in `tests.md` until
   the corresponding checks are implemented and executed.
3. Confirm the final GitHub Project/Kanban Issue statuses independently; they
   are not established by the local build and test runs.
