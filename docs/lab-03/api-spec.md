# Lab 3 REST API Specification: TokTickIT

## 1. Conventions

### 1.1 Base path and content types

- All endpoints use the `/api` prefix.
- JSON requests use `Content-Type: application/json`.
- Attachment uploads use `multipart/form-data`.
- Attachment downloads return the stored file with a safe `Content-Disposition` header.
- Dates are ISO 8601 UTC strings.
- Enum values use uppercase snake case in the API.

### 1.2 Success and error envelopes

Single-resource success:

```json
{
  "success": true,
  "data": {}
}
```

Mutation success may include a safe message:

```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": {
      "email": "Enter a valid email address."
    }
  }
}
```

`fields` is optional. Stack traces, password hashes, session tokens, database identifiers not required by the client, and protected-resource existence are never exposed.

### 1.3 Status codes

| Status | Meaning |
| :--- | :--- |
| `200` | Successful read/update/logout |
| `201` | Successful creation |
| `204` | Successful file response or mutation without JSON body where appropriate |
| `400` | Invalid syntax or query parameter |
| `401` | Missing, invalid, or expired authentication |
| `403` | Authenticated but role/action is forbidden |
| `404` | Resource not found or intentionally concealed from an unauthorized owner |
| `409` | Duplicate email, stale Ticket update, competing claim, or Administrator safety conflict |
| `422` | Semantically valid request that violates a field/business constraint |
| `429` | Login throttle exceeded |
| `500` | Safe unexpected server error |

## 2. Authentication and Session Contract

### 2.1 Session mechanism

- The server issues an opaque random token in a cookie named `toktickit_session`.
- The database stores a SHA-256 token hash, never the raw token.
- Cookie attributes are `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` outside local development.
- Session absolute lifetime is 8 hours.
- CORS allows only the configured client origin and enables credentials.
- The frontend sends `credentials: "include"` for authenticated requests.
- State-changing requests validate the `Origin` header against the configured client origin.
- Password change/reset and account deactivation invalidate all sessions for the affected user.

Safe user object:

```json
{
  "id": 1,
  "name": "Jennifer Anderson",
  "email": "jennifer@example.com",
  "role": "REQUESTER",
  "isActive": true,
  "mustChangePassword": false
}
```

### 2.2 Login

`POST /api/auth/login`

Access: Public

Request:

```json
{
  "email": "jennifer@example.com",
  "password": "LocalLab123"
}
```

Responses:

- `200`: Session cookie set; returns safe user object.
- `401 AUTHENTICATION_FAILED`: Unknown email or incorrect password, using the same message.
- `403 ACCOUNT_INACTIVE`: Account is inactive; no extra account details.
- `422 VALIDATION_ERROR`: Missing/invalid email or password shape.
- `429 TOO_MANY_ATTEMPTS`: Five failed attempts per normalized email/source IP within 15 minutes.

When `mustChangePassword=true`, login still returns `200`, but all normal protected endpoints return `403 PASSWORD_CHANGE_REQUIRED` until password change succeeds.

### 2.3 Current user

`GET /api/auth/me`

Access: Authenticated, including users who must change password

- `200`: Returns the safe user object.
- `401 UNAUTHENTICATED`: Session is missing, expired, revoked, or belongs to an inactive user.

### 2.4 Change own password

`POST /api/auth/change-password`

Access: Authenticated, including users who must change password

Request:

```json
{
  "currentPassword": "LocalLab123",
  "newPassword": "NewSecure123",
  "confirmPassword": "NewSecure123"
}
```

Rules:

- Current password must be correct.
- New password must contain 10-64 characters, include at least one letter and one number, and encode to no more than 72 UTF-8 bytes.
- Confirmation must match.
- New password must differ from the current password.

Responses:

- `200`: Password updated, `mustChangePassword=false`, all prior sessions invalidated, and a replacement current session issued.
- `401 CURRENT_PASSWORD_INVALID`: Current password is incorrect.
- `422 VALIDATION_ERROR`: New password violates policy or confirmation differs.

### 2.5 Logout

`POST /api/auth/logout`

Access: Authenticated when possible; idempotent

- Deletes the current Session row when present.
- Clears the session cookie.
- Returns `200` even if the session already expired.

## 3. Requester and Shared Reference APIs

All Requester ownership is derived from the authenticated session. `requesterId` in query, body, headers, or multipart fields is rejected with `400 CLIENT_IDENTITY_NOT_ALLOWED` and is never used for authorization.

