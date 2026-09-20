# TokTickIT - IT Service Desk Application

> **Lab 1, Lab 2 & Lab 3 Submission** — Full-stack IT Service Desk Web Application built with React, Node.js, Express, Prisma ORM, PostgreSQL, and Playwright E2E Testing following the **Zen Green Theme** Design System.

---

## 👨‍💻 Student Information

- **Developer:** Kittithat Disthanakornkun
- **Student ID:** 67070501004
- **GitHub:** [@JeffMerry](https://github.com/JeffMerry)
- **Repository:** [https://github.com/JeffMerry/toktickit](https://github.com/JeffMerry/toktickit)

---

## 🚀 Tech Stack

### **Frontend (`client/`)**
- **Framework:** React 19 + TypeScript + Vite
- **UI & Design Language:** Zen Green Theme Design System (Custom Responsive Styles) & Bootstrap Icons
- **Testing:** Vitest, React Testing Library (RTL), Playwright E2E

### **Backend (`server/`)**
- **Runtime:** Node.js & Express (TypeScript)
- **Database & ORM:** PostgreSQL & Prisma ORM
- **File Upload Engine:** Multer (Multipart Form-Data, 5MB limit, JPG/PNG/WEBP/PDF)
- **Testing:** Vitest & Supertest

---

## 📁 Project Structure

```text
toktickit/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Zen Green UI Components (Navbar, MyTicketsList, TicketDetailView, etc.)
│   │   ├── context/            # AuthContext (session-based user identity)
│   │   └── App.tsx             # Main App Router & State Integrations
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Express Application
│   ├── prisma/                 # Prisma schema, migrations, & idempotent seed script
│   │   ├── schema.prisma       # User, Session, Category, RelatedSystem, Ticket, Attachment, PublicComment, InternalNote
│   │   └── seed.ts             # Local-only users, categories, systems, Tickets, Comments, and Notes
│   ├── src/                    # REST APIs, authentication, workflow rules, and utilities
│   ├── tests/                  # Unit tests and API Integration tests
│   └── package.json
├── e2e/                        # End-to-End Test Suites (Playwright)
│   ├── lab-02/                 # Lab 2 workflow and screenshot capture specs
│   ├── lab-03/                 # Authenticated Requester, IT Staff, and Admin journeys
│   └── evidence/               # Lab 3 screenshot capture spec
├── artifacts/                  # Visual Inspection Deliverables
│   ├── lab-02/screenshots/     # Lab 2 UI screenshots
│   └── lab-03/screenshots/     # Lab 3 desktop, tablet, and mobile screenshots
├── docs/
│   ├── lab-01/                 # Lab 1 Evidence & Documentation
│   ├── lab-02/                 # Lab 2 Sprint Engineering Contracts & Deliverables
│   │   ├── specification.md    # Product Requirements & Business Rules (BR-01 to BR-13)
│   │   ├── ui-spec.md          # Zen Green Design Tokens & Layout Specs
│   │   ├── api-spec.md         # REST API Endpoints Contract
│   │   ├── tests.md            # Traceability Matrix & Test Evidence
│   │   ├── reviewer.md         # Peer Review & Verification Guide
│   │   └── ai-use.md           # AI Collaboration & Prompt Disclosure
│   └── lab-03/                 # Lab 3 contract, tests, reviewer record, AI use, release evidence
└── README.md
```

---

## 🌟 Key Features Delivered in Lab 2

The Development Requester simulation below describes the Lab 2 increment. Lab 3 replaced it with authenticated users while retaining the Requester Ticket and Attachment workflows.

1. **Development Requester Simulation (FR-01, BR-13):**
   - Simulated login interface to switch between active development requesters (`RequesterSelector.tsx`).
   - Requester identity context stored in `localStorage` and managed globally via `RequesterContext.tsx`.
   - Dynamic Navbar identity badge with one-click requester switcher (`Navbar.tsx`).

2. **Create Ticket Workflow (FR-02, BR-01 – BR-11):**
   - System-generated formatted Ticket Numbers (`TKT-YYYY-XXXXXX`).
   - Dynamic classification dropdowns for Categories and Related Systems loaded from PostgreSQL.
   - Priority selection pills (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) with real-time character counters.
   - Secure multipart file upload supporting JPG, PNG, WEBP, and PDF up to 5MB (Max 5 active attachments per ticket).

3. **My Tickets Data Grid & Responsive Cards (FR-04, FR-05, FR-06, BR-13):**
   - **Strict Ownership Isolation:** Automatically filters tickets belonging exclusively to the active requester.
   - **Real-Time Search & Filtering:** Case-insensitive search by ticket number or summary; filters by category, priority, and status.
   - **Responsive Viewport Adaptability:** Full Data Table on Desktop ($\ge 768\text{px}$) and touch-friendly Card View on Mobile ($< 768\text{px}$).
   - Client-side pagination controls with total record statistics.

4. **Ticket Detail View & Attachment Lifecycle (FR-07, FR-08, BR-12, BR-13):**
   - Read-only ticket summary grid matching Zen Green Theme aesthetics.
   - **Attachment Management:** Real-time download for active files; soft-removal modal enforcing mandatory `removalReason` input.
   - **Security Enforcement:** Disabled download and strikethrough styling for soft-removed files; custom `403 Forbidden` Access Denied screen upon unauthorized access attempts.

---

## 🌟 Key Features Delivered in Lab 3

1. **Authentication and role-based access:**
   - Email/password login, session cookie, logout, and mandatory password change for initial-password accounts.
   - Requester, IT Staff, and Administrator navigation and backend authorization.
   - Requester identity comes from the authenticated session; client-supplied `requesterId` cannot select another user's data.

2. **IT Staff Ticket Queue and workflow:**
   - Search, filters, sorting, pagination, assigned/unassigned ownership, and responsive Queue presentation.
   - Ticket claim/reassignment, IT Priority, permitted status transitions, Public Comments, and private Internal Notes.

3. **Administrator User Management:**
   - User list and search, account creation/editing, one-role assignment, activation/deactivation, and new initial passwords.
   - Backend protection against self-deactivation and removal of the last active Administrator.

4. **Release verification:**
   - Reviewed feature branches were integrated through `lab3-staging` and released to `main` in [PR #39](https://github.com/JeffMerry/toktickit/pull/39).
   - On merged `main` commit `79807cd`, server build and 48 tests, client build and 9 tests, and 4 real Chromium E2E journeys passed.

The Requester “problem appears resolved” action, migration-specific regression checks, and keyboard/focus verification remain open in the [Lab 3 test plan](docs/lab-03/tests.md).

---

## 🛠️ Getting Started

### **Prerequisites**
- **Node.js and npm:** Versions compatible with this repository's installed dependencies
- **PostgreSQL Database:** Running local instance

---

### 1. Backend Setup (`server/`)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Ensure DATABASE_URL in .env points to your local PostgreSQL instance

# Run database migrations
npx prisma migrate dev

# Seed the intended local development database
npm run db:seed

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

The Lab 3 seed contains local-only accounts and temporary passwords. Check the configured database before running it because seeded data is updated and E2E tests create additional local data.

---

### 2. Frontend Setup (`client/`)

```bash
# Navigate to client directory in another terminal
cd client

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Testing Suite

### **1. Run Backend Unit & API Tests (Vitest & Supertest)**
```bash
npm --prefix server run build
npm --prefix server test
```

### **2. Run Frontend Tests & Build Check**
```bash
npm --prefix client run build
npm --prefix client test
```

### **3. Run Lab 3 End-to-End (E2E) Tests (Playwright)**
```bash
# From the repository root; confirm the intended local database first
npm install
npm --prefix server run db:seed
npm run test:e2e
```

The Lab 3 E2E suite starts or reuses the local server and client. It changes seeded passwords and creates Ticket/User data. Screenshot evidence can be refreshed after reseeding with `npm run capture:lab3-evidence`.

---

## 📚 Documentation & Deliverables

### **Lab 3 Documentation (`docs/lab-03/`)**
- 📋 **Software Requirements Specification:** [docs/lab-03/specification.md](docs/lab-03/specification.md)
- 🎨 **Zen Green UI Specification:** [docs/lab-03/ui-spec.md](docs/lab-03/ui-spec.md)
- 🔌 **REST API Specification:** [docs/lab-03/api-spec.md](docs/lab-03/api-spec.md)
- ✅ **Test Plan & Traceability Matrix:** [docs/lab-03/tests.md](docs/lab-03/tests.md)
- 🔍 **Reviewer Record:** [docs/lab-03/reviewer.md](docs/lab-03/reviewer.md)
- 🤖 **AI Usage Reflection:** [docs/lab-03/ai-use.md](docs/lab-03/ai-use.md)
- 📸 **Release & Screenshot Evidence:** [docs/lab-03/release-evidence.md](docs/lab-03/release-evidence.md), [artifacts/lab-03/screenshots/](artifacts/lab-03/screenshots/)

### **Lab 2 Documentation (`docs/lab-02/`)**
- 📋 **Software Requirements Specification:** [docs/lab-02/specification.md](docs/lab-02/specification.md)
- 🎨 **Zen Green UI Specification:** [docs/lab-02/ui-spec.md](docs/lab-02/ui-spec.md)
- 🔌 **REST API Specification:** [docs/lab-02/api-spec.md](docs/lab-02/api-spec.md)
- ✅ **Test Plan & Traceability Matrix:** [docs/lab-02/tests.md](docs/lab-02/tests.md)
- 🔍 **Reviewer & Verification Guide:** [docs/lab-02/reviewer.md](docs/lab-02/reviewer.md)
- 🤖 **AI Collaboration & Prompt Disclosure:** [docs/lab-02/ai-use.md](docs/lab-02/ai-use.md)

### **Lab 1 Documentation (`docs/lab-01/`)**
- 📄 **Lab 1 Test Evidence:** [docs/lab-01/tests.md](docs/lab-01/tests.md)
- 📄 **Lab 1 Reviewer Guide:** [docs/lab-01/reviewer.md](docs/lab-01/reviewer.md)
- 📄 **Lab 1 AI Use Log:** [docs/lab-01/ai_use.md](docs/lab-01/ai_use.md)
