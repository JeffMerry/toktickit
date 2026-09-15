# Lab 3 Test Plan and Traceability: TokTickIT

## 1. Purpose

This plan is created before implementation. It defines how Sprint 3 requirements and Acceptance Criteria will be verified across unit, API/integration, UI component, security/authorization, migration/regression, responsive/accessibility, and end-to-end levels. A test is marked `Pass` only after it runs successfully against the integrated implementation; all initial entries are `Planned`.

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
| UNIT-01 | BR-03, BR-04 | Validate password boundaries, composition, and UTF-8 byte length | Only 10-64 character values with a letter, number, and at most 72 UTF-8 bytes pass | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| UNIT-02 | BR-07, BR-08 | Generate and hash an opaque session token | Raw token is random; stored value differs and verifies by hash | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| UNIT-03 | FR-06, BR-15 | Evaluate role guard combinations | Only listed roles are permitted | `server/tests/lab-03/authorization.unit.test.ts` | Planned |
| UNIT-04 | FR-15, BR-19, AC-11 | Evaluate every Ticket status transition | Approved transitions pass; all others fail | `server/tests/lab-03/ticket-workflow.unit.test.ts` | Planned |
| UNIT-05 | BR-27, BR-28 | Validate and sanitize Comment/Note input | Empty/oversized input fails; valid plain text is preserved safely | `server/tests/lab-03/comments-notes.unit.test.ts` | Planned |
| UNIT-06 | FR-11, AC-09 | Parse Queue query parameters | Defaults and allowed values pass; invalid values return validation results | `server/tests/lab-03/staff-queue.unit.test.ts` | Planned |

### 4.2 Authentication API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-AUTH-01 | FR-01, FR-02, AC-01 | Active user logs in with valid credentials | `200`, session cookie, safe user/role data | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-02 | BR-02, AC-01 | Login email contains spaces/mixed case | Normalized email authenticates the same account | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-03 | BR-05, AC-02 | Unknown email and incorrect password | Same safe `401` response for both | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-04 | BR-01, AC-02 | Inactive user attempts login | `403 ACCOUNT_INACTIVE`; no protected details | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-05 | BR-06 | Sixth failed attempt in throttle window | `429`; valid safe retry guidance | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-06 | FR-04, BR-09, AC-03 | Initial-password user calls normal protected API | `403 PASSWORD_CHANGE_REQUIRED` | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-07 | FR-04, BR-04, AC-03 | Initial-password user saves a valid new password | Flag cleared; replacement session works | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-08 | FR-03, AC-04 | Logout then reuse old cookie | Logout is `200`; protected request is `401` | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-09 | BR-10 | Password reset/change with multiple sessions | All old sessions are invalidated | `server/tests/lab-03/auth.api.test.ts` | Planned |
| API-AUTH-10 | BR-37 | Inspect auth responses/log-safe mapping | No hash, raw token, or secret is returned | `server/tests/lab-03/auth.api.test.ts` | Planned |

### 4.3 Authorization and Requester regression API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-AUTHZ-01 | FR-06, AC-04 | Protected endpoint without/with expired session | `401`; no protected data | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-AUTHZ-02 | FR-07, BR-12, AC-05 | Requester supplies any client-controlled `requesterId` | `400 CLIENT_IDENTITY_NOT_ALLOWED`; authenticated identity remains authoritative | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-AUTHZ-03 | BR-13, BR-14, AC-05 | Requester A reads Requester B Ticket | Concealed `404`; no Ticket data | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-AUTHZ-04 | BR-13, AC-06 | Requester A accesses Requester B Attachment | Access denied; no file/metadata leak | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-AUTHZ-05 | FR-17, BR-25, AC-08 | Requester calls Internal Note routes | Rejected; no Note count/content | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-REQ-01 | FR-08, AC-06 | Authenticated Requester creates Ticket | `201`; session user is requester; status `NEW`; IT Priority copied | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |
| API-REQ-02 | FR-08, AC-06 | List/detail owned Tickets with Lab 2 filters | Correct owned data and pagination | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |
| API-REQ-03 | BR-36, AC-06 | Upload/download/soft-remove Attachment | Lab 2 validation, quota, ownership, and removal remain correct | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |
| API-REQ-04 | FR-09, BR-24, BR-27, AC-07 | Requester posts valid Public Comment | Author/time set by backend; comment returned | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| API-REQ-05 | FR-10, BR-20, BR-21, AC-07 | Requester indicates apparent resolution | Indication saved; Ticket status unchanged | `server/tests/lab-03/requester-regression.api.test.ts` | Planned |

