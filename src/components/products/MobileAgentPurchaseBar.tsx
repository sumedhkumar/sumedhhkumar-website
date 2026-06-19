"use client";

import { useState } from "react";
import type { CryptoPaymentConfig, TradingAgentProduct } from "@/types";
import { isSubscriptionAgentSlug } from "@/data/agent-subscription-plans";
import Button from "@/components/ui/Button";
import {
  useAgentPurchaseState,
} from "@/components/products/AgentPurchaseCard";
import MobileAgentPurchaseSheet from "@/components/products/MobileAgentPurchaseSheet";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function MobileAgentPurchaseBar({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useAgentPurchaseState(product);
  const isSubscriptionProduct = isSubscriptionAgentSlug(product.slug);

  return (
    <>
      <div className="mobile-purchase-bar">
        <div>
          <p className="body-compact">{product.name}</p>
          <p className="product-price" style={{ fontSize: 24 }}>
            {isSubscriptionProduct ? "From $199" : formatUsd(product.priceUsd)}
          </p>
        </div>
        {isSubscriptionProduct ? (
          <Button href={`/ai-trading-agents/${product.slug}/plans`} variant="primary">
            View Plans
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={() => setOpen(true)}>
            Buy Now
          </Button>
        )}
      </div>

      {open && !isSubscriptionProduct ? (
        <MobileAgentPurchaseSheet
          product={product}
          paymentsConfigured={paymentsConfigured}
          cryptoPaymentConfig={cryptoPaymentConfig}
          state={state}
          setState={setState}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
