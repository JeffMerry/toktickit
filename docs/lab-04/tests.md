# Lab 4 Test Plan and Traceability

> Status: Integrated `lab4-staging` verification was run on source commit `4ac723d54ccf3478d1a378de6c7e497188515c12` on 2026-10-06, followed by a keyboard-focus fix committed as `3ec883c` and a regression rerun on that code. A `Passed` row means the named check ran locally; `Not run separately` means the scenario is covered elsewhere or still needs the stated dedicated check. The developer reported that the manual keyboard/focus check passed on 2026-10-06. A real Lab 3 database snapshot migration and final `main` verification remain pending.

## 1. Test Strategy

Lab 4 uses unit, API/integration, client component, responsive/accessibility, migration/regression, performance-smoke, and Playwright end-to-end tests. API tests exercise backend authorization directly; hiding a UI control is never accepted as authorization proof. The final release run seeds the intended local database before tests that require fixtures and records the tested commit, date, command, and result.

The planned paths follow the current repository layout: server API tests are under `server/tests/api/`, client component tests are colocated under `client/src/components/`, and browser journeys are under `e2e/lab-04/`.

## 2. Planned Test Commands

```powershell
# Seed documented local demonstration data
npm --prefix server run db:seed

# Server unit and API/integration suites
npm --prefix server test
npm --prefix server run build

# Client component suite and production build
npm --prefix client test
npm --prefix client run build

# Lab 4 browser journeys
npm run test:e2e
```

The final E2E command is run after an explicit seed because browser flows change passwords and create or update test data. Migration regression runs only against a disposable database or a recoverable snapshot.

## 3. Test Matrix