### 4.4 IT Staff Queue and Ticket workflow API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-QUEUE-01 | FR-11, AC-09 | Search by Ticket number, summary, Requester name/email | Matching results only | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-QUEUE-02 | FR-11, AC-09 | Combine status, priority, category, and ownership filters | Correct intersection and counts | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-QUEUE-03 | FR-11, AC-09 | Sort and paginate Queue | Stable order and correct metadata | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-QUEUE-04 | FR-11, BR-37 | Invalid Queue query | Safe `400`; no server details | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| API-QUEUE-05 | FR-06, AC-09 | Requester calls Queue API | `403`; no Queue rows | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| API-STAFF-01 | FR-12 | Operational user retrieves Ticket Detail | Ticket, Attachments, Comments, Notes, owners, transitions returned | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-02 | FR-13, BR-22, AC-10 | Claim unassigned Ticket | Current operational user becomes owner | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-03 | BR-22, BR-23, AC-10 | Competing/stale claim | `409`; first valid claim remains | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-04 | FR-13, BR-16, AC-11 | Assign active eligible and inactive/ineligible users | Eligible assignment succeeds; invalid targets fail | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-05 | FR-14, BR-17, BR-18, AC-11 | Change IT Priority | IT Priority changes; Requested Priority does not | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-06 | FR-15, BR-19, AC-11 | Perform valid and invalid status transitions | Matrix enforced on backend | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| API-STAFF-07 | FR-16, FR-17, AC-12 | Create Public Comment and Internal Note | Append-only entries saved with backend author/time | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| API-STAFF-08 | BR-25, AC-08, AC-12 | Compare operational and Requester detail payloads | Notes appear only in permitted operational response | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |

### 4.5 Administrator API tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-ADMIN-01 | FR-18, AC-13 | List, search, and role-filter users | Correct safe rows returned | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-02 | FR-19, BR-33, AC-13 | Create valid one-role user | `201`; hashed initial password; change required | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-03 | BR-02, BR-33, AC-13 | Create/update duplicate normalized email | `409 EMAIL_ALREADY_EXISTS` | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-04 | FR-20, AC-13 | Edit name, email, role, activation | Valid changes saved; stale update conflicts | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-05 | FR-21, BR-34, AC-13 | Set new initial password | Hash saved, flag set, sessions revoked, plaintext absent | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-06 | FR-22, BR-30, AC-14 | Administrator deactivates self | `409 SELF_DEACTIVATION_FORBIDDEN` | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-07 | FR-22, BR-31, AC-14 | Deactivate/change role of last active Administrator | Transaction rejects with `409` | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| API-ADMIN-08 | FR-06, BR-29, AC-15 | Requester/IT Staff call Administrator routes | `403`; no user list or account data | `server/tests/lab-03/authorization.api.test.ts` | Planned |

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
| UI-AUTH-01 | FR-01, FR-23, AC-01, AC-02 | Login initial, validation, busy, and safe failure modes | Correct fields, focus, disabled state, and messages | `client/src/tests/lab-03/Login.test.tsx` | Planned |
| UI-AUTH-02 | FR-04, AC-03 | Mandatory password change | Normal navigation blocked; rules and continuation shown | `client/src/tests/lab-03/ChangePassword.test.tsx` | Planned |
| UI-SHELL-01 | FR-05, AC-15 | Render shell for each role | Correct user/role and permitted navigation only | `client/src/tests/lab-03/AppShell.test.tsx` | Planned |
| UI-REQ-01 | FR-09, FR-10, AC-07, AC-08 | Requester Ticket Detail collaboration | Public composer and indication present; Notes absent | `client/src/tests/lab-03/RequesterTicketDetail.test.tsx` | Planned |
| UI-QUEUE-01 | FR-11, FR-23, AC-09 | Queue data/search/filter/loading/empty/failure states | Correct controls and state feedback | `client/src/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| UI-QUEUE-02 | FR-24, AC-16 | Desktop table versus mobile cards | Equivalent data; no hidden required action | `client/src/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| UI-STAFF-01 | FR-12-FR-17, AC-10-AC-12 | Ticket controls and Comment/Note tabs | Approved actions; clear privacy treatment; conflict reload | `client/src/tests/lab-03/StaffTicketDetail.test.tsx` | Planned |
| UI-ADMIN-01 | FR-18-FR-22, AC-13-AC-15 | User list/create/edit/safety feedback | Correct fields, one role, validation, and forbidden mode | `client/src/tests/lab-03/UserManagement.test.tsx` | Planned |
| UI-A11Y-01 | FR-24, AC-16 | Keyboard navigation, labels, focus, announcements | Logical focus and programmatic names/messages | `client/src/tests/lab-03/accessibility.test.tsx` | Planned |

### 4.8 End-to-end tests

