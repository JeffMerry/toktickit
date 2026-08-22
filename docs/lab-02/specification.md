# Lab 2 Sprint Engineering Specification: TokTickIT Requester Ticketing MVP

## 1. Sprint Goal
Deliver a fully functional, responsive Requester-facing IT support ticketing MVP with a consistent Zen Green design system. The system enables Requesters to select a temporary testing identity, create IT support tickets with permitted attachments, view and manage their owned tickets with search/filtering/sorting/pagination, inspect ticket details, and soft-remove attachments safely—all validated through spec-driven and test-driven engineering contracts.

---

## 2. Stakeholder Request Interpretation
The IT department requires a professional, end-user-facing ticketing experience. A Requester must be able to submit a ticket with a summary, category, related system, requested priority, description, and supporting evidence files. Once submitted, the system generates a unique, official Ticket Number and saves the data securely. 

Requesters can view their tickets in a dedicated "My Tickets" screen with search, filtering, sorting, and pagination capabilities, ensuring complete data isolation so no user can access another user's tickets. Since authentication will be introduced in Lab 3, Lab 2 features a temporary **Development Requester Selection** screen to simulate multi-user testing contexts. The application must strictly enforce the Zen Green Theme across all views.

---

## 3. Scope

### Included
- **Development Requester Context**: Temporary simulated login selector to switch between active seeded Requesters.
- **Create Ticket Workflow**: Form submission with field validations, attachment uploads, system-generated Ticket Number, and initial status `New`.
- **My Tickets Workflow**: Paginated list of tickets owned strictly by the active Requester with search, filter (Category, Priority, Status), and sorting capabilities.
- **Ticket Detail (View Mode)**: Read-only presentation of ticket info and attachment section.
- **Attachment Lifecycle**: Upload (JPG, PNG, WEBP, PDF up to 5MB, max 5 active files per ticket), metadata display, secure download for active files, and soft-removal with reason recording.
- **Zen Green Design System**: Consistent visual layout, accessible components, and responsive design across Desktop ($\ge 992\text{px}$), Tablet ($768-991\text{px}$), and Mobile ($< 768\text{px}$).

### Excluded
- Real authentication, login/logout sessions, password hashing, JWTs, or role-based authorization (deferred to Lab 3).
- IT Staff workflow (Ticket queues, claiming/reassigning tickets, changing IT Priority, resolving/closing tickets).
- Ticket collaboration (Public comments, internal notes, actions taken).
- Lifecycle status transitions beyond initial `New` state creation.
- Admin management of users, categories, or reference data.

---

## 4. Functional Requirements

- **FR-01**: The system MUST allow the user to select an active Development Requester identity from a dropdown list to establish the session testing context.
- **FR-02**: The system MUST allow a Requester to submit a new IT support ticket containing Category, Related System, Requested Priority, Summary, Description, and optional initial Attachments.
- **FR-03**: The backend MUST generate a unique, non-sequential or formatted Ticket Number upon successful ticket creation.
- **FR-04**: The system MUST display only tickets belonging to the currently selected Development Requester on the "My Tickets" screen.
- **FR-05**: The system MUST support searching tickets by Ticket Number or Summary, and filtering by Category, Requested Priority, and Current Status.
- **FR-06**: The system MUST support pagination and multi-column sorting (Created Date, Ticket Number, Priority, Status).
- **FR-07**: The system MUST display a read-only Ticket Detail view for an owned ticket, preventing cross-requester access.
- **FR-08**: The system MUST allow Requesters to attach permitted files during or after ticket creation, up to 5 active files per ticket.
- **FR-09**: The system MUST support soft-removal of attachments with a required removal reason, preserving metadata while blocking download/preview access.

---

## 5. Business Rules

- **BR-01**: Official Ticket Number is generated strictly by the backend (format: `TKT-YYYY-XXXXXX`) and cannot be modified by the frontend.
- **BR-02**: Every newly created ticket MUST start with `Current Status = New`.
- **BR-03**: The Development Requester selection is for testing context only and MUST NOT be treated as authenticated identity or security mechanism.
- **BR-04**: Inactive Requesters MUST NOT appear in the Development Requester selection dropdown.
- **BR-05**: Ticket Summary is required (min 5 chars, max 100 chars, whitespace trimmed).
- **BR-06**: Ticket Description is required (min 10 chars, max 2000 chars, whitespace trimmed).
- **BR-07**: Category and Related System MUST be valid active references from the database.
- **BR-08**: Requested Priority MUST be one of `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- **BR-09**: Allowed attachment file types are strictly `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
- **BR-10**: Maximum size per attachment file is 5 MB ($5 \times 1024 \times 1024$ bytes).
- **BR-11**: Maximum number of active attachments per ticket is 5. Attempts to upload a 6th active file MUST be rejected.
- **BR-12**: Attachment removal MUST be implemented as a soft-removal (`isRemoved = true`, recording `removedAt` timestamp and `removalReason`). Soft-removed attachments MUST NOT be downloadable or previewable.
- **BR-13**: Requesters can only access, view, or modify tickets and attachments that they own (`requesterId` match). Accessing another Requester's ticket MUST return a 403 Forbidden or 404 Not Found error.

---

## 6. UI Specification Summary

