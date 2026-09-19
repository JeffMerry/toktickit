# Lab 3 Test Plan and Traceability: TokTickIT

## 1. Purpose

This plan was created before implementation. It defines how Sprint 3 requirements and Acceptance Criteria are verified across unit, API/integration, UI component, security/authorization, migration/regression, responsive/accessibility, and end-to-end levels. A test is marked `Pass` only after it runs successfully against the integrated implementation; unimplemented coverage remains `Planned`.

## 2. Test Strategy

1. **Unit tests** validate password policy, authorization helpers, status transitions, query parsing, and safe data mapping.
2. **API/integration tests** exercise real Express routes with a test PostgreSQL database and seeded users.
3. **Security tests** call protected endpoints directly with missing, wrong-role, expired, and cross-owner sessions.
4. **Migration/regression tests** apply the Lab 3 migration to representative Lab 2 data and rerun retained behavior.
5. **UI component tests** verify screen modes, role navigation, validation, privacy treatment, and responsive representations.
6. **E2E tests** verify complete role journeys in a browser using documented local-only accounts.
7. **Visual/accessibility checks** inspect desktop, tablet, and mobile screenshots plus keyboard/focus behavior.

## 3. Test Data Contract

- Requester A: active, normal password, owns Tickets.
- Requester B: active, owns different Tickets.
- Requester Initial: active, `mustChangePassword=true`.
- Requester Inactive: inactive.
- IT Staff A/B/C: active; at least one owns Tickets.
- IT Staff Inactive: inactive and ineligible for assignment.
- Administrator A: active current Administrator.
- Administrator B: active when testing safe role/deactivation changes.
- Last Admin fixture: exactly one active Administrator for conflict tests.
- Tickets cover every status and priority, including assigned/unassigned and stale-update fixtures.
- At least one Ticket has Public Comments, Internal Notes, active Attachments, and a soft-removed Attachment.

Seed helpers use stable normalized emails and never use real personal credentials.

## 4. Planned Automated Tests

### 4.1 Unit tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UNIT-01 | BR-03, BR-04 | Validate password policy and normalized email handling | Documented password policy and normalized lookup behavior pass | `server/tests/unit/auth.test.ts` | Pass |
| UNIT-02 | BR-07, BR-08 | Generate and hash an opaque session token | Raw token is random; stored value differs and verifies by hash | `server/tests/unit/auth.test.ts` | Pass |
| UNIT-03 | FR-06, BR-15 | Evaluate role guard combinations | Only listed roles are permitted | `server/tests/unit/staffAuthorization.test.ts` | Pass |
| UNIT-04 | FR-15, BR-19, AC-11 | Evaluate Ticket status transitions | Approved transitions pass; invalid transitions fail | `server/tests/unit/ticketWorkflow.test.ts` | Pass |
| UNIT-05 | BR-27, BR-28 | Validate and sanitize Comment/Note input | Empty/oversized input fails; valid plain text is preserved safely | `server/tests/lab-03/comments-notes.unit.test.ts` | Planned |
| UNIT-06 | FR-11, AC-09 | Parse Queue query parameters | Defaults and allowed values pass; invalid values return validation results | `server/tests/lab-03/staff-queue.unit.test.ts` | Planned |

### 4.2 Authentication API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-AUTH-01 | FR-01, FR-02, AC-01 | Active user logs in with valid credentials | `200`, session cookie, safe user/role data | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-02 | BR-02, AC-01 | Login email contains spaces/mixed case | Normalized email authenticates the same account | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-03 | BR-05, AC-02 | Unknown email and incorrect password | Same safe `401` response for both | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-04 | BR-01, AC-02 | Inactive user attempts login | Safe denial; no protected details | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-05 | BR-06 | Repeated failed attempts in throttle window | `429` with safe retry guidance | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-06 | FR-04, BR-09, AC-03 | Initial-password user calls normal protected API | `403 PASSWORD_CHANGE_REQUIRED` | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-07 | FR-04, BR-04, AC-03 | Initial-password user saves a valid new password | Flag cleared; replacement session works | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-08 | FR-03, AC-04 | Logout then reuse old cookie | Logout is `200`; protected request is `401` | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-09 | BR-10 | Password change with multiple sessions | Other old sessions are invalidated | `server/tests/api/auth.api.test.ts` | Pass |
| API-AUTH-10 | BR-37 | Inspect auth response mapping | No hash, raw token, or secret is returned | `server/tests/api/auth.api.test.ts` | Pass |

