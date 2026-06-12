import QRCode from "qrcode";
import { appConfig, hasCryptoConfiguration } from "@/lib/config";

export function canUseCryptoPayments() {
  return hasCryptoConfiguration();
}

export function getCryptoPaymentConfig() {
  if (!canUseCryptoPayments()) {
    return null;
  }

  return {
    walletAddress: appConfig.cryptoWalletAddress,
    network: appConfig.cryptoWalletNetwork,
  };
}

export async function generateCryptoWalletQrCode() {
  const config = getCryptoPaymentConfig();

  if (!config) {
    return "";
  }

  return QRCode.toDataURL(config.walletAddress);
}
