import nodemailer from "nodemailer";
import {
  appConfig,
  getSmtpConfigurationErrorMessage,
  hasSmtpConfiguration,
} from "@/lib/config";

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

export type RazorpayPaymentSuccessEmailInput = {
  timestamp: string;
  purchaseType: "product" | "expert";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  purchaseName: string;
  purchaseDescription: string;
  originalPriceUsd: string;
  couponCode?: string;
  discountUsd?: string;
  finalPriceUsd: string;
  usdToInrRate: string;
  usdToInrRateSource?: string;
  usdToInrRateFetchedAt: string;
  usdToInrEffectiveDateIst?: string;
  finalPriceInr: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  selectedPlanName?: string;
  subscriptionDuration?: string;
  payablePriceUsd?: string;
  expertName?: string;
  sessionLabel?: string;
  sessionDurationMinutes?: string;
  slotStartUtc?: string;
  slotDisplayIst?: string;
  calBookingUid?: string;
  calBookingStatus?: string;
  calMeetingUrl?: string;
  fallbackBookingUrl?: string;
  supportFollowupRequired?: boolean;
  bookingErrorSummary?: string;
};



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

function renderPriceValue(input: RazorpayPaymentSuccessEmailInput) {
  if (!input.couponCode || !input.discountUsd || input.discountUsd === "$0.00") {
    return escapeHtml(input.finalPriceUsd);
  }

  return `<span style="text-decoration:line-through;color:#8D929B;">${escapeHtml(input.originalPriceUsd)}</span> ${escapeHtml(input.finalPriceUsd)}`;
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
  const lines = [
    "A new enquiry has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
  ];
  if (input.phoneOrWhatsapp) lines.push(`Phone / WhatsApp: ${input.phoneOrWhatsapp}`);
  if (input.subject) lines.push(`Subject: ${input.subject}`);
  lines.push("Message:", input.message, `Submitted At: ${input.timestamp}`);
  return lines.join("\n\n");
}

function buildContactAdminHtml(input: ContactEmailInput) {
  const details = [
    { label: "Full Name", value: input.fullName },
    { label: "Email", value: input.emailAddress },
  ];
  if (input.phoneOrWhatsapp) details.push({ label: "Phone / WhatsApp", value: input.phoneOrWhatsapp });
  if (input.subject) details.push({ label: "Subject", value: input.subject });
  details.push({ label: "Submitted At", value: input.timestamp });

  return buildEmailHtml({
    title: "New Vyntegra enquiry submitted",
    intro: "A new enquiry has been submitted.",
    details,
    blocks: [{ heading: "Message", body: input.message }],
  });
}

function buildContactCustomerBody(input: ContactEmailInput) {
  const lines = [
    `Hi ${input.fullName},`,
    "We have received your enquiry.",
  ];
  if (input.subject) lines.push(`Subject: ${input.subject}`);
  lines.push(
    "Your submitted message:",
    input.message,
    "Our team will review your message and get back to you within 24 hours.",
    "Regards,",
    "Vyntegra"
  );
  return lines.join("\n\n");
}

function buildContactCustomerHtml(input: ContactEmailInput) {
  const details = [];
  if (input.subject) details.push({ label: "Subject", value: input.subject });
  details.push({ label: "Submitted At", value: input.timestamp });

  return buildEmailHtml({
    title: "Vyntegra enquiry received",
    intro: `Hi ${input.fullName}, we have received your enquiry.`,
    details,
    blocks: [
      {
        heading: "Your submitted message",
        body: input.message,
      },
      {
        body: "Our team will review your message and get back to you within 24 hours.",
      },
    ],
  });
}

function buildCustomSolutionsAdminBody(input: CustomSolutionsEmailInput) {
  const lines = [
    "A new custom solution requirement has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
  ];
  if (input.phoneOrWhatsapp) lines.push(`Phone / WhatsApp: ${input.phoneOrWhatsapp}`);
  if (input.companyOrOrganization) lines.push(`Company / Organization: ${input.companyOrOrganization}`);
  if (input.solutionType) lines.push(`Type of Solution: ${input.solutionType}`);
  if (input.preferredTimeline) lines.push(`Expected Timeline: ${input.preferredTimeline}`);
  if (input.supportingFileInformation) lines.push(`Supporting File: ${input.supportingFileInformation}`);
  lines.push(
    "Requirement:",
    input.requirementsDescription,
    `Source Page: ${input.sourcePage}`,
    `Submitted At: ${input.timestamp}`
  );
  return lines.join("\n\n");
}

