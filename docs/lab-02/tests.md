# Lab 2 Test Plan and Results: TokTickIT

## 1. Test Strategy

The test plan ensures full traceability between Functional Requirements (FR), Business Rules (BR), Acceptance Criteria (AC), and automated tests across key testing levels:

1. **Unit Tests**: Generator utilities (Ticket Number format `TKT-YYYY-XXXXXX`), file validation helpers.
2. **API / Integration Tests**: Backend REST HTTP endpoints (`POST /api/tickets`, `GET /api/tickets`, `GET /api/tickets/:id`, `POST /api/tickets/:id/attachments`, `GET /api/attachments/:id/download`, `DELETE /api/attachments/:id`), ownership isolation, attachment constraints, search, filtering, and pagination behavior.
3. **UI Component Tests**: React forms, field validation error placement, loading spinner states, badge rendering, responsive ticket list presentation, and soft-removal modal.
4. **Responsive / Visual Checks**: Viewport adaptability at Desktop ($\ge 992\text{px}$), Tablet ($768-991\text{px}$), and Mobile ($< 768\text{px}$).
5. **End-to-End (E2E) Tests**: Complete user journey using Playwright.

---

## 2. Planned Test Table

| Test ID | Level | Mapped Requirement / AC | Test Scenario Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket Number generator returns `TKT-2026-XXXXXX` format | Returns correct padded string format | `server/tests/unit/ticketNumber.test.ts` | Pass |
| **API-01** | API | AC-01, FR-02 | Create ticket with valid data via POST `/api/tickets` | Status 201; returns Ticket Number and `New` status | `server/tests/api/createTicket.api.test.ts` | Pass |
| **API-02** | API | BR-05, BR-06, BR-07 | Create ticket missing required fields or invalid category | Status 400; returns explicit field error messages | `server/tests/api/createTicket.api.test.ts` | Pass |
| **API-03** | API | AC-03, BR-13, FR-04 | Strict ticket ownership isolation for active Requester | Status 200; returns only tickets owned by active Requester | `server/tests/api/myTickets.api.test.ts` | Pass |
| **API-04** | API | FR-05, FR-06 | My Tickets search, filter by category/priority/status, pagination | Status 200; returns filtered data with pagination metadata | `server/tests/api/myTickets.api.test.ts` | Pass |
| **API-05** | API | AC-05, BR-11, BR-13 | Upload attachment to existing ticket with ownership protection & 5 active files quota | Status 201 on success; 403 on non-owner; 400 on quota exceeded | `server/tests/api/attachments.api.test.ts` | Pass |
| **API-06** | API | AC-06, BR-12, BR-13 | Soft-remove attachment with valid reason & block download for removed files | Status 200; `isRemoved = true`; download blocked with 403 | `server/tests/api/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02, FR-01 | Unselected Requester attempts ticket view | Redirected to Requester Selection screen | `client/src/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-02** | UI | AC-04, BR-09, BR-10 | Select invalid file format or size $> 5\text{MB}$ in form | Shows field-level red error under file input | `client/src/components/CreateTicketForm.tsx` | Pass |
| **UI-03** | UI | FR-06 | Responsive My Tickets layout (Table on Desktop, Cards on Mobile) | Displays Table on $\ge 768\text{px}$ and Cards on $< 768\text{px}$ | `client/src/components/MyTicketsList.tsx` | Pass |
| **UI-04** | UI | AC-06, BR-12 | Soft removal confirmation modal enforcing mandatory removal reason | Requires valid reason before submitting soft removal | `client/src/components/AttachmentSection.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-07 | Complete journey: Select Requester -> Create Ticket -> Search in My Tickets -> Detail | Ticket created and found in list with matching info | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Covered Test IDs | Verification Status |
| :--- | :--- | :--- |
| **AC-01** (Create Ticket Success) | `API-01`, `E2E-01` | Verified & Passing |
| **AC-02** (Requester Selector Required) | `UI-01`, `E2E-01` | Verified & Passing |
| **AC-03** (Ownership Protection) | `API-03`, `API-05`, `API-06` | Verified & Passing |
| **AC-04** (File Size & Type Validation) | `UNIT-01`, `UI-02` | Verified & Passing |
| **AC-05** (Max 5 Attachments Limit) | `API-05` | Verified & Passing |
| **AC-06** (Soft Removal with Reason) | `API-06`, `UI-04` | Verified & Passing |
| **AC-07** (Search, Filter, Pagination) | `API-04`, `UI-03`, `E2E-01` | Verified & Passing |
| **AC-08** (Responsive Mobile View) | `UI-03` | Verified & Passing |

---

## 4. Responsive and Visual Checklist

- [x] No horizontal scrolling on mobile viewports ($< 768\text{px}$).
- [x] Responsive My Tickets view switches automatically to Mobile Cards on screen width $< 768\text{px}$.
- [x] Status and Priority badges maintain consistent Zen Green Theme colors.
- [x] Form error messages render immediately below corresponding fields without clipping.
- [x] Soft-removed attachment items show strikethrough styling and disabled download actions.

---

## 5. Test Execution Commands

```bash
# Run unit & API backend tests
npx vitest run tests/unit/
npx vitest run tests/api/

# Run frontend UI component build check
npm --prefix client run build

# Run Playwright E2E tests
npx playwright test e2e/lab-02/
```
