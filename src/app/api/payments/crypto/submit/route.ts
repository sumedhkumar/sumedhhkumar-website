import { after } from "next/server";
import {
  hasCryptoConfiguration,
  hasCryptoProofSmtpConfiguration,
  hasSmtpConfiguration,
  isProductionPersistenceConfigured,
  serviceUnavailableResponse,
} from "@/lib/config";
import {
  sendCryptoPaymentProofEmails,
  sendPaymentQueryEmail,
} from "@/lib/email";
import { getSubscriptionAgentPlan } from "@/data/agent-subscription-plans";
import { products } from "@/data/products";
import { calculateFinalPrice } from "@/lib/pricing";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import { formatIstDateTime } from "@/lib/time";
import {
  hashClientIp,
  saveCryptoPaymentProofSubmission,
  saveCryptoPaymentQuerySubmission,
  summarizePersistenceError,
  updateSubmissionEmailStatus,
} from "@/lib/server/persistence";
import { createHash, randomUUID } from "node:crypto";
import {
  buildSubmissionAttachmentPath,
  deletePrivateSubmissionAttachment,
  isAttachmentStorageConfigured,
  sanitizeStorageFilename,
  uploadPrivateSubmissionAttachment,
} from "@/lib/server/supabase-storage";

export const runtime = "nodejs";

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



function buildProductPaymentSummary(
  product: (typeof products)[number],
  couponCode: string,
  selectedPlanId: string,
) {
  const selectedPlan = selectedPlanId
    ? getSubscriptionAgentPlan(product.slug, selectedPlanId)
    : null;
    
  if (!selectedPlan) {
    return {
      purchaseType: "product" as const,
      purchaseName: product.name,
      originalProductPrice: formatUsd(product.priceUsd),
      couponCode: "",
      discountAmount: "",
      finalPayablePrice: formatUsd(product.priceUsd),
      bookingDetails: "",
    };
  }

  const pricing = calculateFinalPrice(product.slug, selectedPlan.id, couponCode);

  return {
    purchaseType: "product" as const,
    purchaseName: `${product.name} - ${selectedPlan.name}`,
    originalProductPrice: formatUsd(pricing.originalPriceUsd),
    couponCode: pricing.appliedCoupon,
    discountAmount: pricing.discountUsd > 0 ? formatUsd(pricing.discountUsd) : "",
    finalPayablePrice: formatUsd(pricing.finalPriceUsd),
    bookingDetails: `Subscription duration: ${selectedPlan.durationLabel}`,
  };
}

