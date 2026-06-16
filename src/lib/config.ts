export const serviceNotConfiguredMessage = "This service is not configured yet.";

function readFlag(name: string) {
  return process.env[name] === "true";
}

function readValue(name: string) {
  return process.env[name] ?? "";
}

function readFlagDefault(name: string, defaultValue: boolean) {
  const value = readValue(name);

  if (!value) {
    return defaultValue;
  }

  return value === "true";
}

function readFlagWithDefault(
  primaryName: string,
  fallbackName: string,
  defaultValue: boolean,
) {
  const primaryValue = readValue(primaryName);
  const fallbackValue = readValue(fallbackName);

  if (primaryValue) {
    return primaryValue === "true";
  }

  if (fallbackValue) {
    return fallbackValue === "true";
  }

  return defaultValue;
}

const officialContactEmail = "ai.vyntegra@gmail.com";
const contactEmail =
  readValue("CONTACT_EMAIL") ||
  readValue("NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL") ||
  officialContactEmail;
const adminEmail = readValue("ADMIN_EMAIL") || contactEmail;
const adminPaymentEmail = readValue("ADMIN_PAYMENT_EMAIL") || adminEmail;
const customSolutionsRecipientEmail =
  readValue("CUSTOM_SOLUTION_EMAIL") ||
  readValue("CUSTOM_SOLUTIONS_RECIPIENT_EMAIL") ||
  adminEmail;
const queryEmail = readValue("QUERY_EMAIL") || adminPaymentEmail;
const smtpPort = readValue("SMTP_PORT") || "465";
const smtpUser = readValue("SMTP_USER") || contactEmail;
const smtpFromEmail =
  readValue("EMAIL_FROM") ||
  readValue("SMTP_FROM_EMAIL") ||
  `Vyntegra <${smtpUser}>`;

export const appConfig = {
  appBaseUrl: readValue("APP_BASE_URL"),
  persistenceProvider: readValue("PERSISTENCE_PROVIDER") || "disabled",
  paymentsEnabled: readFlag("PAYMENTS_ENABLED"),
  stripeEnabled: readFlag("STRIPE_ENABLED"),
  stripeSecretKey: readValue("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: readValue("STRIPE_WEBHOOK_SECRET"),
  razorpayEnabled: readFlag("RAZORPAY_ENABLED"),
  razorpayKeyId: readValue("RAZORPAY_KEY_ID"),
  publicRazorpayKeyId: readValue("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
  razorpayKeySecret: readValue("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: readValue("RAZORPAY_WEBHOOK_SECRET"),
  cryptoPaymentsEnabled: readFlagWithDefault(
    "CRYPTO_PAYMENT_ENABLED",
    "CRYPTO_PAYMENTS_ENABLED",
    true,
  ),
  cryptoPaymentToken: readValue("CRYPTO_PAYMENT_TOKEN") || "USDT",
  cryptoWalletAddress:
    readValue("CRYPTO_WALLET_ADDRESS") ||
    "TGFNSMePvxZZuxXPLJuFC3b8rSuUoPnAxV",
  cryptoWalletNetwork:
    readValue("CRYPTO_PAYMENT_NETWORK") ||
    readValue("CRYPTO_WALLET_NETWORK") ||
    "Tron (TRC20)",
  cryptoQrImagePath:
    readValue("CRYPTO_QR_IMAGE_PATH") || "/payments/crypto-payment-qr.png",
  contactEmail,
  adminEmail,
  adminPaymentEmail,
  queryEmail,
  expertBookingEnabled: readFlag("EXPERT_BOOKING_ENABLED"),
  productAccessEnabled: readFlag("PRODUCT_ACCESS_ENABLED"),
  customSolutionsRecipientEmail,
  smtpHost: readValue("SMTP_HOST"),
  smtpPort,
  smtpSecure: readFlagDefault("SMTP_SECURE", Number(smtpPort) === 465),
  smtpUser,
  smtpPass: readValue("SMTP_APP_PASSWORD") || readValue("SMTP_PASS"),
  smtpFromEmail,
};

export function isProductionPersistenceConfigured() {
  return (
    appConfig.persistenceProvider !== "" &&
    appConfig.persistenceProvider !== "disabled"
  );
}

export function hasSmtpConfiguration() {
  return Boolean(
    appConfig.smtpHost &&
      appConfig.smtpPort &&
      appConfig.smtpUser &&
      appConfig.smtpPass &&
      appConfig.smtpFromEmail,
  );
}

export function hasStripeConfiguration() {
  return Boolean(
    appConfig.paymentsEnabled &&
      isProductionPersistenceConfigured() &&
      appConfig.stripeEnabled &&
      appConfig.stripeSecretKey &&
      appConfig.stripeWebhookSecret,
  );
}

export function hasRazorpayConfiguration() {
  return Boolean(
    appConfig.paymentsEnabled &&
      isProductionPersistenceConfigured() &&
      appConfig.razorpayEnabled &&
      appConfig.razorpayKeyId &&
      appConfig.publicRazorpayKeyId &&
      appConfig.razorpayKeySecret &&
      appConfig.razorpayWebhookSecret,
  );
}

export function hasRazorpayCheckoutConfiguration() {
  return Boolean(
    appConfig.razorpayEnabled &&
      appConfig.publicRazorpayKeyId &&
      appConfig.razorpayKeySecret &&
      (process.env.RAZORPAY_USD_TO_INR_RATE ||
        process.env.NODE_ENV !== "production"),
  );
}

export const hasProductRazorpayCheckoutConfiguration =
  hasRazorpayCheckoutConfiguration;

export function hasCryptoConfiguration() {
  return Boolean(
    appConfig.cryptoPaymentsEnabled &&
      appConfig.cryptoPaymentToken &&
      appConfig.cryptoWalletAddress &&
      appConfig.cryptoWalletNetwork &&
      appConfig.cryptoQrImagePath,
  );
}

export function hasAnyPaymentConfiguration() {
  return hasGatewayPaymentConfiguration() || hasCryptoConfiguration();
}

export function hasGatewayPaymentConfiguration() {
  return (
    hasStripeConfiguration() ||
    hasRazorpayConfiguration()
  );
}

export function serviceUnavailableResponse() {
  return Response.json(
    {
      ok: false,
      message: serviceNotConfiguredMessage,
    },
    { status: 503 },
  );
}