### 4.3 Authorization and Requester regression API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-AUTHZ-01 | FR-06, AC-04 | Protected endpoint without a session | `401`; no protected data | `server/tests/api/createTicket.api.test.ts`, `server/tests/api/myTickets.api.test.ts` | Pass |
| API-AUTHZ-02 | FR-07, BR-12, AC-05 | Requester supplies any client-controlled `requesterId` | Request is rejected; authenticated identity remains authoritative | `server/tests/api/createTicket.api.test.ts`, `server/tests/api/attachments.api.test.ts` | Pass |
| API-AUTHZ-03 | BR-13, BR-14, AC-05 | Requester A reads Requester B Ticket | Concealed response; no Ticket data | `server/tests/api/attachments.api.test.ts` | Pass |
| API-AUTHZ-04 | BR-13, AC-06 | Requester A accesses Requester B Attachment | Access denied; no file/metadata leak | `server/tests/api/attachments.api.test.ts` | Pass |
| API-AUTHZ-05 | FR-17, BR-25, AC-08 | Requester calls Internal Note routes | Rejected; no Note count/content | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-REQ-01 | FR-08, AC-06 | Authenticated Requester creates Ticket | `201`; session user is requester; status `NEW`; IT Priority copied | `server/tests/api/createTicket.api.test.ts` | Pass |
| API-REQ-02 | FR-08, AC-06 | List owned Tickets with Lab 2 filters | Correct owned data and pagination | `server/tests/api/myTickets.api.test.ts` | Pass |
| API-REQ-03 | BR-36, AC-06 | Upload/download/soft-remove Attachment | Ownership and removal behavior remain correct | `server/tests/api/attachments.api.test.ts` | Pass |
| API-REQ-04 | FR-09, BR-24, BR-27, AC-07 | Requester posts valid Public Comment | Author/time set by backend; comment returned | `e2e/lab-03/requester-ticket-flow.spec.ts` | Pass |
| API-REQ-05 | FR-10, BR-20, BR-21, AC-07 | Requester indicates apparent resolution | Indication saved; Ticket status unchanged | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |

### 4.4 IT Staff Queue and Ticket workflow API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-QUEUE-01 | FR-11, AC-09 | Search by Ticket number, summary, Requester name/email | Matching results only | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-QUEUE-02 | FR-11, AC-09 | Combine Queue filters | Correct matching results | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-QUEUE-03 | FR-11, AC-09 | Sort and paginate Queue | Stable order and correct metadata | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-QUEUE-04 | FR-11, BR-37 | Invalid Queue query | Safe `400`; no server details | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-QUEUE-05 | FR-06, AC-09 | Requester calls Queue API | `403`; no Queue rows | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-01 | FR-12 | Operational user retrieves Ticket Detail | Ticket, owners, comments, and notes are returned only to permitted roles | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-02 | FR-13, BR-22, AC-10 | Claim unassigned Ticket | Current operational user becomes owner | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-03 | BR-22, BR-23, AC-10 | Competing claim | `409`; first valid claim remains | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-04 | FR-13, BR-16, AC-11 | Assign active eligible users | Eligible assignment succeeds; invalid targets fail | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-05 | FR-14, BR-17, BR-18, AC-11 | Change IT Priority | IT Priority changes; Requested Priority does not | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-06 | FR-15, BR-19, AC-11 | Perform valid and invalid status transitions | Matrix enforced on backend | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-07 | FR-16, FR-17, AC-12 | Create Public Comment and Internal Note | Append-only entries saved with backend author/time | `server/tests/api/staffQueue.api.test.ts` | Pass |
| API-STAFF-08 | BR-25, AC-08, AC-12 | Compare operational and Requester detail payloads | Notes appear only in permitted operational response | `server/tests/api/staffQueue.api.test.ts` | Pass |

