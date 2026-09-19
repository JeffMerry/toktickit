# Lab 3 UI Specification: TokTickIT Zen Green Role-Based Experience

## 1. Design Principles

Lab 3 extends the Lab 2 Zen Green system rather than introducing a second visual language. Interfaces must be calm, readable, responsive, keyboard accessible, and explicit about what is public, internal, editable, read-only, loading, successful, or unsafe.

Primary principles:

1. Authentication state and current role are always understandable.
2. Navigation reflects permission, while the backend remains the authorization authority.
3. Public Comments and Internal Notes are visually unmistakable.
4. Dense operational information is prioritized instead of placed in an unreadable mega-grid.
5. Validation appears beside the affected field or action.

## 2. Design Tokens Inherited from Lab 2

| Token | Value | Use |
| :--- | :--- | :--- |
| Primary Green | `#006B3C` | App bar, primary actions, active navigation |
| Secondary Green | `#0B7A46` | Hover, links, focus accents |
| Pale Green | `#EAF6EF` | Selection, success, quiet highlights |
| Page Background | `#F5F7F6` | Application background |
| Surface | `#FFFFFF` | Cards, forms, table containers |
| Border | `#E5E7EB` | Section and table separation |
| Text Primary | `#1F2937` | Main copy |
| Text Muted | `#6B7280` | Metadata and help text |
| Error Red | `#DC2626` | Errors and destructive actions |
| Warning Amber | `#D97706` | Warning callouts and medium priority |
| Success Green | `#16A34A` | Success and resolved state |
| Focus Ring | `#0B7A46` | `2px` visible keyboard focus |

Typography remains Inter/system UI with a 16px body base. Touch targets are at least 44px high. Labels appear above inputs; required labels include a red asterisk; field errors appear directly below the field.

## 3. Shared Application Shell

### 3.1 Header

- TokTickIT logo and product name on the left.
- Role-specific navigation in the center/primary menu.
- Current user name, role badge, and account menu on the right.
- Account menu contains `Change Password` and `Logout`.
- Mobile uses a keyboard-operable menu button with an accessible name and focus return.

### 3.2 Navigation matrix

| Destination | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| My Tickets | Yes | No | No |
| Create Ticket | Yes | No | No |
| Ticket Queue | No | Yes | Yes |
| User Management | No | No | Yes |

Administrator navigation emphasizes User Management even though the approved API matrix permits operational Ticket work. Directly entered forbidden routes display a safe Access Denied screen and never flash protected content.

### 3.3 Global feedback

- Initial session check: centered loading indicator with `Checking your session...`.
- Forbidden: role-neutral message, return action, and no protected data.
- Not found: resource-neutral message without revealing hidden ownership.
- Network/API failure: retry action where safe; no stack traces.
- Success: contextual inline banner or toast announced with `aria-live="polite"`.
- Errors requiring attention use `role="alert"`.

## 4. Authentication Screens

### 4.1 Login

Purpose: authenticate an existing account.

Layout:

- Centered card, maximum width 440px.
- TokTickIT brand, `Sign in to your account` heading, and concise instructions.
- Email and password fields with visible labels.
- Password visibility toggle with an accessible label.
- Full-width primary `Sign in` button.

Modes:

| Mode | UI behavior |
| :--- | :--- |
| Initial | Empty enabled form |
| Validation | Field messages below invalid inputs; focus first invalid field |
| Submitting | Button disabled with `Signing in...`; fields remain readable |
| Invalid credentials | Generic inline error; password cleared |
| Inactive account | Safe inactive message with no account details |
| Failure | Safe retry message |

On success, a user with `mustChangePassword=true` goes to Change Password; all other users go to their role's default screen.

### 4.2 Mandatory Change Password

- Centered card explaining why the change is required.
- Current password, new password, and confirmation fields.
- Visible password requirements updated without relying on color alone.
- Normal navigation is hidden while the password change is mandatory.
- Logout remains available.
- Successful change continues to the role's default screen.

Validation covers required fields, incorrect current password, 10-64 characters, at least one letter and number, the 72 UTF-8 byte safety limit, new/current equality, and confirmation mismatch.

## 5. Requester Screens

### 5.1 Lab 2 regression changes

