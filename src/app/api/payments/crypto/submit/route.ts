import { hasCryptoConfiguration, hasSmtpConfiguration, serviceUnavailableResponse } from "@/lib/config";
import {
  sendCryptoPaymentProofEmails,
  sendPaymentQueryEmail,
} from "@/lib/email";
import { experts } from "@/data/experts";
import { products } from "@/data/products";
import { validateCoupon } from "@/lib/coupon-validation";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";

const allowedProofTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const allowedProofExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const maxProofFileSizeBytes = 5 * 1024 * 1024;
const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 8;
const requestsByIp = new Map<string, number[]>();

type FormErrors = Record<string, string>;

function sanitizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

function hasAllowedProofExtension(fileName: string) {
  return allowedProofExtensions.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recentRequests = (requestsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < requestWindowMs,
  );

  if (recentRequests.length >= maxRequestsPerWindow) {
    requestsByIp.set(ip, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestsByIp.set(ip, recentRequests);
  return false;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

function buildProductPaymentSummary(
  product: (typeof products)[number],
  couponCode: string,
) {
  const originalProductPrice = formatUsd(product.priceUsd);
  const noCouponSummary = {
    purchaseType: "product" as const,
    purchaseName: product.name,
    originalProductPrice,
    couponCode: "",
    discountAmount: "",
    finalPayablePrice: originalProductPrice,
    bookingDetails: "",
  };

  if (!couponCode) {
    return noCouponSummary;
  }

  const couponResult = validateCoupon({
    code: couponCode,
    amountUsd: product.priceUsd,
    target: {
      type: "product",
      productId: product.id,
    },
  });

  if (!couponResult.ok || couponResult.discountAmountUsd <= 0) {
    return noCouponSummary;
  }

  return {
    purchaseType: "product" as const,
    purchaseName: product.name,
    originalProductPrice,
    couponCode: normalizeCouponCode(couponCode),
    discountAmount: formatUsd(couponResult.discountAmountUsd),
    finalPayablePrice: formatUsd(couponResult.finalAmountUsd),
    bookingDetails: "",
  };
}

function buildExpertBookingDetails({
  expertName,
  sessionLabel,
  durationMinutes,
  appointmentDate,
  appointmentSlot,
}: {
  expertName: string;
  sessionLabel: string;
  durationMinutes: number;
  appointmentDate: string;
  appointmentSlot: string;
}) {
  return [
    `Expert: ${expertName}`,
    `Session: ${sessionLabel}`,
    `Duration: ${durationMinutes} minutes`,
    `Date: ${appointmentDate}`,
    `Time Slot: ${appointmentSlot} IST`,
  ].join("\n");
}

function buildExpertPaymentSummary({
  expert,
  session,
  couponCode,
  appointmentDate,
  appointmentSlot,
}: {
  expert: (typeof experts)[number];
  session: (typeof experts)[number]["sessions"][number];
  couponCode: string;
  appointmentDate: string;
  appointmentSlot: string;
}) {
  const originalProductPrice = formatUsd(session.feeUsd);
  const bookingDetails = buildExpertBookingDetails({
    expertName: expert.fullName,
    sessionLabel: session.label,
    durationMinutes: session.durationMinutes,
    appointmentDate,
    appointmentSlot,
  });
  const noCouponSummary = {
    purchaseType: "expert" as const,
    purchaseName: `${expert.fullName} - ${session.label}`,
    originalProductPrice,
    couponCode: "",
    discountAmount: "",
    finalPayablePrice: originalProductPrice,
    bookingDetails,
  };

  if (!couponCode) {
    return noCouponSummary;
  }

  const couponResult = validateCoupon({
    code: couponCode,
    amountUsd: session.feeUsd,
    target: {
      type: "expert",
      expertId: expert.id,
      sessionId: session.id,
    },
  });

  if (!couponResult.ok || couponResult.discountAmountUsd <= 0) {
    return noCouponSummary;
  }

  return {
    purchaseType: "expert" as const,
    purchaseName: `${expert.fullName} - ${session.label}`,
    originalProductPrice,
    couponCode: normalizeCouponCode(couponCode),
    discountAmount: formatUsd(couponResult.discountAmountUsd),
    finalPayablePrice: formatUsd(couponResult.finalAmountUsd),
    bookingDetails,
  };
}

function buildPaymentSummaryFromForm(formData: FormData) {
  const purchaseType = sanitizeText(formData.get("purchaseType"));
  const couponCode = sanitizeText(formData.get("couponCode"));

  if (purchaseType === "expert") {
    const expertId = sanitizeText(formData.get("expertId"));
    const sessionId = sanitizeText(formData.get("sessionId"));
    const appointmentDate = sanitizeText(formData.get("appointmentDate"));
    const appointmentSlot = sanitizeText(formData.get("appointmentSlot"));
    const expert = experts.find((item) => item.id === expertId);
    const session = expert?.sessions.find(
      (item) => item.id === sessionId && item.active,
    );

    if (!expert || !session || !appointmentDate || !appointmentSlot) {
      return null;
    }

    return buildExpertPaymentSummary({
      expert,
      session,
      couponCode,
      appointmentDate,
      appointmentSlot,
    });
  }

  const productId = sanitizeText(formData.get("productId"));
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  return buildProductPaymentSummary(product, couponCode);
}

function validateProofSubmission({
  fullName,
  emailAddress,
  confirmEmailAddress,
  transactionHash,
  paymentScreenshot,
  acceptedManualVerification,
}: {
  fullName: string;
  emailAddress: string;
  confirmEmailAddress: string;
  transactionHash: string;
  paymentScreenshot: File | null;
  acceptedManualVerification: boolean;
}) {
  const errors: FormErrors = {};

  if (!fullName) {
    errors.fullName = "Enter your full name.";
  }

  if (!isValidEmail(emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (emailAddress !== confirmEmailAddress) {
    errors.confirmEmailAddress =
      "Email addresses do not match. Please re-enter your email correctly.";
  }

  if (!transactionHash) {
    errors.transactionHash = "Enter the transaction hash or payment ID.";
  }

  if (!paymentScreenshot) {
    errors.paymentScreenshot =
      "Please upload a clear payment screenshot before submitting.";
  }

  if (
    paymentScreenshot &&
    (!allowedProofTypes.has(paymentScreenshot.type) ||
      !hasAllowedProofExtension(paymentScreenshot.name))
  ) {
    errors.paymentScreenshot =
      "Please upload a valid payment screenshot in JPG, PNG, WEBP, or PDF format.";
  }

  if (paymentScreenshot && paymentScreenshot.size > maxProofFileSizeBytes) {
    errors.paymentScreenshot =
      "File size is too large. Please upload a smaller file.";
  }

  if (!acceptedManualVerification) {
    errors.acceptedManualVerification =
      "Confirm that you understand payment will be manually verified.";
  }

  return errors;
}

function validateQuerySubmission({
  fullName,
  emailAddress,
  message,
}: {
  fullName: string;
  emailAddress: string;
  message: string;
}) {
  const errors: FormErrors = {};

  if (!fullName) {
    errors.queryFullName = "Enter your full name.";
  }

  if (!isValidEmail(emailAddress)) {
    errors.queryEmailAddress = "Enter a valid email address.";
  }

  if (message.length < 10) {
    errors.queryMessage = "Write your payment-related question.";
  }

  if (message.length > 1500) {
    errors.queryMessage = "Keep your query within 1500 characters.";
  }

  return errors;
}

export async function POST(request: Request) {
  if (!hasCryptoConfiguration()) {
    return serviceUnavailableResponse();
  }

  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json(
      {
        ok: false,
        message:
          "Payment proof could not be submitted. Please check the required fields and try again.",
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();

  if (sanitizeText(formData.get("website"))) {
    return Response.json(
      {
        ok: false,
        message:
          "Payment proof could not be submitted. Please check the required fields and try again.",
      },
      { status: 400 },
    );
  }

  const submissionType = sanitizeText(formData.get("submissionType"));

  if (submissionType === "query") {
    const fullName = sanitizeText(formData.get("queryFullName"));
    const emailAddress = sanitizeText(formData.get("queryEmailAddress"));
    const message = sanitizeText(formData.get("queryMessage"));
    const paymentSummary = buildPaymentSummaryFromForm(formData);
    const errors = validateQuerySubmission({
      fullName,
      emailAddress,
      message,
    });

    if (Object.keys(errors).length > 0) {
      return Response.json(
        {
          ok: false,
          message:
            "Your query could not be submitted. Please check the required fields and try again.",
          errors,
        },
        { status: 400 },
      );
    }

    if (!hasSmtpConfiguration()) {
      return serviceUnavailableResponse();
    }

    try {
      await sendPaymentQueryEmail({
        timestamp: new Date().toISOString(),
        fullName,
        emailAddress,
        message,
        productName: paymentSummary?.purchaseName ?? "",
        productPrice: paymentSummary?.finalPayablePrice ?? "",
        bookingDetails: paymentSummary?.bookingDetails ?? "",
      });

      return Response.json({
        ok: true,
        message:
          "Your query has been submitted. Vyntegra will respond within 24 hours.",
      });
    } catch {
      return Response.json(
        {
          ok: false,
          message:
            "Your query could not be submitted. Please check the required fields and try again.",
        },
        { status: 500 },
      );
    }
  }

  const fullName = sanitizeText(formData.get("fullName"));
  const emailAddress = sanitizeText(formData.get("emailAddress"));
  const confirmEmailAddress = sanitizeText(formData.get("confirmEmailAddress"));
  const transactionHash = sanitizeText(formData.get("transactionHash"));
  const paymentSummary = buildPaymentSummaryFromForm(formData);
  const acceptedManualVerification =
    sanitizeText(formData.get("acceptedManualVerification")) === "true";
  const fileValue = formData.get("paymentScreenshot");
  const paymentScreenshot =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const errors = validateProofSubmission({
    fullName,
    emailAddress,
    confirmEmailAddress,
    transactionHash,
    paymentScreenshot,
    acceptedManualVerification,
  });

  if (!paymentSummary) {
    errors.purchaseTarget = "Select a valid product or consultation.";
  }

  if (Object.keys(errors).length > 0 || !paymentScreenshot || !paymentSummary) {
    return Response.json(
      {
        ok: false,
        message:
          errors.confirmEmailAddress ??
          errors.transactionHash ??
          errors.paymentScreenshot ??
          errors.purchaseTarget ??
          "Payment proof could not be submitted. Please check the required fields and try again.",
        errors,
      },
      { status: 400 },
    );
  }

  if (!hasSmtpConfiguration()) {
    return serviceUnavailableResponse();
  }

  const cryptoConfig = getCryptoPaymentConfig();

  if (!cryptoConfig) {
    return serviceUnavailableResponse();
  }

  try {
    await sendCryptoPaymentProofEmails({
      timestamp: new Date().toISOString(),
      fullName,
      emailAddress,
      productName: paymentSummary.purchaseName,
      originalProductPrice: paymentSummary.originalProductPrice,
      couponCode: paymentSummary.couponCode,
      discountAmount: paymentSummary.discountAmount,
      finalPayablePrice: paymentSummary.finalPayablePrice,
      amountPaid: paymentSummary.finalPayablePrice,
      bookingDetails: paymentSummary.bookingDetails,
      token: cryptoConfig.token,
      network: cryptoConfig.network,
      walletAddress: cryptoConfig.walletAddress,
      transactionHash,
      attachment: {
        filename: paymentScreenshot.name,
        content: Buffer.from(await paymentScreenshot.arrayBuffer()),
        contentType: paymentScreenshot.type || "application/octet-stream",
      },
    });

    return Response.json({
      ok: true,
      message:
        "Your payment proof has been submitted successfully. Our team will verify the payment and get back to you by email.",
    });
  } catch {
    return Response.json(
      {
        ok: false,
        message:
          "Payment proof could not be submitted. Please check the required fields and try again.",
      },
      { status: 500 },
    );
  }
}
