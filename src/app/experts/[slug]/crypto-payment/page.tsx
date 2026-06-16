import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { validateCoupon } from "@/lib/coupon-validation";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import { CryptoPaymentPanel } from "@/components/products/AgentPurchaseCard";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function findExpert(slug: string) {
  return experts.find((expert) => expert.slug === slug);
}

function getStringParam(
  query: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = query[key];

  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function formatAppointmentDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(year, month - 1, day));
}

export const metadata: Metadata = {
  title: "Pay with Crypto | Vyntegra",
  description: "Submit manual crypto payment proof for a Vyntegra consultation.",
};

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export default async function ExpertCryptoPaymentPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const expert = findExpert(slug);

  if (!expert) {
    notFound();
  }

  const sessionId = getStringParam(query, "session");
  const appointmentDateKey = getStringParam(query, "date");
  const appointmentSlot = getStringParam(query, "slot");
  const couponCode = getStringParam(query, "coupon");
  const session = expert.sessions.find(
    (item) => item.id === sessionId && item.active,
  );
  const appointmentDate = formatAppointmentDate(appointmentDateKey);
  const couponResult =
    couponCode && session
      ? validateCoupon({
          code: couponCode,
          amountUsd: session.feeUsd,
          target: {
            type: "expert",
            expertId: expert.id,
            sessionId: session.id,
          },
        })
      : null;
  const finalAmountUsd =
    couponResult?.ok && couponResult.discountAmountUsd > 0 && session
      ? couponResult.finalAmountUsd
      : (session?.feeUsd ?? 0);
  const cryptoPaymentConfig = getCryptoPaymentConfig();

  return (
    <main className="listing-page crypto-payment-page">
      <div className="listing-container crypto-payment-screen">
        <header className="listing-hero">
          <p className="eyebrow">Manual Crypto Payment</p>
          <h1 className="page-title">Complete Crypto Payment</h1>
          <p className="body-standard">
            Consultation: <strong>{expert.fullName}</strong>
          </p>
        </header>

        {session && appointmentDateKey && appointmentSlot && cryptoPaymentConfig ? (
          <CryptoPaymentPanel
            targetType="expert"
            expert={expert}
            session={session}
            appointmentDate={appointmentDate}
            appointmentSlot={appointmentSlot}
            finalAmountUsd={finalAmountUsd}
            couponCode={couponResult?.ok ? couponCode : ""}
            cryptoPaymentConfig={cryptoPaymentConfig}
          />
        ) : (
          <EmptyState
            heading="Crypto payment unavailable."
            copy={
              cryptoPaymentConfig
                ? "Please return to expert checkout, select a session date and time, then choose Pay with Crypto."
                : "Crypto payment configuration is pending. Please choose another payment option or contact Vyntegra."
            }
          />
        )}
      </div>
    </main>
  );
}
