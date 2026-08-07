import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMultiline(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function buildEmailHtml({ title, intro, details = [], blocks = [] }: {
  title: string;
  intro: string;
  details?: { label: string; value: string }[];
  blocks?: { heading?: string; body: string }[];
}) {
  const detailRows = details
    .map((d) => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#5F6470;font-size:13px;font-weight:700;width:38%;">${escapeHtml(d.label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#171A1F;font-size:14px;">${renderMultiline(d.value)}</td>
    </tr>`)
    .join("");

  const detailTable = details.length > 0
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #E7E1D5;border-radius:8px;overflow:hidden;background:#FFFCF7;">${detailRows}</table>`
    : "";

  const blockHtml = blocks
    .map((b) => `<section style="margin-top:18px;">
      ${b.heading ? `<h2 style="margin:0 0 8px;color:#171A1F;font-size:16px;line-height:1.35;">${escapeHtml(b.heading)}</h2>` : ""}
      <p style="margin:0;color:#343942;font-size:14px;line-height:1.65;">${renderMultiline(b.body)}</p>
    </section>`)
    .join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(intro)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#F4F1EA;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#FFFFFF;border:1px solid #E4DDCF;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#171A1F;padding:22px 24px;">
            <p style="margin:0 0 6px;color:#D8CBA6;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Vyntegra</p>
            <h1 style="margin:0;color:#FFFFFF;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
          </td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0 0 18px;color:#343942;font-size:15px;line-height:1.65;">${escapeHtml(intro)}</p>
            ${detailTable}
            ${blockHtml}
            <p style="margin:24px 0 0;color:#343942;font-size:14px;line-height:1.6;">Regards,<br><strong>Vyntegra</strong></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function formatIstDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " IST";
  } catch {
    return isoString;
  }
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, message: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Environment variables (set in Supabase project secrets)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.hostinger.com";
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const smtpUser = Deno.env.get("SMTP_USER") || "";
  const smtpPass = Deno.env.get("SMTP_PASS") || "";
  const adminEmail = Deno.env.get("ADMIN_MAIL_TO") || "support@vyntegra.in";
  const supportEmail = Deno.env.get("CONTACT_MAIL") || "support@vyntegra.in";
  const adminBccRaw = Deno.env.get("ADMIN_BCC_EMAILS") || "mahajanshardul1@gmail.com,sumedh.bhalerao07@gmail.com";
  const adminBccEmails = adminBccRaw.split(",").map((e) => e.trim()).filter(Boolean);

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Invalid request body." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Honeypot check
  if (sanitize(body.website)) {
    return new Response(JSON.stringify({ ok: false, message: "Something went wrong. Please try again." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fullName = sanitize(body.fullName);
  const emailAddress = sanitize(body.emailAddress);
  const phoneOrWhatsapp = sanitize(body.phoneOrWhatsapp);
  const subject = sanitize(body.subject);
  const message = sanitize(body.message);
  const enquiryType = sanitize(body.enquiryType);

  // Validate
  const errors: Record<string, string> = {};
  if (!fullName) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) errors.emailAddress = "Enter a valid email address.";
  if (message.length < 10) errors.message = "Write your enquiry message.";
  if (message.length > 3000) errors.message = "Keep your message within 3000 characters.";

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ ok: false, message: "Something went wrong. Please try again.", errors }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const timestamp = new Date().toISOString();
  const submittedAtIstDisplay = formatIstDateTime(timestamp);
  const submissionId = crypto.randomUUID();

  // Save to Supabase DB
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      await supabase.from("form_submissions").insert({
        id: submissionId,
        submission_type: "contact",
        submitted_at: timestamp,
        submitted_at_ist_display: submittedAtIstDisplay,
        full_name: fullName,
        email_address: emailAddress,
        phone_or_whatsapp: phoneOrWhatsapp,
        subject: subject,
        message: message,
        email_status: "pending",
        raw_payload: { fullName, emailAddress, phoneOrWhatsapp, subject, message, enquiryType },
      });
    } catch (dbErr) {
      console.error("DB insert failed:", dbErr);
      // Non-fatal: continue to send email
    }
  }

  // Send emails via SMTP (nodemailer)
  if (!smtpUser || !smtpPass) {
    return new Response(JSON.stringify({ ok: false, message: "Email service not configured." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    const smtpFrom = `Vyntegra <${smtpUser}>`;
    const displayTimestamp = submittedAtIstDisplay;

    // Admin notification
    const adminDetails = [
      { label: "Full Name", value: fullName },
      { label: "Email", value: emailAddress },
      ...(phoneOrWhatsapp ? [{ label: "Phone / WhatsApp", value: phoneOrWhatsapp }] : []),
      ...(subject ? [{ label: "Subject", value: subject }] : []),
      { label: "Submitted At", value: displayTimestamp },
    ];

    await transporter.sendMail({
      from: smtpFrom,
      to: adminEmail,
      bcc: adminBccEmails,
      replyTo: supportEmail,
      subject: "New Vyntegra enquiry submitted",
      text: [
        "A new enquiry has been submitted.",
        `Full Name: ${fullName}`,
        `Email: ${emailAddress}`,
        ...(phoneOrWhatsapp ? [`Phone / WhatsApp: ${phoneOrWhatsapp}`] : []),
        ...(subject ? [`Subject: ${subject}`] : []),
        "Message:",
        message,
        `Submitted At: ${displayTimestamp}`,
      ].join("\n\n"),
      html: buildEmailHtml({
        title: "New Vyntegra enquiry submitted",
        intro: "A new enquiry has been submitted.",
        details: adminDetails,
        blocks: [{ heading: "Message", body: message }],
      }),
    });

    // Customer confirmation
    await transporter.sendMail({
      from: smtpFrom,
      to: emailAddress,
      replyTo: supportEmail,
      subject: "Vyntegra enquiry received",
      text: [
        `Hi ${fullName},`,
        "We have received your enquiry.",
        ...(subject ? [`Subject: ${subject}`] : []),
        "Your submitted message:",
        message,
        "Our team will review your message and get back to you within 24 hours.",
        "Regards,",
        "Vyntegra",
      ].join("\n\n"),
      html: buildEmailHtml({
        title: "Vyntegra enquiry received",
        intro: `Hi ${fullName}, we have received your enquiry.`,
        details: [
          ...(subject ? [{ label: "Subject", value: subject }] : []),
          { label: "Submitted At", value: displayTimestamp },
        ],
        blocks: [
          { heading: "Your submitted message", body: message },
          { body: "Our team will review your message and get back to you within 24 hours." },
        ],
      }),
    });

    // Update email status in DB
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await supabase.from("form_submissions")
          .update({ email_status: "sent" })
          .eq("id", submissionId);
      } catch {
        // Non-fatal
      }
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Your enquiry has been submitted. Vyntegra will get back to you soon." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("SMTP error:", err);

    // Mark email as failed in DB
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await supabase.from("form_submissions")
          .update({ email_status: "failed", email_error: String(err) })
          .eq("id", submissionId);
      } catch {
        // Non-fatal
      }
    }

    return new Response(
      JSON.stringify({ ok: false, message: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