### 3.1 Active reference data

| Method | Path | Access | Behavior |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Authenticated | Lists active Categories |
| `GET` | `/api/related-systems` | Authenticated | Lists active Related Systems |

### 3.2 Create Ticket

`POST /api/tickets`

Access: Requester

Multipart fields:

- `categoryId`: required integer
- `relatedSystemId`: required integer
- `requestedPriority`: `LOW`, `MEDIUM`, `HIGH`, or `URGENT`
- `summary`: 5-100 trimmed characters
- `description`: 10-2,000 trimmed characters
- `attachments`: zero to five allowed files following Lab 2 rules

The backend supplies `requesterId`, Ticket number, initial status `NEW`, and initial IT Priority equal to Requested Priority.

### 3.3 List owned Tickets

`GET /api/tickets`

Access: Requester

Query parameters:

| Parameter | Values / default |
| :--- | :--- |
| `search` | Ticket number or summary; optional |
| `categoryId` | Positive integer; optional |
| `priority` | Priority enum; optional |
| `status` | Ticket status enum; optional |
| `sortBy` | `createdAt`, `updatedAt`, `ticketNumber`, `requestedPriority`, `currentStatus`; default `createdAt` |
| `sortOrder` | `asc` or `desc`; default `desc` |
| `page` | Positive integer; default `1` |
| `limit` | `1-50`; default `10` |

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "totalItems": 0,
    "totalPages": 0,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

### 3.4 Owned Ticket Detail

`GET /api/tickets/:id`

Access: Owning Requester

Returns Ticket fields, Category, Related System, Requester-safe ownership data, permitted Attachment metadata, Public Comments, and resolution indication. It never returns Internal Notes.

Non-owner access returns `404 RESOURCE_NOT_FOUND` to conceal existence.

### 3.5 Requester Attachment continuity

