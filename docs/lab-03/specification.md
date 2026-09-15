# Lab 3 Sprint Engineering Specification: TokTickIT Users, Roles, and Operations

## 1. Sprint Goal

Deliver secure, role-aware access to TokTickIT while preserving the completed Lab 2 Requester experience and data. Sprint 3 replaces the Development Requester selector with authenticated users, adds an operational IT Staff Ticket Queue and Ticket Detail workflow, and provides a focused Administrator User Management screen. Completion requires backend-enforced authorization, traceable automated tests, responsive Zen Green interfaces, and reviewable evidence from the final `main` branch.

## 2. Stakeholder Request Interpretation

TokTickIT must use real accounts instead of a client-selected Requester identity. An active user signs in with an email address and password and, when using an initial password, must replace it before accessing normal screens. Requesters continue to manage only their own Tickets and Attachments. IT Staff triage and progress work through a shared queue, while Administrators manage accounts and may perform the explicitly permitted Ticket operations in the authorization matrix. Public Comments support shared communication; Internal Notes remain restricted to operational roles.

## 3. Scope

### 3.1 Included

- Email/password login, logout, current-user retrieval, server-side sessions, and mandatory first-login password change.
- Backend role-based authorization for `REQUESTER`, `IT_STAFF`, and `ADMINISTRATOR`.
- Migration from `RequesterUser` to a single authenticated `User` model without losing existing Tickets or Attachments.
- Removal of the Development Requester selector, its navigation action, and client-side identity state.
- Authenticated continuation of all Lab 2 Requester Ticket and Attachment functions.
- Requester Public Comments and the `Problem Appears Resolved` indication.
- IT Staff Ticket Queue with search, filters, sorting, pagination, ownership, status, and priority information.
- Ticket claim/reassignment, IT Priority, permitted status transitions, Public Comments, and Internal Notes.
- Administrator user list, search, optional role filter, create/edit, activation/deactivation, and initial-password reset.
- Zen Green responsive and accessible UI behavior for desktop, tablet, and mobile.
- Unit, API/integration, UI, security, migration/regression, and end-to-end tests.

### 3.2 Excluded

- Self-registration, email invitations, password-reset email, MFA, social login, and SSO.
- Multiple roles per user, departments, profile photos, role history, or account audit screens.
- User deletion, bulk operations, import/export, and advanced account recovery.
- Actions Taken, formal SLA calculations, escalation, notifications, and advanced dashboards/KPIs.
- Multi-tenancy and production/cloud infrastructure changes.
- Editing or deleting Public Comments or Internal Notes.

## 4. Functional Requirements

### 4.1 Authentication and application shell

- **FR-01:** The system MUST authenticate an active user using a normalized email address and password.
- **FR-02:** The system MUST establish a server-side session and return only safe current-user data.
- **FR-03:** The system MUST invalidate the current session on logout.
- **FR-04:** A user marked `mustChangePassword` MUST change the password before accessing normal application functions.
- **FR-05:** The authenticated shell MUST display the current user's name and role and show role-appropriate navigation.

### 4.2 Authorization and Requester continuity

- **FR-06:** Every protected API MUST authenticate and authorize the request on the backend.
- **FR-07:** Requester identity for Ticket and Attachment operations MUST come from the authenticated session, never from a client-supplied `requesterId`.
- **FR-08:** A Requester MUST be able to create Tickets and view/manage only owned Tickets and permitted Attachments using all retained Lab 2 behavior.
- **FR-09:** A Requester MUST be able to create and view Public Comments on an owned Ticket.
- **FR-10:** A Requester MUST be able to indicate that an owned Ticket's problem appears resolved without formally setting the Ticket to `RESOLVED` or `CLOSED`.

### 4.3 IT Staff Ticket operations

