# Acceptance checklist

Status key: **Verified** = checked in the build environment. **Verify after deploy** = needs your live Supabase, SMTP or domain; steps given.

| # | Criterion | Status | How to confirm |
|---|---|---|---|
| 1 | All navigation links work | Verify after deploy | Click every header/footer link; unknown URLs show the 404 page |
| 2 | Responsive on common screens | Verify after deploy | Browser dev tools at 360, 768, 1280 px; layout is mobile-first CSS |
| 3 | Service cards open the correct page or enquiry form | Verify after deploy | Services cards → detail pages; utility cards → form with the service pre-filled |
| 4 | Contact forms validate and save | Verified (validation) / Verify after deploy (save) | Backend tests cover validation, honeypot and consent; submit a live enquiry and see it in `/admin/enquiries` |
| 5 | Email notifications work | Verify after deploy | Set SMTP, submit an enquiry, booking, registration; send a quotation |
| 6 | Bookings prevent conflicts | Verify after deploy | Run `supabase/verify.sql` (expects PASS); book the same slot twice in two browsers |
| 7 | Admin requires authentication | Verified | Automated tests: every admin route returns 401 without a valid token |
| 8 | Public users cannot access protected data | Verified (API) | Tests above; database tables have RLS enabled with no public policies |
| 9 | Portfolio filters and course listings work | Verify after deploy | Add a project and a course in admin; check `/portfolio` and `/training` |
| 10 | Admin changes appear publicly | Verify after deploy | Publish an FAQ/announcement/service edit and reload the site (allow up to a minute for contact/stats) |
| 11 | API returns appropriate status codes | Verified | Tests: 400 validation, 401/403 auth, 404 unknown, 201 honeypot, 403 CORS |
| 12 | Migrations apply | Verify after deploy | Run the four SQL files in order without errors |
| 13 | Production environment variables set | Verify after deploy | Follow `DEPLOYMENT.md` sections 3 and 5 |
| 14 | No decorative buttons | Verified (code review) | Every button/link has a handler or destination; "Contact Us"/CTAs link to forms |
| 15 | Builds and runs without critical errors | Verified | `npm run build` (frontend) and `npm test` (backend 11 tests, frontend 2 tests) pass |
| 16 | SEO, accessibility, security reviewed | Partly verified | Titles/meta/Open Graph/structured data/robots/sitemap present; labelled forms, skip link, focus styles, reduced-motion respected; Helmet, CORS allow-list, rate limits, hashed passwords. Run Lighthouse and a screen-reader pass after deploy |

Known gaps: no Open Graph preview image (add one to `frontend/public` and reference it in `index.html`); no server-side PDF; no automated browser (end-to-end) tests; error monitoring relies on Render logs (add a service such as Sentry if you want alerts).
