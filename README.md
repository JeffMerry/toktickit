# TokTickIT - IT Service Desk Application

> **Lab 1 & Lab 2 Submission** — Full-stack IT Service Desk Web Application built with React, Node.js, Express, Prisma ORM, PostgreSQL, and Playwright E2E Testing following the **Zen Green Theme** Design System.

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
│   │   ├── context/            # RequesterContext (Simulated Login Identity State)
│   │   └── App.tsx             # Main App Router & State Integrations
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Express Application
│   ├── prisma/                 # Prisma schema, migrations, & idempotent seed script
│   │   ├── schema.prisma       # RequesterUser, Category, RelatedSystem, Ticket, Attachment models
│   │   └── seed.ts             # Active requesters, categories, and systems seed data
│   ├── src/                    # REST APIs, Multer configs, utils (ticketNumber generator)
│   ├── tests/                  # Unit tests and API Integration tests
│   └── package.json
├── e2e/                        # End-to-End Test Suites (Playwright)
│   └── lab-02/                 # Full user workflow & screenshot capture specs
├── artifacts/                  # Visual Inspection Deliverables
│   └── lab-02/screenshots/     # UI Screenshots for Desktop, Mobile, and Modals
├── docs/
│   ├── lab-01/                 # Lab 1 Evidence & Documentation
│   └── lab-02/                 # Lab 2 Sprint Engineering Contracts & Deliverables
│       ├── specification.md    # Product Requirements & Business Rules (BR-01 to BR-13)
│       ├── ui-spec.md          # Zen Green Design Tokens & Layout Specs
│       ├── api-spec.md         # REST API Endpoints Contract
│       ├── tests.md            # Traceability Matrix & Test Evidence
│       ├── reviewer.md         # Peer Review & Verification Guide
│       └── ai-use.md           # AI Collaboration & Prompt Disclosure
└── README.md
```

---

## 🌟 Key Features Delivered in Lab 2

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

## 🛠️ Getting Started

### **Prerequisites**
- **Node.js:** v18+ 
- **npm:** v9+
- **PostgreSQL Database:** Running local or cloud instance

---

### 1. Backend Setup (`server/`)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Ensure DATABASE_URL in .env points to your PostgreSQL instance

# Run database migrations
npx prisma migrate dev

# Seed database with initial categories, related systems, and development requesters
npm run db:seed

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

---

### 2. Frontend Setup (`client/`)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:3000 or http://localhost:3001)
npm run dev
```

---

## 🧪 Testing Suite

### **1. Run Backend Unit & API Tests (Vitest & Supertest)**
```bash
# Run generator unit tests
npx vitest run server/tests/unit/

# Run API integration tests (Create Ticket, My Tickets, Attachments Lifecycle)
npx vitest run server/tests/api/
```

### **2. Run Frontend Build Check**
```bash
npm --prefix client run build
```

### **3. Run End-to-End (E2E) Tests (Playwright)**
```bash
npx playwright test e2e/lab-02/
```

---

## 📚 Documentation & Deliverables

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
