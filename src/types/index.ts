export type ProductFaqItem = {
  question: string;
  answer: string;
};

export type ProductReview = {
  reviewerName: string;
  reviewText: string;
};

export type TradingAgentProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  screenshots: string[];
  platform: string;
  market: string;
  keyCapabilities: string[];
  requirements: string[];
  setupSteps: string[];
  version: string;
  updateHistory: string[];
  faqs: ProductFaqItem[];
  reviews: ProductReview[];
  priceUsd: number;
  featured: boolean;
  active: boolean;
};

export type ExpertSession = {
  id: string;
  label: string;
  durationMinutes: number;
  feeUsd: number;
  active: boolean;
};

export type SocialLink = {
  label: "YouTube" | "Instagram" | "LinkedIn" | "Portfolio";
  href: string;
};

export type Expert = {
  id: string;
  slug: string;
  fullName: string;
  professionalPhoto: string;
  specialization: string;
  currentRole: string;
  professionalSummary: string;
  expertiseAreas: string[];
  relevantExperience: string[];
  qualifications: string[];
  linkedInUrl: string;
  socialLinks?: SocialLink[];
  consultationTopics: string[];
  sessions: ExpertSession[];
  featured: boolean;
  active: boolean;
  availabilitySummary: string;
};

export type DiscountType = "percentage" | "fixed";

export type Coupon = {
  code: string;
  active: boolean;
  discountType: DiscountType;
  discountValue: number;
  validFrom: string;
  expiresAt: string;
  totalUsageLimit: number | null;
  perCustomerUsageLimit: number | null;
  applicableProductIds: string[];
  applicableExpertIds: string[];
  applicableSessionIds: string[];
  usageCount: number;
};

export type Testimonial = {
  quote: string;
  attribution: string;
};

export type PaymentProvider = "razorpay" | "stripe" | "crypto";

export type CouponPurchaseTarget =
  | {
      type: "product";
      productId: string;
      expertId?: never;
      sessionId?: never;
    }
  | {
      type: "expert";
      expertId: string;
      sessionId: string;
      productId?: never;
    };

export type CouponValidationResult = {
  ok: boolean;
  message: string;
  discountAmountUsd: number;
  finalAmountUsd: number;
};
