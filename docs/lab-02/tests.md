# Lab 2 Test Plan and Results: TokTickIT

## 1. Test Strategy

The test plan ensures full traceability between Functional Requirements (FR), Business Rules (BR), Acceptance Criteria (AC), and automated tests across five key testing levels:

1. **Unit Tests**: Generator utilities (Ticket Number format), file validation helpers, query builder transformers.
2. **API / Integration Tests**: Backend HTTP endpoints, ownership checks, attachment constraints, pagination behavior.
3. **UI Component Tests**: React forms, validation error placement, loading spinner states, badge rendering.
4. **Responsive / Visual Checks**: Viewport adaptability at Desktop ($\ge 992\text{px}$), Tablet ($768-991\text{px}$), and Mobile ($< 768\text{px}$).
5. **End-to-End (E2E) Tests**: Complete user journey using Playwright.

---

## 2. Planned Test Table

| Test ID | Level | Mapped Requirement / AC | Test Scenario Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket Number generator returns `TKT-2026-XXXXXX` format | Returns correct padded string format | `server/tests/lab-02/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | BR-09, BR-10 | File validator checks size ($\le 5\text{MB}$) and MIME types | Validates PDF/JPG/PNG/WEBP correctly | `server/tests/lab-02/file-validator.test.ts` | Pass |
| **API-01** | API | AC-01, FR-02 | Create ticket with valid data | Status 201; returns Ticket Number and `New` status | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | BR-05, BR-06 | Create ticket missing required fields | Status 400; returns explicit field errors | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-03, BR-13 | Access ticket owned by another Requester | Status 403 Forbidden | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-04** | API | AC-05, BR-11 | Upload 6th attachment to ticket with 5 active files | Status 422 Unprocessable Entity | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-05** | API | AC-06, BR-12 | Soft-remove attachment with valid reason | Status 200; `isRemoved = true`; download blocked | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02 | Unselected Requester attempts ticket view | Redirected to Requester Selection screen | `client/src/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-02** | UI | AC-04 | Select invalid file format or size $> 5\text{MB}$ in form | Shows field-level red error under dropzone | `client/src/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | BR-12 | Soft-removed attachment display | Grayed out with strike-through, download hidden | `client/src/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-07 | Complete journey: Select Requester -> Create Ticket -> Search in My Tickets | Ticket created and found in list with matching info | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Covered Test IDs | Verification Status |
| :--- | :--- | :--- |
| **AC-01** (Create Ticket Success) | `API-01`, `E2E-01` | Planned & Traceable |
| **AC-02** (Requester Selector Required) | `UI-01` | Planned & Traceable |
| **AC-03** (Ownership Protection) | `API-03` | Planned & Traceable |
| **AC-04** (File Size & Type Validation) | `UNIT-02`, `UI-02` | Planned & Traceable |
| **AC-05** (Max 5 Attachments Limit) | `API-04` | Planned & Traceable |
| **AC-06** (Soft Removal with Reason) | `API-05`, `UI-03` | Planned & Traceable |
| **AC-07** (Search, Filter, Pagination) | `E2E-01` | Planned & Traceable |
| **AC-08** (Responsive Mobile View) | `E2E-01` | Planned & Traceable |

---

## 4. Responsive and Visual Checklist

- [x] No horizontal scrolling on mobile viewports ($< 768\text{px}$).
- [x] Primary buttons maintain minimum height of 44px for touch targets.
- [x] Status and Priority badges maintain consistent Zen Green Theme colors.
- [x] Form error messages render immediately below corresponding fields without clipping.

---

## 5. Test Execution Commands

```bash
# Run unit & API backend tests
npm --prefix server test

# Run frontend UI component tests
npm --prefix client test

# Run Playwright E2E tests
npx playwright test e2e/lab-02/
```