- Remove Development Requester selector, Change Requester action, and simulated-login notice.
- Read Requester name and identity from the authenticated session.
- Retain Create Ticket, My Tickets, Ticket Detail, Attachment upload/download/soft-removal, validation, pagination, and Zen Green behavior.
- If session expires, return to Login after showing a safe message.

### 5.2 Requester Ticket Detail collaboration

Ticket information and Attachments remain grouped as in Lab 2. Add:

- `Public Comments` section with chronological entries, author role badge, author name, and localized creation time.
- Plain-text comment composer with remaining-character guidance and `Post Comment` action.
- `Problem Appears Resolved` secondary action with confirmation explaining that IT remains responsible for formal resolution/closure.
- A visible indication after submission, including time, without changing the status badge.
- No Internal Notes tab, count, placeholder, network data, or other hint is rendered for Requesters.

## 6. IT Staff Ticket Queue

### 6.1 Desktop structure

- Header: `Ticket Queue`, result count, and refresh action.
- Search: Ticket Number, Summary, Requester name, or email.
- Filters: Category, Requested Priority, IT Priority, Status, ownership, and owner.
- Sort selector/header behavior for Created, Updated, Ticket Number, IT Priority, and Status.
- Pagination with current page, total pages, result range, Previous, and Next.

Required desktop columns:

| Column | Reason |
| :--- | :--- |
| Ticket Number | Stable work reference and detail link |
| Updated | Prioritizes recently changed work |
| Summary | Main issue context; truncates visually with accessible full text |
| Category | Supports triage |
| Requested / IT Priority | Shows the difference between user request and IT decision |
| Status | Shows workflow state |
| Owner | Shows assigned or `Unassigned` |
| Action | Explicit `Open` control |

Requester identity appears in detail or accessible secondary text instead of adding another mandatory wide column.

### 6.2 Smaller screens

- Tablet may use a horizontally constrained table only when all controls remain readable; filters wrap into two columns.
- Mobile replaces the table with cards showing Ticket Number, Summary, IT Priority, Status, Owner, Updated, and Open action.
- Filter controls appear in a collapsible panel with an active-filter count.
- No page-level horizontal overflow.

### 6.3 Queue states

- Loading: skeleton rows/cards and disabled pagination.
- Empty: `No tickets are available`.
- No results: `No tickets match these filters` with Clear Filters.
- Forbidden: Access Denied screen.
- Failure: safe message and Retry.
- Invalid query: preserve valid controls and identify invalid filters without displaying raw server details.

## 7. Operational Ticket Detail

### 7.1 Information architecture

- Breadcrumb/back action to Ticket Queue.
- Ticket Number, status badge, IT Priority badge, and owner summary.
- Read-only Requester, Category, Related System, Requested Priority, Summary, Description, Created, and Updated fields.
- Editable operational card containing owner, IT Priority, and permitted next status.
- Attachment list continuing Lab 2 metadata and removed-file presentation.
- Collaboration tabs: Public Comments and Internal Notes.

### 7.2 Operational controls

- `Claim Ticket` appears for an unassigned Ticket.
- Owner selector contains active IT Staff and Administrator users plus `Unassigned` where permitted.
- Requested Priority is always visibly read-only.
- IT Priority is editable only for operational roles.
- Status control displays only server-approved next statuses.
- Resolution, cancellation, closure, and reopening require a confirmation dialog.
- Conflicts show that the Ticket changed and offer Reload; the UI does not silently overwrite.

### 7.3 Public Comments versus Internal Notes

| Element | Public Comments | Internal Notes |
| :--- | :--- | :--- |
| Visual treatment | Pale green/shared communication | Pale amber/private operational area |
| Label | `Visible to Requester` | `Internal - not visible to Requester` |
| Composer button | `Post Public Comment` | `Add Internal Note` |
| Maximum length | 2,000 characters | 4,000 characters |

Switching tabs never copies draft content between composers. The active tab and privacy label remain visible while typing.

## 8. Administrator User Management

### 8.1 User list

- Page heading `Users` and primary `Create User` action.
- Search by name or email.
- Optional role filter.
- Required desktop columns: Name, Email, Role, Status, and Edit action.
- Mobile cards show the same information without horizontal overflow.
- Pagination may be used by the API but is not a mandatory visible feature for the expected lab dataset.

