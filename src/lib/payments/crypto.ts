import QRCode from "qrcode";
import { appConfig, hasCryptoConfiguration } from "@/lib/config";
import type { CryptoPaymentConfig } from "@/types";

export function canUseCryptoPayments() {
  return hasCryptoConfiguration();
}

export function getCryptoPaymentConfig(): CryptoPaymentConfig | null {
  if (!canUseCryptoPayments()) {
    return null;
  }

  return {
    token: appConfig.cryptoPaymentToken,
    walletAddress: appConfig.cryptoWalletAddress,
    network: appConfig.cryptoWalletNetwork,
    qrImagePath: appConfig.cryptoQrImagePath,
  };
}

export async function generateCryptoWalletQrCode() {
  const config = getCryptoPaymentConfig();

  if (!config) {
    return "";
  }

  return QRCode.toDataURL(config.walletAddress);
}