### 4.5 Administrator API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-ADMIN-01 | FR-18, AC-13 | List, search, and role-filter users | Correct safe rows returned | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-02 | FR-19, BR-33, AC-13 | Create valid one-role user | `201`; hashed initial password; change required | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-03 | BR-02, BR-33, AC-13 | Create/update duplicate normalized email | `409` duplicate-email response | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-04 | FR-20, AC-13 | Edit name, email, role, activation | Valid changes and stale-write protection work | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-05 | FR-21, BR-34, AC-13 | Set new initial password | Hash saved, flag set, sessions revoked, plaintext absent | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-06 | FR-22, BR-30, AC-14 | Administrator deactivates self | `409` self-deactivation response | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-07 | FR-22, BR-31, AC-14 | Concurrent removal of active Administrators | One active Administrator remains | `server/tests/api/adminUsers.api.test.ts` | Pass |
| API-ADMIN-08 | FR-06, BR-29, AC-15 | Requester/IT Staff call Administrator routes | `403`; no user list or account data | `server/tests/api/adminUsers.api.test.ts` | Pass |

### 4.6 Migration and regression tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| MIG-01 | BR-36, AC-17 | Apply migration to representative Lab 2 database | Migration completes without dropping Ticket/Attachment data | `server/tests/lab-03/migration-regression.test.ts` | Planned |
| MIG-02 | FR-07, AC-17 | Compare requester/Ticket ownership before and after migration | Counts and ownership mappings match | `server/tests/lab-03/migration-regression.test.ts` | Planned |
| MIG-03 | BR-18, AC-17 | Inspect migrated Ticket priorities/statuses | IT Priority copied; statuses mapped correctly | `server/tests/lab-03/migration-regression.test.ts` | Planned |
| MIG-04 | Seed contract | Run seed twice | Stable users/Tickets; no duplicates | `server/tests/lab-03/migration-regression.test.ts` | Planned |
| REG-01 | FR-08, BR-36, AC-06, AC-17 | Rerun Lab 2 Ticket/Attachment API scenarios using sessions | Retained behaviors pass | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |
| REG-02 | FR-08, AC-17 | Run updated Requester E2E journey | Authenticated journey completes | `e2e/lab-03/authentication.spec.ts` | Planned |

### 4.7 UI component tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UI-AUTH-01 | FR-01, FR-23, AC-01, AC-02 | Login validation and safe failure modes | Correct fields and messages | `client/src/App.test.tsx`, `e2e/lab-03/authentication.spec.ts` | Pass |
| UI-AUTH-02 | FR-04, AC-03 | Mandatory password change | Normal navigation blocked until change completes | `e2e/lab-03/authentication.spec.ts` | Pass |
| UI-SHELL-01 | FR-05, AC-15 | Render shell for each role | Correct permitted navigation only | `client/src/components/Navbar.test.tsx` | Pass |
| UI-REQ-01 | FR-09, FR-10, AC-07, AC-08 | Requester Ticket Detail collaboration | Public composer is available | `client/src/components/PublicCommentSection.test.tsx`, `e2e/lab-03/requester-ticket-flow.spec.ts` | Pass |
| UI-QUEUE-01 | FR-11, FR-23, AC-09 | Queue data/search/filter states | Correct controls and state feedback | `client/src/components/StaffTicketQueue.test.tsx` | Pass |
| UI-QUEUE-02 | FR-24, AC-16 | Desktop/tablet/mobile Queue evidence | Required actions remain available at tested viewports | `e2e/evidence/capture-lab3-screenshots.spec.ts` | Pass; keyboard review pending |
| UI-STAFF-01 | FR-12-FR-17, AC-10-AC-12 | Ticket controls and Comment/Note sections | Approved actions and privacy treatment render | `client/src/components/StaffTicketDetail.test.tsx` | Pass |
| UI-ADMIN-01 | FR-18-FR-22, AC-13-AC-15 | User list/create/edit/safety feedback | Correct fields, one role, validation, and forbidden mode | `client/src/components/UserManagement.test.tsx` | Pass |
| UI-A11Y-01 | FR-24, AC-16 | Keyboard navigation, labels, focus, announcements | Logical focus and programmatic names/messages | `client/src/tests/lab-03/accessibility.test.tsx` | Planned |

