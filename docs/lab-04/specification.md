# Lab 4 Sprint Engineering Specification: TokTickIT Actions Taken, Dashboards, and Final Regression

> Status: Approved implementation contract for Issue 1. It defines the Lab 4 scope before feature code is started.

## 1. Sprint Goal

Complete TokTickIT's service-desk workflow by recording the work performed on a Ticket, enforcing a final status lifecycle, and providing concise role-appropriate dashboards. The increment preserves all authenticated Requester, IT Staff, Administrator, comment, note, attachment, and user-management behavior delivered through Lab 3.

## 2. Stakeholder Request Interpretation

IT Staff need a reliable record of work performed under a Ticket without changing the primary Ticket Owner model. Each Ticket may have multiple Actions Taken by different eligible operational users. Requesters can read Action Taken information for their own Tickets but cannot change it. Dashboards summarize authoritative data and link users to existing detailed views; they do not replace the Ticket Queue or My Tickets. A Requester indication that a problem appears resolved remains advisory until IT Staff formally updates the Ticket.

## 3. Scope

### 3.1 Included

- A Ticket-to-Actions-Taken parent-child model, migration, idempotent seed data, APIs, validation, authorization, and stale-update protection.
- A final backend-enforced Ticket status transition matrix and resolution gate.
- Requester and IT Staff dashboards, with Administrator reuse of the IT Staff dashboard.
- Dashboard metric calculations, empty behavior, and drill-down destinations.
- Ticket Detail Action Taken list, create/edit modes, and Requester read-only view.
- Regression, responsive, accessibility, safe-failure, and release verification across Labs 1 to 3.

### 3.2 Explicitly excluded

- SLA clocks, escalation, on-call scheduling, and breach notifications.
- Email, SMS, LINE, push, or other external notifications.
- Inventory, purchasing, labour cost, billing, approval workflows, reporting warehouses, and multi-tenancy.
- Action Taken deletion, external file storage changes, or new features not approved in this contract.

## 4. Functional Requirements

### 4.1 Actions Taken

- **FR-01:** A permitted operational user MUST be able to view Actions Taken on an accessible Ticket.
- **FR-02:** IT Staff and Administrators MUST be able to create, assign, edit, start, complete, and cancel an Action Taken on an accessible Ticket.
- **FR-03:** IT Staff and Administrators MUST be able to edit an existing Action Taken on an accessible Ticket using stale-update protection without deleting audit history.
- **FR-04:** An Action Taken MUST record action date/time, description, result, assignment, authenticated creator/performer, follow-up requirement, follow-up note, attachment notes, and lifecycle state.
- **FR-05:** A Requester MUST be able to view Actions Taken only for an owned Ticket and MUST NOT create or update them.

### 4.2 Ticket workflow

- **FR-06:** The backend MUST enforce the approved Ticket status transition matrix for every status mutation.
- **FR-07:** An eligible operational user MUST formally resolve or close a Ticket only when the resolution gate is satisfied.
- **FR-08:** A Requester MUST be able to indicate that an owned Ticket appears resolved; the indication MUST NOT itself change the formal Ticket status.
- **FR-09:** Ticket Detail MUST show only permitted status transitions and refresh its status summary after a successful update.

### 4.3 Dashboards

- **FR-10:** A Requester dashboard MUST return only metrics and recent Tickets owned by the authenticated Requester.
- **FR-11:** An IT Staff dashboard MUST return operational metrics for unassigned Tickets, Tickets owned by the current user, status/priority distribution, and recent or urgent work.
- **FR-12:** An Administrator MAY use the IT Staff dashboard and retains the existing Administrator User Management navigation.
- **FR-13:** Dashboard cards and items MUST provide an accessible drill-down to an existing filtered Ticket view or Ticket Detail where practical.
- **FR-14:** Dashboard calculations MUST be performed by the backend and return concise documented payloads, not whole Ticket collections.

### 4.4 Product hardening

- **FR-15:** All retained Lab 1 to 3 role navigation, authorization, Ticket, attachment, comment, note, authentication, and user-management behavior MUST continue to work.
- **FR-16:** Lab 4 screens MUST provide loading, validation, success, empty, forbidden, conflict, not-found, and safe-failure feedback appropriate to the operation.
- **FR-17:** Major Lab 4 screens MUST preserve the Zen Green language and work at desktop, tablet, and mobile widths with keyboard-accessible controls and visible focus.

## 5. Business Rules

### 5.1 Actions Taken

