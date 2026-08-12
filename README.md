# TokTickIT - IT Service Desk Application

> **Lab 1 Submission** — Full-stack IT Service Desk Application built with React, Node.js, Express, Prisma ORM, and PostgreSQL.

---

##  Student Information

- **Developer:** Kittithat Disthanakornkun
- **Student ID:** 67070501004
- **GitHub:** [@JeffMerry](https://github.com/JeffMerry)
- **Repository:** [https://github.com/JeffMerry/toktickit](https://github.com/JeffMerry/toktickit)

---

## Tech Stack

### **Frontend (`client/`)**
- **Framework:** React 19 + TypeScript + Vite
- **UI & Styling:** Bootstrap 5 & Bootstrap Icons
- **Testing:** Vitest & React Testing Library (RTL)

### **Backend (`server/`)**
- **Runtime:** Node.js & Express (TypeScript)
- **Database & ORM:** PostgreSQL & Prisma ORM
- **Testing:** Vitest & Supertest

---

## 📁 Project Structure

```text
toktickit/
├── client/                 # Frontend React Application
│   ├── src/                # App components, styles, & tests
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Express Application
│   ├── prisma/             # Prisma schema & database seeds
│   │   ├── migrations/     # Database migration history
│   │   ├── schema.prisma   # Category & Data models
│   │   └── seed.ts         # Initial Category seeding script
│   ├── src/                # Express App, Routes, & Controllers
│   ├── tests/              # Backend Supertest & Vitest suites
│   └── package.json
├── docs/
│   └── lab-01/             # Lab 1 Evidence & Documentation
│       ├── tests.md        # Detailed Test Case Evidence & Results
│       ├── reviewer.md     # Peer Review Evidence & PR Links
│       └── ai_use.md       # AI Usage Reflection & Prompts
└── README.md
```

---

##  Getting Started

### **Prerequisites**
- **Node.js:** v18+ 
- **npm:** v9+
- **PostgreSQL Database:** Running instance (Local or Cloud)

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

# Seed database with initial categories (Account, Hardware, Software, Network)
npm run db:seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

---

### 2. Frontend Setup (`client/`)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

##  Testing

Both frontend and backend are equipped with automated test suites using **Vitest**.

### **Run Backend Tests**
```bash
cd server
npm test
```
*Tests `/api/health`, `/api/categories`, and Prisma mock behavior.*

### **Run Frontend Tests**
```bash
cd client
npm test
```
*Tests App component render, system check success flow, and API error states.*

---

##  Lab 1 Documentation & Evidence

-  **Test Evidence & Log Summary:** [docs/lab-01/tests.md](docs/lab-01/tests.md)
-  **Peer Review Evidence & PR Records:** [docs/lab-01/reviewer.md](docs/lab-01/reviewer.md)
-  **AI Use & Prompt Reflections:** [docs/lab-01/ai_use.md](docs/lab-01/ai_use.md)