| Method | Path | Access | Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets/:id/attachments` | Owning Requester | Up to five active files total |
| `GET` | `/api/attachments/:id/download` | Owning Requester; operational roles | Removed files are unavailable |
| `DELETE` | `/api/attachments/:id` | Owning Requester | Soft-removal with required reason |

Lab 2 MIME type, file-size, filename sanitization, active-file quota, and soft-removal rules remain in force.

### 3.6 Public Comments

`GET /api/tickets/:id/public-comments`

Access: Owning Requester, IT Staff, Administrator

`POST /api/tickets/:id/public-comments`

Request:

```json
{
  "content": "The issue still occurs after restarting."
}
```

Content must contain 1-2,000 trimmed characters. Author and `createdAt` come from the backend. No update or delete endpoint exists.

### 3.7 Problem Appears Resolved

`POST /api/tickets/:id/resolution-indication`

Access: Owning Requester

Request:

```json
{
  "appearsResolved": true
}
```

The server records or clears `resolutionSuggestedAt` and `resolutionSuggestedById`. Ticket status is unchanged.

## 4. Operational Ticket APIs

Access to this section: `IT_STAFF` or `ADMINISTRATOR`. A user with `mustChangePassword=true` remains blocked.

### 4.1 Ticket Queue

`GET /api/staff/tickets`

Query parameters:

| Parameter | Values / default |
| :--- | :--- |
| `search` | Ticket number, summary, Requester name, or Requester email |
| `categoryId` | Positive integer |
| `requestedPriority` | Priority enum |
| `itPriority` | Priority enum |
| `status` | Ticket status enum |
| `ownerId` | Active eligible User ID |
| `assignment` | `assigned`, `unassigned`, or omitted |
| `sortBy` | `createdAt`, `updatedAt`, `ticketNumber`, `itPriority`, `currentStatus`; default `updatedAt` |
| `sortOrder` | `asc` or `desc`; default `desc` |
| `page` | Positive integer; default `1` |
| `limit` | `1-50`; default `10` |

Response entries include Ticket number, dates, summary, Category, Requester identity required for work, Requested Priority, IT Priority, current status, owner, and `resolutionSuggestedAt`. Pagination uses the envelope defined in section 3.3.

### 4.2 Operational Ticket Detail

`GET /api/staff/tickets/:id`

Returns full operational Ticket data, active/removed Attachment metadata, Public Comments, Internal Notes, eligible owners, and allowed next statuses.

### 4.3 Claim Ticket

`POST /api/staff/tickets/:id/claim`

Request:

```json
{
  "expectedUpdatedAt": "2026-09-15T08:00:00.000Z"
}
```

- `200`: Unassigned Ticket is assigned to the current operational user.
- `409 TICKET_ALREADY_ASSIGNED`: Ticket already has an owner.
- `409 STALE_TICKET`: `expectedUpdatedAt` does not match.

### 4.4 Assign or reassign Ticket

`PATCH /api/staff/tickets/:id/owner`

Request:

```json
{
  "ownerId": 12,
  "expectedUpdatedAt": "2026-09-15T08:00:00.000Z"
}
```

`ownerId` must identify an active IT Staff or Administrator. `null` is permitted to return a Ticket to the unassigned queue.

### 4.5 Update IT Priority

`PATCH /api/staff/tickets/:id/priority`

```json
{
  "itPriority": "HIGH",
  "expectedUpdatedAt": "2026-09-15T08:00:00.000Z"
}
```

Requested Priority is read-only and never changed by this operation.

### 4.6 Update Ticket status

`PATCH /api/staff/tickets/:id/status`

```json
{
  "status": "IN_PROGRESS",
  "expectedUpdatedAt": "2026-09-15T08:00:00.000Z"
}
```

The server validates the transition matrix in `specification.md`. Transitions that require an owner or confirmation are validated by the API; the UI confirmation dialog is not a security control.

### 4.7 Internal Notes

`GET /api/staff/tickets/:id/internal-notes`

`POST /api/staff/tickets/:id/internal-notes`

```json
{
  "content": "Device diagnostics scheduled for tomorrow."
}
```

Content must contain 1-4,000 trimmed characters. Author and timestamp come from the backend. No update or delete endpoint exists.

## 5. Administrator User Management APIs

Access to this section: `ADMINISTRATOR` only.

### 5.1 List users

`GET /api/admin/users`

Query parameters:

| Parameter | Values / default |
| :--- | :--- |
| `search` | Name or normalized email; optional |
| `role` | User role enum; optional |
| `page` | Positive integer; default `1` |
| `limit` | `1-50`; default `20` |

The UI is not required to expose pagination, but the API returns bounded results. Returned fields are `id`, `name`, `email`, `role`, `isActive`, `mustChangePassword`, `createdAt`, and `updatedAt`.

### 5.2 Create user

`POST /api/admin/users`

```json
{
  "name": "Alex Thompson",
  "email": "alex.thompson@example.com",
  "role": "IT_STAFF",
  "isActive": true,
  "initialPassword": "LocalLab123"
}
```

- Name: 2-100 trimmed characters.
- Email: valid, normalized, and unique.
- Role: exactly one permitted role.
- Initial password: follows BR-04 and is hashed immediately.
- `mustChangePassword` is always set to `true`.

### 5.3 Update user

`PATCH /api/admin/users/:id`

```json
{
  "name": "Alex Thompson",
  "email": "alex.thompson@example.com",
  "role": "IT_STAFF",
  "isActive": true,
  "expectedUpdatedAt": "2026-09-15T08:00:00.000Z"
}
```

Rules:

- Duplicate normalized email returns `409 EMAIL_ALREADY_EXISTS`.
- Self-deactivation returns `409 SELF_DEACTIVATION_FORBIDDEN`.
- Deactivating or changing the role of the last active Administrator returns `409 LAST_ACTIVE_ADMIN_REQUIRED`.
- Deactivation invalidates all sessions for the target user.
- Stale updates return `409 STALE_USER`.

### 5.4 Set new initial password

`POST /api/admin/users/:id/initial-password`

```json
{
  "initialPassword": "Temporary123",
  "confirmPassword": "Temporary123"
}
```

On success, the password is hashed, `mustChangePassword=true`, all existing sessions for the target user are invalidated, and the plaintext value is not returned or logged.

## 6. Authorization Summary

| API group | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| `/api/auth/*` | Own session | Own session | Own session |
| Requester `/api/tickets*` mutations | Own only | No | No |
| Public Comments | Own Ticket | All | All |
| Resolution indication | Own Ticket | No | No |
| `/api/staff/tickets*` | No | Yes | Yes |
| Internal Notes | No | Yes | Yes |
| `/api/admin/users*` | No | No | Yes |

## 7. Deprecated Lab 2 Identity Contract

The following identity mechanisms are removed after authenticated replacements are available:

- `GET /api/requesters` as a Development Requester selector source.
- `requesterId` in Ticket query parameters, JSON bodies, multipart fields, or custom headers.
- Client `localStorage` values that select a Requester identity.

No compatibility mode may treat client-supplied Requester identity as authenticated identity.
