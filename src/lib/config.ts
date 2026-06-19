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

const officialContactEmail = "support@vyntegra.in";
const contactEmail = readValue("CONTACT_MAIL") || officialContactEmail;
const supportEmail = contactEmail;
const adminEmail = readValue("ADMIN_MAIL_TO") || contactEmail;
const adminPaymentEmail = adminEmail;
const customSolutionsRecipientEmail = adminEmail;
const queryEmail = adminPaymentEmail;
const smtpPort = readValue("SMTP_PORT") || "465";
const smtpUser = readValue("SMTP_USER");
const smtpFromEmail =
  smtpUser ? `Vyntegra <${smtpUser}>` : "";
const paymentMailFrom = readValue("PAYMENT_MAIL_FROM") || "sales@vyntegra.in";
const paymentMailFromName =
  readValue("PAYMENT_MAIL_FROM_NAME") || "Vyntegra Sales";
const paymentMailReplyTo =
  readValue("PAYMENT_MAIL_REPLY_TO") || paymentMailFrom;
const paymentMailFromEmail = `${paymentMailFromName} <${paymentMailFrom}>`;
const cryptoProofMailbox = "ai.vyntegra@gmail.com";
const cryptoProofSmtpPort = readValue("CRYPTO_PROOF_SMTP_PORT") || "465";
const cryptoProofSmtpUser = readValue("CRYPTO_PROOF_SMTP_USER");
const cryptoProofMailFromEmail = cryptoProofSmtpUser
  ? `Vyntegra AI <${cryptoProofMailbox}>`
  : "";

export const appConfig = {
  appBaseUrl: readValue("APP_BASE_URL"),
  persistenceProvider: readValue("PERSISTENCE_PROVIDER") || "disabled",
  databaseUrl: readValue("DATABASE_URL"),
  databaseSsl: readFlagDefault("DATABASE_SSL", true),
  autoMigrateDb: readFlag("AUTO_MIGRATE_DB"),
  supabaseUrl: readValue("SUPABASE_URL"),
  supabaseServiceRoleKey: readValue("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseStorageBucket: readValue("SUPABASE_STORAGE_BUCKET"),
  adminExportToken: readValue("ADMIN_EXPORT_TOKEN"),
  ipHashSalt: readValue("IP_HASH_SALT"),
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
  supportEmail,
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
  smtpPass: readValue("SMTP_PASS"),
  smtpFromEmail,
  paymentMailFrom,
  paymentMailFromName,
  paymentMailReplyTo,
  paymentMailFromEmail,
  cryptoProofMailbox,
  cryptoProofSmtpHost: readValue("CRYPTO_PROOF_SMTP_HOST"),
  cryptoProofSmtpPort,
  cryptoProofSmtpSecure: readFlagDefault(
    "CRYPTO_PROOF_SMTP_SECURE",
    Number(cryptoProofSmtpPort) === 465,
  ),
  cryptoProofSmtpUser,
  cryptoProofSmtpPass: readValue("CRYPTO_PROOF_SMTP_PASS"),
  cryptoProofMailFromEmail,
};

export function isProductionPersistenceConfigured() {
  return (
    appConfig.persistenceProvider === "postgres" && Boolean(appConfig.databaseUrl)
  );
}

export function isAttachmentStorageConfigured() {
  return Boolean(
    appConfig.supabaseUrl &&
      appConfig.supabaseServiceRoleKey &&
      appConfig.supabaseStorageBucket,
  );
}

export function hasSmtpConfiguration() {
  return getMissingSmtpConfigurationVariables().length === 0;
}

export function getMissingSmtpConfigurationVariables() {
  return [
    ["SMTP_HOST", appConfig.smtpHost],
    ["SMTP_PORT", appConfig.smtpPort],
    ["SMTP_USER", appConfig.smtpUser],
    ["SMTP_PASS", appConfig.smtpPass],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

export function getSmtpConfigurationErrorMessage() {
  const missingVariables = getMissingSmtpConfigurationVariables();

  if (missingVariables.length === 0) {
    return "";
  }

  return `Email service is not configured. Missing environment variables: ${missingVariables.join(", ")}.`;
}

export function hasCryptoProofSmtpConfiguration() {
  return getMissingCryptoProofSmtpConfigurationVariables().length === 0;
}

export function getMissingCryptoProofSmtpConfigurationVariables() {
  return [
    ["CRYPTO_PROOF_SMTP_HOST", appConfig.cryptoProofSmtpHost],
    ["CRYPTO_PROOF_SMTP_PORT", appConfig.cryptoProofSmtpPort],
    ["CRYPTO_PROOF_SMTP_USER", appConfig.cryptoProofSmtpUser],
    ["CRYPTO_PROOF_SMTP_PASS", appConfig.cryptoProofSmtpPass],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
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
  return hasRazorpayConfiguration();
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
