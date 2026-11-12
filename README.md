# Handover AI
![CI](https://github.com/Davipol/nurse-handover-tool/actions/workflows/ci.yml/badge.svg)

A full-stack clinical handover tool for hospital nurses. Nurses can view patient information, read and write shift handover notes, and receive AI-generated SBAR summaries to support safe patient care transitions.

Built as a portfolio project. It runs on demo data only and is not intended for real patient information.

## Features

- Browse patients by hospital unit
- View full handover history per patient
- Write new handover notes with vitals and urgency level
- Record vitals separately as a quick entry (saved as a routine handover note)
- AI-generated SBAR summaries (updated automatically on new handovers)
- Change handover urgency level
- Void handovers with reason and audit trail
- Nurse authentication with JWT sessions
- Backend covered by integration tests, run automatically on every push

## Tech Stack

**Frontend:** Next.js, Tailwind CSS, NextAuth.js  
**Backend:** Node.js, Express  
**Database:** PostgreSQL (Neon)  
**AI:** OpenRouter (Liquid LFM model)  
**Deployment:** Vercel (frontend), Render (backend)  
**Testing & CI:** Jest, Supertest, GitHub Actions

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

Backend `.env.test`:

```bash
PGDATABASE=handover_tool_db_test
PGUSER=your_user
PGPASSWORD=your_password
PGHOST=localhost
PGPORT=5432
```

Backend `.env.production` (used when `NODE_ENV=production`, connects with SSL):

```bash
DATABASE_URL=your_postgres_connection_string
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
npm run setup-and-seed
```

The seed creates 6 units with demo nurses, patients and handover notes. All demo nurses share the password `Handover2026!`.

## Testing

Tests use Jest and Supertest against a separate test database. AI calls are mocked, so no API key is needed.

```bash
cd backend
npm run setup-test
npm test
```

Every push to `main` runs the test suite on GitHub Actions against a fresh Postgres database. Render and Vercel only deploy once the tests pass.

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/units` | List all units |
| GET | `/api/units/:id/summary?date=YYYY-MM-DD` | AI summary of a unit's handovers on a given date |
| GET | `/api/nurses` | List all nurses |
| POST | `/api/nurses/login` | Log in with email and password |
| GET | `/api/patients` | List patients (filters: `unit`, `bed`) |
| GET | `/api/patients/:bed` | Get the patient in a bed |
| GET | `/api/patients/:bed/handovers` | Handover history for a patient |
| GET | `/api/patients/:bed/summary` | Cached AI SBAR summary for a patient |
| GET | `/api/handovers` | List handovers (filters: `urgency`, `date`, `shift`) |
| POST | `/api/handovers` | Create a handover note |
| PATCH | `/api/handovers/:id/urgency` | Change a handover's urgency |
| PATCH | `/api/handovers/:id/void` | Void a handover with a reason |
| GET | `/api/handovers/:id/summary` | AI SBAR summary of a single handover |

## License

MIT, see [LICENSE](LICENSE).