| Test ID | Type | Requirement / AC | Scenario | Expected result | Planned test file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-01 | Unit | BR-04 to BR-08 | Validate Action Taken date, text limits, conditional follow-up note, assignment, and lifecycle transitions | Invalid input has deterministic validation errors | No separate unit file; `server/tests/api/lab4ActionsTaken.api.test.ts` | Covered by API tests; separate unit test not added |
| UNIT-02 | Unit | BR-09 to BR-13 | Evaluate final status transition and resolution gate | Only approved transitions and qualified resolutions are allowed | `server/tests/unit/ticketWorkflow.test.ts` and `server/tests/api/lab4TicketWorkflow.api.test.ts` | Passed locally |
| UNIT-03 | Unit | BR-17 to BR-19 | Calculate dashboard status, open, urgent, and ordering rules | Counts and ordering match documented rules | `server/tests/api/lab4Dashboards.api.test.ts` | Covered by API tests; separate unit test not added |
| API-ACT-01 | API | FR-01 to FR-04, AC-01 | Operational user creates, assigns, starts, completes, and cancels Actions Taken | Correct Ticket relation, session-derived creator/performer, and lifecycle state | `server/tests/api/lab4ActionsTaken.api.test.ts` | Passed locally (5-test suite) |
| API-ACT-02 | API | BR-05, BR-06, AC-02 | Missing Result or required Follow-up Note | Validation error; no invalid Action saved | `server/tests/api/lab4ActionsTaken.api.test.ts` | Passed locally |
| API-ACT-03 | API | FR-05, BR-08, AC-03 | Requester reads own/non-owned Action Taken and attempts writes | Own read allowed; non-owned read and all writes denied | `server/tests/api/lab4ActionsTaken.api.test.ts` | Passed locally |
| API-ACT-04 | API | BR-03, BR-07 to BR-09, AC-04 | Client supplies performer, inactive assignee, invalid lifecycle edge, or stale update timestamp | Actor is ignored/rejected; invalid assignment/edge fails; stale edit returns `409` | `server/tests/api/lab4ActionsTaken.api.test.ts` | Passed for covered cases; see source for individual assertions |
| API-WF-01 | API | FR-06, AC-05 | Attempt valid and invalid status transitions | Backend matrix is enforced | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Passed locally (4-test suite) |
| API-WF-02 | API | FR-07, BR-11 to BR-13, AC-05 | Resolve without owner, confirmation, or qualifying Action Taken | Validation error; Ticket status unchanged | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Passed locally |
| API-WF-03 | API | FR-08, AC-06 | Requester posts resolution indication repeatedly | Timestamp is recorded idempotently; formal status is unchanged | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Passed locally |
| API-WF-04 | API | BR-15, AC-04 | Concurrent status or Action update | One update succeeds; stale request receives `409` | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Passed for stale request after Action mutation |
| API-DASH-01 | API | FR-10, BR-18, AC-07 | Requester dashboard with owned and foreign Tickets | Only owned counts/lists are returned | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally, including top-five ordering |
| API-DASH-02 | API | FR-11, BR-19 to BR-21, AC-08 | IT Staff dashboard metrics over known fixtures | Unassigned, owned, status, priority, urgent, and recent values match queries | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally against database counts |
| API-DASH-03 | API | FR-10 to FR-12 | Wrong role calls dashboard route | `403`; no dashboard payload is leaked | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally |
| API-DASH-04 | API | BR-19, AC-09 | No matching Tickets | Zero-valued metrics and empty arrays are returned | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally for empty Requester |
| MIG-01 | Migration | Data Changes, AC-11 | Apply additive migration to representative legacy database | Existing Tickets, attachments, comments, notes, and users remain valid | Disposable `toktickit_lab4_verification` database | Fresh Prisma migration passed; Lab 4 SQL migrations passed on a synthetic populated Lab 3 schema; real Lab 3 snapshot not tested |
| MIG-02 | Migration | Seed decision | Run seed twice | Stable fixture keys; no duplicate Actions Taken or users | Manual count check on disposable database | Passed: User/Ticket/Action Taken counts stayed `10/8/7` |
| REG-01 | API | FR-15, AC-11 | Run retained Lab 3 requester, staff, admin, attachment, comment, and note tests | Existing behavior remains passing | Existing `server/tests/api/*.test.ts` | Passed: 17 files, 60 tests |
| UI-ACT-01 | UI | FR-01 to FR-05 | Render operational Action list/create/edit and Requester read-only mode | Correct fields, permissions, empty, and validation states | `client/src/components/ActionsTaken.test.tsx` | Passed locally |
| UI-ACT-02 | UI | FR-16, AC-09 | Action API failure and stale conflict | Error/retry/reload feedback preserves draft where practical | `client/src/components/ActionsTaken.test.tsx` | Passed locally |
| UI-WF-01 | UI | FR-09, AC-05 | Status controls for each role and resolution gate feedback | Only permitted options render; explanatory feedback appears | `client/src/components/StaffTicketDetail.test.tsx`, `RequesterResolutionIndication.test.tsx` | Passed locally |
| UI-REQ-DASH-01 | UI | FR-10, FR-13, AC-07 | Requester metrics, zero state, and drill-down | Owned cards and accessible destinations render | `client/src/components/Dashboards.test.tsx` | Passed locally |
| UI-STAFF-DASH-01 | UI | FR-11 to FR-14, AC-08 | Staff metrics, lists, empty state, and drill-down | Correct safe cards and queue destinations render | `client/src/components/Dashboards.test.tsx` | Passed locally, including retry |
| UI-A11Y-01 | UI style | FR-17, AC-10 | Labels, keyboard focus, non-color cues, and modal/panel controls | Semantics and visible focus pass automated/manual checks | Component tests and Playwright role locators | Automated keyboard focus open/Cancel/Save/status checks pass in `e2e/lab-04/keyboard-focus.spec.ts`; developer reported manual keyboard/focus check passed on 2026-10-06 (no screenshot supplied) |
| VIS-01 | Visual | FR-17, AC-10 | Desktop 1440 px, tablet 768 px, and mobile 320 px inspection | No clipping, overlap, or horizontal overflow | `e2e/evidence/capture-lab4-screenshots.spec.ts` | Passed: 12 screenshots, width assertion at each viewport |
| PERF-01 | Smoke | FR-14 | Dashboard queries over seed-scale data | Endpoint responds without full Ticket collection or server error | `server/tests/api/lab4Dashboards.api.test.ts` | Seed-scale smoke passed; no load/performance benchmark |
| E2E-01 | E2E | AC-01 to AC-03 | Staff creates and completes an Action; Requester reads own Action list | Authorized Action flow succeeds | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed; editing and multiple Actions not exercised in browser |
| E2E-02 | E2E | AC-04 to AC-06 | Work Action and resolution gate | Incomplete Action blocks resolution; completed Action allows it | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed for resolution gate; close/reopen/cancel and requester indication covered by API/UI tests, not browser |
| E2E-03 | E2E | AC-07 to AC-10 | Requester and staff dashboards, drill-down, responsive views | Role data and navigation work correctly | `e2e/lab-04/dashboards.spec.ts` | Passed; injected network-failure retry not exercised in browser |
| E2E-04 | E2E | AC-11 | Representative Lab 3 role regression journey | Retained authentication and product flows remain working | Existing `e2e/lab-03/*.spec.ts` | Passed: 4 browser journeys |

