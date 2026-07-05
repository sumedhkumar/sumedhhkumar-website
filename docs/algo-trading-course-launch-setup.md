# Algo Trading Course Launch Setup

This guide is for the website owner/operator preparing the Vyntegra Trading Automation Masterclass course funnel for launch.

## What Has Been Implemented

- Public course landing page: `/courses/algo-trading`
- Register/login page: `/courses/algo-trading/register`
- Protected access page: `/courses/algo-trading/access`
- Internal admin registrations page: `/admin/course-registrations`
- Email/password signup and login through Supabase Auth
- Password reset through Supabase Auth
- `course_registrations` database table and persistence
- First-registration user email and admin email
- External payment link copy with manual admin verification
- Centralized course links for videos, WhatsApp, and payment
- Legacy redirects from `/algo-trading-course` and `/algo-trading-course/access`

## Required Environment Variables

Set these in the deployment environment. Do not commit real secrets.

### Core App

- `APP_BASE_URL`: deployed site origin, such as `https://YOUR-DOMAIN`. Used when generating public links in course registration emails.
- `PERSISTENCE_PROVIDER`: set to `postgres` for production database persistence.
- `DATABASE_URL`: Supabase Postgres connection string for the same project that owns `auth.users`.
- `DATABASE_SSL`: usually `true` in production.
- `AUTO_MIGRATE_DB`: optional. Keep `false` unless intentionally running the schema migration flow once and verifying the result.

### Supabase Auth

- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL used by browser and server auth clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anon key used by browser and server auth clients.

These two values are public browser values, not service-role secrets.

### Supabase Server/Storage

- `SUPABASE_URL`: Supabase project URL for server-side storage features already present elsewhere in the site.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role key. Never expose it to client code and never prefix it with `NEXT_PUBLIC_`.
- `SUPABASE_STORAGE_BUCKET`: private storage bucket name used by existing submission attachment flows.

The course registration table itself uses `DATABASE_URL`; storage variables are still part of the wider site setup.

### SMTP

The course registration emails use the shared SMTP configuration:

- `SMTP_HOST`: SMTP server host.
- `SMTP_PORT`: SMTP server port.
- `SMTP_SECURE`: `true` for implicit TLS ports such as 465.
- `SMTP_USER`: authenticated SMTP mailbox. Also used to derive the default `Vyntegra <SMTP_USER>` sender.
- `SMTP_PASS`: SMTP password or app password.
- `CONTACT_MAIL`: support/contact inbox used as support email.
- `ADMIN_MAIL_TO`: admin inbox for notifications. Defaults to `CONTACT_MAIL` if blank.

Payment-mail and crypto-proof SMTP variables exist for other site flows, but they are not part of the course V1 payment verification flow.

### Admin

- `ADMIN_EXPORT_TOKEN`: bearer token used for `/admin/course-registrations` and existing admin export APIs. Use a long, random value.

### Course Public Links

These are public values, not secrets. Leave them blank to keep safe placeholders visible.

- `NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL`: optional HTTPS hero video URL. The direct-share campaign landing page can safely convert supported YouTube watch, share, or embed URLs to a privacy-enhanced embed. Unlisted YouTube is acceptable for promotional/free intro content, but it is not private paid-course protection.
- `NEXT_PUBLIC_COURSE_LECTURE_1_VIDEO_URL`: HTTPS URL for Lecture 1 - Course Roadmap.
- `NEXT_PUBLIC_COURSE_LECTURE_2_VIDEO_URL`: HTTPS URL for Lecture 2 - First Teaching Session.
- `NEXT_PUBLIC_COURSE_WHATSAPP_GROUP_URL`: must be a valid `https://chat.whatsapp.com/...` group URL.
- `NEXT_PUBLIC_COURSE_WHATSAPP_PHONE`: numeric country-code WhatsApp phone value, for example `919999999999`.
- `NEXT_PUBLIC_COURSE_PAYMENT_LINK`: valid HTTPS external payment page URL.
- `NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL`: public support email used by support and full-course inquiry links.

Invalid, blank, non-HTTPS, or placeholder values do not become clickable course links.

## Supabase Dashboard Setup

1. Create or open the Supabase project for the website.
2. Enable email/password auth.
3. Add redirect/callback URLs:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://YOUR-DOMAIN/auth/callback`
4. Configure password recovery so links return through the same callback route. The app requests:
   - `https://YOUR-DOMAIN/auth/callback?next=%2Fauth%2Freset-password`
5. Confirm the project database contains Supabase `auth.users`.
6. Confirm `DATABASE_URL` points to the same Supabase Postgres project, because `course_registrations.user_id` references `auth.users(id)`.

## Database Setup

1. Run `db/schema.sql` in the Supabase SQL editor or through the project's migration process.
2. Confirm `course_registrations` exists.
3. Confirm the table includes:
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `UNIQUE (user_id, course_slug)`
   - `access_status` allowed values: `free_access`, `paid`, `blocked`
   - `payment_status` allowed values: `unpaid`, `paid`, `manual_verification`
   - `login_provider` allowed values: `google`, `email_password`
   - `hidden_bonus_agent_access_eligible BOOLEAN NOT NULL DEFAULT false`
4. Confirm indexes exist for user ID, lowercased email, course slug, and registered date.
5. Use `AUTO_MIGRATE_DB=true` only if you intentionally want the app migration path to create/update tables. Turn it back to `false` after verifying the schema.

