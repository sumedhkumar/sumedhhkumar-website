import nodemailer from "nodemailer";
import { appConfig, hasSmtpConfiguration } from "@/lib/config";

export type ContactEmailInput = {
  timestamp: string;
  fullName: string;
  emailAddress: string;
  phoneOrWhatsapp: string;
  subject: string;
  message: string;
};

export type CustomSolutionsEmailInput = {
  timestamp: string;
  fullName: string;
  emailAddress: string;
  phoneOrWhatsapp: string;
  companyOrOrganization: string;
  solutionType: string;
  requirementsDescription: string;
  preferredTimeline: string;
  approximateBudget: string;
  supportingFileInformation: string;
  sourcePage: string;
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

export type CryptoPaymentProofEmailInput = {
  timestamp: string;
  fullName: string;
  emailAddress: string;
  productName: string;
  originalProductPrice: string;
  couponCode: string;
  discountAmount: string;
  finalPayablePrice: string;
  amountPaid: string;
  bookingDetails?: string;
  token: string;
  network: string;
  walletAddress: string;
  transactionHash: string;
  attachment: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

export type PaymentQueryEmailInput = {
  timestamp: string;
  fullName: string;
  emailAddress: string;
  message: string;
  productName: string;
  productPrice: string;
  bookingDetails?: string;
};

function fallback(value: string, fallbackValue: string) {
  return value || fallbackValue;
}

type EmailDetail = {
  label: string;
  value: string;
};

type EmailBlock = {
  heading?: string;
  body: string;
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

function renderDetails(details: EmailDetail[]) {
  const rows = details
    .map(
      (detail) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#5F6470;font-size:13px;font-weight:700;width:38%;">${escapeHtml(detail.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#171A1F;font-size:14px;">${renderMultiline(detail.value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #E7E1D5;border-radius:8px;overflow:hidden;background:#FFFCF7;">
      ${rows}
    </table>`;
}

function renderBlocks(blocks: EmailBlock[]) {
  return blocks
    .map(
      (block) => `
        <section style="margin-top:18px;">
          ${
            block.heading
              ? `<h2 style="margin:0 0 8px;color:#171A1F;font-size:16px;line-height:1.35;">${escapeHtml(block.heading)}</h2>`
              : ""
          }
          <p style="margin:0;color:#343942;font-size:14px;line-height:1.65;">${renderMultiline(block.body)}</p>
        </section>`,
    )
    .join("");
}

function buildEmailHtml({
  title,
  intro,
  details = [],
  blocks = [],
  note,
}: {
  title: string;
  intro: string;
  details?: EmailDetail[];
  blocks?: EmailBlock[];
  note?: string;
}) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(intro)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#F4F1EA;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#FFFFFF;border:1px solid #E4DDCF;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#171A1F;padding:22px 24px;">
                <p style="margin:0 0 6px;color:#D8CBA6;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Vyntegra</p>
                <h1 style="margin:0;color:#FFFFFF;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 18px;color:#343942;font-size:15px;line-height:1.65;">${escapeHtml(intro)}</p>
                ${details.length > 0 ? renderDetails(details) : ""}
                ${renderBlocks(blocks)}
                ${
                  note
                    ? `<p style="margin:20px 0 0;padding:12px 14px;background:#FFF7E6;border:1px solid #F1D59D;border-radius:8px;color:#684A13;font-size:13px;line-height:1.55;">${renderMultiline(note)}</p>`
                    : ""
                }
                <p style="margin:24px 0 0;color:#343942;font-size:14px;line-height:1.6;">Regards,<br><strong>Vyntegra</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildContactAdminBody(input: ContactEmailInput) {
  return [
    "A new enquiry has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
    "Message:",
    input.message,
    `Submitted At: ${input.timestamp}`,
  ].join("\n\n");
}

function buildContactAdminHtml(input: ContactEmailInput) {
  return buildEmailHtml({
    title: "New Vyntegra enquiry submitted",
    intro: "A new enquiry has been submitted.",
    details: [
      { label: "Full Name", value: input.fullName },
      { label: "Email", value: input.emailAddress },
      { label: "Submitted At", value: input.timestamp },
    ],
    blocks: [{ heading: "Message", body: input.message }],
  });
}

function buildContactCustomerBody(input: ContactEmailInput) {
  return [
    `Hi ${input.fullName},`,
    "We have received your enquiry.",
    "Our team will review your message and get back to you soon.",
    "Regards,",
    "Vyntegra",
  ].join("\n\n");
}

function buildContactCustomerHtml(input: ContactEmailInput) {
  return buildEmailHtml({
    title: "Vyntegra enquiry received",
    intro: `Hi ${input.fullName}, we have received your enquiry.`,
    blocks: [
      {
        body: "Our team will review your message and get back to you soon.",
      },
    ],
  });
}

function buildCustomSolutionsAdminBody(input: CustomSolutionsEmailInput) {
  return [
    "A new custom solution requirement has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
    `Phone / WhatsApp: ${fallback(input.phoneOrWhatsapp, "Not provided")}`,
    `Type of Solution: ${fallback(input.solutionType, "Not provided")}`,
    `Expected Timeline: ${fallback(input.preferredTimeline, "Not provided")}`,
    "Requirement:",
    input.requirementsDescription,
    `Source Page: ${input.sourcePage}`,
    `Submitted At: ${input.timestamp}`,
  ].join("\n\n");
}

function buildCustomSolutionsAdminHtml(input: CustomSolutionsEmailInput) {
  return buildEmailHtml({
    title: "New custom solution requirement submitted",
    intro: "A new custom solution requirement has been submitted.",
    details: [
      { label: "Full Name", value: input.fullName },
      { label: "Email", value: input.emailAddress },
      {
        label: "Phone / WhatsApp",
        value: fallback(input.phoneOrWhatsapp, "Not provided"),
      },
      {
        label: "Type of Solution",
        value: fallback(input.solutionType, "Not provided"),
      },
      {
        label: "Expected Timeline",
        value: fallback(input.preferredTimeline, "Not provided"),
      },
      { label: "Source Page", value: input.sourcePage },
      { label: "Submitted At", value: input.timestamp },
    ],
    blocks: [{ heading: "Requirement", body: input.requirementsDescription }],
  });
}

function buildCustomSolutionsCustomerBody(input: CustomSolutionsEmailInput) {
  return [
    `Hi ${input.fullName},`,
    "We have received your custom solution requirement.",
    "Our team will review the details and get back to you within 24 hours.",
    "Regards,",
    "Vyntegra",
  ].join("\n\n");
}

function buildCustomSolutionsCustomerHtml(input: CustomSolutionsEmailInput) {
  return buildEmailHtml({
    title: "Vyntegra custom solution requirement received",
    intro: `Hi ${input.fullName}, we have received your custom solution requirement.`,
    blocks: [
      {
        body: "Our team will review the details and get back to you within 24 hours.",
      },
    ],
  });
}

function buildCryptoPaymentProofBody(input: CryptoPaymentProofEmailInput) {
  const lines = [
    "A new crypto payment proof has been submitted.",
    `Full Name: ${input.fullName}`,
    `Customer Email: ${input.emailAddress}`,
    `Purchase: ${input.productName}`,
    `Original Price: ${input.originalProductPrice}`,
    `Coupon Applied: ${fallback(input.couponCode, "None")}`,
    `Discount: ${fallback(input.discountAmount, "Not applicable")}`,
    `Final Payable Price: ${input.finalPayablePrice}`,
    `Amount Paid / Claimed Paid: ${input.amountPaid}`,
    `Token: ${input.token}`,
    `Network: ${input.network}`,
    `Wallet Address Shown: ${input.walletAddress}`,
    `Submitted At: ${input.timestamp}`,
    "Payment screenshot is attached.",
    "Please verify the payment manually before providing access details or confirming the booking.",
  ];

  if (input.transactionHash) {
    lines.splice(9, 0, `Transaction Hash / ID: ${input.transactionHash}`);
  }

  if (input.bookingDetails) {
    lines.splice(4, 0, `Booking Details:\n${input.bookingDetails}`);
  }

  return lines.join("\n\n");
}

function buildCryptoPaymentProofHtml(input: CryptoPaymentProofEmailInput) {
  return buildEmailHtml({
    title: `New crypto payment proof submitted - ${input.productName}`,
    intro: "A new crypto payment proof has been submitted.",
    details: [
      { label: "Full Name", value: input.fullName },
      { label: "Customer Email", value: input.emailAddress },
      { label: "Purchase", value: input.productName },
      ...(input.bookingDetails
        ? [{ label: "Booking Details", value: input.bookingDetails }]
        : []),
      { label: "Original Price", value: input.originalProductPrice },
      { label: "Coupon Applied", value: fallback(input.couponCode, "None") },
      {
        label: "Discount",
        value: fallback(input.discountAmount, "Not applicable"),
      },
      { label: "Final Payable Price", value: input.finalPayablePrice },
      { label: "Amount Paid / Claimed Paid", value: input.amountPaid },
      { label: "Transaction Hash / ID", value: input.transactionHash },
      { label: "Token", value: input.token },
      { label: "Network", value: input.network },
      { label: "Wallet Address Shown", value: input.walletAddress },
      { label: "Submitted At", value: input.timestamp },
    ],
    note:
      "Payment screenshot is attached. Please verify the payment manually before providing access details or confirming the booking.",
  });
}

function buildCryptoPaymentCustomerBody(input: CryptoPaymentProofEmailInput) {
  return [
    `Hi ${input.fullName},`,
    `We have received your payment proof for ${input.productName}.`,
    "Payment summary:",
    `Original Price: ${input.originalProductPrice}`,
    `Coupon Applied: ${fallback(input.couponCode, "None")}`,
    `Final Payable Price: ${input.finalPayablePrice}`,
    `Amount Submitted: ${input.amountPaid}`,
    input.bookingDetails ? `Booking Details:\n${input.bookingDetails}` : "",
    "Your payment is currently pending manual verification. Once confirmed, Vyntegra will get back to you by email with the next steps, access details, or booking confirmation.",
    "Please note that uploading a screenshot does not automatically confirm payment.",
    "Regards,",
    "Vyntegra",
  ].filter(Boolean).join("\n\n");
}

function buildCryptoPaymentCustomerHtml(input: CryptoPaymentProofEmailInput) {
  return buildEmailHtml({
    title: `Vyntegra payment proof received - ${input.productName}`,
    intro: `Hi ${input.fullName}, we have received your payment proof for ${input.productName}.`,
    details: [
      { label: "Purchase", value: input.productName },
      ...(input.bookingDetails
        ? [{ label: "Booking Details", value: input.bookingDetails }]
        : []),
      { label: "Original Price", value: input.originalProductPrice },
      { label: "Coupon Applied", value: fallback(input.couponCode, "None") },
      { label: "Final Payable Price", value: input.finalPayablePrice },
      { label: "Amount Submitted", value: input.amountPaid },
      { label: "Transaction Hash / ID", value: input.transactionHash },
    ],
    blocks: [
      {
        body: "Your payment is currently pending manual verification. Once confirmed, Vyntegra will get back to you by email with the next steps, access details, or booking confirmation.",
      },
    ],
    note:
      "The payment screenshot is attached for your reference. Uploading a screenshot does not automatically confirm payment.",
  });
}

function buildPaymentQueryAdminBody(input: PaymentQueryEmailInput) {
  return [
    "A new payment query has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
    `Purchase: ${fallback(input.productName, "Not provided")}`,
    `Payable Amount: ${fallback(input.productPrice, "Not provided")}`,
    input.bookingDetails ? `Booking Details:\n${input.bookingDetails}` : "",
    "Message:",
    input.message,
    `Submitted At: ${input.timestamp}`,
    "Please respond within 24 hours.",
  ].filter(Boolean).join("\n\n");
}

function buildPaymentQueryAdminHtml(input: PaymentQueryEmailInput) {
  return buildEmailHtml({
    title: "New payment query submitted",
    intro: "A new payment query has been submitted.",
    details: [
      { label: "Full Name", value: input.fullName },
      { label: "Email", value: input.emailAddress },
      { label: "Purchase", value: fallback(input.productName, "Not provided") },
      {
        label: "Payable Amount",
        value: fallback(input.productPrice, "Not provided"),
      },
      ...(input.bookingDetails
        ? [{ label: "Booking Details", value: input.bookingDetails }]
        : []),
      { label: "Submitted At", value: input.timestamp },
    ],
    blocks: [{ heading: "Message", body: input.message }],
    note: "Please respond within 24 hours.",
  });
}

function buildPaymentQueryCustomerBody(input: PaymentQueryEmailInput) {
  return [
    `Hi ${input.fullName},`,
    "We have received your payment-related query.",
    "Our team will respond within 24 hours.",
    "Regards,",
    "Vyntegra",
  ].join("\n\n");
}

function buildPaymentQueryCustomerHtml(input: PaymentQueryEmailInput) {
  return buildEmailHtml({
    title: "Vyntegra payment query received",
    intro: `Hi ${input.fullName}, we have received your payment-related query.`,
    blocks: [{ body: "Our team will respond within 24 hours." }],
  });
}

function createEmailTransporter() {
  return nodemailer.createTransport({
    host: appConfig.smtpHost,
    port: Number(appConfig.smtpPort),
    secure: appConfig.smtpSecure,
    auth: {
      user: appConfig.smtpUser,
      pass: appConfig.smtpPass,
    },
  });
}

export async function sendContactEmails(input: ContactEmailInput) {
  if (!hasSmtpConfiguration()) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.adminEmail,
    subject: "New Vyntegra enquiry submitted",
    text: buildContactAdminBody(input),
    html: buildContactAdminHtml(input),
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    subject: "Vyntegra enquiry received",
    text: buildContactCustomerBody(input),
    html: buildContactCustomerHtml(input),
  });
}

export async function sendCustomSolutionsEmails(
  input: CustomSolutionsEmailInput,
) {
  if (!hasSmtpConfiguration()) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = createEmailTransporter();

  const attachments = input.attachment
    ? [
        {
          filename: input.attachment.filename,
          content: input.attachment.content,
          contentType: input.attachment.contentType,
        },
      ]
    : [];

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.customSolutionsRecipientEmail,
    subject: "New custom solution requirement submitted",
    text: buildCustomSolutionsAdminBody(input),
    html: buildCustomSolutionsAdminHtml(input),
    attachments,
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    subject: "Vyntegra custom solution requirement received",
    text: buildCustomSolutionsCustomerBody(input),
    html: buildCustomSolutionsCustomerHtml(input),
  });
}

export async function sendCryptoPaymentProofEmails(
  input: CryptoPaymentProofEmailInput,
) {
  if (!hasSmtpConfiguration()) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.adminPaymentEmail,
    subject: `New crypto payment proof submitted - ${input.productName}`,
    text: buildCryptoPaymentProofBody(input),
    html: buildCryptoPaymentProofHtml(input),
    attachments: [
      {
        filename: input.attachment.filename,
        content: input.attachment.content,
        contentType: input.attachment.contentType,
      },
    ],
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    subject: `Vyntegra payment proof received - ${input.productName}`,
    text: buildCryptoPaymentCustomerBody(input),
    html: buildCryptoPaymentCustomerHtml(input),
    attachments: [
      {
        filename: input.attachment.filename,
        content: input.attachment.content,
        contentType: input.attachment.contentType,
      },
    ],
  });
}

export async function sendPaymentQueryEmail(input: PaymentQueryEmailInput) {
  if (!hasSmtpConfiguration()) {
    throw new Error("SMTP configuration is missing.");
  }

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.queryEmail,
    subject: "New payment query submitted",
    text: buildPaymentQueryAdminBody(input),
    html: buildPaymentQueryAdminHtml(input),
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    subject: "Vyntegra payment query received",
    text: buildPaymentQueryCustomerBody(input),
    html: buildPaymentQueryCustomerHtml(input),
  });
}
