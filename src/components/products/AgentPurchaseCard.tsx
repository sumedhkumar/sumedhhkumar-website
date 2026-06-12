"use client";

import { Dispatch, SetStateAction, useState } from "react";
import type { PaymentProvider, TradingAgentProduct } from "@/types";
import Button from "@/components/ui/Button";

type PurchaseState = {
  couponCode: string;
  couponMessage: string;
  discountAmountUsd: number;
  finalAmountUsd: number;
  paymentProvider: PaymentProvider;
  acceptedTerms: boolean;
  statusMessage: string;
};

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

function createInitialState(product: TradingAgentProduct): PurchaseState {
  return {
    couponCode: "",
    couponMessage: "",
    discountAmountUsd: 0,
    finalAmountUsd: product.priceUsd,
    paymentProvider: "razorpay",
    acceptedTerms: false,
    statusMessage: "",
  };
}

type AgentPurchaseFormProps = {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  state: PurchaseState;
  setState: Dispatch<SetStateAction<PurchaseState>>;
};

export function AgentPurchaseForm({
  product,
  paymentsConfigured,
  state,
  setState,
}: AgentPurchaseFormProps) {
  const unavailableMessage = "This product is not currently available for purchase.";
  const configurationMessage = "Online purchase configuration is pending.";
  const blockingMessage = product.active
    ? paymentsConfigured
      ? ""
      : configurationMessage
    : unavailableMessage;
  const buyDisabled =
    !product.active || !paymentsConfigured || !state.acceptedTerms;

  async function applyCoupon() {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: state.couponCode,
        amountUsd: product.priceUsd,
        targetType: "product",
        productId: product.id,
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      discountAmountUsd?: number;
      finalAmountUsd?: number;
    };

    setState((current) => ({
      ...current,
      couponMessage: result.message ?? "Coupon code is invalid or inactive.",
      discountAmountUsd: result.discountAmountUsd ?? 0,
      finalAmountUsd: result.finalAmountUsd ?? product.priceUsd,
    }));
  }

  async function buyNow() {
    if (buyDisabled) {
      return;
    }

    setState((current) => ({
      ...current,
      statusMessage: configurationMessage,
    }));
  }

  return (
    <div className="purchase-stack">
      <div>
        <h2 className="card-title">{product.name}</h2>
        <p className="body-compact" style={{ marginTop: 8 }}>
          {product.shortDescription}
        </p>
      </div>

      <p className="product-price">{formatUsd(product.priceUsd)}</p>

      <div>
        <label className="form-label" htmlFor={`${product.id}-coupon`}>
          Coupon Code
        </label>
        <input
          id={`${product.id}-coupon`}
          type="text"
          placeholder="Enter coupon code"
          value={state.couponCode}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              couponCode: event.target.value,
            }))
          }
          className="form-control"
          style={{ marginTop: 8 }}
        />
      </div>

      <Button type="button" variant="secondary" onClick={applyCoupon}>
        Apply Coupon
      </Button>

      {state.couponMessage ? (
        <p className="body-compact">{state.couponMessage}</p>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span className="body-compact">Original Price</span>
          <span className="body-compact">{formatUsd(product.priceUsd)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span className="body-compact">Discount</span>
          <span className="body-compact">
            {formatUsd(state.discountAmountUsd)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span className="body-standard" style={{ fontWeight: 700 }}>
            Final Payable Amount
          </span>
          <span className="body-standard" style={{ color: "#E7D2A5", fontWeight: 800 }}>
            {formatUsd(state.finalAmountUsd)}
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
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <input
                type="radio"
                name={`${product.id}-payment`}
                value={option.value}
                checked={state.paymentProvider === option.value}
                disabled={!paymentsConfigured}
                onChange={() =>
                  setState((current) => ({
                    ...current,
                    paymentProvider: option.value,
                  }))
                }
                style={{ accentColor: "#C7A56A" }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label
        className="body-compact"
        style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
      >
        <input
          type="checkbox"
          checked={state.acceptedTerms}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              acceptedTerms: event.target.checked,
            }))
          }
          style={{
            width: 18,
            height: 18,
            accentColor: "#C7A56A",
            alignSelf: "flex-start",
            flex: "0 0 auto",
          }}
        />
        <span>
          I confirm that I have read and understood the{" "}
          <a
            href="/terms#ai-trading-software-agents-risk-disclaimer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#E7D2A5", textDecoration: "underline" }}
          >
            Terms and Conditions
          </a>
          . I understand that trading involves financial risk, that profits are
          not guaranteed, and that Vyntegra is not responsible for losses arising
          from my use of the software.
        </span>
      </label>

      {blockingMessage ? (
        <p className="body-compact" style={{ color: "#C79252" }}>
          {blockingMessage}
        </p>
      ) : null}

      {state.statusMessage ? (
        <p className="body-compact" style={{ color: "#C79252" }}>
          {state.statusMessage}
        </p>
      ) : null}

      <Button type="button" variant="primary" disabled={buyDisabled} onClick={buyNow}>
        Buy Now
      </Button>
    </div>
  );
}

export function useAgentPurchaseState(product: TradingAgentProduct) {
  return useState<PurchaseState>(() => createInitialState(product));
}

export default function AgentPurchaseCard({
  product,
  paymentsConfigured,
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
}) {
  const [state, setState] = useAgentPurchaseState(product);

  return (
    <aside id="purchase" className="purchase-card desktop-purchase-card">
      <AgentPurchaseForm
        product={product}
        paymentsConfigured={paymentsConfigured}
        state={state}
        setState={setState}
      />
    </aside>
  );
}