## SMTP and Email Setup

Course registration email behavior:

- A user email is sent on first course registration.
- An admin email is sent on first course registration.
- Normal login does not resend course registration emails.
- Duplicate registration checks prevent repeat registration emails for the same Supabase user and course.
- SMTP failure is caught and does not block registration.

Before launch:

1. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
2. Configure `CONTACT_MAIL` and `ADMIN_MAIL_TO`.
3. Create one new test user.
4. Confirm the user receives the free-access email.
5. Confirm the admin inbox receives the registration notification.
6. Log in again with the same user and confirm no duplicate registration email is sent.

## Admin Setup

1. Set `ADMIN_EXPORT_TOKEN` to a long random value.
2. Open `/admin/course-registrations`.
3. Enter the token manually.
4. The token is stored only in `sessionStorage` for the browser session.
5. Use search and filters to find registrations by name, email, WhatsApp, course slug, access status, payment status, or login provider.

Admin actions:

- **Mark paid**: sets `payment_status=paid` and `access_status=paid`.
- **Manual verification**: sets `payment_status=manual_verification`.
- **Mark unpaid**: sets `payment_status=unpaid`; blocked users stay blocked.
- **Block access**: sets `access_status=blocked`.
- **Restore free access**: sets `access_status=free_access` and does not downgrade paid payment status.

Future bonus eligibility is not shown in the admin UI. There is no full admin identity, role, or audit-log system yet; this is token-based admin access.

## Payment V1 Operations

1. Set `NEXT_PUBLIC_COURSE_PAYMENT_LINK` to the external payment page when it is ready.
2. The payment link must be HTTPS.
3. The student pays on the external payment page.
4. The student keeps the payment reference or confirmation.
5. The Vyntegra team verifies payment outside the website.
6. An admin opens `/admin/course-registrations`, finds the student, and marks the registration paid.

This is manual verification, not automatic payment verification. Do not claim instant activation unless the operations team can actually support that timing. No Razorpay, Stripe, crypto verification, or payment proof upload is implemented for this course V1 flow.

## Course Content Link Setup

- Add the optional hero video URL to `NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL`.
- Add Lecture 1 to `NEXT_PUBLIC_COURSE_LECTURE_1_VIDEO_URL`.
- Add Lecture 2 to `NEXT_PUBLIC_COURSE_LECTURE_2_VIDEO_URL`.
- Leave any value blank until it is ready; the UI will show safe placeholders.
- Video URLs must be HTTPS.
- The independent direct-share landing page at `/lp/trading-automation-masterclass` embeds the intro video on-page when this URL is a supported YouTube URL.
- Do not paste private or unapproved links unless they are intended for logged-in course students.
- `/courses/algo-trading/access` still requires login and course registration.
- Preview images and placeholder assets live in `public/images/course/`; their course-facing references are configured in `src/data/algo-trading-course.ts`.

## Required Manual Test Checklist

Run this before launch:

1. `npm run lint`
2. `npm run build`
3. Open `/courses/algo-trading`.
4. Confirm the LP CTA scrolls to the registration section.
5. Test email/password signup.
6. Confirm the Google login button is not visible.
7. Test login for an existing user.
8. Test forgot password and reset password.
9. Confirm first-registration user email says Lecture 1 + Lecture 2.
10. Confirm first-registration admin email.
11. Confirm duplicate login does not resend registration email.
12. Confirm protected access redirects unauthenticated users.
13. Confirm a registered user can access free lessons.
14. Confirm Lecture 1 and Lecture 2 video states for missing, YouTube, Vimeo, and external URLs.
15. Confirm a blocked user cannot access lessons.
16. Confirm invalid/missing payment, video, and WhatsApp links stay safe.
17. Confirm real WhatsApp group and phone links activate when configured, or email fallback appears when they are blank.
18. Confirm the real payment link activates when configured.
19. Confirm admin can search for a user.
20. Confirm admin can mark manual verification.
21. Confirm admin can mark paid.
22. Confirm paid, manual, free, and blocked access page behavior.
23. Confirm `/algo-trading-course` redirects to `/courses/algo-trading`.
24. Confirm `/algo-trading-course/access` redirects to `/courses/algo-trading/access`.
25. Check mobile views for `/lp/trading-automation-masterclass`, `/courses/algo-trading/register`, `/courses/algo-trading/access`, `/admin/course-registrations`, and `/auth/reset-password`.

## Known Limitations and Future Work

- External payment is manual verification only.
- No payment proof upload exists for the course flow.
- No automatic gateway verification exists for the course flow.
- No paid course content modules exist beyond the current protected access/status page.
- Course login is not connected to agent purchases or expert bookings.
- There is no email retry queue or outbox.
- Admin access is token-based, not a full admin identity and audit system.
- The Next.js middleware-to-proxy deprecation warning may still appear during build until that migration is handled.
- Future bonus access remains intentionally hidden.

## Safety and Compliance Notes

- Do not promise profits.
- Do not promise returns.
- Keep the disclaimer visible: "This is an educational course. It does not provide investment advice or profit guarantees. Trading involves financial risk."
- Treat the course as educational, not investment advice.
- Do not publish fake testimonials.
- Do not publish fake P&L or profit screenshots.
