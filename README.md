# TokTickIT - IT Service Desk Application

TokTickIT is an IT service desk application for Account and Access, Hardware, Software, and Network requests.

## Project Structure

- `client/`: React + TypeScript + Vite + Bootstrap frontend
- `server/`: Node.js + Express + TypeScript + Prisma backend
- `docs/lab-01/`: Lab 1 documentation & submission evidence

## Setup & Running

### 1. Server Setup
```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

## Testing

- Backend tests: `cd server && npm test`
- Frontend tests: `cd client && npm test`
