# Lab 2 UI Specification: TokTickIT Zen Green Theme

## 1. Design System & Visual Tokens

The TokTickIT application follows the **Zen Green Theme** to provide a clean, calm, professional, and accessible IT support experience.

| Token / Element | HEX / Style Value | Usage & Guidance |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | App top bar/header, primary action buttons (`.btn-primary`), strong emphasis. |
| **Secondary Green** | `#0B7A46` | Active navigation tabs, links, focus outlines, hover accents. |
| **Pale Green** | `#EAF6EF` | Selected card background, subtle section highlights, success callout fill. |
| **Page Background** | `#F5F7F6` | Main page background (soft near-white to reduce eye fatigue). |
| **Surface / Card** | `#FFFFFF` | Form containers, ticket cards, table containers with border `#E5E7EB` & subtle shadow. |
| **Text Primary** | `#1F2937` | Dark charcoal-green for high readability (never pure `#000000`). |
| **Text Muted** | `#6B7280` | Secondary text, field help text, metadata labels. |
| **Editable Field** | `#FFFFFF` | Background with neutral border `#D1D5DB`, focus ring `#0B7A46`. |
| **Read-Only Field** | `#F3F4F6` | Soft gray-green shading distinct from editable fields, cursor `not-allowed`. |
| **Error Red** | `#DC2626` | Field error messages, invalid field border, destructive action hover. |
| **Warning Amber** | `#D97706` | Amber badges/callouts (e.g. Medium priority badge). |
| **Success Green** | `#16A34A` | Confirmation messages, Resolved status badge. |

---

## 2. Typography & Spacing Rules

- **Font Family**: Inter, system-ui, -apple-system, sans-serif.
- **Base Size**: 16px body text; 14px small/secondary text; 12px badge/meta text.
- **Heading Scale**: `h1` (24px, semibold), `h2` (20px, semibold), `h3` (16px, medium).
- **Control Spacing**: Form labels are placed **above** inputs (`margin-bottom: 6px`).
- **Required Indicator**: Required field labels display a red asterisk `*` (`color: #DC2626; margin-left: 2px;`).
- **Validation Messages**: Error messages MUST appear directly below the corresponding field in 13px red text (`#DC2626`).

---

## 3. Button Hierarchy & Interactive States

1. **Primary Button**: Background `#006B3C`, Text `#FFFFFF`. Hover: `#0B7A46`. Active: `#054E2B`.
2. **Secondary Button**: Background `#FFFFFF`, Border `#D1D5DB`, Text `#374151`. Hover: `#F3F4F6`.
3. **Destructive / Soft-Remove Button**: Background `#FEF2F2`, Border `#FCA5A5`, Text `#DC2626`.
4. **Disabled State**: Opacity `0.5`, background `#E5E7EB`, cursor `not-allowed`.
5. **Busy / Loading State**: Displays a spinning loader icon alongside text (e.g., `Submitting...`), button is disabled during processing.

---

## 4. Screen Layout Specifications

### 4.1 Development Requester Selection Screen
- **Purpose**: Temporary testing identity selector ("Simulated Login").
- **Layout**: Centered card container (max-width `540px`) on pale/quiet background.
- **Header**: TokTickIT Logo/Brand, Title "Select Development Requester".
- **Controls**: Dropdown select listing active seeded Requesters, "Continue" button (`.btn-primary`).
- **Notice Banner**: Info box clearly explaining: *"Select a Development Requester to test requester-specific ticket behavior. This is not a login screen."*

### 4.2 Create Ticket Screen
- **Layout**: Two-column responsive grid (Desktop) collapsing to single column (Mobile).
- **Top Row**: System-generated/read-only fields (Ticket Number placeholder `Auto-generated`, Date, Requester Name).
- **Middle Section**: Classification inputs (Category dropdown, Related System dropdown, Requested Priority pills/radio).
- **Main Inputs**: Ticket Summary (single-line text input) & Description (resizable textarea, min 4 rows).
- **Attachment Section**: File upload drag & drop dropzone + file list preview with file size, status, and remove button.
- **Action Footer**: Right-aligned "Cancel" (Secondary) and "Submit Ticket" (Primary) buttons.

### 4.3 My Tickets Screen
- **Header Bar**: Title "My Tickets", "Create Ticket" action button, Refresh/Clear Filters button.
- **Filter Controls Bar**:
  - Search input (Ticket Number or Summary)
  - Category dropdown filter
  - Requested Priority dropdown filter
  - Status dropdown filter
  - Reset filters link
- **Ticket List View**:
  - **Desktop ($\ge 992\text{px}$)**: Table view with columns (Ticket No, Created Date, Summary, Category, Priority Badge, Status Badge, Action).
  - **Mobile ($< 768\text{px}$)**: Responsive card list view stacked vertically.
- **Pagination Footer**: "Showing X of Y tickets", Page number buttons (`Previous`, `1`, `2`, ..., `Next`).
- **Empty States**: Distinct illustrations/messages for "No tickets created yet" vs "No tickets match search filters".

### 4.4 Requester Ticket Detail Screen (View Mode)
- **Header**: Breadcrumb navigation (`My Tickets > Ticket Details`), Ticket Number title, Status badge.
- **Ticket Summary Card**: Read-only grid displaying Category, Related System, Requested Priority, Created Date, Summary, Description.
- **Attachment Section Card**: List of attached files with:
  - File icon (Image/PDF icon)
  - File name and size
  - Download button (Active files)
  - Soft-removed indicator with removal reason (Removed files: grayed out, strike-through, download disabled)
  - "Add Attachment" button (if active count < 5)

---

## 5. Status & Priority Badges

| Badge Type | Value | Background Color | Text Color |
| :--- | :--- | :--- | :--- |
| **Status** | `New` | `#E0F2FE` (Light Blue) | `#0369A1` |
| **Status** | `In Progress` | `#FEF3C7` (Light Amber) | `#B45309` |
| **Status** | `Resolved` | `#DCFCE7` (Light Green) | `#15803D` |
| **Priority** | `LOW` | `#F3F4F6` (Gray) | `#4B5563` |
| **Priority** | `MEDIUM` | `#FEF3C7` (Amber) | `#D97706` |
| **Priority** | `HIGH` | `#FFEDD5` (Orange) | `#C2410C` |
| **Priority** | `URGENT` | `#FEE2E2` (Red) | `#B91C1C` |

---

## 6. Responsive Viewport Rules

- **Desktop ($\ge 992\text{px}$)**: Max content container width `1200px` centered; multi-column layout.
- **Tablet ($768\text{px} - 991\text{px}$)**: 2-column form grids; full-width tables with horizontal scroll if required.
- **Mobile ($< 768\text{px}$)**: 1-column vertical stack; full-width touch-friendly buttons ($\min 44\text{px}$ height); cards replace tables.

---

## 7. Visual Inspection Screenshot Checklist
- `artifacts/lab-02/screenshots/create-ticket/desktop_initial.png`
- `artifacts/lab-02/screenshots/create-ticket/desktop_validation_error.png`
- `artifacts/lab-02/screenshots/create-ticket/desktop_success.png`
- `artifacts/lab-02/screenshots/my-tickets/desktop_list.png`
- `artifacts/lab-02/screenshots/my-tickets/mobile_cards.png`
- `artifacts/lab-02/screenshots/ticket-detail/desktop_view_and_attachments.png`
