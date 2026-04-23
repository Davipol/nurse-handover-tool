# Handover AI

A full-stack clinical handover tool for hospital nurses. Nurses can view patient information, read and write shift handover notes, and receive AI-generated SBAR summaries to support safe patient care transitions.

## Features

- Browse patients by hospital unit
- View full handover history per patient
- Write new handover notes with vitals
- AI-generated SBAR summaries (updated automatically on new handovers)
- Change handover urgency level
- Void handovers with reason and audit trail
- Nurse authentication with JWT sessions

## Tech Stack

**Frontend:** Next.js, Tailwind CSS, NextAuth.js  
**Backend:** Node.js, Express  
**Database:** PostgreSQL (Neon)  
**AI:** OpenRouter (Liquid LFM model)  
**Deployment:** Vercel (frontend), Render (backend)

## Demo

Live app: [nurse-handover-tool-nli6.vercel.app](https://nurse-handover-tool-nli6.vercel.app)

Demo credentials are pre-filled on the login page.

## Local Development

**Prerequisites:** Node.js, PostgreSQL

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Environment variables:**

Backend `.env.development`:

```bash
PGDATABASE=handover_tool_db
PGUSER=your_user
PGPASSWORD=your_password
PGHOST=localhost
PGPORT=5432
LIQUID_API_KEY=your_openrouter_key
```

Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:9090
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## Database Setup

```bash
cd backend
psql handover_tool_db -f db/schema.sql
psql handover_tool_db -f db/migrations/003_add_ai_summary_cache.sql
psql handover_tool_db -f db/migrations/004_add_handover_voiding.sql
psql handover_tool_db -f db/migrations/005_add_password_hash.sql
node db/db_seed.js
```
