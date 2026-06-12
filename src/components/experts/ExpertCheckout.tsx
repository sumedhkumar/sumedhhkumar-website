"use client";

import { useState } from "react";
import type { Expert, ExpertSession, PaymentProvider } from "@/types";
import Button from "@/components/ui/Button";

const paymentOptions: { value: PaymentProvider; label: string }[] = [
  { value: "razorpay", label: "Pay with Razorpay" },
  { value: "stripe", label: "Pay with Stripe" },
  { value: "crypto", label: "Pay with Crypto" },
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ExpertCheckout({
  expert,
  paymentsConfigured,
}: {
  expert: Expert;
  paymentsConfigured: boolean;
}) {
  const sessions = expert.sessions.filter((session) => session.active);
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.id ?? "",
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountAmountUsd, setDiscountAmountUsd] = useState(0);
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider>("razorpay");
  const [statusMessage, setStatusMessage] = useState("");
  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );
  const originalFee = selectedSession?.feeUsd ?? 0;
  const finalAmount = Math.max(0, originalFee - discountAmountUsd);

  async function applyCoupon() {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode,
        amountUsd: originalFee,
        targetType: "expert",
        expertId: expert.id,
        sessionId: selectedSessionId,
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      discountAmountUsd?: number;
    };

    setCouponMessage(result.message ?? "Coupon code is invalid or inactive.");
    setDiscountAmountUsd(result.discountAmountUsd ?? 0);
  }

  function continueToPayment() {
    setStatusMessage("Online payment configuration is pending.");
  }

  return (
    <div className="checkout-card">
      <div style={{ display: "grid", gap: 18 }}>
        <h1 className="section-title">Book a Consultation</h1>

        <div>
          <h2 className="card-title">Selected Expert</h2>
          <p className="body-standard" style={{ marginTop: 8 }}>
            {expert.fullName}
          </p>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="card-title">Choose a Session</legend>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {sessions.map((session: ExpertSession) => (
              <label
                key={session.id}
                className="body-standard"
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <input
                  type="radio"
                  name="session"
                  value={session.id}
                  checked={selectedSessionId === session.id}
                  onChange={() => {
                    setSelectedSessionId(session.id);
                    setDiscountAmountUsd(0);
                    setCouponMessage("");
                  }}
                  style={{ accentColor: "#C7A56A", marginTop: 5 }}
                />
                <span>
                  {session.label} · {session.durationMinutes} minutes ·{" "}
                  {formatUsd(session.feeUsd)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="form-label" htmlFor="expertCoupon">
            Coupon Code
          </label>
          <input
            id="expertCoupon"
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            className="form-control"
            style={{ marginTop: 8 }}
          />
        </div>

        <Button type="button" variant="secondary" onClick={applyCoupon}>
          Apply Coupon
        </Button>

        {couponMessage ? <p className="body-compact">{couponMessage}</p> : null}

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span className="body-compact">Original Fee</span>
            <span className="body-compact">{formatUsd(originalFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span className="body-compact">Discount</span>
            <span className="body-compact">{formatUsd(discountAmountUsd)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span className="body-standard" style={{ fontWeight: 700 }}>
              Final Payable Amount
            </span>
            <span className="body-standard" style={{ color: "#E7D2A5", fontWeight: 800 }}>
              {formatUsd(finalAmount)}
            </span>
          </div>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="form-label">Payment Options</legend>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className="body-standard"
                style={{ display: "flex", gap: 10, alignItems: "center" }}
              >
                <input
                  type="radio"
                  name="expertPaymentProvider"
                  value={option.value}
                  checked={paymentProvider === option.value}
                  disabled={!paymentsConfigured}
                  onChange={() => setPaymentProvider(option.value)}
                  style={{ accentColor: "#C7A56A" }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {!paymentsConfigured ? (
          <p className="body-compact" style={{ color: "#C79252" }}>
            Online payment configuration is pending.
          </p>
        ) : null}

        {statusMessage ? (
          <p className="body-compact" style={{ color: "#C79252" }}>
            {statusMessage}
          </p>
        ) : null}

        <Button
          type="button"
          variant="primary"
          disabled={!paymentsConfigured || !selectedSession}
          onClick={continueToPayment}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
