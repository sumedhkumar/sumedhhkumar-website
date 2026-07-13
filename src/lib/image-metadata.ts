export type ImageDimensions = {
  width: number;
  height: number;
};

const imageDimensions: Record<string, ImageDimensions> = {
  "/images/optimized/sumedhhkumar-bhalerao-avatar.webp": {
    width: 900,
    height: 900,
  },
  "/images/optimized/sumedhhkumar-bhalerao-headshot.webp": {
    width: 900,
    height: 900,
  },
  "/images/optimized/sumedhhkumar-bhalerao-profile.webp": {
    width: 900,
    height: 1125,
  },
  "/images/optimized/agents/astro-vyn-gold/image-1.webp": {
    width: 1600,
    height: 811,
  },
  "/images/optimized/agents/astro-vyn-gold/image-2.webp": {
    width: 1600,
    height: 811,
  },
  "/images/optimized/agents/astro-vyn-gold/image-3.webp": {
    width: 1600,
    height: 813,
  },
  "/images/optimized/agents/sentinel-vyn/image-1.webp": {
    width: 1600,
    height: 913,
  },
  "/images/optimized/agents/sentinel-vyn/image-2.webp": {
    width: 1600,
    height: 913,
  },
  "/images/optimized/agents/sentinel-vyn/image-3.webp": {
    width: 1600,
    height: 913,
  },
  "/images/optimized/agents/apex-flux/performance-report.webp": {
    width: 1600,
    height: 439,
  },
  "/payments/crypto-payment-qr.png": {
    width: 1101,
    height: 1600,
  },
};

export function getImageDimensions(
  src: string | undefined,
  fallback: ImageDimensions,
) {
  return src ? imageDimensions[src] ?? fallback : fallback;
}