## 4. Acceptance-Criterion Traceability

| Acceptance criterion | Primary planned tests |
| :--- | :--- |
| AC-01 Action creation / server performer | UNIT-01, API-ACT-01, E2E-01 |
| AC-02 Follow-up validation | UNIT-01, API-ACT-02, UI-ACT-01 |
| AC-03 Requester visibility and write restriction | API-ACT-03, UI-ACT-01, E2E-01 |
| AC-04 Stale/concurrent protection | API-ACT-04, API-WF-04, UI-ACT-02, E2E-02 |
| AC-05 Status matrix and resolution gate | UNIT-02, API-WF-01, API-WF-02, UI-WF-01, E2E-02 |
| AC-06 Advisory requester indication | API-WF-03, E2E-02 |
| AC-07 Requester dashboard ownership | API-DASH-01, UI-REQ-DASH-01, E2E-03 |
| AC-08 Staff dashboard calculations | UNIT-03, API-DASH-02, UI-STAFF-DASH-01, E2E-03 |
| AC-09 Empty and safe-failure behavior | API-DASH-04, UI-ACT-02, E2E-03 |
| AC-10 Responsive and accessibility | UI-A11Y-01, VIS-01, E2E-03 |
| AC-11 Final regression | MIG-01, MIG-02, REG-01, E2E-04 |

## 5. Final Execution Record

Dashboard feature branch local verification (2026-10-06, `feature/23-lab4-dashboards`):

| Command | Observed result |
| :--- | :--- |
| `npm --prefix server run build` | Passed |
| `server: node -r dotenv/config .\\node_modules\\vitest\\vitest.mjs run lab4Dashboards.api.test.ts` with `DOTENV_CONFIG_PATH=.env` | Passed: 3 dashboard API tests |
| `server: node -r dotenv/config .\\node_modules\\vitest\\vitest.mjs run` with `DOTENV_CONFIG_PATH=.env` | Passed: 17 files, 60 tests |
| `npm --prefix client run build` | Passed |
| `npm --prefix client test -- Dashboards.test.tsx` | Passed: 2 Dashboard UI tests |
| `npm --prefix client test` | Passed: 9 files, 20 tests |

Final-verification feature branch run (2026-10-06, `feature/24-lab4-final-verification`, commits `d7b4ef0` and `0c2c3fe`):