function buildCustomSolutionsAdminHtml(input: CustomSolutionsEmailInput) {
  const details = [
    { label: "Full Name", value: input.fullName },
    { label: "Email", value: input.emailAddress },
  ];
  if (input.phoneOrWhatsapp) details.push({ label: "Phone / WhatsApp", value: input.phoneOrWhatsapp });
  if (input.companyOrOrganization) details.push({ label: "Company / Organization", value: input.companyOrOrganization });
  if (input.solutionType) details.push({ label: "Type of Solution", value: input.solutionType });
  if (input.preferredTimeline) details.push({ label: "Expected Timeline", value: input.preferredTimeline });
  if (input.supportingFileInformation) details.push({ label: "Supporting File", value: input.supportingFileInformation });
  details.push(
    { label: "Source Page", value: input.sourcePage },
    { label: "Submitted At", value: input.timestamp }
  );

  return buildEmailHtml({
    title: "New custom solution requirement submitted",
    intro: "A new custom solution requirement has been submitted.",
    details,
    blocks: [{ heading: "Requirement", body: input.requirementsDescription }],
  });
}

function buildCustomSolutionsCustomerBody(input: CustomSolutionsEmailInput) {
  const lines = [
    `Hi ${input.fullName},`,
    "We have received your custom solution requirement.",
  ];
  if (input.solutionType) lines.push(`Solution Type: ${input.solutionType}`);
  if (input.companyOrOrganization) lines.push(`Company / Organization: ${input.companyOrOrganization}`);
  if (input.preferredTimeline) lines.push(`Preferred Timeline: ${input.preferredTimeline}`);
  if (input.supportingFileInformation) lines.push(`Supporting File: ${input.supportingFileInformation}`);
  lines.push(
    "Your submitted requirement:",
    input.requirementsDescription,
    "Our team will review the details and get back to you within 24 hours.",
    "Regards,",
    "Vyntegra"
  );
  return lines.join("\n\n");
}

