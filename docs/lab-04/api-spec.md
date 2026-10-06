# Lab 4 API Contract: Actions Taken, Workflow, and Dashboards

> Status: Approved API contract for Issue 1. All protected routes use the existing server-side `toktickit_session` cookie and trusted-origin protection for state-changing requests.

## 1. Conventions

- JSON uses camelCase. Timestamps are ISO 8601 UTC strings.
- The backend derives authenticated identity, role, and Action Taken performer; clients do not submit trusted identity fields.
- `401` means no valid session, `403` means authenticated but forbidden, `404` is a safe not-found response, `409` means stale/conflicting state, and `422` means domain validation failed.
- State-changing Ticket and Action Taken updates require `expectedUpdatedAt`, an ISO timestamp previously returned by the server.
- Error shape is `{ "error": "Safe human-readable message." }`. Error responses never contain stack traces, password/session data, or another Requester data.

## 2. Actions Taken

### 2.1 Read Action Taken list

```http
GET /api/tickets/:ticketId/actions-taken
```

Requester may read only an owned Ticket. IT Staff and Administrator may read an operationally accessible Ticket.

```json
{
  "data": [
    {
      "id": 41,
      "ticketId": 12,
      "actionOccurredAt": "2026-09-29T03:30:00.000Z",
      "description": "Replaced the faulty network cable.",
      "result": null,
      "status": "PLANNED",
      "assignee": { "id": 6, "name": "Mary Support", "role": "IT_STAFF" },
      "createdBy": { "id": 6, "name": "Mary Support", "role": "IT_STAFF" },
      "performedBy": null,
      "followUpRequired": true,
      "followUpNote": "Confirm connection quality tomorrow.",
      "attachmentNotes": "See cable-test-photo.jpg in the Ticket attachments.",
      "createdAt": "2026-09-29T03:31:00.000Z",
      "updatedAt": "2026-09-29T03:31:00.000Z"
    }
  ]
}
```

### 2.2 Create Action Taken

```http
POST /api/staff/tickets/:ticketId/actions-taken
Content-Type: application/json
```

IT Staff and Administrator only. Request body:

```json
{
  "actionOccurredAt": "2026-09-29T03:30:00.000Z",
  "description": "Replaced the faulty network cable.",
  "assigneeId": 6,
  "followUpRequired": true,
  "followUpNote": "Confirm connection quality tomorrow.",
  "attachmentNotes": "See cable-test-photo.jpg in the Ticket attachments."
}
```

Returns `201 Created` with a `PLANNED` Action Taken. `createdBy` comes from the session; `performedBy` is set only when the Action is completed. Returns `422` for invalid date, missing Description, an inactive/ineligible assignee, or missing Follow-up Note when required.

### 2.3 Update Action Taken

```http
PATCH /api/staff/actions-taken/:actionId
Content-Type: application/json
```

IT Staff and Administrator only. Body has the same editable fields as create, may include `result`, and includes:

```json
{ "expectedUpdatedAt": "2026-09-29T03:31:00.000Z" }
```

Returns `200 OK` with the edited Action Taken. The original creator, performer, and `createdAt` never change. Completed and cancelled Actions cannot be reassigned. Returns `409` for stale `expectedUpdatedAt`; the client reloads current data before retrying.

### 2.4 Transition Action Taken lifecycle

```http
PATCH /api/staff/actions-taken/:actionId/status
Content-Type: application/json
```

```json
{
  "status": "COMPLETED",
  "result": "Connection is stable after verification.",
  "expectedUpdatedAt": "2026-09-29T03:31:00.000Z"
}
```

IT Staff and Administrator only. The backend permits `PLANNED → IN_PROGRESS | COMPLETED | CANCELLED` and `IN_PROGRESS → COMPLETED | CANCELLED`. Completion requires Result and stores the session user as `performedBy` with a server completion timestamp. Terminal Actions cannot transition again; stale updates return `409`.

## 3. Ticket workflow additions

### 3.1 Advisory Requester indication

```http
POST /api/tickets/:ticketId/resolution-indication
```

Requester owns the Ticket. The body is empty. Returns `200 OK` with `requesterResolvedAt` and unchanged `currentStatus`. Non-owners are denied without Ticket data. Repeating the call is idempotent: it retains the original indication timestamp and returns the current Ticket summary.

### 3.2 Formal status update

```http
PATCH /api/staff/tickets/:ticketId/status
Content-Type: application/json
```

