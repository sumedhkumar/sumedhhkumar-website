"use client";

import { X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { CryptoPaymentConfig, TradingAgentProduct } from "@/types";
import { AgentPurchaseForm } from "@/components/products/AgentPurchaseCard";

type PurchaseState = Parameters<typeof AgentPurchaseForm>[0]["state"];

export default function MobileAgentPurchaseSheet({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
  state,
  setState,
  onClose,
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
  state: PurchaseState;
  setState: Dispatch<SetStateAction<PurchaseState>>;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="mobile-purchase-backdrop"
        aria-label="Close purchase panel"
        onClick={onClose}
      />
      <div className="mobile-purchase-sheet" role="dialog" aria-modal="true">
        <button
          type="button"
          aria-label="Close purchase panel"
          onClick={onClose}
          style={{
            width: 44,
            height: 44,
            border: "1px solid rgba(184, 145, 74, 0.32)",
            borderRadius: 8,
            background: "transparent",
            color: "#D8CBA6",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            float: "right",
          }}
        >
          <X size={20} strokeWidth={1.75} />
        </button>
        <div style={{ clear: "both", paddingTop: 12 }}>
          <AgentPurchaseForm
            product={product}
            paymentsConfigured={paymentsConfigured}
            cryptoPaymentConfig={cryptoPaymentConfig}
            state={state}
            setState={setState}
          />
        </div>
      </div>
    </>
  );
}

