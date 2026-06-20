# Vyntegra Website

## Stack
Next.js App Router, TypeScript, React, Tailwind CSS, lucide-react, next/font/google, nodemailer, stripe, razorpay, and qrcode.

## Local Setup
Run `npm install`, then `npm run dev` for local development. Use `npm run lint`, `npx tsc --noEmit`, and `npm run build` before release.

## Environment Variables
Copy `.env.example` to a real local environment file and fill only genuine values. Do not commit real secret values.

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
Add a genuine founder photograph before launch. Until then, the site renders the required founder photograph pending fallback.

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
The Custom Solutions form can operate when `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, and `CUSTOM_SOLUTIONS_RECIPIENT_EMAIL` are configured and tested.

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
