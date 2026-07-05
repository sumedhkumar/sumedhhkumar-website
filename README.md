# Vyntegra Website

## Stack
Next.js App Router, TypeScript, React, Tailwind CSS, lucide-react, next/font/google, nodemailer, stripe, razorpay, and qrcode.

## Local Setup
Run `npm install`, then `npm run dev` for local development. Use `npm run lint`, `npx tsc --noEmit`, and `npm run build` before release.

## Algo Trading Course Launch Setup
See [docs/algo-trading-course-launch-setup.md](docs/algo-trading-course-launch-setup.md) for the final owner/operator setup checklist for the Vyntegra Trading Automation Masterclass funnel.

## Environment Variables
Copy `.env.example` to a real local environment file and fill only genuine values. Do not commit real secret values.

Set `APP_BASE_URL` to the deployed site origin, such as `https://your-domain.com`, so course registration emails, auth redirects, and access/reset links are generated with the correct public domain.

## Supabase Auth Setup
Course account access uses Supabase Auth with email/password in the current funnel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the browser/server auth clients, and keep `SUPABASE_SERVICE_ROLE_KEY` server-only for private storage/admin operations. The anon key is safe to expose as a public browser key; the service-role key is not.

Add redirect URLs for local and production callbacks:

- `http://localhost:3000/auth/callback`
- `https://your-domain.com/auth/callback`

Email/password auth and password reset templates should be configured in Supabase before the course login UI is enabled. The course UI does not show a Google login button.

## Course Content Links
The Vyntegra Trading Automation Masterclass uses public `NEXT_PUBLIC_COURSE_*` variables for the intro video, Lecture 1, Lecture 2, WhatsApp group, WhatsApp phone, and future payment link. These values are not secrets. Leave them blank to keep the protected access page in its placeholder-safe state.

Only real `https://` video/payment URLs are rendered. WhatsApp group links must use `https://chat.whatsapp.com/...`, and WhatsApp contact links are created only from a real numeric phone value.

Before launch, set:

- `NEXT_PUBLIC_COURSE_LECTURE_1_VIDEO_URL`: Lecture 1 - Course Roadmap.
- `NEXT_PUBLIC_COURSE_LECTURE_2_VIDEO_URL`: Lecture 2 - First Teaching Session.
- `NEXT_PUBLIC_COURSE_WHATSAPP_GROUP_URL`: optional WhatsApp group/community URL.
- `CONTACT_MAIL` and `NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL`: support email used by server email and public support links.
- `NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL`: optional landing-page hero video.

Preview assets live under `public/images/course/`, and the course-facing references are centralized in `src/data/algo-trading-course.ts`.

## Trading Automation Masterclass Launch Checklist
- Confirm the LP CTA scrolls to the registration section.
- Confirm registration and login work with email/password.
- Confirm the Google login button is not visible.
- Confirm the protected access page renders for an approved user.
- Confirm Lecture 1 and Lecture 2 video states with missing, YouTube, Vimeo, and external URLs.
- Confirm WhatsApp CTAs or email support fallbacks.
- Confirm email copy says Lecture 1 + Lecture 2.
- Confirm no banned claims or old lesson labels are visible.

## Supabase Postgres + Private Storage Setup
Create a Supabase project. Set the following values manually in `.env.local` for local development and in the Vercel project environment for deployment; do not commit real values. In **Project Settings > Database**, copy the pooled or transaction-pooler connection string into `DATABASE_URL`, set `PERSISTENCE_PROVIDER=postgres` and `DATABASE_SSL=true`, and configure `ADMIN_EXPORT_TOKEN` plus a private `IP_HASH_SALT`. Production form submissions and payment records are rejected unless both `PERSISTENCE_PROVIDER=postgres` and `DATABASE_URL` are configured.

Create the schema using one of these approaches:

- Option A: run [`db/schema.sql`](db/schema.sql) in the provider's database console.
- Option B: set `AUTO_MIGRATE_DB=true` for one deployment or run, verify the tables exist, then set it back to `false`.

In **Storage**, create the private bucket named `vyntegra-submission-attachments`. Set `SUPABASE_STORAGE_BUCKET=vyntegra-submission-attachments`, copy the project URL to `SUPABASE_URL`, and place the service role key in `SUPABASE_SERVICE_ROLE_KEY`. Never expose this key in client code, never prefix it with `NEXT_PUBLIC_`, and do not use an anon key for private attachment writes or downloads.

The read-only exports require `Authorization: Bearer <ADMIN_EXPORT_TOKEN>` (or `x-admin-token`). For example:

```bash
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" "https://your-domain.example/api/admin/submissions?limit=50"
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" "https://your-domain.example/api/admin/razorpay-payments?purchaseType=product"
curl -L -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" "https://your-domain.example/api/admin/submissions/<submissionId>/attachments/<attachmentId>" -o proof-file
```

Course registration admin is available at `/admin/course-registrations`. Enter `ADMIN_EXPORT_TOKEN` manually in the page; it is stored only in `sessionStorage` for that browser tab/session and sent to `/api/admin/course-registrations` and `/api/admin/course-registrations/<registrationId>` as a bearer token. The API returns admin-safe course registration rows and does not expose hidden bonus fields.