- **Color Tokens**: Primary Green `#006B3C`, Secondary Green `#0B7A46`, Pale Green `#EAF6EF`, Background `#F5F7F6`, Surface/Card `#FFFFFF`, Text Charcoal `#1F2937`, Error Red `#DC2626`.
- **Form Controls**: Labels positioned above inputs; required fields indicated with a red asterisk `*`. Validation messages rendered directly under the corresponding input field.
- **State Feedback**: Submit buttons show a loading spinner and enter disabled state during API requests. Clear empty states for lists with no tickets and no-results search states.
- **Responsive Layout**: Desktop ($\ge 992\text{px}$) multi-column layout; Tablet ($768-991\text{px}$) two-column layout; Mobile ($< 768\text{px}$) single-column stacked layout with touch-friendly targets ($\ge 44\text{px}$).

---

## 7. Data Changes

### Prisma Models Required:
1. `RequesterUser`: `id`, `name`, `email`, `department`, `isActive`, `createdAt`, `updatedAt`
2. `Category`: `id`, `name`, `description`, `isActive`
3. `RelatedSystem`: `id`, `name`, `description`, `isActive`
4. `Ticket`: `id`, `ticketNumber` (unique), `requesterId`, `categoryId`, `relatedSystemId`, `requestedPriority`, `currentStatus`, `summary`, `description`, `createdAt`, `updatedAt`
5. `Attachment`: `id`, `ticketId`, `fileName`, `fileSize`, `mimeType`, `storagePath`, `isRemoved`, `removedAt`, `removalReason`, `createdAt`

---

## 8. API Contract Summary

- `GET /api/requesters` — Fetch active development requesters.
- `GET /api/categories` — Fetch active ticket categories.
- `GET /api/related-systems` — Fetch active related systems.
- `POST /api/tickets` — Create a new ticket for the active requester.
- `GET /api/tickets?requesterId=X&search=...&category=...&priority=...&status=...&page=1&limit=10&sortBy=createdAt&sortOrder=desc` — Paginated list of owned tickets.
- `GET /api/tickets/:id?requesterId=X` — Retrieve detail of an owned ticket.
- `POST /api/tickets/:id/attachments` — Upload attachment for owned ticket.
- `GET /api/attachments/:id/download?requesterId=X` — Secure file download.
- `DELETE /api/attachments/:id` — Soft-remove attachment with payload `{ requesterId, reason }`.

---

## 9. Acceptance Criteria

- **AC-01**: Given valid ticket form data, when the Requester submits the form, then one ticket is saved in the database with status `New`, and the official generated Ticket Number (e.g. `TKT-2026-000001`) is displayed.
- **AC-02**: Given no Development Requester is selected, when the user attempts to access "My Tickets" or "Create Ticket", then the user is redirected to the Development Requester Selection screen.
- **AC-03**: Given Requester A is selected, when requesting a ticket or ticket list belonging to Requester B, then access is denied (403/404) and Requester B's data is never returned.
- **AC-04**: Given a file larger than 5MB or an unsupported file type (e.g., `.exe`), when the Requester attempts to attach it, then submission is blocked with an explicit field validation error message.
- **AC-05**: Given a ticket with 5 active attachments, when the user tries to add a 6th attachment, then the system rejects the upload with an error message stating maximum limit reached.
- **AC-06**: Given an active attachment on an owned ticket, when the user confirms soft-removal with a valid reason, then the attachment status becomes soft-removed, download links are disabled/hidden, and the removal reason is saved.
- **AC-07**: Given a search query or filter criteria in "My Tickets", when applied, then the ticket list filters dynamically in real-time or upon form submission, updating pagination counters correctly.
- **AC-08**: Given screen resize to mobile viewport ($< 768\text{px}$), when viewing "My Tickets" and "Create Ticket", then all controls stack vertically with no horizontal scrolling or clipped labels.

---

## 10. Definition of Done

### Part 1: Product Completion
- [ ] All functional requirements (FR-01 to FR-09) and business rules (BR-01 to BR-13) implemented.
- [ ] All acceptance criteria (AC-01 to AC-08) satisfied and verified.
- [ ] 100% passing automated unit, API, UI, and E2E tests.
- [ ] Conformance to Zen Green UI specification verified across Desktop, Tablet, and Mobile viewports.
- [ ] Graceful error handling for API failures, validation errors, and empty states.

### Part 2: Course Delivery Requirements
- [ ] Feature branches merged into `lab2-staging` via peer-reviewed Pull Requests.
- [ ] Complete `docs/lab-02/` documentation (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
- [ ] Screenshots collected under `artifacts/lab-02/screenshots/`.
- [ ] Final release PR merged from `lab2-staging` to `main`.
- [ ] Single concise PDF generated with Answer Part 1 through Part 9.

---

## 11. Assumptions and Decisions

1. **Development Login Storage**: Selected Requester ID is stored in `localStorage` and sent via request headers (`x-requester-id`) or query parameters for all API calls to simulate user context.
2. **Ticket Number Format**: Sequential format `TKT-2026-XXXXXX` padded with 6 digits for clear visual identity.
3. **Storage Strategy**: Attachments stored locally in `server/uploads/attachments/` with sanitized, timestamped unique filenames while preserving original filename in metadata.
