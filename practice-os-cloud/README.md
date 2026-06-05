# Practice OS Cloud

Practice OS Cloud is the multi-location version of Practice OS. It is designed so owner, reviewer, manager and staff work on one central database from different computers.

## Recommended Production Stack

- Next.js web app
- PostgreSQL database
- Prisma ORM
- Supabase Auth
- Supabase Storage for task documents
- Vercel or similar hosting
- Daily scheduled recurring task generation

Official references:

- Vercel supports Next.js hosting: <https://vercel.com/docs/concepts/next.js/overview>
- Supabase provides a full Postgres database, Auth, Storage and Realtime: <https://supabase.com/docs/guides/database/overview>
- Supabase database backups are available, but storage objects require separate backup planning: <https://supabase.com/docs/guides/platform/backups>

## Why This Is Better For Different Locations

Do not let each employee run a separate Practice OS copy.

Use one cloud app:

```text
Owner / Staff / Reviewer -> https://practiceos.youroffice.com -> PostgreSQL database
```

This gives:

- One live task register
- Role-based access
- Staff-specific My Work page
- Live owner dashboard
- Central document vault
- Audit history
- Automatic recurring tasks
- No Excel/database version conflict

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill:

```text
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
PRACTICE_OS_OWNER_EMAIL
```

4. Install dependencies:

```bash
npm install
```

5. Run database migration:

```bash
npx prisma migrate dev
```

6. Run the Supabase SQL migration:

```text
supabase/migrations/001_storage_and_policies.sql
```

7. Import local Practice OS data:

```bash
npm run seed
```

8. Start locally:

```bash
npm run dev
```

9. Deploy to Vercel and add the same environment variables.

## Pages

- `/dashboard`: owner/manager overview
- `/my-work`: staff work desk
- `/tasks`: manager task creation and register
- `/clients`: client master
- `/staff`: staff responsibility matrix
- `/owner-review`: owner cockpit

## Staff Workflow

1. Staff logs in.
2. Staff opens `/my-work`.
3. Staff updates:
   - status
   - time spent
   - remarks
   - checklist
   - uploaded files
4. Reviewer checks prepared work.
5. Owner monitors `/dashboard` and `/owner-review`.

## Assignment Workflow

Tasks are assigned in this order:

1. Client-service assigned staff
2. Client assigned staff
3. Group/service responsibility
4. Manager manual assignment

Reviewer is assigned in this order:

1. Client-service reviewer
2. Client reviewer
3. Owner/reviewer fallback

## Recurring Task Generation

Recurring task rules create tasks for:

- Daily accounting support
- Weekly review
- Monthly GST
- Monthly final books
- Monthly stock statements
- Quarterly TDS
- Quarterly RERA
- Yearly ITR
- Yearly tax audit
- As-needed ROC/legal/compliance work

Manual run:

```bash
npm run generate:tasks
```

Cloud run:

```text
POST /api/cron/generate-tasks
Header: x-cron-secret = CRON_SECRET
```

Vercel cron is configured in `vercel.json`.

## Document Vault

Private Supabase bucket:

```text
task-documents
```

Path convention:

```text
Client / FY / Service / Period / File
```

See:

```text
docs/document-vault.md
```

## Next Implementation Items

This scaffold prepares the cloud system. The next build steps are:

- Login page and Supabase auth middleware
- Staff checklist update UI
- Task document upload form
- Reviewer approval/correction screen
- Fee revision and profitability screens
- Client portal for data requests
- Email/WhatsApp reminders
- Monthly review pack generation

Deployment trigger