function buildCustomSolutionsCustomerHtml(input: CustomSolutionsEmailInput) {
  const details = [];
  if (input.solutionType) details.push({ label: "Solution Type", value: input.solutionType });
  if (input.companyOrOrganization) details.push({ label: "Company / Organization", value: input.companyOrOrganization });
  if (input.preferredTimeline) details.push({ label: "Preferred Timeline", value: input.preferredTimeline });
  if (input.supportingFileInformation) details.push({ label: "Supporting File", value: input.supportingFileInformation });

  return buildEmailHtml({
    title: "Vyntegra custom solution requirement received",
    intro: `Hi ${input.fullName}, we have received your custom solution requirement.`,
    details,
    blocks: [
      {
        heading: "Your submitted requirement",
        body: input.requirementsDescription,
      },
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
  ];
  if (input.bookingDetails) lines.push(`Booking Details:\n${input.bookingDetails}`);
  lines.push(`Original Price: ${input.originalProductPrice}`);
  if (input.couponCode) lines.push(`Coupon Applied: ${input.couponCode}`);
  if (input.discountAmount) lines.push(`Discount: ${input.discountAmount}`);
  lines.push(
    `Final Payable Price: ${input.finalPayablePrice}`,
    `Amount Paid / Claimed Paid: ${input.amountPaid}`,
  );
  if (input.transactionHash) lines.push(`Transaction Hash / ID: ${input.transactionHash}`);
  lines.push(
    `Token: ${input.token}`,
    `Network: ${input.network}`,
    `Wallet Address Shown: ${input.walletAddress}`,
    `Submitted At: ${input.timestamp}`,
    "Payment screenshot is attached.",
    "Please verify the payment manually before providing access details or confirming the booking."
  );

  return lines.join("\n\n");
}

function buildCryptoPaymentProofHtml(input: CryptoPaymentProofEmailInput) {
  const details = [
    { label: "Full Name", value: input.fullName },
    { label: "Customer Email", value: input.emailAddress },
    { label: "Purchase", value: input.productName },
  ];
  if (input.bookingDetails) details.push({ label: "Booking Details", value: input.bookingDetails });
  details.push({ label: "Original Price", value: input.originalProductPrice });
  if (input.couponCode) details.push({ label: "Coupon Applied", value: input.couponCode });
  if (input.discountAmount) details.push({ label: "Discount", value: input.discountAmount });
  details.push(
    { label: "Final Payable Price", value: input.finalPayablePrice },
    { label: "Amount Paid / Claimed Paid", value: input.amountPaid },
  );
  if (input.transactionHash) details.push({ label: "Transaction Hash / ID", value: input.transactionHash });
  details.push(
    { label: "Token", value: input.token },
    { label: "Network", value: input.network },
    { label: "Wallet Address Shown", value: input.walletAddress },
    { label: "Submitted At", value: input.timestamp }
  );

  return buildEmailHtml({
    title: `New crypto payment proof submitted - ${input.productName}`,
    intro: "A new crypto payment proof has been submitted.",
    details,
    note:
      "Payment screenshot is attached. Please verify the payment manually before providing access details or confirming the booking.",
  });
}

function buildCryptoPaymentCustomerBody(input: CryptoPaymentProofEmailInput) {
  const lines = [
    `Hi ${input.fullName},`,
    `We have received your payment proof for ${input.productName}.`,
    "Payment summary:",
    `Original Price: ${input.originalProductPrice}`,
  ];
  if (input.couponCode) lines.push(`Coupon Applied: ${input.couponCode}`);
  lines.push(`Final Payable Price: ${input.finalPayablePrice}`, `Amount Submitted: ${input.amountPaid}`);
  if (input.bookingDetails) lines.push(`Booking Details:\n${input.bookingDetails}`);
  lines.push(
    "Your payment is currently pending manual verification. Once confirmed, Vyntegra will get back to you by email with the next steps, access details, or booking confirmation.",
    "Please note that uploading a screenshot does not automatically confirm payment.",
    "Regards,",
    "Vyntegra"
  );
  return lines.join("\n\n");
}

function buildCryptoPaymentCustomerHtml(input: CryptoPaymentProofEmailInput) {
  const details = [
    { label: "Purchase", value: input.productName },
  ];
  if (input.bookingDetails) details.push({ label: "Booking Details", value: input.bookingDetails });
  details.push({ label: "Original Price", value: input.originalProductPrice });
  if (input.couponCode) details.push({ label: "Coupon Applied", value: input.couponCode });
  details.push(
    { label: "Final Payable Price", value: input.finalPayablePrice },
    { label: "Amount Submitted", value: input.amountPaid }
  );
  if (input.transactionHash) details.push({ label: "Transaction Hash / ID", value: input.transactionHash });

  return buildEmailHtml({
    title: `Vyntegra payment proof received - ${input.productName}`,
    intro: `Hi ${input.fullName}, we have received your payment proof for ${input.productName}.`,
    details,
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
  const lines = [
    "A new payment query has been submitted.",
    `Full Name: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
  ];
  if (input.productName) lines.push(`Purchase: ${input.productName}`);
  if (input.productPrice) lines.push(`Payable Amount: ${input.productPrice}`);
  if (input.bookingDetails) lines.push(`Booking Details:\n${input.bookingDetails}`);
  lines.push(
    "Message:",
    input.message,
    `Submitted At: ${input.timestamp}`,
    "Please respond within 24 hours."
  );
  return lines.join("\n\n");
}

function buildPaymentQueryAdminHtml(input: PaymentQueryEmailInput) {
  const details = [
    { label: "Full Name", value: input.fullName },
    { label: "Email", value: input.emailAddress },
  ];
  if (input.productName) details.push({ label: "Purchase", value: input.productName });
  if (input.productPrice) details.push({ label: "Payable Amount", value: input.productPrice });
  if (input.bookingDetails) details.push({ label: "Booking Details", value: input.bookingDetails });
  details.push({ label: "Submitted At", value: input.timestamp });

  return buildEmailHtml({
    title: "New payment query submitted",
    intro: "A new payment query has been submitted.",
    details,
    blocks: [{ heading: "Message", body: input.message }],
    note: "Please respond within 24 hours.",
  });
}

function buildPaymentQueryCustomerBody(input: PaymentQueryEmailInput) {
  const lines = [
    `Hi ${input.fullName},`,
    "We have received your payment-related query.",
  ];
  if (input.productName) lines.push(`Purchase: ${input.productName}`);
  if (input.productPrice) lines.push(`Payable Amount: ${input.productPrice}`);
  if (input.bookingDetails) lines.push(`Booking Details:\n${input.bookingDetails}`);
  lines.push(
    "Your submitted query:",
    input.message,
    "Our team will respond within 24 hours.",
    "Regards,",
    "Vyntegra"
  );
  return lines.join("\n\n");
}

function buildPaymentQueryCustomerHtml(input: PaymentQueryEmailInput) {
  const details = [];
  if (input.productName) details.push({ label: "Purchase", value: input.productName });
  if (input.productPrice) details.push({ label: "Payable Amount", value: input.productPrice });
  if (input.bookingDetails) details.push({ label: "Booking Details", value: input.bookingDetails });

  return buildEmailHtml({
    title: "Vyntegra payment query received",
    intro: `Hi ${input.fullName}, we have received your payment-related query.`,
    details,
    blocks: [
      { heading: "Your submitted query", body: input.message },
      { body: "Our team will respond within 24 hours." },
    ],
  });
}

function buildRazorpayCustomerSubject(input: RazorpayPaymentSuccessEmailInput) {
  if (input.purchaseType === "product") {
    return `Vyntegra payment successful - ${input.purchaseName}`;
  }

  return input.calBookingUid
    ? "Vyntegra payment successful - Expert session booked"
    : "Vyntegra payment successful - Booking action required";
}

function buildRazorpayDetails(input: RazorpayPaymentSuccessEmailInput) {
  const details = [
    { label: "Purchase Type", value: input.purchaseType === "product" ? "AI product" : "Talk to Expert session" },
    { label: "Product / Service", value: input.purchaseName },
    { label: "Description", value: input.purchaseDescription },
  ];

  if (input.selectedPlanName) {
    details.push({ label: "Selected Plan", value: input.selectedPlanName });
    if (input.subscriptionDuration) details.push({ label: "Subscription Term", value: input.subscriptionDuration });
    if (input.payablePriceUsd) details.push({ label: "Payable USD Amount", value: input.payablePriceUsd });
  }

  details.push({ label: "Original USD Price", value: input.originalPriceUsd });
  if (input.couponCode) details.push({ label: "Coupon Code", value: input.couponCode });
  if (input.discountUsd) details.push({ label: "Discount Amount", value: input.discountUsd });
  details.push({ label: "Discounted USD Payable Amount", value: input.finalPriceUsd });
  details.push({ label: "USD to INR Rate Used", value: `${input.usdToInrRate} / USD` });
  if (input.usdToInrRateSource) details.push({ label: "Rate Source", value: input.usdToInrRateSource });
  details.push({ label: "Conversion Timestamp", value: input.usdToInrRateFetchedAt });
  if (input.usdToInrEffectiveDateIst) details.push({ label: "Effective Date IST", value: input.usdToInrEffectiveDateIst });
  details.push(
    { label: "Razorpay Payable Amount", value: input.finalPriceInr },
    { label: "Razorpay Order ID", value: input.razorpayOrderId },
    { label: "Razorpay Payment ID", value: input.razorpayPaymentId }
  );

  if (input.purchaseType === "expert") {
    if (input.expertName) details.push({ label: "Expert", value: input.expertName });
    if (input.sessionLabel) details.push({ label: "Session", value: input.sessionLabel });
    details.push({
      label: "Duration",
      value: input.sessionDurationMinutes ? `${input.sessionDurationMinutes} minutes` : "30 minutes",
    });
    if (input.slotDisplayIst) details.push({ label: "Selected Slot", value: input.slotDisplayIst });
    if (input.calBookingUid) details.push({ label: "Cal.com Booking UID", value: input.calBookingUid });
    if (input.calBookingStatus) details.push({ label: "Cal.com Booking Status", value: input.calBookingStatus });
    if (input.calMeetingUrl) details.push({ label: "Meeting URL", value: input.calMeetingUrl });
    if (input.fallbackBookingUrl) details.push({ label: "Private Booking Link", value: input.fallbackBookingUrl });
  }

  return details;
}

function buildRazorpayCustomerBody(input: RazorpayPaymentSuccessEmailInput) {
  const lines = [
    `Hi ${input.customerName},`,
    "Your Razorpay payment was successful.",
    `Purchase Type: ${input.purchaseType === "product" ? "AI product" : "Talk to Expert session"}`,
    `Product / Service: ${input.purchaseName}`,
    `Description: ${input.purchaseDescription}`,
  ];

  if (input.selectedPlanName) {
    lines.push(`Selected Plan: ${input.selectedPlanName}`);
    if (input.subscriptionDuration) lines.push(`Subscription Term: ${input.subscriptionDuration}`);
  }

  lines.push(`Original USD Price: ${input.originalPriceUsd}`);
  if (input.couponCode) lines.push(`Coupon Code: ${input.couponCode}`);
  if (input.discountUsd) lines.push(`Discount Amount: ${input.discountUsd}`);
  
  lines.push(
    `Discounted USD Payable Amount: ${input.finalPriceUsd}`,
    `USD to INR Rate Used: ${input.usdToInrRate} / USD`,
    `Conversion Timestamp: ${input.usdToInrRateFetchedAt}`,
    `Razorpay Payable Amount: ${input.finalPriceInr}`,
    `Razorpay Order ID: ${input.razorpayOrderId}`,
    `Razorpay Payment ID: ${input.razorpayPaymentId}`
  );

  if (input.purchaseType === "expert") {
    if (input.calBookingUid) {
      lines.push(
        "Booking Status: Confirmed in Cal.com.",
        `Cal.com Booking UID: ${input.calBookingUid}`,
        input.slotDisplayIst ? `Selected Slot: ${input.slotDisplayIst}` : "",
        input.calMeetingUrl ? `Meeting URL: ${input.calMeetingUrl}` : "",
      );
    } else if (input.fallbackBookingUrl) {
      lines.push(
        "Booking Status: Payment successful; selected slot could not be auto-confirmed.",
        `Private Booking Link: ${input.fallbackBookingUrl}`,
        "Use the private link or contact support@vyntegra.in for a custom slot or refund.",
      );
    } else {
      lines.push(
        "Booking Status: Payment successful; Vyntegra support will contact you to arrange the expert session or process a 100% refund if needed.",
      );
    }
  } else {
    lines.push(
      input.selectedPlanName
        ? "Next Steps: After payment verification, Vyntegra will send access/setup next steps by email."
        : "Next Steps: Vyntegra will send product access or next steps by email.",
    );
  }

  lines.push("Regards,", "Vyntegra");
  return lines.filter(Boolean).join("\n\n");
}

function buildRazorpayCustomerHtml(input: RazorpayPaymentSuccessEmailInput) {
  const bookingBody =
    input.purchaseType !== "expert"
      ? input.selectedPlanName
        ? "After payment verification, Vyntegra will send access/setup next steps by email."
        : "Vyntegra will send product access or next steps by email."
      : input.calBookingUid
        ? "Your expert session has been booked in Cal.com. Cal.com may also send its own booking confirmation."
        : input.fallbackBookingUrl
          ? `Payment is successful. The selected slot could not be auto-confirmed, so use this private Cal.com booking link or contact support@vyntegra.in: ${input.fallbackBookingUrl}`
          : "Payment is successful. Vyntegra support will contact you to arrange the expert session or process a 100% refund if needed.";

  return buildEmailHtml({
    title: buildRazorpayCustomerSubject(input),
    intro: `Hi ${input.customerName}, your Razorpay payment was successful.`,
    details: buildRazorpayDetails(input).filter(
      (detail) => detail.label !== "Discounted USD Payable Amount",
    ),
    blocks: [
      {
        heading: "Payable amount",
        body: input.finalPriceUsd,
      },
      {
        heading: "Booking / next steps",
        body: bookingBody,
      },
    ],
    note:
      input.couponCode && input.discountUsd
        ? `HTML price summary: ${input.originalPriceUsd} discounted to ${input.finalPriceUsd}.`
        : undefined,
  }).replace(
    escapeHtml(input.finalPriceUsd),
    renderPriceValue(input),
  );
}

function buildRazorpayAdminBody(input: RazorpayPaymentSuccessEmailInput) {
  return [
    "A Razorpay payment was verified.",
    buildRazorpayDetails(input)
      .map((detail) => `${detail.label}: ${detail.value}`)
      .join("\n"),
    input.bookingErrorSummary
      ? `Booking Error Summary:\n${input.bookingErrorSummary}`
      : "",
  ].filter(Boolean).join("\n\n");
}

function buildRazorpayAdminHtml(input: RazorpayPaymentSuccessEmailInput) {
  return buildEmailHtml({
    title: `Razorpay payment verified - ${input.purchaseName}`,
    intro: "A Razorpay payment was verified.",
    details: buildRazorpayDetails(input),
    blocks: input.bookingErrorSummary
      ? [{ heading: "Booking error summary", body: input.bookingErrorSummary }]
      : [],
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

function assertSmtpConfiguration() {
  if (!hasSmtpConfiguration()) {
    throw new Error(
      getSmtpConfigurationErrorMessage() ||
        "Email service is not configured.",
    );
  }
}

export async function sendContactEmails(input: ContactEmailInput) {
  assertSmtpConfiguration();

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.supportEmail,
    replyTo: appConfig.supportEmail,
    subject: "New Vyntegra enquiry submitted",
    text: buildContactAdminBody(input),
    html: buildContactAdminHtml(input),
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    replyTo: appConfig.supportEmail,
    subject: "Vyntegra enquiry received",
    text: buildContactCustomerBody(input),
    html: buildContactCustomerHtml(input),
  });
}

export async function sendCustomSolutionsEmails(
  input: CustomSolutionsEmailInput,
) {
  assertSmtpConfiguration();

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
    to: appConfig.supportEmail,
    replyTo: appConfig.supportEmail,
    subject: "New custom solution requirement submitted",
    text: buildCustomSolutionsAdminBody(input),
    html: buildCustomSolutionsAdminHtml(input),
    attachments,
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    replyTo: appConfig.supportEmail,
    subject: "Vyntegra custom solution requirement received",
    text: buildCustomSolutionsCustomerBody(input),
    html: buildCustomSolutionsCustomerHtml(input),
  });
}

export async function sendCryptoPaymentProofEmails(
  input: CryptoPaymentProofEmailInput,
) {
  assertSmtpConfiguration();

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.cryptoPaymentProofEmail,
    replyTo: appConfig.supportEmail,
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
    replyTo: appConfig.supportEmail,
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
  assertSmtpConfiguration();

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: appConfig.supportEmail,
    replyTo: appConfig.supportEmail,
    subject: "New payment query submitted",
    text: buildPaymentQueryAdminBody(input),
    html: buildPaymentQueryAdminHtml(input),
  });

  await transporter.sendMail({
    from: appConfig.smtpFromEmail,
    to: input.emailAddress,
    replyTo: appConfig.supportEmail,
    subject: "Vyntegra payment query received",
    text: buildPaymentQueryCustomerBody(input),
    html: buildPaymentQueryCustomerHtml(input),
  });
}

export async function sendRazorpayPaymentSuccessEmails(
  input: RazorpayPaymentSuccessEmailInput,
) {
  assertSmtpConfiguration();

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: appConfig.paymentMailFromEmail,
    to: input.customerEmail,
    replyTo: appConfig.paymentMailReplyTo,
    subject: buildRazorpayCustomerSubject(input),
    text: buildRazorpayCustomerBody(input),
    html: buildRazorpayCustomerHtml(input),
  });

  await transporter.sendMail({
    from: appConfig.paymentMailFromEmail,
    to: appConfig.adminPaymentEmail,
    replyTo: appConfig.paymentMailReplyTo,
    subject: `Razorpay payment verified - ${input.purchaseName}`,
    text: buildRazorpayAdminBody(input),
    html: buildRazorpayAdminHtml(input),
  });
}