### 8.2 Create and edit panel

The form appears in a side panel on desktop and a full-screen dialog/page on mobile.

Fields:

- Name
- Email
- One Role
- Active state
- Initial Password and confirmation on create

Edit additionally provides `Set New Initial Password` as a separate explicit action. Password values are never redisplayed after submission.

### 8.3 Administrator safety feedback

- Duplicate email: field-level error under Email.
- Invalid role/input: field-level error.
- Self-deactivation: clear conflict message; Active control returns to its saved value.
- Last active Administrator: conflict message explaining that another active Administrator is required.
- Deactivation: confirmation identifies the user and explains that login sessions will end.
- Non-Administrator: Access Denied without rendering the user list.

## 9. Badges

### 9.1 Priority badges

| Value | Background | Text |
| :--- | :--- | :--- |
| `LOW` | `#F3F4F6` | `#4B5563` |
| `MEDIUM` | `#FEF3C7` | `#92400E` |
| `HIGH` | `#FFEDD5` | `#9A3412` |
| `URGENT` | `#FEE2E2` | `#991B1B` |

### 9.2 Status badges

| Value | Background | Text |
| :--- | :--- | :--- |
| `NEW` | `#E0F2FE` | `#075985` |
| `OPEN` | `#DBEAFE` | `#1D4ED8` |
| `IN_PROGRESS` | `#FEF3C7` | `#92400E` |
| `WAITING_FOR_REQUESTER` | `#F3E8FF` | `#7E22CE` |
| `RESOLVED` | `#DCFCE7` | `#166534` |
| `CLOSED` | `#E5E7EB` | `#374151` |
| `REOPENED` | `#FFEDD5` | `#9A3412` |
| `CANCELLED` | `#FEE2E2` | `#991B1B` |

Every badge includes readable text and does not communicate meaning by color alone.

## 10. Responsive Rules

| Viewport | Rules |
| :--- | :--- |
| Desktop `>= 992px` | Centered max-width 1200px; tables and multi-column forms |
| Tablet `768-991px` | Two-column forms where readable; wrapped filters; no clipped actions |
| Mobile `< 768px` | Single-column forms; cards replace dense tables; full-width primary actions |

At all widths:

- No unintended page-level horizontal scroll.
- Dialogs fit the viewport and retain a visible close action.
- Long Ticket numbers, names, emails, and summaries wrap or truncate with accessible full content.
- Sticky/fixed elements do not cover focused fields or validation messages.

## 11. Accessibility Contract

- Semantic headings follow a logical order.
- Every input has a programmatic label and error association.
- Keyboard focus is visible and follows visual order.
- Dialogs trap focus, support Escape when safe, and restore focus to their trigger.
- Tables use headers and accessible names; mobile cards preserve equivalent information.
- Status, priority, role, success, and error meaning never relies on color alone.
- Loading and asynchronous results are announced without excessive interruption.
- Touch targets are at least 44px and text remains usable at 200% zoom.

## 12. Required Visual Evidence Checklist

Store final screenshots under `artifacts/lab-03/screenshots/`.

### Authentication

- [ ] Desktop Login initial state
- [ ] Login validation/safe failure state
- [ ] Mandatory Change Password state
- [ ] Authenticated shell with user and role

### Staff Queue

- [ ] Desktop realistic Queue
- [ ] Search/filter results
- [ ] Empty or no-results state
- [ ] Mobile Queue cards

### Staff Ticket Detail

- [ ] Desktop operational fields
- [ ] Claim/reassign or conflict feedback
- [ ] Public Comments tab
- [ ] Internal Notes privacy treatment
- [ ] Mobile Ticket Detail

### User Management

- [ ] Desktop user list and create/edit panel
- [ ] Validation or safety conflict
- [ ] Mobile user list/form

### Cross-screen inspection

- [ ] Desktop, tablet, and mobile navigation
- [ ] Visible keyboard focus
- [ ] No clipped text or overlapping controls
- [ ] No unintended horizontal overflow
- [ ] Consistent badges and editable/read-only fields
