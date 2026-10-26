# CyberSpark IT Solutions: website

Monorepo, built in approval-gated stages.

| Stage | Scope | Status |
|---|---|---|
| 1 | Supabase schema + Express API (services, enquiries, admin auth, lead management, CSV) | **Done** |
| 2 | Public website (Vite React, all public pages, enquiry forms) | Next |
| 3 | Admin dashboard UI | |
| 4 | Consultation booking, quotations, blog, testimonials, training | |
| 5 | Automation hooks, SEO, deployment (Vercel + Render) | |

## Stage 1: run it
1. Supabase: create a project, run `supabase/schema.sql` then `supabase/seed.sql` in the SQL Editor.
2. `cd backend && cp .env.example .env` and fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
3. `npm install`
4. `ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='at-least-10-chars' npm run create-admin`
5. `npm run dev` then open `http://localhost:4000/api/health`

## API
Public: `GET /api/services?type=utility|service`, `GET /api/services/:slug`, `POST /api/enquiries`
Admin (Bearer token): `POST /api/admin/login`, `GET /api/admin/stats`, `GET /api/admin/enquiries?status=&q=&page=`,
`GET /api/admin/enquiries.csv`, `GET|PATCH /api/admin/enquiries/:id`, `POST /api/admin/enquiries/:id/notes`,
`GET|POST|PATCH|DELETE /api/admin/services` (writes: admin role only)

## Needs your setup
Supabase project and keys, SMTP credentials (emails are skipped and logged until set), Render deploy (Stage 5).

## Stage 5: production readiness
- `DEPLOYMENT.md`: step-by-step Supabase → Render → Vercel → domain, plus operations and a go-live checklist
- `render.yaml`: Render blueprint; `frontend/vercel.json`: routing and security headers
- `docs/AUTOMATION.md`: optional n8n/AI hooks (signed outbound events; inbound AI notes as internal notes only)
- `docs/ACCEPTANCE.md`: your 16 acceptance criteria with what is verified and what to confirm after deploy
- `supabase/verify.sql`: proves double bookings are blocked
- `backend`: `npm test` (11 tests), `npm run purge-old-data` (retention). `frontend`: `npm test`, `npm run build`
- Dynamic sitemap at `/api/sitemap.xml`; structured data in `frontend/index.html`

## Completed vs. needs your setup
**Working in code:** public site, enquiry and consultation workflows, quotations, training, content management, admin with roles, CSV export, retention script, tests, deployment config.
**Needs your credentials or content:** Supabase project and SQL, Render and Vercel accounts, domain DNS, SMTP, official logo, real portfolio/testimonials/stats/courses, legal review, optional n8n/AI/CRM/WhatsApp accounts.
# CyberSparkIT
# CyberSparkIT