| Test ID | Requirement / AC | Scenario | Expected result | Planned file | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| E2E-01 | AC-01-AC-04 | Valid/invalid/inactive login, first password change, logout | Complete auth lifecycle and direct-access protection | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-02 | AC-05-AC-08, AC-17 | Requester creates/opens Ticket, comments, indicates resolution, and attempts forbidden access | Owned workflow succeeds; forbidden data remains unavailable | `e2e/lab-03/authentication.spec.ts` | Planned |
| E2E-03 | AC-09-AC-12 | Staff searches Queue, claims Ticket, updates priority/status, comments, and notes | Complete operational flow succeeds | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| E2E-04 | AC-13-AC-15 | Admin lists/searches/creates/edits/deactivates/resets password and tests safety rules | Valid changes succeed; unsafe/non-Admin actions fail | `e2e/lab-03/user-administration.spec.ts` | Planned |
| E2E-05 | AC-16 | Major screens at desktop/tablet/mobile viewports | Readable, operable, no clipping/overflow | All Lab 3 E2E files plus screenshot capture | Planned |

## 5. Acceptance-Criterion Traceability

| Acceptance Criterion | Primary tests | Initial status |
| :--- | :--- | :--- |
| AC-01 Valid login/session | API-AUTH-01, API-AUTH-02, UI-AUTH-01, E2E-01 | Planned |
| AC-02 Safe failed/inactive login | API-AUTH-03, API-AUTH-04, UI-AUTH-01, E2E-01 | Planned |
| AC-03 Mandatory password change | API-AUTH-06, API-AUTH-07, UI-AUTH-02, E2E-01 | Planned |
| AC-04 Logout invalidation | API-AUTH-08, API-AUTHZ-01, E2E-01 | Planned |
| AC-05 Authenticated Requester identity | API-AUTHZ-02, API-AUTHZ-03, E2E-02 | Planned |
| AC-06 Lab 2 Requester continuity | API-AUTHZ-04, API-REQ-01-API-REQ-03, REG-01, E2E-02 | Planned |
| AC-07 Requester Comment/resolution indication | API-REQ-04, API-REQ-05, UI-REQ-01, E2E-02 | Planned |
| AC-08 Internal Note restriction | API-AUTHZ-05, API-STAFF-08, UI-REQ-01, E2E-02 | Planned |
| AC-09 Queue queries | UNIT-06, API-QUEUE-01-API-QUEUE-05, UI-QUEUE-01, E2E-03 | Planned |
| AC-10 Claim/conflict | API-STAFF-02, API-STAFF-03, UI-STAFF-01, E2E-03 | Planned |
| AC-11 Owner/priority/status workflow | UNIT-04, API-STAFF-04-API-STAFF-06, UI-STAFF-01, E2E-03 | Planned |
| AC-12 Comments/Notes append-only and visibility | UNIT-05, API-STAFF-07, API-STAFF-08, UI-STAFF-01, E2E-03 | Planned |
| AC-13 Administrator valid operations | API-ADMIN-01-API-ADMIN-05, UI-ADMIN-01, E2E-04 | Planned |
| AC-14 Administrator safety | API-ADMIN-06, API-ADMIN-07, UI-ADMIN-01, E2E-04 | Planned |
| AC-15 Non-Administrator restriction | API-ADMIN-08, UI-SHELL-01, UI-ADMIN-01, E2E-04 | Planned |
| AC-16 Responsive/accessibility | UI-QUEUE-02, UI-A11Y-01, E2E-05 | Planned |
| AC-17 Migration/regression | MIG-01-MIG-04, REG-01, REG-02 | Planned |

## 6. Manual Visual and Accessibility Matrix

| Screen | Desktop | Tablet | Mobile | Keyboard/focus | Evidence location |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Login | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/authentication/` |
| Change Password | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/authentication/` |
| Requester Ticket Detail | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/requester-ticket-detail/` |
| Staff Ticket Queue | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/staff-queue/` |
| Staff Ticket Detail | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/staff-ticket-detail/` |
| User Management | Planned | Planned | Planned | Planned | `artifacts/lab-03/screenshots/user-management/` |

Inspection checks include consistent Zen Green tokens, role navigation, status/priority/role badges, editable versus read-only styling, validation placement, focus visibility, privacy labels, clipping, overlap, and horizontal overflow.

## 7. Planned Test Commands

Commands will be finalized when the test files are implemented.

```bash
# Backend unit and API/integration tests
npm --prefix server test

# Backend production build
npm --prefix server run build

# Frontend component tests and production build
npm --prefix client test
npm --prefix client run build

# Lab 3 E2E tests
npx playwright test e2e/lab-03/
```

Migration verification additionally runs Prisma migration and seed commands against a disposable test database. The final results table must record the actual command, commit SHA, date, and Pass/Fail outcome from the integrated branch.

## 8. Completion Evidence

Before this plan is marked complete:

- [ ] Replace `Planned` with actual outcomes only after execution.
- [ ] Record actual test file paths if implementation changes them.
- [ ] Capture complete passing output from final `main`.
- [ ] Record the tested commit SHA.
- [ ] Link failed tests to corrective Issues/PRs instead of hiding failures.
- [ ] Confirm every AC retains at least one passing automated or justified manual test.