### 4.8 End-to-end tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E2E-01 | AC-01-AC-04 | Invalid login, required password change, logout, and restored session | Auth lifecycle succeeds with safe failure feedback | `e2e/lab-03/authentication.spec.ts` | Pass |
| E2E-02 | AC-05-AC-08 | Requester creates/opens an owned Ticket and posts a Public Comment | Owned workflow succeeds | `e2e/lab-03/requester-ticket-flow.spec.ts` | Pass |
| E2E-03 | AC-09-AC-12 | Staff filters Queue, claims Ticket, updates priority/status, comments, and notes | Complete operational flow succeeds | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| E2E-04 | AC-13-AC-15 | Admin lists/searches/creates/edits/resets initial password | Documented admin management flow succeeds | `e2e/lab-03/user-administration.spec.ts` | Pass |
| E2E-05 | AC-16 | Captured major screens at desktop/tablet/mobile viewports | Screenshots captured; keyboard/focus remains manual | `e2e/evidence/capture-lab3-screenshots.spec.ts` | Pass; keyboard review pending |

## 5. Acceptance-Criterion Traceability

| Acceptance Criterion | Primary tests | Initial status |
| :--- | :--- | :--- |
| AC-01 Valid login/session | API-AUTH-01, API-AUTH-02, UI-AUTH-01, E2E-01 | Pass |
| AC-02 Safe failed/inactive login | API-AUTH-03, API-AUTH-04, UI-AUTH-01, E2E-01 | Pass |
| AC-03 Mandatory password change | API-AUTH-06, API-AUTH-07, UI-AUTH-02, E2E-01 | Pass |
| AC-04 Logout invalidation | API-AUTH-08, API-AUTHZ-01, E2E-01 | Pass |
| AC-05 Authenticated Requester identity | API-AUTHZ-02, API-AUTHZ-03, E2E-02 | Pass |
| AC-06 Lab 2 Requester continuity | API-AUTHZ-04, API-REQ-01-API-REQ-03, REG-01, E2E-02 | Pass; migration-specific regression remains planned |
| AC-07 Requester Comment/resolution indication | API-REQ-04, API-REQ-05, UI-REQ-01, E2E-02 | Pass for Public Comment; resolution-indication API coverage remains planned |
| AC-08 Internal Note restriction | API-AUTHZ-05, API-STAFF-08, UI-REQ-01, E2E-02 | Pass |
| AC-09 Queue queries | UNIT-06, API-QUEUE-01-API-QUEUE-05, UI-QUEUE-01, E2E-03 | Pass |
| AC-10 Claim/conflict | API-STAFF-02, API-STAFF-03, UI-STAFF-01, E2E-03 | Pass |
| AC-11 Owner/priority/status workflow | UNIT-04, API-STAFF-04-API-STAFF-06, UI-STAFF-01, E2E-03 | Pass |
| AC-12 Comments/Notes append-only and visibility | UNIT-05, API-STAFF-07, API-STAFF-08, UI-STAFF-01, E2E-03 | Pass |
| AC-13 Administrator valid operations | API-ADMIN-01-API-ADMIN-05, UI-ADMIN-01, E2E-04 | Pass |
| AC-14 Administrator safety | API-ADMIN-06, API-ADMIN-07, UI-ADMIN-01, E2E-04 | Pass |
| AC-15 Non-Administrator restriction | API-ADMIN-08, UI-SHELL-01, UI-ADMIN-01, E2E-04 | Pass |
| AC-16 Responsive/accessibility | UI-QUEUE-02, UI-A11Y-01, E2E-05 | Pass for automated visual checks; keyboard/focus remains manual |
| AC-17 Migration/regression | MIG-01-MIG-04, REG-01, REG-02 | Planned |

## 6. Manual Visual and Accessibility Matrix

| Screen | Desktop | Tablet | Mobile | Keyboard/focus | Evidence location |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Login | Captured | Captured | Captured | Manual review pending | `artifacts/lab-03/screenshots/authentication/` |
| Change Password | Captured | Optional | Captured | Manual review pending | `artifacts/lab-03/screenshots/authentication/` |
| Requester Ticket Detail | Captured | Optional | Captured | Manual review pending | `artifacts/lab-03/screenshots/requester-ticket-detail/` |
| Staff Ticket Queue | Captured | Captured | Captured | Manual review pending | `artifacts/lab-03/screenshots/staff-queue/` |
| Staff Ticket Detail | Captured | Captured | Captured | Manual review pending | `artifacts/lab-03/screenshots/staff-ticket-detail/` |
| User Management | Captured | Optional | Captured | Manual review pending | `artifacts/lab-03/screenshots/user-management/` |