- **BR-01:** An Action Taken belongs to exactly one Ticket and cannot be moved to another Ticket.
- **BR-02:** A Ticket has zero or one primary Ticket Owner, while one or more eligible operational users may perform Actions Taken on it.
- **BR-03:** `createdById` is derived exclusively from the authenticated session on creation. `performedById` is set only by the authenticated operational user who completes the Action Taken. Neither identity is accepted from a client request.
- **BR-04:** `actionOccurredAt` is required and stored in UTC. Planned work may be scheduled in the future; an Action Taken completed with a future time beyond five minutes is rejected. The UI defaults to the current server time.
- **BR-05:** Action Description and Result are required trimmed plain text of 1-2,000 characters each. Attachment Notes are optional trimmed plain text of at most 1,000 characters.
- **BR-06:** When `followUpRequired=true`, Follow-up Note is required trimmed plain text of 1-2,000 characters. When false, the note is stored as `null`.
- **BR-07:** An Action Taken may be assigned only to an active `IT_STAFF` or `ADMINISTRATOR` user. Inactive users and Requesters are rejected. The primary Ticket Owner and Action Taken assignee may differ.
- **BR-08:** Action lifecycle transitions are `PLANNED → IN_PROGRESS | COMPLETED | CANCELLED` and `IN_PROGRESS → COMPLETED | CANCELLED`; `COMPLETED` and `CANCELLED` are terminal. Completion requires a Result and records performer/time on the backend.
- **BR-09:** Actions Taken are not deleted in Lab 4. Every create, edit, assignment, and lifecycle transition appends an audit event. An edit preserves original creator/performed-by attribution, records `updatedAt`, and requires the latest `updatedAt` value.
- **BR-10:** IT Staff and Administrators may create or edit Actions Taken on operationally accessible Tickets. Requesters have read-only access only to Actions Taken of owned Tickets.

### 5.2 Ticket workflow and resolution

- **BR-11:** Required statuses are `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- **BR-12:** Only IT Staff and Administrators may change formal Ticket status. Requesters cannot set a formal status.
- **BR-13:** A Ticket must have an active operational owner before it can enter `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `RESOLVED`.
- **BR-14:** Moving a Ticket to `RESOLVED` requires explicit confirmation, at least one completed Action Taken with a non-empty Result, and no unfinished Action Taken requiring follow-up. The backend enforces this rule.
- **BR-15:** Moving a Ticket to `CLOSED` requires explicit confirmation and may occur only from `RESOLVED`. Moving to `CANCELLED` requires explicit confirmation.
- **BR-16:** A Requester resolution indication records the authenticated Requester and a backend timestamp without changing `currentStatus`.
- **BR-17:** Status, owner, priority, and Action Taken edits require the latest resource `updatedAt`; stale writes return `409 Conflict` without overwriting newer data.

### 5.3 Dashboards and security

- **BR-18:** A Requester dashboard query is always scoped to the authenticated Requester ID; a client cannot select another Requester.
- **BR-19:** Dashboard metrics use the database as the authoritative source and return zero counts plus empty arrays when there are no matching Tickets.
- **BR-20:** Open Ticket counts exclude `RESOLVED`, `CLOSED`, and `CANCELLED`. Recent Tickets are ordered by `updatedAt DESC`, then `id DESC`, and limited to five records.
- **BR-21:** Urgent work means `itPriority=URGENT` and a status other than `CLOSED` or `CANCELLED`.
- **BR-22:** Hidden or disabled controls are not authorization. Every protected read and write is authorized by the backend and safe errors reveal no protected data.
- **BR-23:** Existing attachment, Public Comment, Internal Note, authentication, session, and Administrator safety rules remain in force unless this contract explicitly changes them.

## 6. Authorization Matrix

`Own` means the authenticated Requester owns the Ticket. `Operational` means IT Staff and Administrator access. Administrator Ticket permissions are explicitly listed and do not arise from merely being authenticated.

| Operation | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| View Actions Taken | Own only | All | All |
| Create / assign / edit / start / complete / cancel Actions Taken | No | All | All |
| Indicate problem appears resolved | Own only | No | No |
| Change Ticket owner, priority, or status | No | All | All |
| Requester Dashboard | Own only | No | No |
| IT Staff Dashboard | No | Own operational view | Operational view |
| User Management | No | No | Yes |
| Existing own Ticket / Attachment / Public Comment actions | Own only | View where already permitted | View where already permitted |
| Existing Internal Note actions | No | All | All |

## 7. Ticket Status Transition Matrix

Only IT Staff and Administrators may perform these transitions. The Requester advisory indication is separate from this matrix.

| Current status | Permitted next status | Backend validation |
| :--- | :--- | :--- |
| `NEW` | `OPEN`, `CANCELLED` | `OPEN` requires owner; cancellation confirmation required |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | Owner required for non-terminal work |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | `RESOLVED` requires BR-12; cancellation confirmation required |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | `RESOLVED` requires BR-12 |
| `RESOLVED` | `CLOSED`, `REOPENED` | Confirmation required |
| `CLOSED` | `REOPENED` | Confirmation required |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | Owner required for work transitions |
| `CANCELLED` | None | Terminal in Lab 4 |