- **FR-11:** IT Staff MUST be able to retrieve a shared Ticket Queue with search, filters, sorting, and pagination.
- **FR-12:** Permitted operational users MUST be able to open Ticket Detail and view Ticket, Requester, Attachment, ownership, priority, status, Comment, and Note information.
- **FR-13:** Permitted operational users MUST be able to claim an unassigned Ticket or assign/reassign it to an active eligible user.
- **FR-14:** Permitted operational users MUST be able to update IT Priority without changing Requested Priority.
- **FR-15:** Permitted operational users MUST be able to change Ticket status only through an approved transition.
- **FR-16:** Permitted operational users MUST be able to create and view Public Comments.
- **FR-17:** Only IT Staff and Administrators MUST be able to create and view Internal Notes.

### 4.4 Administrator user management

- **FR-18:** An Administrator MUST be able to list users and search by name or email, with an optional role filter.
- **FR-19:** An Administrator MUST be able to create a user with name, email, one permitted role, activation state, and initial password.
- **FR-20:** An Administrator MUST be able to edit a user's name, email, role, and activation state.
- **FR-21:** An Administrator MUST be able to set a new initial password that must be changed at the user's next login.
- **FR-22:** The system MUST prevent self-deactivation and deactivation or role change of the last active Administrator.

### 4.5 User experience and feedback

- **FR-23:** Required screens MUST provide meaningful loading, saving, success, validation, empty/no-results, forbidden, not-found, conflict, and safe failure feedback.
- **FR-24:** Required screens MUST be usable on desktop, tablet, and mobile and meet the Lab 2 accessibility baseline.

## 5. Business Rules

### 5.1 Authentication and accounts

- **BR-01:** Only an active user with valid credentials may authenticate.
- **BR-02:** Email matching is case-insensitive after trimming and lowercase normalization; normalized email values are unique.
- **BR-03:** Passwords are hashed with bcrypt using a cost factor of 12 and are never logged, returned, or stored in plaintext.
- **BR-04:** Passwords must contain 10-64 characters, include at least one letter and one number, and encode to no more than 72 UTF-8 bytes for safe bcrypt handling; confirmation must match on password-change forms.
- **BR-05:** Login failure uses one generic message for an unknown email or incorrect password. Inactive accounts use a safe inactive-account message without returning account details.
- **BR-06:** Five failed login attempts within 15 minutes for the same normalized email and source IP cause a 15-minute temporary throttle. This does not add an account-unlock workflow.
- **BR-07:** A server-side session expires after 8 hours, uses a cryptographically random token, and stores only a token hash in the database.
- **BR-08:** The session cookie is `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` outside local development.
- **BR-09:** A user with `mustChangePassword=true` may access only current-user, change-password, and logout endpoints until a valid new password is saved.
- **BR-10:** Changing or resetting a password invalidates all existing sessions for that user.

### 5.2 Authorization and ownership

- **BR-11:** Hidden or disabled UI controls are usability feedback, not authorization; the backend enforces every protected operation.
- **BR-12:** A client-supplied Requester identity is ignored or rejected. The authenticated User ID determines Requester ownership.
- **BR-13:** A Requester may access only owned Tickets and their permitted Attachments and Public Comments.
- **BR-14:** Unauthorized resource access must not reveal whether another user's protected Ticket, Attachment, or Internal Note exists.
- **BR-15:** Every user has exactly one role in Lab 3.

### 5.3 Ticket ownership, priority, and status