Inspection checks include consistent Zen Green tokens, role navigation, status/priority/role badges, editable versus read-only styling, validation placement, focus visibility, privacy labels, clipping, overlap, and horizontal overflow.

## 7. Planned Test Commands

The Lab 3 Playwright suite uses the seeded local-only accounts and deliberately
does not seed the database itself. This avoids silently resetting a developer's
local data. Before a full E2E run, explicitly reseed the intended local test
database; the run changes seeded passwords and creates test Ticket/User data.

```bash
# Backend unit and API/integration tests
npm --prefix server test

# Backend production build
npm --prefix server run build

# Frontend component tests and production build
npm --prefix client test
npm --prefix client run build

# Lab 3 E2E tests
npm --prefix server run db:seed
npm run test:e2e
```

The E2E suite is serial and covers these browser flows:

- `e2e/lab-03/authentication.spec.ts` — safe failed login, required password change, logout, and requester session restoration.
- `e2e/lab-03/requester-ticket-flow.spec.ts` — authenticated Ticket creation, owned detail access, and a Public Comment.
- `e2e/lab-03/staff-ticket-flow.spec.ts` — Queue filtering, claim, IT Priority, status change, Public Comment, and Internal Note.
- `e2e/lab-03/user-administration.spec.ts` — create, search, edit, and initial-password reset for an account.

`playwright.config.ts` starts the local server and client for the test run, or
reuses an already-running local instance outside CI. Use `E2E_BASE_URL` only
when intentionally targeting a different local app URL.

Migration verification additionally runs Prisma migration and seed commands against a disposable test database. The final results table must record the actual command, commit SHA, date, and Pass/Fail outcome from the integrated branch.

## 8. Integrated Execution Record

The following commands ran against integrated `lab3-staging` commit `8bd18a9` on 2026-09-17 (Asia/Bangkok). The commit contains the merged Staff Ticket Workflow and Administrator User Management work.

| Command | Result | Evidence |
| :--- | :--- | :--- |
| `npm --prefix server run build` | Pass | TypeScript compilation completed successfully. |
| `npm --prefix server test` | Pass | 14 test files, 48 tests passed. |
| `npm --prefix client run build` | Pass | TypeScript compilation and Vite production build completed successfully. |
| `npm --prefix client test` | Pass | 6 test files, 9 tests passed. |

No automated-suite failures were hidden or skipped during this run. At the time
of this integrated run, the repository did not yet contain `e2e/lab-03/` tests,
so no Lab 3 Playwright command is claimed as executed for commit `8bd18a9`.
The suite was added later on the release-evidence branch and must be run from
the final release candidate before the final PR. Manual screenshots remain
required evidence in addition to the E2E result.

## 9. Final Release-Candidate Execution Record

The following final verification ran against release-candidate commit `a51b474`
on 2026-09-18 (Asia/Bangkok). The database was explicitly seeded before the
server/client suites and seeded again immediately before E2E so each browser
flow began with the documented temporary-password fixtures.

| Command | Result | Evidence |
| :--- | :--- | :--- |
| `npm --prefix server run build` | Pass | TypeScript compilation completed successfully. |
| `npm --prefix server test` | Pass | 14 test files, 48 tests passed. |
| `npm --prefix client run build` | Pass | TypeScript compilation and Vite production build completed successfully. |
| `npm --prefix client test` | Pass | 6 test files, 9 tests passed. |
| `npm run test:e2e` | Pass | 4 Chromium role-journey tests passed in 21.1 seconds. |

No automated-suite failures were hidden or skipped. The E2E result covers
authentication/requester access, requester Ticket collaboration, IT Staff
workflow, Administrator user management, and responsive checks at the tested
viewports.

## 10. Completion Evidence

Before this plan is marked complete:

- [x] Replace implemented and executed test entries with actual outcomes; remaining `Planned` entries identify coverage not yet implemented.
- [ ] Record actual test file paths if implementation changes them.
- [ ] Capture complete passing output from final `main`.
- [x] Record the tested commit SHA.
- [x] Link failed tests to corrective Issues/PRs instead of hiding failures. No failures occurred in the integrated run.
- [ ] Confirm every AC retains at least one passing automated or justified manual test.
