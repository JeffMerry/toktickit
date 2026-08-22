# Lab 2 REST API Specification: TokTickIT Backend

## 1. Overview & General Headers

All API requests and responses use JSON (`Content-Type: application/json`).
To simulate authentication in Lab 2, all requester-bound requests MUST include the header:
`x-requester-id: <number>`

---

## 2. Endpoints Detail

### 2.1 Retrieve Active Development Requesters
- **HTTP Method**: `GET`
- **Path**: `/api/requesters`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer.a@example.com",
      "department": "Marketing",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.b@example.com",
      "department": "Engineering",
      "isActive": true
    }
  ]
}
```

---

### 2.2 Retrieve Active Categories & Related Systems
- **HTTP Method**: `GET`
- **Path**: `/api/categories` & `/api/related-systems`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" },
    { "id": 3, "name": "Software" },
    { "id": 4, "name": "Network" }
  ]
}
```

---

### 2.3 Create Ticket
- **HTTP Method**: `POST`
- **Path**: `/api/tickets`
- **Headers**: `x-requester-id: 1`
- **Request Body**:
```json
{
  "categoryId": 2,
  "relatedSystemId": 5,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when idle."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 5,
    "requestedPriority": "MEDIUM",
    "currentStatus": "New",
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual even when idle.",
    "createdAt": "2026-08-22T13:00:00.000Z"
  }
}
```
- **Error Response `400 Bad Request`**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Summary is required and must be between 5 and 100 characters."
  }
}
```

---

### 2.4 Retrieve Paginated Owned Tickets (My Tickets)
- **HTTP Method**: `GET`
- **Path**: `/api/tickets`
- **Headers**: `x-requester-id: 1`
- **Query Parameters**:
  - `search` (optional): string
  - `category` (optional): number
  - `priority` (optional): `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `status` (optional): string
  - `page` (default: 1): number
  - `limit` (default: 10, max: 50): number
  - `sortBy` (default: `createdAt`): `createdAt` | `ticketNumber` | `priority` | `status`
  - `sortOrder` (default: `desc`): `asc` | `desc`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "ticketNumber": "TKT-2026-000101",
      "summary": "Laptop battery drains quickly",
      "categoryName": "Hardware",
      "requestedPriority": "MEDIUM",
      "currentStatus": "New",
      "createdAt": "2026-08-22T13:00:00.000Z"
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

### 2.5 Retrieve Single Owned Ticket Detail
- **HTTP Method**: `GET`
- **Path**: `/api/tickets/:id`
- **Headers**: `x-requester-id: 1`
- **Response `200 OK`**: Ticket details object including category, related system, and active/removed attachment metadata.
- **Error `403 Forbidden`**:
```json
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to view this ticket."
  }
}
```

---

### 2.6 Upload Attachment
- **HTTP Method**: `POST`
- **Path**: `/api/tickets/:id/attachments`
- **Headers**: `x-requester-id: 1`, `Content-Type: multipart/form-data`
- **Form Data**: `file` (File binary)
- **Response `201 Created`**: Attachment metadata object (`id`, `fileName`, `fileSize`, `mimeType`, `isRemoved: false`).
- **Error `400 Bad Request`**: File size exceeds 5MB or type not allowed.
- **Error `422 Unprocessable Entity`**: Ticket already has 5 active attachments.

---

### 2.7 Soft-Remove Attachment
- **HTTP Method**: `DELETE`
- **Path**: `/api/attachments/:id`
- **Headers**: `x-requester-id: 1`
- **Request Body**: `{ "reason": "Uploaded wrong document by mistake" }`
- **Response `200 OK`**: Attachment status updated to `isRemoved = true`.

---

### 2.8 Download Attachment
- **HTTP Method**: `GET`
- **Path**: `/api/attachments/:id/download`
- **Headers**: `x-requester-id: 1`
- **Response `200 OK`**: Binary file download stream.
- **Error `410 Gone` / `404 Not Found`**: Attachment was soft-removed.
