module.exports=[98003,e=>{"use strict";let t,a;function r(e){return"true"===process.env[e]}function s(e){return process.env[e]??""}function o(e,t){let a=s(e);return a?"true"===a:t}let i=s("CONTACT_MAIL")||"support@vyntegra.in",n=s("ADMIN_MAIL_TO")||i,u=s("SMTP_PORT")||"465",_=s("SMTP_USER"),c=_?`Vyntegra <${_}>`:"",p=s("PAYMENT_MAIL_FROM")||"sales@vyntegra.in",d=s("PAYMENT_MAIL_FROM_NAME")||"Vyntegra Sales",l=s("PAYMENT_MAIL_REPLY_TO")||p,m=`${d} <${p}>`,y="ai.vyntegra@gmail.com",E=s("CRYPTO_PROOF_SMTP_PORT")||"465",g=s("CRYPTO_PROOF_SMTP_USER"),S=g?`Vyntegra AI <${y}>`:"",f={appBaseUrl:s("APP_BASE_URL"),persistenceProvider:s("PERSISTENCE_PROVIDER")||"disabled",databaseUrl:s("DATABASE_URL"),databaseSsl:o("DATABASE_SSL",!0),autoMigrateDb:r("AUTO_MIGRATE_DB"),publicSupabaseUrl:s("NEXT_PUBLIC_SUPABASE_URL"),publicSupabaseAnonKey:s("NEXT_PUBLIC_SUPABASE_ANON_KEY"),supabaseUrl:s("SUPABASE_URL"),supabaseServiceRoleKey:s("SUPABASE_SERVICE_ROLE_KEY"),supabaseStorageBucket:s("SUPABASE_STORAGE_BUCKET"),adminExportToken:s("ADMIN_EXPORT_TOKEN"),ipHashSalt:s("IP_HASH_SALT"),paymentsEnabled:r("PAYMENTS_ENABLED"),stripeEnabled:r("STRIPE_ENABLED"),stripeSecretKey:s("STRIPE_SECRET_KEY"),stripeWebhookSecret:s("STRIPE_WEBHOOK_SECRET"),razorpayEnabled:r("RAZORPAY_ENABLED"),razorpayKeyId:s("RAZORPAY_KEY_ID"),publicRazorpayKeyId:s("NEXT_PUBLIC_RAZORPAY_KEY_ID"),razorpayKeySecret:s("RAZORPAY_KEY_SECRET"),razorpayWebhookSecret:s("RAZORPAY_WEBHOOK_SECRET"),cryptoPaymentsEnabled:(t=s("CRYPTO_PAYMENT_ENABLED"),a=s("CRYPTO_PAYMENTS_ENABLED"),t?"true"===t:!a||"true"===a),cryptoPaymentToken:s("CRYPTO_PAYMENT_TOKEN")||"USDT",cryptoWalletAddress:s("CRYPTO_WALLET_ADDRESS")||"TGFNSMePvxZZuxXPLJuFC3b8rSuUoPnAxV",cryptoWalletNetwork:s("CRYPTO_PAYMENT_NETWORK")||s("CRYPTO_WALLET_NETWORK")||"Tron (TRC20)",cryptoQrImagePath:s("CRYPTO_QR_IMAGE_PATH")||"/payments/crypto-payment-qr.png",contactEmail:i,supportEmail:i,adminEmail:n,adminPaymentEmail:n,queryEmail:n,expertBookingEnabled:r("EXPERT_BOOKING_ENABLED"),productAccessEnabled:r("PRODUCT_ACCESS_ENABLED"),customSolutionsRecipientEmail:n,smtpHost:s("SMTP_HOST"),smtpPort:u,smtpSecure:o("SMTP_SECURE",465===Number(u)),smtpUser:_,smtpPass:s("SMTP_PASS"),smtpFromEmail:c,paymentMailFrom:p,paymentMailFromName:d,paymentMailReplyTo:l,paymentMailFromEmail:m,cryptoProofMailbox:y,cryptoProofSmtpHost:s("CRYPTO_PROOF_SMTP_HOST"),cryptoProofSmtpPort:E,cryptoProofSmtpSecure:o("CRYPTO_PROOF_SMTP_SECURE",465===Number(E)),cryptoProofSmtpUser:g,cryptoProofSmtpPass:s("CRYPTO_PROOF_SMTP_PASS"),cryptoProofMailFromEmail:S};function $(){return"postgres"===f.persistenceProvider&&!!f.databaseUrl}function h(){return[["SMTP_HOST",f.smtpHost],["SMTP_PORT",f.smtpPort],["SMTP_USER",f.smtpUser],["SMTP_PASS",f.smtpPass]].filter(([,e])=>!e).map(([e])=>e)}e.s(["appConfig",0,f,"getSmtpConfigurationErrorMessage",0,function(){let e=h();return 0===e.length?"":`Email service is not configured. Missing environment variables: ${e.join(", ")}.`},"hasCryptoConfiguration",0,function(){return!!(f.cryptoPaymentsEnabled&&f.cryptoPaymentToken&&f.cryptoWalletAddress&&f.cryptoWalletNetwork&&f.cryptoQrImagePath)},"hasCryptoProofSmtpConfiguration",0,function(){return 0===[["CRYPTO_PROOF_SMTP_HOST",f.cryptoProofSmtpHost],["CRYPTO_PROOF_SMTP_PORT",f.cryptoProofSmtpPort],["CRYPTO_PROOF_SMTP_USER",f.cryptoProofSmtpUser],["CRYPTO_PROOF_SMTP_PASS",f.cryptoProofSmtpPass]].filter(([,e])=>!e).map(([e])=>e).length},"hasRazorpayConfiguration",0,function(){return!!(f.paymentsEnabled&&$()&&f.razorpayEnabled&&f.razorpayKeyId&&f.publicRazorpayKeyId&&f.razorpayKeySecret&&f.razorpayWebhookSecret)},"hasSmtpConfiguration",0,function(){return 0===h().length},"hasStripeConfiguration",0,function(){return!!(f.paymentsEnabled&&$()&&f.stripeEnabled&&f.stripeSecretKey&&f.stripeWebhookSecret)},"isAttachmentStorageConfigured",0,function(){return!!(f.supabaseUrl&&f.supabaseServiceRoleKey&&f.supabaseStorageBucket)},"isProductionPersistenceConfigured",0,$,"serviceUnavailableResponse",0,function(){return Response.json({ok:!1,message:"This service is not configured yet."},{status:503})}])},66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},12714,(e,t,a)=>{t.exports=e.x("node:fs/promises",()=>require("node:fs/promises"))},50227,(e,t,a)=>{t.exports=e.x("node:path",()=>require("node:path"))},23862,e=>e.a(async(t,a)=>{try{let t=await e.y("pg-587764f78a6c7a9c");e.n(t),a()}catch(e){a(e)}},!0),29286,e=>e.a(async(t,a)=>{try{var r=e.i(12714),s=e.i(50227),o=e.i(23862),i=e.i(98003),n=t([o]);[o]=n.then?(await n)():n;let m=globalThis;function u(){return Error("PostgreSQL persistence is not configured.")}function _(){if(!(0,i.isProductionPersistenceConfigured)())throw u();return m.vyntegraDbPool||(m.vyntegraDbPool=new o.Pool({connectionString:i.appConfig.databaseUrl,ssl:i.appConfig.databaseSsl?{rejectUnauthorized:!1}:void 0})),m.vyntegraDbPool}async function c(e,t=[]){return await l(),_().query(e,[...t])}async function p(e){await l();let t=await _().connect();try{return await e(t)}finally{t.release()}}async function d(){let e=(await (0,r.readFile)((0,s.join)(process.cwd(),"db","schema.sql"),"utf8")).split(/;\s*(?:\r?\n|$)/).map(e=>e.trim()).filter(Boolean),t=await _().connect();try{for(let a of e)await t.query(a)}finally{t.release()}}async function l(){if(!(0,i.isProductionPersistenceConfigured)())throw u();i.appConfig.autoMigrateDb&&(m.vyntegraDatabaseReady||(m.vyntegraDatabaseReady=d().catch(e=>{throw m.vyntegraDatabaseReady=void 0,e})),await m.vyntegraDatabaseReady)}e.s(["queryDb",0,c,"withDbClient",0,p]),a()}catch(e){a(e)}},!1),67464,e=>e.a(async(t,a)=>{try{var r=e.i(66680),s=e.i(98003),o=e.i(29286),i=t([o]);function n(e){return e?e instanceof Date?e.toISOString():e:null}function u(e){return""===e||void 0===e?null:e}function _(e,t){let a=e?.trim()??"";if(!a)throw Error(`${t} is required.`);return a}function c(e){return{razorpayPaymentId:e.razorpay_payment_id,razorpayOrderId:e.razorpay_order_id,purchaseType:e.purchase_type,verifiedAt:n(e.verified_at)??"",verifiedAtIstDisplay:e.verified_at_ist_display,capturedAtUtc:n(e.captured_at_utc),capturedAtIstDisplay:e.captured_at_ist_display,customerPhone:e.customer_phone,emailStatus:e.email_status,bookingStatus:e.booking_status,calBookingUid:e.cal_booking_uid,calBookingStatus:e.cal_booking_status,calMeetingUrl:e.cal_meeting_url,supportFollowupRequired:e.support_followup_required,bookingErrorSummary:e.booking_error_summary}}function p(e){return{id:e.id,userId:e.user_id,fullName:e.full_name,email:e.email,whatsappNumber:e.whatsapp_number,courseSlug:e.course_slug,accessStatus:e.access_status,paymentStatus:e.payment_status,loginProvider:e.login_provider,source:e.source,utmSource:e.utm_source,utmMedium:e.utm_medium,utmCampaign:e.utm_campaign,hiddenBonusAgentAccessEligible:e.hidden_bonus_agent_access_eligible,lastLoginAt:n(e.last_login_at),registeredAt:n(e.registered_at)??"",createdAt:n(e.created_at)??"",updatedAt:n(e.updated_at)??""}}function d(e){return{id:e.id,fullName:e.full_name,email:e.email,whatsappNumber:e.whatsapp_number,courseSlug:e.course_slug,accessStatus:e.access_status,paymentStatus:e.payment_status,loginProvider:e.login_provider,source:e.source,utmSource:e.utm_source,utmMedium:e.utm_medium,utmCampaign:e.utm_campaign,lastLoginAt:n(e.last_login_at),registeredAt:n(e.registered_at)??"",createdAt:n(e.created_at)??"",updatedAt:n(e.updated_at)??""}}function l(e){return JSON.stringify(function e(t,a=""){let r=a.toLowerCase();return["signature","secret","password","authorization","api_key","apikey","attachment","content"].some(e=>r.includes(e))?"[redacted]":Array.isArray(t)?t.map(t=>e(t)):t&&"object"==typeof t?Object.fromEntries(Object.entries(t).map(([t,a])=>[t,e(a,t)])):t}(e))}async function m(e,t,a,s){let o=a.submissionId||(0,r.randomUUID)();return await e.query(`INSERT INTO form_submissions (
      id, submission_type, submitted_at, submitted_at_ist_display, full_name,
      email_address, phone_or_whatsapp, subject, message, company_or_organization,
      solution_type, requirements_description, preferred_timeline, source_page,
      purchase_type, product_id, product_slug, product_name, selected_plan_id,
      selected_plan_name, subscription_duration, original_product_price, coupon_code,
      discount_amount, final_payable_price, amount_paid, crypto_token, crypto_network,
      crypto_wallet_address, transaction_hash, client_ip_hash, user_agent, raw_payload
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
      $30, $31, $32, $33::jsonb
    )`,[o,t,a.timestamp,a.submittedAtIstDisplay,u(a.fullName),u(a.emailAddress),u(a.phoneOrWhatsapp),u(a.subject),u(a.message),u(a.companyOrOrganization),u(a.solutionType),u(a.requirementsDescription),u(a.preferredTimeline),u(a.sourcePage),u(a.purchaseType),u(a.productId),u(a.productSlug),u(a.productName),u(a.selectedPlanId),u(a.selectedPlanName),u(a.subscriptionDuration),u(a.originalProductPrice),u(a.couponCode),u(a.discountAmount),u(a.finalPayablePrice),u(a.amountPaid),u(a.cryptoToken),u(a.cryptoNetwork),u(a.cryptoWalletAddress),u(a.transactionHash),a.clientIpHash,a.userAgent,l(a.rawPayload)]),s&&await e.query(`INSERT INTO submission_attachments (
        id, submission_id, attachment_kind, filename, safe_filename, content_type,
        size_bytes, sha256_hash, storage_bucket, storage_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,[s.id,o,s.kind,s.filename,s.safeFilename,s.contentType,s.sizeBytes,s.sha256Hash,s.storageBucket,s.storagePath]),{id:o}}async function y(e,t,a){return(0,o.withDbClient)(async r=>{await r.query("BEGIN");try{let s=await m(r,e,t,a);return await r.query("COMMIT"),s}catch(e){throw await r.query("ROLLBACK"),e}})}async function E(e){return y("contact",e)}async function g(e){return y("custom_solution",e,e.attachment)}async function S(e){return y("crypto_payment_query",e)}async function f(e){return y("crypto_payment_proof",e,e.attachment)}async function $(e,t,a){await (0,o.queryDb)(`UPDATE form_submissions
     SET email_status = $2, email_error = $3, updated_at = now()
     WHERE id = $1`,[e,t,"failed"===t?u(a):null])}async function h(e){var t;let a=_(e.userId,"User ID"),r=_(e.fullName,"Full name"),s=(t=e.email,_(t,"Email").toLowerCase()),i=_(e.whatsappNumber,"WhatsApp number"),n=e.courseSlug?.trim()||"algo-trading",c=await (0,o.queryDb)(`INSERT INTO course_registrations (
      user_id, full_name, email, whatsapp_number, course_slug, access_status,
      payment_status, login_provider, source, utm_source, utm_medium,
      utm_campaign, hidden_bonus_agent_access_eligible
    ) VALUES (
      $1, $2, $3, $4, $5, COALESCE($6::text, 'free_access'),
      COALESCE($7::text, 'unpaid'), COALESCE($8::text, 'email_password'), $9,
      $10, $11, $12, COALESCE($13::boolean, false)
    ) ON CONFLICT (user_id, course_slug) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      whatsapp_number = EXCLUDED.whatsapp_number,
      access_status = COALESCE($6::text, course_registrations.access_status),
      payment_status = COALESCE($7::text, course_registrations.payment_status),
      login_provider = COALESCE($8::text, course_registrations.login_provider),
      source = COALESCE(EXCLUDED.source, course_registrations.source),
      utm_source = COALESCE(EXCLUDED.utm_source, course_registrations.utm_source),
      utm_medium = COALESCE(EXCLUDED.utm_medium, course_registrations.utm_medium),
      utm_campaign = COALESCE(EXCLUDED.utm_campaign, course_registrations.utm_campaign),
      hidden_bonus_agent_access_eligible = COALESCE(
        $13::boolean,
        course_registrations.hidden_bonus_agent_access_eligible
      ),
      updated_at = now()
    RETURNING *`,[a,r,s,i,n,u(e.accessStatus),u(e.paymentStatus),u(e.loginProvider),u(e.source?.trim()),u(e.utmSource?.trim()),u(e.utmMedium?.trim()),u(e.utmCampaign?.trim()),e.hiddenBonusAgentAccessEligible??null]);return p(c.rows[0])}async function P(e,t="algo-trading"){let a=await (0,o.queryDb)(`SELECT *
     FROM course_registrations
     WHERE user_id = $1 AND course_slug = $2
     LIMIT 1`,[_(e,"User ID"),_(t,"Course slug")]);return a.rows[0]?p(a.rows[0]):null}async function b(e,t="algo-trading"){let a=await (0,o.queryDb)(`UPDATE course_registrations
     SET last_login_at = now(), updated_at = now()
     WHERE user_id = $1 AND course_slug = $2
     RETURNING *`,[_(e,"User ID"),_(t,"Course slug")]);return a.rows[0]?p(a.rows[0]):null}async function T(e){let t={search:e.search?.trim()||void 0,accessStatus:e.accessStatus,paymentStatus:e.paymentStatus,loginProvider:e.loginProvider,courseSlug:e.courseSlug?.trim()||void 0},{whereSql:a,params:r}=function(e){let t=[],a=[],r=(e,r)=>{a.push(r),t.push(e.replace("?",`$${a.length}`))};if(e.search){a.push(`%${e.search}%`);let r=`$${a.length}`;t.push(`(full_name ILIKE ${r} OR email ILIKE ${r} OR whatsapp_number ILIKE ${r})`)}return e.accessStatus&&r("access_status = ?",e.accessStatus),e.paymentStatus&&r("payment_status = ?",e.paymentStatus),e.loginProvider&&r("login_provider = ?",e.loginProvider),e.courseSlug&&r("course_slug = ?",e.courseSlug),{whereSql:t.length?`WHERE ${t.join(" AND ")}`:"",params:a}}(t),s=await (0,o.queryDb)(`SELECT COUNT(*)::text AS total
     FROM course_registrations
     ${a}`,r),i=[...r,e.limit,e.offset];return{registrations:(await (0,o.queryDb)(`SELECT *
     FROM course_registrations
     ${a}
     ORDER BY registered_at DESC
     LIMIT $${i.length-1} OFFSET $${i.length}`,i)).rows.map(d),total:Number(s.rows[0]?.total??0)}}async function R(e,t){let a=[],r=[],s=(e,t)=>{r.push(t),a.push(e.replace("?",`$${r.length}`))};if(t.accessStatus&&s("access_status = ?",t.accessStatus),t.paymentStatus&&s("payment_status = ?",t.paymentStatus),0===a.length)throw Error("No course registration admin status updates provided.");r.push(_(e,"Registration ID"));let i=await (0,o.queryDb)(`UPDATE course_registrations
     SET ${a.join(", ")}, updated_at = now()
     WHERE id = $${r.length}
     RETURNING *`,r);return i.rows[0]?d(i.rows[0]):null}async function A(e){await (0,o.queryDb)(`INSERT INTO razorpay_orders (
      id, razorpay_order_id, target_type, order_created_at, order_created_at_ist_display,
      customer_name, customer_email, product_id, product_slug, product_name, expert_id,
      expert_slug, expert_name, session_id, session_label, session_duration_minutes,
      slot_start_utc, appointment_date, appointment_slot, selected_plan_id,
      selected_plan_name, subscription_duration, original_price_usd, discount_usd,
      final_price_usd, coupon_code, usd_to_inr_rate, usd_to_inr_rate_source,
      exchange_rate_fetched_at_utc, exchange_rate_fetched_at_ist_display,
      exchange_rate_is_fallback, usd_to_inr_effective_date_ist, final_price_inr,
      amount_paise, currency, client_ip_hash, user_agent, raw_notes, raw_order
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
      $29, $30, $31, $32, $33, $34, $35, $36, $37, $38::jsonb, $39::jsonb
    ) ON CONFLICT (razorpay_order_id) DO UPDATE SET
      raw_notes = EXCLUDED.raw_notes,
      raw_order = EXCLUDED.raw_order,
      updated_at = now()`,[(0,r.randomUUID)(),e.razorpayOrderId,e.targetType,e.orderCreatedAt,u(e.orderCreatedAtIstDisplay),e.customerName,e.customerEmail,u(e.productId),u(e.productSlug),u(e.productName),u(e.expertId),u(e.expertSlug),u(e.expertName),u(e.sessionId),u(e.sessionLabel),u(e.sessionDurationMinutes),u(e.slotStartUtc),u(e.appointmentDate),u(e.appointmentSlot),u(e.selectedPlanId),u(e.selectedPlanName),u(e.subscriptionDuration),u(e.originalPriceUsd),u(e.discountUsd),u(e.finalPriceUsd),u(e.couponCode),u(e.usdToInrRate),u(e.usdToInrRateSource),u(e.exchangeRateFetchedAtUtc),u(e.exchangeRateFetchedAtIstDisplay),e.exchangeRateIsFallback??!1,u(e.usdToInrEffectiveDateIst),u(e.finalPriceInr),e.amountPaise,e.currency,e.clientIpHash,e.userAgent,l(e.rawNotes),l(e.rawOrder)])}async function O(e){return(0,o.withDbClient)(async t=>{let a=await t.query(`INSERT INTO razorpay_payments (
        id, razorpay_payment_id, razorpay_order_id, purchase_type, verified_at,
        verified_at_ist_display, captured_at_utc, captured_at_ist_display,
        customer_phone, booking_status, razorpay_signature_hash, raw_payment,
        raw_verification_payload
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb
      ) ON CONFLICT (razorpay_payment_id) DO NOTHING
      RETURNING *`,[(0,r.randomUUID)(),e.razorpayPaymentId,e.razorpayOrderId,e.purchaseType,e.verifiedAt,u(e.verifiedAtIstDisplay),u(e.capturedAtUtc),u(e.capturedAtIstDisplay),u(e.customerPhone),e.bookingStatus,e.razorpaySignatureHash,l(e.rawPayment),l(e.rawVerificationPayload)]);if(a.rows[0])return{created:!0,payment:c(a.rows[0])};let s=(await t.query("SELECT * FROM razorpay_payments WHERE razorpay_payment_id = $1",[e.razorpayPaymentId])).rows[0];if(!s)throw Error("The verified payment could not be loaded.");return{created:!1,payment:c(s)}})}async function C(e,t,a){await (0,o.queryDb)(`UPDATE razorpay_payments
     SET email_status = $2, email_error = $3, updated_at = now()
     WHERE razorpay_payment_id = $1`,[e,t,"failed"===t?u(a):null])}async function I(e,t){await (0,o.queryDb)(`UPDATE razorpay_payments
     SET booking_status = $2,
         cal_booking_uid = $3,
         cal_booking_status = $4,
         cal_meeting_url = $5,
         support_followup_required = $6,
         booking_error_summary = $7,
         updated_at = now()
     WHERE razorpay_payment_id = $1`,[e,t.bookingStatus,u(t.calBookingUid),u(t.calBookingStatus),u(t.calMeetingUrl),t.supportFollowupRequired??!1,u(t.bookingErrorSummary)])}async function w(e){let t=[],a=[],r=(e,r)=>{a.push(r),t.push(e.replace("?",`$${a.length}`))};return e.type&&r("s.submission_type = ?",e.type),e.email&&r("s.email_address ILIKE ?",`%${e.email}%`),e.from&&r("s.submitted_at >= ?",e.from),e.to&&r("s.submitted_at <= ?",e.to),a.push(e.limit,e.offset),(await (0,o.queryDb)(`SELECT s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', a.id,
            'attachment_kind', a.attachment_kind,
            'filename', a.filename,
            'safe_filename', a.safe_filename,
            'content_type', a.content_type,
            'size_bytes', a.size_bytes,
            'sha256_hash', a.sha256_hash,
            'storage_provider', a.storage_provider,
            'created_at', a.created_at
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
      ) AS attachments
     FROM form_submissions s
     LEFT JOIN submission_attachments a ON a.submission_id = s.id
     ${t.length?`WHERE ${t.join(" AND ")}`:""}
     GROUP BY s.id
     ORDER BY s.submitted_at DESC
     LIMIT $${a.length-1} OFFSET $${a.length}`,a)).rows}async function D(e,t){return(await (0,o.queryDb)(`SELECT id, filename, safe_filename, content_type, size_bytes, storage_bucket, storage_path
     FROM submission_attachments
     WHERE id = $1 AND submission_id = $2`,[t,e])).rows[0]??null}async function N(e){let t=[],a=[],r=(e,r)=>{a.push(r),t.push(e.replace("?",`$${a.length}`))};return e.purchaseType&&r("p.purchase_type = ?",e.purchaseType),e.email&&r("o.customer_email ILIKE ?",`%${e.email}%`),e.from&&r("p.verified_at >= ?",e.from),e.to&&r("p.verified_at <= ?",e.to),a.push(e.limit,e.offset),(await (0,o.queryDb)(`SELECT
      p.razorpay_payment_id, p.razorpay_order_id, p.purchase_type, p.verified_at,
      p.verified_at_ist_display, p.captured_at_utc, p.captured_at_ist_display,
      p.customer_phone, p.email_status, p.email_error, p.booking_status,
      p.cal_booking_uid, p.cal_booking_status, p.cal_meeting_url,
      p.support_followup_required, p.booking_error_summary, p.raw_payment,
      p.raw_verification_payload, p.created_at AS payment_created_at,
      p.updated_at AS payment_updated_at, o.target_type, o.order_created_at,
      o.order_created_at_ist_display, o.customer_name, o.customer_email,
      o.product_id, o.product_slug, o.product_name, o.expert_id, o.expert_slug,
      o.expert_name, o.session_id, o.session_label, o.session_duration_minutes,
      o.slot_start_utc, o.appointment_date, o.appointment_slot,
      o.selected_plan_id, o.selected_plan_name, o.subscription_duration,
      o.original_price_usd, o.discount_usd, o.final_price_usd, o.coupon_code,
      o.usd_to_inr_rate, o.usd_to_inr_rate_source,
      o.exchange_rate_fetched_at_utc, o.exchange_rate_fetched_at_ist_display,
      o.exchange_rate_is_fallback, o.usd_to_inr_effective_date_ist,
      o.final_price_inr, o.amount_paise, o.currency, o.status, o.raw_notes,
      o.raw_order
     FROM razorpay_payments p
     INNER JOIN razorpay_orders o ON o.razorpay_order_id = p.razorpay_order_id
     ${t.length?`WHERE ${t.join(" AND ")}`:""}
     ORDER BY p.verified_at DESC
     LIMIT $${a.length-1} OFFSET $${a.length}`,a)).rows}[o]=i.then?(await i)():i,e.s(["getCourseRegistrationByUserId",0,P,"getSubmissionAttachment",0,D,"hashClientIp",0,function(e){return s.appConfig.ipHashSalt&&e&&"unknown"!==e?(0,r.createHash)("sha256").update(`${s.appConfig.ipHashSalt}:${e}`).digest("hex"):""},"hashRazorpaySignature",0,function(e){return(0,r.createHash)("sha256").update(e).digest("hex")},"listCourseRegistrations",0,T,"listFormSubmissions",0,w,"listRazorpayPayments",0,N,"saveContactSubmission",0,E,"saveCryptoPaymentProofSubmission",0,f,"saveCryptoPaymentQuerySubmission",0,S,"saveCustomSolutionSubmission",0,g,"saveRazorpayOrder",0,A,"summarizePersistenceError",0,function(e){return"The delivery provider returned an error."},"updateCourseRegistrationAdminStatus",0,R,"updateCourseRegistrationLastLogin",0,b,"updateRazorpayPaymentBookingStatus",0,I,"updateRazorpayPaymentEmailStatus",0,C,"updateSubmissionEmailStatus",0,$,"upsertCourseRegistration",0,h,"upsertRazorpayVerifiedPayment",0,O]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__11spoqk._.js.map