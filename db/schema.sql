CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('contact', 'custom_solution', 'crypto_payment_proof', 'crypto_payment_query')),
  submitted_at TIMESTAMPTZ NOT NULL,
  submitted_at_ist_display TEXT NOT NULL,
  full_name TEXT,
  email_address TEXT,
  phone_or_whatsapp TEXT,
  subject TEXT,
  message TEXT,
  company_or_organization TEXT,
  solution_type TEXT,
  requirements_description TEXT,
  preferred_timeline TEXT,
  source_page TEXT,
  purchase_type TEXT,
  product_id TEXT,
  product_slug TEXT,
  product_name TEXT,
  selected_plan_id TEXT,
  selected_plan_name TEXT,
  subscription_duration TEXT,
  original_product_price TEXT,
  coupon_code TEXT,
  discount_amount TEXT,
  final_payable_price TEXT,
  amount_paid TEXT,
  crypto_token TEXT,
  crypto_network TEXT,
  crypto_wallet_address TEXT,
  transaction_hash TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
  email_error TEXT,
  client_ip_hash TEXT,
  user_agent TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_submissions_type_submitted_at_idx ON form_submissions (submission_type, submitted_at DESC);
CREATE INDEX IF NOT EXISTS form_submissions_email_submitted_at_idx ON form_submissions (email_address, submitted_at DESC);
CREATE INDEX IF NOT EXISTS form_submissions_transaction_hash_idx ON form_submissions (transaction_hash) WHERE transaction_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS form_submissions_created_at_idx ON form_submissions (created_at DESC);

CREATE TABLE IF NOT EXISTS submission_attachments (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  attachment_kind TEXT NOT NULL CHECK (attachment_kind IN ('crypto_payment_screenshot', 'custom_solution_supporting_file')),
  filename TEXT NOT NULL,
  safe_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256_hash TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase_storage',
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS submission_attachments_submission_id_idx ON submission_attachments (submission_id);
CREATE INDEX IF NOT EXISTS submission_attachments_sha256_hash_idx ON submission_attachments (sha256_hash);
CREATE INDEX IF NOT EXISTS submission_attachments_storage_location_idx ON submission_attachments (storage_bucket, storage_path);
CREATE INDEX IF NOT EXISTS submission_attachments_created_at_idx ON submission_attachments (created_at DESC);

CREATE TABLE IF NOT EXISTS razorpay_orders (
  id TEXT PRIMARY KEY,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'expert')),
  order_created_at TIMESTAMPTZ NOT NULL,
  order_created_at_ist_display TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  product_id TEXT,
  product_slug TEXT,
  product_name TEXT,
  expert_id TEXT,
  expert_slug TEXT,
  expert_name TEXT,
  session_id TEXT,
  session_label TEXT,
  session_duration_minutes INTEGER,
  slot_start_utc TIMESTAMPTZ,
  appointment_date TEXT,
  appointment_slot TEXT,
  selected_plan_id TEXT,
  selected_plan_name TEXT,
  subscription_duration TEXT,
  original_price_usd NUMERIC(12,2),
  discount_usd NUMERIC(12,2),
  final_price_usd NUMERIC(12,2),
  coupon_code TEXT,
  usd_to_inr_rate NUMERIC(12,4),
  usd_to_inr_rate_source TEXT,
  exchange_rate_fetched_at_utc TIMESTAMPTZ,
  exchange_rate_fetched_at_ist_display TEXT,
  exchange_rate_is_fallback BOOLEAN NOT NULL DEFAULT false,
  usd_to_inr_effective_date_ist TEXT,
  final_price_inr NUMERIC(12,2),
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  client_ip_hash TEXT,
  user_agent TEXT,
  raw_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_order JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS razorpay_orders_target_created_idx ON razorpay_orders (target_type, order_created_at DESC);
CREATE INDEX IF NOT EXISTS razorpay_orders_email_created_idx ON razorpay_orders (customer_email, order_created_at DESC);
CREATE INDEX IF NOT EXISTS razorpay_orders_created_at_idx ON razorpay_orders (created_at DESC);

CREATE TABLE IF NOT EXISTS razorpay_payments (
  id TEXT PRIMARY KEY,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT NOT NULL REFERENCES razorpay_orders(razorpay_order_id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('product', 'expert')),
  verified_at TIMESTAMPTZ NOT NULL,
  verified_at_ist_display TEXT,
  captured_at_utc TIMESTAMPTZ,
  captured_at_ist_display TEXT,
  customer_phone TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'skipped')),
  email_error TEXT,
  booking_status TEXT CHECK (booking_status IN ('not_applicable', 'pending', 'confirmed', 'manual_followup_required')),
  cal_booking_uid TEXT,
  cal_booking_status TEXT,
  cal_meeting_url TEXT,
  support_followup_required BOOLEAN NOT NULL DEFAULT false,
  booking_error_summary TEXT,
  razorpay_signature_hash TEXT,
  raw_payment JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_verification_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS razorpay_payments_order_id_idx ON razorpay_payments (razorpay_order_id);
CREATE INDEX IF NOT EXISTS razorpay_payments_type_verified_idx ON razorpay_payments (purchase_type, verified_at DESC);
CREATE INDEX IF NOT EXISTS razorpay_payments_created_at_idx ON razorpay_payments (created_at DESC);

CREATE TABLE IF NOT EXISTS course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  course_slug TEXT NOT NULL DEFAULT 'algo-trading',
  access_status TEXT NOT NULL DEFAULT 'free_access' CHECK (access_status IN ('free_access', 'paid', 'blocked')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'manual_verification')),
  login_provider TEXT NOT NULL DEFAULT 'email_password' CHECK (login_provider IN ('google', 'email_password')),
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  hidden_bonus_agent_access_eligible BOOLEAN NOT NULL DEFAULT false,
  progress_state JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_login_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS course_registrations_user_id_idx ON course_registrations (user_id);
CREATE INDEX IF NOT EXISTS course_registrations_email_lower_idx ON course_registrations (lower(email));
CREATE INDEX IF NOT EXISTS course_registrations_course_slug_idx ON course_registrations (course_slug);
CREATE INDEX IF NOT EXISTS course_registrations_registered_at_idx ON course_registrations (registered_at DESC);