```json
{
  "currentStatus": "RESOLVED",
  "confirmed": true,
  "expectedUpdatedAt": "2026-09-29T03:00:00.000Z"
}
```

IT Staff and Administrator only. The backend enforces the transition matrix, owner requirement, confirmation requirement, and qualifying Action Taken resolution gate. Invalid transition/confirmation/action state returns `422`; stale state returns `409`; success returns the refreshed Ticket summary.

## 4. Dashboard endpoints

### 4.1 Requester Dashboard

```http
GET /api/dashboard/requester
```

Requester only. The server scopes every query to the authenticated requester. Example response:

```json
{
  "metrics": {
    "openTickets": { "value": 3, "drillDown": { "view": "my-tickets", "filters": { "terminal": false } } },
    "waitingForRequester": { "value": 1, "drillDown": { "view": "my-tickets", "filters": { "status": "WAITING_FOR_REQUESTER" } } },
    "recentlyUpdated": { "value": 5, "drillDown": { "view": "my-tickets", "filters": { "sortBy": "updatedAt", "sortOrder": "desc" } } },
    "recentlyResolved": { "value": 1, "drillDown": { "view": "my-tickets", "filters": { "status": "RESOLVED" } } }
  },
  "attentionTickets": [],
  "recentResolvedTickets": []
}
```

Recent arrays contain at most five safe Ticket summaries: `id`, `ticketNumber`, `summary`, `currentStatus`, `updatedAt`, `requestedPriority`, and `itPriority` where already visible to the Requester.

`recentlyUpdated` means `updatedAt` within the previous 30 days. Since this schema does not have a separate formal resolution timestamp, `recentlyResolved` means a Ticket currently in `RESOLVED` whose `updatedAt` falls in that same window. Both recent lists use `updatedAt DESC, id DESC`; the attention list shows the five most recently updated owned Tickets. Dashboard drill-downs use `terminal=false`, `status`, and `updatedSince` on My Tickets. The `updatedSince` timestamp is supplied by the dashboard response, so its matching count remains stable when opened.

### 4.2 IT Staff Dashboard

```http
GET /api/dashboard/staff
```

IT Staff and Administrator only. Example metric names:

```json
{
  "metrics": {
    "unassignedTickets": { "value": 4, "drillDown": { "view": "staff-queue", "filters": { "assignment": "unassigned" } } },
    "myOwnedTickets": { "value": 2, "drillDown": { "view": "staff-queue", "filters": { "assignment": "mine" } } },
    "urgentActiveTickets": { "value": 1, "drillDown": { "view": "staff-queue", "filters": { "itPriority": "URGENT", "terminal": false } } },
    "recentlyUpdatedTickets": { "value": 5, "drillDown": { "view": "staff-queue", "filters": { "sortBy": "updatedAt", "sortOrder": "desc" } } }
  },
  "byStatus": [{ "status": "IN_PROGRESS", "value": 2 }],
  "byItPriority": [{ "priority": "URGENT", "value": 1 }],
  "urgentTickets": [],
  "recentTickets": []
}
```

`urgentTickets` and `recentTickets` contain at most five Queue-safe Ticket summaries. All count values are integers, including zero.

The Queue accepts dashboard drill-downs through `assignment`, `ownerId`, `status`, `itPriority`, `terminal=false`, `urgentActive=true`, and `updatedSince`. `urgentActive=true` means `URGENT` with any status except `CLOSED` or `CANCELLED`, as required by BR-21. Status and IT-priority distributions count all Tickets, including terminal Tickets. Lists use `updatedAt DESC, id DESC` and contain at most five Tickets. Requester and staff dashboard endpoints reject client query parameters; the Requester ID always comes from the session.

## 5. Compatibility and failure behavior

All approved Lab 1 to 3 routes remain supported. The existing Ticket Queue and My Tickets endpoints accept documented dashboard drill-down filters; unsupported filters return safe `400` validation errors. Repeated clicks disable the initiating UI control while a mutation is pending. API retry never creates a duplicate Action Taken because the client retries only after an uncertain failure is reconciled by reloading the action list; a future idempotency key is outside Lab 4 scope.

## 6. Authorization summary

| Endpoint group | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| `GET /api/tickets/:ticketId/actions-taken` | Own only | Yes | Yes |
| `POST/PATCH /api/staff/*actions-taken*` | No | Yes | Yes |
| `POST /api/tickets/:ticketId/resolution-indication` | Own only | No | No |
| `GET /api/dashboard/requester` | Own only | No | No |
| `GET /api/dashboard/staff` | No | Yes | Yes |