| Command / check | Observed result |
| :--- | :--- |
| Prisma `migrate deploy` on disposable `toktickit_lab4_verification` database | Applied all 7 migrations from an empty database; no production or regular local database was modified |
| `npm --prefix server run db:seed` twice on that database | Passed twice; User/Ticket/Action Taken counts remained `10/8/7` |
| `npm --prefix server test` on that database | Passed: 17 files, 60 tests. Server tests run one worker because API suites share mutable fixtures; a concurrent run produced a transient dashboard count mismatch. |
| `npm --prefix server run build` | Passed |
| `npm --prefix client test` | Passed: 9 files, 20 tests |
| `npm --prefix client run build` | Passed |
| `npm run test:e2e` on that database after reseeding | Passed: 7 Chromium journeys (4 retained Lab 3, 3 Lab 4) |
| `npm run capture:lab4-evidence` | Passed: 12 screenshots in `artifacts/lab-04/screenshots/`; no horizontal overflow at 1440, 768, or 320 px |

The browser run detected and prompted fixes for the post-save Action form, stale Ticket timestamp after Action changes, and a 320 px Staff detail overflow. The screenshots were captured again after the responsive fix. React/Vite printed non-failing inline-style shorthand warnings during browser runs; they were not treated as a passing accessibility audit.

Integrated staging run (2026-10-06, `lab4-staging` source commit `4ac723d54ccf3478d1a378de6c7e497188515c12`):

| Command / check | Observed result |
| :--- | :--- |
| Prisma `migrate deploy` on separate `toktickit_lab4_verify_20261006_4ac723d` database | Passed: all 7 migrations applied from empty database |
| `npm --prefix server run db:seed` twice; database row counts after each run | Passed: User/Ticket/Action Taken stayed `10/8/7` |
| `npm --prefix server test` on that database | Passed: 17 files, 60 tests |
| `npm --prefix server run build` | Passed |
| `npm --prefix client test` | Passed: 9 files, 20 tests |
| `npm --prefix client run build` | Passed |
| Reseed, then `npm run test:e2e` on that database | Passed: 7 Chromium journeys (4 Lab 3, 3 Lab 4) |

The test database was created separately from the regular `toktickit` database. The database-backed server and browser commands initially encountered sandbox `spawn EPERM` and passed when rerun with execution permission; those failed starts did not execute tests. The browser run printed non-failing React/Vite shorthand-style warnings. The existing 12 screenshots are from the feature-branch run above and were not recaptured on this staging commit.

Migration from a representative real Lab 3 database snapshot, PR approval, and verification after merging into `main` are **pending**. Record those results when performed; do not treat the feature-branch or staging results as proof of a later `main` commit.

Follow-up verification on the focus-fix code later committed as `3ec883c` (2026-10-06):

| Command / check | Observed result |
| :--- | :--- |
| Apply the first four migration SQL files to separate `toktickit_lab4_legacy_verify_20261006_4ac723d`; insert synthetic Lab 3 rows; apply the three Lab 4 migration SQL files | Passed. User/Ticket/Attachment/PublicComment/InternalNote counts stayed `2/2/1/1/1`. Requester/owner links, URGENT priority, WAITING_FOR_REQUESTER status, requester indication, unassigned Ticket, and zero-action legacy Tickets were preserved. This checks SQL data preservation, not Prisma migration metadata or a real Lab 3 snapshot. |
| `e2e/lab-04/keyboard-focus.spec.ts` | Initially failed: opening the Action form and completion panel did not move focus; saving an Action also lost focus when the parent detail view unmounted during refresh. Passed after focus management and an in-place parent refresh were added. Open/Cancel/Save/status transitions now pass focus assertions. |
| `npm --prefix client test`; `npm --prefix client run build` | Passed: 9 files / 20 tests; build passed |
| Reseed disposable database; `npm run test:e2e` | Passed: 8 Chromium journeys, including the new keyboard-focus regression |

The connected Windows/browser UI tools were unavailable to the assistant. The developer subsequently reported in chat on 2026-10-06 that the local browser keyboard/focus review of Dashboard and Actions Taken passed; this is developer-reported manual evidence, with no screenshot supplied. A real pre-Lab-4 database snapshot is unavailable; the populated Lab 3 migration check above used synthetic fixture rows.