## 8. Data Changes and Migration

### 8.1 Model decision

Add `ActionTaken` with `id`, `ticketId`, `assigneeId?`, `createdById`, `performedById?`, `actionOccurredAt`, `description`, `result?`, `status`, `followUpRequired`, `followUpNote?`, `attachmentNotes?`, `createdAt`, and `updatedAt`; plus append-only `ActionTakenEvent` audit rows. `Ticket.actionsTaken` is a one-to-many relation. Index `(ticketId, actionOccurredAt DESC)` supports ordered Ticket Detail retrieval; indexes for assignee and performer support current-user views.

### 8.2 Migration and recovery decision

The migration is additive: create the table, add foreign keys and indexes, then retain all existing Ticket and related data. Legacy Tickets have an empty Action Taken list and remain readable. Dashboard calculations include legacy Tickets; those with no Actions Taken simply cannot pass the new resolution gate until work is recorded. Before production-like migration testing, take a database backup or disposable test database snapshot. If verification fails, restore the snapshot; no destructive rollback is required for the additive schema change.

### 8.3 Seed decision

Seed data is idempotent by stable Ticket number and stable Action Taken fixture keys. It contains major statuses/priorities, assigned and unassigned Tickets, and Tickets with zero, one, and multiple Actions Taken. It also produces both non-zero and zero dashboard metric states without relying on real credentials.

## 9. API and UI Contract Summary

The detailed REST contract is in [`api-spec.md`](./api-spec.md) and the detailed screen contract is in [`ui-spec.md`](./ui-spec.md). The existing authenticated shell adds a role-appropriate Dashboard entry while retaining the appropriate previous navigation. All state-changing requests retain trusted-origin and session protections established in Lab 3.

## 10. Acceptance Criteria

- **AC-01:** Given a permitted operational user and valid data, when an Action Taken is created, it is saved under the selected Ticket with backend-derived creator and time fields.
- **AC-02:** Given follow-up is required, when Follow-up Note is missing, creation and update are rejected with an actionable validation message.
- **AC-03:** Given a Requester, when Actions Taken for an owned and non-owned Ticket are requested, only owned Ticket data is returned and all write attempts are forbidden.
- **AC-04:** Given two operational users editing an Action Taken or Ticket workflow state, when one saves first, the stale request receives `409 Conflict` and does not overwrite the newer record.
- **AC-05:** Given an operational user, when an invalid Action/Ticket status transition, inactive assignment, or resolution without qualifying completed Actions is requested, the backend rejects it and preserves state.
- **AC-06:** Given a Requester indication, when it is recorded for an owned Ticket, the indication timestamp is saved while formal status remains unchanged.
- **AC-07:** Given a Requester, when dashboard data is retrieved, all counts and recent Tickets belong only to that Requester and drill-down filters match the metric.
- **AC-08:** Given IT Staff or an Administrator, when dashboard data is retrieved, authoritative unassigned, owned, status/priority, recent, and urgent values match database queries.
- **AC-09:** Given an empty matching dataset or an unavailable dashboard/API request, the UI shows a clear empty or safe-failure state with a retry path and does not discard entered data.
- **AC-10:** Given desktop, tablet, and mobile viewports, when major Actions Taken and Dashboard screens are used by keyboard, content remains labelled, focused, readable, and free from unintended horizontal overflow.
- **AC-11:** Given the integrated Lab 4 application, when all earlier role journeys run, authentication, ownership, Tickets, attachments, comments, notes, staff work, and user management remain correct.

## 11. Definition of Done

- [ ] FR-01 through FR-17 are implemented and backend rules are enforced.
- [ ] BR-01 through BR-23 are covered by automated or justified manual tests.
- [ ] Each AC maps to one or more entries in [`tests.md`](./tests.md).
- [ ] Migration, repeated seed, and legacy-data behavior are verified on a disposable database.
- [ ] Server, client, API, regression, and E2E suites pass on the integrated release candidate and final `main` branch.
- [ ] Dashboard and Action Taken screens pass visual, responsive, keyboard, and safe-failure checks.
- [ ] README, review record, AI-use record, screenshots, and release evidence are current.

## 12. Assumptions and Decisions

- An Action Taken has a planned-to-completed lifecycle and is editable but never deletable during Lab 4. Its creator and, when completed, original performer remain attributable after edits.
- Existing `requesterResolvedAt` semantics are retained as the advisory Requester indication; no duplicate status field is introduced.
- The primary Ticket Owner coordinates the workflow; Action performer is not an assignment field.
- Date/time values are stored and compared in UTC. The UI may display them in the browser locale.
- Administrator reuses the IT Staff dashboard rather than receiving a separate expanded analytics product.