- **BR-16:** A Ticket has zero or one primary owner. An owner must be an active `IT_STAFF` or `ADMINISTRATOR` user.
- **BR-17:** Requested Priority is set by the Requester and remains unchanged by operational updates.
- **BR-18:** IT Priority initially copies Requested Priority and may be changed only by IT Staff or Administrators.
- **BR-19:** Required Ticket statuses are `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- **BR-20:** A Requester cannot directly set a Ticket to `RESOLVED`, `CLOSED`, or any other workflow status.
- **BR-21:** `Problem Appears Resolved` records the authenticated Requester and backend timestamp and does not change Ticket status.
- **BR-22:** Claim succeeds only for an unassigned Ticket and assigns the authenticated operational user; a competing claim returns `409 Conflict`.
- **BR-23:** Assignment, priority, and status changes use the latest Ticket state; stale or conflicting updates return `409 Conflict`.

### 5.4 Comments and notes

- **BR-24:** Public Comments are visible to the owning Requester, IT Staff, and Administrators.
- **BR-25:** Internal Notes are visible only to IT Staff and Administrators and must never appear in Requester responses.
- **BR-26:** Public Comments and Internal Notes are append-only in Lab 3.
- **BR-27:** The backend supplies author and creation time. A Public Comment must contain 1-2,000 trimmed characters; an Internal Note must contain 1-4,000 trimmed characters.
- **BR-28:** Comment and Note content is rendered as plain text; executable markup is not interpreted.

### 5.5 Administrator safety

- **BR-29:** Only an Administrator may use User Management endpoints.
- **BR-30:** Administrators cannot deactivate their own account.
- **BR-31:** The last active Administrator cannot be deactivated or changed to another role.
- **BR-32:** Users are deactivated, never deleted, so historical Ticket, Comment, and Note authors remain valid.
- **BR-33:** Creating or updating a user rejects duplicate normalized email addresses and invalid role values.
- **BR-34:** Setting a new initial password sets `mustChangePassword=true` and invalidates that user's sessions.

### 5.6 Validation and regression

- **BR-35:** All timestamps and authorship values are generated by the backend.
- **BR-36:** Existing Lab 2 Ticket number, field, Attachment validation, five-active-file limit, and soft-removal rules remain in force unless explicitly changed here.
- **BR-37:** Safe errors use a stable error code and message and never expose stack traces, hashes, session tokens, or secrets.

## 6. Authorization Matrix

`Own` means the authenticated Requester owns the Ticket. `Operational` means the Ticket operation is available to IT Staff and Administrators. Administrator Ticket permissions are explicit in this matrix and do not arise merely from being authenticated.

| Operation | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| Login, logout, current user, own password change | Yes | Yes | Yes |
| Create Ticket | Yes | No | No |
| List/view Ticket | Own only | All | All |
| Manage Attachment | Own only | View | View |
| View/create Public Comment | Own only | All | All |
| View/create Internal Note | No | All | All |
| Indicate problem appears resolved | Own only | No | No |
| View Ticket Queue | No | Yes | Yes |
| Claim/assign/reassign owner | No | Yes | Yes |
| Change IT Priority | No | Yes | Yes |
| Change Ticket status | No | Yes | Yes |
| List/search/create/edit/deactivate users | No | No | Yes |
| Set a new initial password | No | No | Yes |

## 7. Ticket Status Transition Matrix

Only IT Staff and Administrators may perform the transitions below. The Requester resolution indication is separate from this matrix.

| Current status | Permitted next status | Confirmation / validation |
| :--- | :--- | :--- |
| `NEW` | `OPEN`, `CANCELLED` | `OPEN` requires an owner; `CANCELLED` requires confirmation |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | `RESOLVED` requires confirmation; `CANCELLED` requires confirmation |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | `RESOLVED` requires confirmation; `CANCELLED` requires confirmation |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | `RESOLVED` requires confirmation |
| `RESOLVED` | `CLOSED`, `REOPENED` | Both require confirmation |
| `CLOSED` | `REOPENED` | Requires confirmation |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | An owner is required |
| `CANCELLED` | None | Terminal in Lab 3 |

Actions Taken are not required in Lab 3, so resolution is not blocked by incomplete Actions Taken.

## 8. Data Changes and Migration

### 8.1 Required models

- `User`: `id`, `name`, `email`, `normalizedEmail`, `passwordHash`, `role`, `isActive`, `mustChangePassword`, `createdAt`, `updatedAt`.
- `Session`: `id`, `tokenHash`, `userId`, `expiresAt`, `createdAt`, `lastUsedAt`.
- `Ticket`: existing fields plus `ownerId?`, `itPriority`, `currentStatus`, `resolutionSuggestedAt?`, `resolutionSuggestedById?`, and optimistic concurrency through `updatedAt`.
- `PublicComment`: `id`, `ticketId`, `authorId`, `content`, `createdAt`.
- `InternalNote`: `id`, `ticketId`, `authorId`, `content`, `createdAt`.

Enums are used for `UserRole`, `Priority`, and `TicketStatus`. Foreign keys preserve authorship; users are not cascade-deleted.

### 8.2 Migration strategy

1. Add the new enums, `User`, `Session`, comment/note models, and nullable Ticket fields.
2. Copy every `RequesterUser` into `User` while preserving IDs where possible, role `REQUESTER`, activation state, name, and normalized unique email.
3. Set an approved local-development initial password hash and `mustChangePassword=true` for migrated Requesters.
4. Repoint `Ticket.requesterId` to `User.id` and verify Ticket counts and ownership before removing the old relation/table.
5. Copy each Ticket's Requested Priority into IT Priority and map existing status strings into `TicketStatus` values.
6. Keep Ticket owner nullable and preserve all Category, Related System, Ticket, and Attachment rows.
7. Remove the Development Requester API and client state only after authenticated regression tests pass.

The migration must be additive before destructive cleanup and must include count/ownership verification. Development data may be restored from a documented backup if verification fails.

### 8.3 Seed requirements

- Idempotent upsert behavior based on normalized email and stable Ticket number.
- At least four active and one inactive Requester.
- At least three active and one inactive IT Staff user.
- At least one active Administrator.
- Realistic Tickets across statuses and priorities, including assigned and unassigned Tickets.
- Safe sample Public Comments and Internal Notes.
- Clearly documented local-only credentials; no real passwords or secrets.

## 9. API Contract Summary

The exact contract is defined in [`api-spec.md`](./api-spec.md). Authentication uses an opaque server-side session stored in the `toktickit_session` HttpOnly cookie. CORS permits only the configured client origin with credentials. State-changing requests verify the `Origin` header in addition to `SameSite=Lax` cookie protection.

API groups:

- `/api/auth/*` for login, logout, current user, and password change.
- `/api/tickets` and `/api/attachments/*` for authenticated Requester continuity.
- `/api/tickets/:id/public-comments` and `/api/tickets/:id/resolution-indication` for Requester collaboration.
- `/api/staff/tickets*` for Queue and operational Ticket actions.
- `/api/admin/users*` for Administrator User Management.

## 10. UI Specification Summary

The detailed screen contract is defined in [`ui-spec.md`](./ui-spec.md). Lab 3 reuses the Lab 2 Zen Green tokens and component conventions. The application shell replaces the Development Requester display with the authenticated user's name and role. Public Comments and Internal Notes use visually distinct tabs and warning text. Tables become cards on mobile, controls remain keyboard accessible, and feedback is presented near the affected action without leaking protected information.

## 11. Acceptance Criteria

- **AC-01:** Given an active user with valid credentials, when login succeeds, the backend establishes a session and returns safe identity and role data.
- **AC-02:** Given invalid credentials or an inactive account, when login is attempted, access is denied with a safe response and no protected account data.
- **AC-03:** Given a user with an initial password, when login succeeds, normal screens and APIs remain unavailable until a valid new password is saved.
- **AC-04:** Given an authenticated user, when logout completes, the old session cannot access a protected endpoint.
- **AC-05:** Given a Requester, when any client-controlled `requesterId` is supplied, the backend rejects the parameter and never returns another Requester's protected data.
- **AC-06:** Given an authenticated Requester, when using retained Lab 2 Ticket and Attachment functions, owned resources work and non-owned resources remain protected.
- **AC-07:** Given an owned Ticket, when the Requester posts a valid Public Comment or indicates apparent resolution, authorship and time are recorded by the backend without formally resolving the Ticket.
- **AC-08:** Given a Requester, when an Internal Note endpoint or data path is requested, access is denied and no Note content is returned.
- **AC-09:** Given IT Staff or an Administrator, when Queue search, filters, sorting, or pagination are applied, the matching Tickets and correct metadata are returned.
- **AC-10:** Given an unassigned Ticket, when an operational user claims it, that user becomes owner; a competing stale claim receives a conflict.
- **AC-11:** Given an operational user, when ownership, IT Priority, or status is changed, only valid values and approved status transitions are saved while Requested Priority remains unchanged.
- **AC-12:** Given an operational user, when Public Comments and Internal Notes are created, they remain append-only and appear only to permitted roles.
- **AC-13:** Given an Administrator, when listing, searching, creating, editing, activating/deactivating, or resetting an initial password, valid changes are saved and unsafe/duplicate input is rejected.
- **AC-14:** Given an Administrator, when attempting self-deactivation or removal/deactivation/role change of the last active Administrator, the backend rejects the operation.
- **AC-15:** Given a non-Administrator, when an Administrator endpoint or screen is requested, access is forbidden without returning user-management data.
- **AC-16:** Given desktop, tablet, and mobile viewports, when major Lab 3 screens are used, controls remain readable, keyboard accessible, unclipped, and free from unintended horizontal overflow.
- **AC-17:** Given the Lab 2 database and regression suite, when the Lab 3 migration and application are run, existing data remains correct and retained Requester behavior continues to pass.

Each criterion maps to planned tests in [`tests.md`](./tests.md).

## 12. Product Definition of Done

### 12.1 Product completion

- [ ] FR-01 through FR-24 are implemented.
- [ ] BR-01 through BR-37 are enforced by the backend where applicable.
- [ ] AC-01 through AC-17 are verified by traceable tests.
- [ ] Prisma migration preserves existing Lab 2 Tickets and Attachments.
- [ ] Seed behavior is idempotent and uses safe local-only credentials.
- [ ] Server, client, and E2E test suites pass from the final `main` branch.
- [ ] Server and client production builds pass.
- [ ] Direct API authorization tests cover every protected role boundary.
- [ ] Desktop, tablet, and mobile visual inspection is complete.
- [ ] No password hash, session token, secret, or protected Internal Note leaks to an unauthorized response.

### 12.2 Course delivery completion

- [ ] Lab 3 work is represented by GitHub Issues on the existing Kanban board.
- [ ] Feature branches are reviewed through Pull Requests into `lab3-staging`.
- [ ] Review comments, author responses, approvals, and PR links are recorded in `reviewer.md`.
- [ ] `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` existed before the main implementation PRs were completed.
- [ ] `ai-use.md` identifies the LLM, includes 6-10 selected prompts, and contains the student's reflection.
- [ ] Final evidence and screenshots match the final `main` branch.
- [ ] One concise PDF is submitted with `Answer Part 1` through `Answer Part 9` in order.

## 13. Assumptions and Decisions

1. **Authentication:** Server-side opaque sessions are chosen over client-stored JWTs so logout and password-reset invalidation are explicit and testable.
2. **Administrator Ticket access:** Administrators receive operational Ticket permissions explicitly in the authorization matrix to satisfy the Lab 3 owner, priority, Comment, and Note rules. The normal Administrator navigation remains focused on User Management.
3. **Password storage:** bcrypt cost 12 is suitable for the current Node/Express course stack; the implementation will add the required package in the authentication issue.
4. **Attachments:** Lab 2 upload, download, validation, quota, and soft-removal rules remain unchanged. IT Staff and Administrators have read access in Lab 3; Attachment mutation remains with the owning Requester.
5. **Concurrency:** `updatedAt` is used as an expected-version value for operational Ticket mutations; mismatches return `409 Conflict`.
6. **Requester resolution:** The indication is stored independently of Ticket status and may be cleared automatically when an operational user reopens or continues work.
7. **API compatibility:** Development `requesterId` parameters and `/api/requesters` are removed after authenticated replacements and regression tests are available; they are not retained as a fallback identity mechanism.
8. **Login throttling:** The course implementation may use an in-memory sliding window keyed by normalized email and source IP because production-grade distributed infrastructure is excluded. Restart behavior is documented and covered by deterministic tests.