function buildPaymentSummaryFromForm(formData: FormData) {
  const purchaseType = sanitizeText(formData.get("purchaseType"));
  const couponCode = sanitizeText(formData.get("couponCode"));
  const selectedPlanId = sanitizeText(formData.get("selectedPlanId"));

  if (purchaseType === "expert") {
    return null;
  }

  const productId = sanitizeText(formData.get("productId"));
  const product = products.find((item) => item.id === productId && item.active);

  if (!product) {
    return null;
  }

  if (selectedPlanId && !getSubscriptionAgentPlan(product.slug, selectedPlanId)) {
    return null;
  }

  return buildProductPaymentSummary(product, couponCode, selectedPlanId);
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

    if (!isProductionPersistenceConfigured() || !hasSmtpConfiguration()) {
      return serviceUnavailableResponse();
    }

    const timestamp = new Date().toISOString();
    const productId = sanitizeText(formData.get("productId"));
    const selectedPlanId = sanitizeText(formData.get("selectedPlanId"));
    const product = products.find((item) => item.id === productId);
    const selectedPlan = product
      ? getSubscriptionAgentPlan(product.slug, selectedPlanId)
      : null;
    let submissionId = "";

    try {
      const submission = await saveCryptoPaymentQuerySubmission({
        timestamp,
        submittedAtIstDisplay: formatIstDateTime(timestamp) ?? "",
        fullName,
        emailAddress,
        message,
        purchaseType: "product",
        productId: product?.id ?? "",
        productSlug: product?.slug ?? "",
        productName: paymentSummary?.purchaseName ?? "",
        selectedPlanId,
        selectedPlanName: selectedPlan?.name ?? "",
        subscriptionDuration: selectedPlan?.durationLabel ?? "",
        originalProductPrice: paymentSummary?.originalProductPrice ?? "",
        couponCode: paymentSummary?.couponCode ?? "",
        discountAmount: paymentSummary?.discountAmount ?? "",
        finalPayablePrice: paymentSummary?.finalPayablePrice ?? "",
        clientIpHash: hashClientIp(ip),
        userAgent: request.headers.get("user-agent") ?? "",
        rawPayload: {
          fullName,
          emailAddress,
          message,
          productId,
          selectedPlanId,
          paymentSummary,
        },
      });
      submissionId = submission.id;

      await sendPaymentQueryEmail({
        timestamp,
        fullName,
        emailAddress,
        message,
        productName: paymentSummary?.purchaseName ?? "",
        productPrice: paymentSummary?.finalPayablePrice ?? "",
        bookingDetails: paymentSummary?.bookingDetails ?? "",
      });
      await updateSubmissionEmailStatus(submissionId, "sent");

      return Response.json({
        ok: true,
        message:
          "Your query has been submitted. Vyntegra will respond within 24 hours.",
      });
    } catch (error) {
      if (submissionId) {
        try {
          await updateSubmissionEmailStatus(
            submissionId,
            "failed",
            summarizePersistenceError(error),
          );
        } catch {
          // Return the existing safe failure response if the status write fails.
        }
      }

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

  if (
    !isProductionPersistenceConfigured() ||
    !hasSmtpConfiguration() ||
    !hasCryptoProofSmtpConfiguration() ||
    !isAttachmentStorageConfigured()
  ) {
    return serviceUnavailableResponse();
  }

  const cryptoConfig = getCryptoPaymentConfig();

  if (!cryptoConfig) {
    return serviceUnavailableResponse();
  }

  const timestamp = new Date().toISOString();
  const productId = sanitizeText(formData.get("productId"));
  const selectedPlanId = sanitizeText(formData.get("selectedPlanId"));
  const product = products.find((item) => item.id === productId);
  const selectedPlan = product
    ? getSubscriptionAgentPlan(product.slug, selectedPlanId)
    : null;
  const screenshotContent = Buffer.from(await paymentScreenshot.arrayBuffer());
  const submissionId = randomUUID();
  const attachmentId = randomUUID();
  const attachmentContentType =
    paymentScreenshot.type || "application/octet-stream";
  const safeFilename = sanitizeStorageFilename(
    paymentScreenshot.name,
    attachmentContentType,
  );
  const storagePath = buildSubmissionAttachmentPath({
    submissionType: "crypto_payment_proof",
    timestamp,
    submissionId,
    attachmentId,
    safeFilename,
  });
  let uploadedStorage: { bucket: string; path: string } | null = null;

  try {
    uploadedStorage = await uploadPrivateSubmissionAttachment({
      path: storagePath,
      content: screenshotContent,
      contentType: attachmentContentType,
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

  const paymentProofEmailInput = {
    timestamp,
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
      content: screenshotContent,
      contentType: attachmentContentType,
    },
  };

  try {
    await saveCryptoPaymentProofSubmission({
      submissionId,
      timestamp,
      submittedAtIstDisplay: formatIstDateTime(timestamp) ?? "",
      fullName,
      emailAddress,
      purchaseType: "product",
      productId: product?.id ?? "",
      productSlug: product?.slug ?? "",
      productName: paymentSummary.purchaseName,
      selectedPlanId,
      selectedPlanName: selectedPlan?.name ?? "",
      subscriptionDuration: selectedPlan?.durationLabel ?? "",
      originalProductPrice: paymentSummary.originalProductPrice,
      couponCode: paymentSummary.couponCode,
      discountAmount: paymentSummary.discountAmount,
      finalPayablePrice: paymentSummary.finalPayablePrice,
      amountPaid: paymentSummary.finalPayablePrice,
      cryptoToken: cryptoConfig.token,
      cryptoNetwork: cryptoConfig.network,
      cryptoWalletAddress: cryptoConfig.walletAddress,
      transactionHash,
      clientIpHash: hashClientIp(ip),
      userAgent: request.headers.get("user-agent") ?? "",
      rawPayload: {
        fullName,
        emailAddress,
        productId,
        selectedPlanId,
        paymentSummary,
        transactionHash,
        cryptoToken: cryptoConfig.token,
        cryptoNetwork: cryptoConfig.network,
        cryptoWalletAddress: cryptoConfig.walletAddress,
        paymentScreenshot: {
          filename: paymentScreenshot.name,
          contentType: paymentScreenshot.type,
          sizeBytes: paymentScreenshot.size,
        },
      },
      attachment: {
        id: attachmentId,
        kind: "crypto_payment_screenshot",
        filename: paymentScreenshot.name,
        safeFilename,
        contentType: attachmentContentType,
        sizeBytes: screenshotContent.byteLength,
        sha256Hash: createHash("sha256").update(screenshotContent).digest("hex"),
        storageBucket: uploadedStorage.bucket,
        storagePath: uploadedStorage.path,
      },
    });
  } catch {
    try {
      await deletePrivateSubmissionAttachment(
        uploadedStorage.bucket,
        uploadedStorage.path,
      );
    } catch {
      // The database failure remains the primary response.
    }

    return Response.json(
      {
        ok: false,
        message:
          "Payment proof could not be submitted. Please check the required fields and try again.",
      },
      { status: 500 },
    );
  }

  after(async () => {
    try {
      await sendCryptoPaymentProofEmails(paymentProofEmailInput);
      await updateSubmissionEmailStatus(submissionId, "sent");
    } catch (error) {
      try {
        await updateSubmissionEmailStatus(
          submissionId,
          "failed",
          summarizePersistenceError(error),
        );
      } catch {
        console.error("Failed to update crypto payment proof email status.");
      }
    }
  });

  return Response.json({
    ok: true,
    message:
      "Your payment proof has been submitted successfully. Our team will verify the payment and get back to you by email.",
  });
}
