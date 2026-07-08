
# Advanced Demo App

A full-stack project with advanced features like JWT, RBAC, GraphQL, and WebSockets.

## Project Structure
- `backend/`: NestJS API with Prisma ORM
- `frontend/`: Next.js 15 application with TailwindCSS
- `docker-compose.yml`: Infrastructure (PostgreSQL, Redis)

## Prerequisites
- Node.js >= 22.0.0
- Docker Desktop (for Database & Redis)
- Google Gemini API Key (for AI features)

## Getting Started

### 1. Setup Environment Variables
Copy `.env.example` to `.env` in the root and add your keys:
```bash
cp .env.example .env
```

### 2. Install All Dependencies
From the root directory, run:
```bash
npm run install:all
```

### 3. Start Infrastructure
```bash
npm run docker:up
```

### 4. Setup Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Run Development Servers
You can run both servers from the root in separate terminals:
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## API Documentation
Once the backend is running, access Swagger UI at:
`http://localhost:4000/api/docs`

## Tech Stack
- **Backend:** NestJS, Prisma, PostgreSQL, Swagger
- **Frontend:** Next.js 15, TailwindCSS, TanStack Query, Zustand, Framer Motion
- **AI:** Google Gemini SDK
