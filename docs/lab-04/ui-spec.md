# Lab 4 UI Specification: Actions Taken and Dashboards

> Status: Approved UI contract for Issue 1. It extends the existing Zen Green application shell without replacing retained Lab 3 screens.

## 1. Purpose and shared conventions

Lab 4 adds a role-appropriate Dashboard entry to the authenticated navigation, Actions Taken to Ticket Detail, and final workflow feedback. Existing Zen Green card, badge, button, form, table/card-on-mobile, loading, empty, validation, and error conventions are reused. Status and priority always use text in addition to color.

| Role | Landing dashboard | Retained primary navigation |
| :--- | :--- | :--- |
| Requester | Requester Dashboard | My Tickets, Create Ticket |
| IT Staff | IT Staff Dashboard | Ticket Queue |
| Administrator | IT Staff Dashboard | User Management |

The Dashboard link is active only on a dashboard screen. Existing current-user name, role display, logout, and password-change guard remain visible and unchanged.

## 2. Requester Dashboard

### 2.1 Structure

1. Page title: `My Dashboard` and a short ownership statement.
2. Metric-card row: Open Tickets, Waiting for You, Recently Updated, Recently Resolved.
3. A maximum-five-item `Needs attention / recently updated` list.
4. A maximum-five-item `Recently resolved` list.

Each metric card shows a label, a numeric value, an accessible button or link label such as `View 3 open tickets`, and its drill-down destination. A zero value remains visible and uses an explanatory empty message rather than disappearing.

### 2.2 Drill-down behavior

| Card or list | Destination |
| :--- | :--- |
| Open Tickets | My Tickets filtered to non-terminal statuses |
| Waiting for You | My Tickets filtered to `WAITING_FOR_REQUESTER` |
| Recently Updated / Recently Resolved | Matching My Tickets filter or Ticket Detail for a selected item |
| Recent Ticket item | Owned Ticket Detail |

The client carries documented filter parameters into the existing My Tickets view. It never accepts a Requester ID from the URL or dashboard payload.

## 3. IT Staff Dashboard

### 3.1 Structure

1. Page title: `IT Staff Dashboard` and an operational summary.
2. Metric-card row: Unassigned Tickets, My Owned Tickets, Urgent Active Tickets, Recently Updated Tickets.
3. Compact status-distribution and IT-priority-distribution cards.
4. Maximum-five-item urgent-work list and maximum-five-item recently-updated list.

Administrator sees the same operational dashboard. The existing User Management navigation remains available.

### 3.2 Drill-down behavior

| Card or list | Destination |
| :--- | :--- |
| Unassigned Tickets | Ticket Queue with `assignment=unassigned` |
| My Owned Tickets | Ticket Queue with current-user ownership filter |
| Urgent Active Tickets | Ticket Queue with `itPriority=URGENT` and active-status filter |
| Status / priority distribution | Ticket Queue with selected status or IT Priority |
| Recent or urgent Ticket item | Staff Ticket Detail |

## 4. Actions Taken on Ticket Detail

### 4.1 Shared list

Ticket Detail has an `Actions Taken` section below the Ticket summary and workflow controls. It orders entries by Action Date/Time descending, then ID descending. Every entry shows:

- Action date/time in browser locale with an accessible UTC value available to assistive technology.
- Description and Result as plain text.
- Lifecycle status and assignee, with text labels for `PLANNED`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.
- `Performed by` name and role badge.
- A clear `Follow-up required` or `No follow-up required` text indicator.
- Follow-up Note only when present.
- Attachment Notes only when present.
- Created/updated context when an entry was edited.

The section has loading text, `No actions have been recorded for this ticket.` empty state, and a safe error panel with `Retry`.

### 4.2 Operational create and edit modes

IT Staff and Administrator see an `Add Action Taken` button. It opens an accessible inline panel or modal with:

| Control | Behavior |
| :--- | :--- |
| Action date/time | Required, defaults to current local time, validates the server rule |
| Action description | Required textarea with inline validation |
| Result | Optional until completion; required when completing |
| Assignee | Optional active operational-user selector; rejects inactive or Requester accounts |
| Performed by | Read-only backend value set when the Action is completed |
| Follow-up required | Checkbox or switch |
| Follow-up note | Hidden or disabled until required; required when enabled |
| Attachment notes | Optional textarea describing the relevant attachment/file |
| Save / Cancel | Save disables repeated submit while pending; Cancel closes without mutation |

An operational user sees `Edit Action` plus permitted lifecycle controls for each accessible Action Taken: `Start`, `Complete`, or `Cancel`. The original creator and performer remain read-only. A stale update shows a conflict message and offers `Reload latest action` without silently overwriting entered values. There is no delete control in Lab 4.

### 4.3 Requester mode

Requester sees the same readable Action Taken list only on an owned Ticket. `Add Action Taken`, `Edit Action`, internal staff controls, and all write APIs are unavailable. A direct API attempt is still rejected by the backend.

## 5. Ticket workflow and advisory resolution feedback

Operational users see only the next statuses permitted by the transition matrix in [`specification.md`](./specification.md). The confirmation checkbox is shown for resolve, close, cancel, and any other transition declared to require confirmation. A failed transition shows the backend reason near the controls; status is not optimistically changed.

Requester Ticket Detail contains `Problem appears resolved` as an advisory action. After success, it shows the recorded indication time and explains that IT Staff must formally review the Ticket. It never renders a formal status selector.

When `RESOLVED` is unavailable because no qualifying Action Taken exists, the UI explains that at least one completed Action Taken is required. The backend remains authoritative if a client bypasses this message.

## 6. Feedback and safe-failure contract

| State | Required behavior |
| :--- | :--- |
| Loading | Textual loading state; controls that would duplicate the pending request are disabled |
| Validation | Field-level message placed near the affected input; focus moves to or remains on the actionable error |
| Success | Concise confirmation and refreshed affected list, Ticket summary, or metric |
| Empty | Explicit no-data message and no misleading zero-state card removal |
| Forbidden | Safe role message with no protected record detail |
| Not found | Safe not-found message and a back-to-list/dashboard action |
| Conflict | Explain that newer data exists; provide reload/retry without silently discarding draft data |
| API failure | Error panel and Retry; no destructive UI reset or duplicate request |

## 7. Responsive and accessibility rules

- Desktop uses metric-card grids and readable action/detail cards.
- Tablet allows cards to wrap without clipping controls.
- Mobile changes wide lists to stacked cards; controls remain full-width where needed.
- No major screen has unintended horizontal page scrolling at 320 px, 768 px, or 1440 px viewport widths.
- Inputs have visible labels, validation is programmatically associated, and status/priority/follow-up state has non-color text.
- Modal or panel focus is managed, Escape/Cancel is available where appropriate, and keyboard focus remains visible.
- Dashboard card drill-down uses semantic links or buttons with descriptive accessible names.

## 8. Visual inspection checklist

- [ ] Dashboard cards match the Zen Green spacing, border, and button language.
- [ ] Actions Taken distinguishes editable operational controls from Requester read-only content.
- [ ] All loading, empty, error, and retry states are readable.
- [ ] Desktop, tablet, and mobile screenshots are captured for both dashboards and Actions Taken.
- [x] Keyboard focus on Dashboard and Actions Taken was manually checked in the local browser and reported as passing by the developer on 2026-10-06 (no screenshot supplied).
- [ ] Labels, overlap, clipping, and horizontal overflow are manually verified across the required viewports.
