# Lab 4 Test Plan and Traceability

> Status: Planned before implementation. Replace `Planned` with the observed result only after the relevant branch is integrated and tested.

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
| UNIT-01 | Unit | BR-04 to BR-08 | Validate Action Taken date, text limits, conditional follow-up note, assignment, and lifecycle transitions | Invalid input has deterministic validation errors | `server/tests/unit/lab4ActionsTaken.test.ts` | Planned |
| UNIT-02 | Unit | BR-09 to BR-13 | Evaluate final status transition and resolution gate | Only approved transitions and qualified resolutions are allowed | `server/tests/unit/lab4Workflow.test.ts` | Planned |
| UNIT-03 | Unit | BR-17 to BR-19 | Calculate dashboard status, open, urgent, and ordering rules | Counts and ordering match documented rules | `server/tests/unit/lab4DashboardMetrics.test.ts` | Planned |
| API-ACT-01 | API | FR-01 to FR-04, AC-01 | Operational user creates, assigns, starts, completes, and cancels Actions Taken | Correct Ticket relation, session-derived creator/performer, and lifecycle state | `server/tests/api/lab4ActionsTaken.api.test.ts` | Planned |
| API-ACT-02 | API | BR-05, BR-06, AC-02 | Missing Result or required Follow-up Note | `422`; no Action Taken saved | `server/tests/api/lab4ActionsTaken.api.test.ts` | Planned |
| API-ACT-03 | API | FR-05, BR-08, AC-03 | Requester reads own/non-owned Action Taken and attempts writes | Own read allowed; non-owned read and all writes denied | `server/tests/api/lab4ActionsTaken.api.test.ts` | Planned |
| API-ACT-04 | API | BR-03, BR-07 to BR-09, AC-04 | Client supplies performer, inactive assignee, invalid lifecycle edge, or stale update timestamp | Actor is ignored/rejected; invalid assignment/edge fails; stale edit returns `409` | `server/tests/api/lab4ActionsTaken.api.test.ts` | Planned |
| API-WF-01 | API | FR-06, AC-05 | Attempt each valid and invalid status transition | Backend matrix is enforced | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Planned |
| API-WF-02 | API | FR-07, BR-11 to BR-13, AC-05 | Resolve without owner, confirmation, or qualifying Action Taken | `422`; Ticket status is unchanged | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Planned |
| API-WF-03 | API | FR-08, AC-06 | Requester posts resolution indication repeatedly | Timestamp is recorded idempotently; formal status is unchanged | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Planned |
| API-WF-04 | API | BR-15, AC-04 | Concurrent status or Action update | One update succeeds; stale request receives `409` | `server/tests/api/lab4TicketWorkflow.api.test.ts` | Planned |
| API-DASH-01 | API | FR-10, BR-18, AC-07 | Requester dashboard with owned and foreign Tickets | Only owned counts/lists are returned | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally, including top-five ordering |
| API-DASH-02 | API | FR-11, BR-19 to BR-21, AC-08 | IT Staff dashboard metrics over known fixtures | Unassigned, owned, status, priority, urgent, and recent values match queries | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally against database counts |
| API-DASH-03 | API | FR-10 to FR-12 | Wrong role calls dashboard route | `403`; no dashboard payload is leaked | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally |
| API-DASH-04 | API | BR-19, AC-09 | No matching Tickets | Zero-valued metrics and empty arrays are returned | `server/tests/api/lab4Dashboards.api.test.ts` | Passed locally for empty Requester |
| MIG-01 | Migration | Data Changes, AC-11 | Apply additive migration to representative legacy database | Existing Tickets, attachments, comments, notes, and users remain valid | `server/tests/api/lab4MigrationRegression.api.test.ts` | Planned |
| MIG-02 | Migration | Seed decision | Run seed twice | Stable fixture keys; no duplicate Actions Taken or users | `server/tests/api/lab4MigrationRegression.api.test.ts` | Planned |
| REG-01 | API | FR-15, AC-11 | Run retained Lab 3 requester, staff, admin, attachment, comment, and note tests | Existing behavior remains passing | Existing `server/tests/api/*.test.ts` | Planned |
| UI-ACT-01 | UI | FR-01 to FR-05 | Render operational Action list/create/edit and Requester read-only mode | Correct fields, permissions, empty, and validation states | `client/src/components/ActionsTaken.test.tsx` | Planned |
| UI-ACT-02 | UI | FR-16, AC-09 | Action API failure and stale conflict | Error/retry/reload feedback preserves draft where practical | `client/src/components/ActionsTaken.test.tsx` | Planned |
| UI-WF-01 | UI | FR-09, AC-05 | Status controls for each role and resolution gate feedback | Only permitted options render; explanatory feedback appears | `client/src/components/TicketWorkflow.test.tsx` | Planned |
| UI-REQ-DASH-01 | UI | FR-10, FR-13, AC-07 | Requester metrics, zero state, and drill-down | Owned cards and accessible destinations render | `client/src/components/Dashboards.test.tsx` | Passed locally |
| UI-STAFF-DASH-01 | UI | FR-11 to FR-14, AC-08 | Staff metrics, lists, empty state, and drill-down | Correct safe cards and queue destinations render | `client/src/components/Dashboards.test.tsx` | Passed locally, including retry |
| UI-A11Y-01 | UI style | FR-17, AC-10 | Labels, keyboard focus, non-color cues, and modal/panel controls | Semantics and visible focus pass automated/manual checks | `client/src/components/lab4Accessibility.test.tsx` | Planned |
| VIS-01 | Visual | FR-17, AC-10 | Desktop 1440 px, tablet 768 px, and mobile 320 px inspection | No clipping, overlap, or horizontal overflow | `e2e/evidence/capture-lab4-screenshots.spec.ts` | Planned |
| PERF-01 | Smoke | FR-14 | Dashboard queries over seed-scale data | Endpoint responds without full Ticket collection or server error | `server/tests/api/lab4DashboardPerformance.api.test.ts` | Planned |
| E2E-01 | E2E | AC-01 to AC-03 | Staff creates/edits multiple Actions; Requester reads own Action list | Full authorized Action flow succeeds | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| E2E-02 | E2E | AC-04 to AC-06 | Work Actions, resolution gate, requester indication, resolve/close/reopen/cancel | Workflow and conflict behavior are visible | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| E2E-03 | E2E | AC-07 to AC-10 | Requester and staff dashboards, drill-down, safe failure, responsive views | Role data and navigation work correctly | `e2e/lab-04/dashboards.spec.ts` | Planned |
| E2E-04 | E2E | AC-11 | Representative Lab 1 to 3 role regression journey | Retained authentication and product flows remain working | `e2e/lab-04/final-regression.spec.ts` | Planned |

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

These results are from the feature branch. Browser E2E, responsive screenshots, and final `lab4-staging`/`main` verification remain to be recorded after integration.

After final integration, record the exact branch/commit, date, commands, and observed outcome here. Do not mark tests as passing before they run.

| Commit | Command | Result | Observed output / evidence |
| :--- | :--- | :--- | :--- |
| Pending | Pending | Pending | Pending |