## Course Payment V1 Process
Set `NEXT_PUBLIC_COURSE_PAYMENT_LINK` to the external course payment page URL when it is ready. This is a public link, not a secret; do not put tokens, private keys, or sensitive provider credentials in it.

The V1 course flow is manual verification: the student pays externally from `/courses/algo-trading/access`, the team verifies payment outside the site, then an admin opens `/admin/course-registrations`, searches by email or WhatsApp, and uses **Mark paid** to set `payment_status=paid` and `access_status=paid`. If the payment is unclear, use **Manual verification**. If access should be stopped, use **Block access**.

This code does not automatically verify payments. Payment gateway/provider compliance, payment-page setup, and external transaction review remain operational responsibilities outside this code change.

## Real Data Insertion
The default public state intentionally contains empty products, experts, coupons, testimonials, contact details, wallet values, and protected access mappings.

## Product Data
Add genuine AI Trading Software Agent records in `src/data/products.ts`. Store protected product-access references only in `src/lib/server/product-access.ts`.

## Expert Data
Add genuine expert profiles and sessions in `src/data/experts.ts`. Do not place Calendly URLs in public expert data.

## Coupon Data
Add genuine coupon records in `src/data/coupons.ts`. Production coupon usage enforcement requires persistent storage before launch.

## Testimonial Data
Add only genuine customer testimonials in `src/data/testimonials.ts`. The testimonials section is hidden while the array is empty.

## Founder Photograph
Add a genuine founder photograph before launch. The course funnel founder portrait is configured in `src/data/algo-trading-course.ts`.

## Founder Social URLs
The founder social URLs are locked in `src/data/site.ts` and render only in the Founder section.

## Contact Details
Set `NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL` and `NEXT_PUBLIC_VYNTEGRA_CONTACT_PHONE` with genuine public contact details before launch.

## Calendly URLs
Store expert-to-Calendly URL mappings only in `src/lib/server/expert-booking.ts`. Booking remains disabled until production persistence, verified payment entitlement checks, mappings, and `EXPERT_BOOKING_ENABLED=true` are configured and tested.

## Payment Providers
Stripe, Razorpay, and crypto payment scaffolds are disabled by default. Enable only after production persistence, server-side price calculation, server-side coupon validation, provider credentials, webhook verification, idempotent fulfillment, and sandbox testing are complete.

## Crypto Wallet and Network
Set `CRYPTO_WALLET_ADDRESS` and `CRYPTO_WALLET_NETWORK` only with genuine production values. Manual verification must persist the pending request before any confirmation is shown.

## SMTP
Course registration emails and the Custom Solutions form use the shared SMTP configuration. Set and test `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`; the sender is derived from `SMTP_USER`, and admin/support delivery uses the configured contact/admin mail variables.

## Crypto Proof Email Delivery
Keep `SMTP_*` authenticated as `support@vyntegra.in`; it remains responsible for support mail and must be permitted to send as the `sales@vyntegra.in` alias. Crypto proof delivery also requires the separate `CRYPTO_PROOF_SMTP_HOST`, `CRYPTO_PROOF_SMTP_PORT`, `CRYPTO_PROOF_SMTP_SECURE`, `CRYPTO_PROOF_SMTP_USER`, and `CRYPTO_PROOF_SMTP_PASS` settings for `ai.vyntegra@gmail.com`.

Each persisted crypto proof sends three messages: a Sales confirmation to the customer without an attachment, an attachment-free Sales notification to `sales@vyntegra.in`, and an AI self-copy with the uploaded proof attached.

## Launch-Blocking Checklist
- final legal review
- real product data
- real expert data
- genuine assets
- contact details
- founder assets
- payment-provider keys
- payment testing
- crypto verification workflow
- secure product-access persistence
- coupon usage persistence
- payment persistence
- expert booking-token persistence
- rate-limit persistence
- Stripe webhook testing
- Razorpay callback-signature testing
- Razorpay webhook testing
- SMTP testing
- Calendly advanced-embed testing
- Calendly event-scheduled persistence testing

## Security Architecture
Public data lives in `src/data`. Server-only protected references live in `src/lib/server`. SMTP credentials and payment secrets are read only in server Route Handlers and server libraries. Calendly URLs and product-access references must not be serialized to public pre-payment pages.

## Current Shell Scope
This is a complete branded website shell and production-safe integration scaffold. It does not include live payment fulfillment, protected downloads, coupon usage persistence, paid booking access, real expert profiles, real products, real contact details, or final legal text.

## Final ZIP Cleanup Rules
No ZIP is created by default in this workspace task. If a clean source ZIP is later created, exclude `node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`, `.venv`, `venv`, `__pycache__`, `.pytest_cache`, `.DS_Store`, logs, temporary files, secrets, real environment files, cache folders, IDE folders, `design-system/sumedh-kumar`, `requirements.txt`, `AGENTS.md`, and `CLAUDE.md`. The temporary typographic V favicon in `src/app/icon.svg` must be replaced with final approved brand assets before launch.
