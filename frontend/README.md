# Vehicle Maintenance Tracker - Frontend

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the Vehicle Maintenance
Tracker. Communicates with the Spring Boot backend via REST.

## Prerequisites

- Node.js 20+
- Backend running (default `http://localhost:8080`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from the example:

   ```bash
   cp .env.local.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   App runs at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                     # App Router
│   ├── (auth)/              # login, register (public)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # protected pages
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   └── services/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/              # shared UI components
├── features/               # feature modules (api + UI per domain)
│   ├── auth/
│   ├── vehicles/
│   └── services/
├── hooks/                   # custom React hooks
├── lib/                     # apiClient (axios), token storage
├── config/                  # constants / env config
└── types/                   # shared TypeScript types (api, models)
```

## Conventions

- Feature-oriented: each domain lives under `features/<domain>` with its own API layer.
- API calls go through the shared `apiClient` (axios) which auto-attaches the JWT.
- Shared types mirror the backend DTOs (`types/api.ts`, `types/models.ts`).
