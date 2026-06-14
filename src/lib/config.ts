export const serviceNotConfiguredMessage = "This service is not configured yet.";

function readFlag(name: string) {
  return process.env[name] === "true";
}

function readValue(name: string) {
  return process.env[name] ?? "";
}

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
  cryptoPaymentsEnabled: readFlag("CRYPTO_PAYMENTS_ENABLED"),
  cryptoWalletAddress: readValue("CRYPTO_WALLET_ADDRESS"),
  cryptoWalletNetwork: readValue("CRYPTO_WALLET_NETWORK"),
  expertBookingEnabled: readFlag("EXPERT_BOOKING_ENABLED"),
  productAccessEnabled: readFlag("PRODUCT_ACCESS_ENABLED"),
  customSolutionsRecipientEmail:
    readValue("CUSTOM_SOLUTIONS_RECIPIENT_EMAIL") ||
    "mahajanshardul1@gmail.com",
  smtpHost: readValue("SMTP_HOST"),
  smtpPort: readValue("SMTP_PORT"),
  smtpUser: readValue("SMTP_USER"),
  smtpPass: readValue("SMTP_PASS"),
  smtpFromEmail: readValue("SMTP_FROM_EMAIL"),
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
      appConfig.smtpFromEmail &&
      appConfig.customSolutionsRecipientEmail,
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

export function hasCryptoConfiguration() {
  return Boolean(
    appConfig.paymentsEnabled &&
      isProductionPersistenceConfigured() &&
      appConfig.cryptoPaymentsEnabled &&
      appConfig.cryptoWalletAddress &&
      appConfig.cryptoWalletNetwork,
  );
}

export function hasAnyPaymentConfiguration() {
  return (
    hasStripeConfiguration() ||
    hasRazorpayConfiguration() ||
    hasCryptoConfiguration()
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
