"use client";

import { useState } from "react";
import type { CryptoPaymentConfig, TradingAgentProduct } from "@/types";
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
  const isAstroVynGoldProduct = product.slug === "astro-vyn-gold";

  return (
    <>
      <div className="mobile-purchase-bar">
        <div>
          <p className="body-compact">{product.name}</p>
          <p className="product-price" style={{ fontSize: 24 }}>
            {isAstroVynGoldProduct ? "From $199" : formatUsd(product.priceUsd)}
          </p>
        </div>
        {isAstroVynGoldProduct ? (
          <Button href="/ai-trading-agents/astro-vyn-gold/plans" variant="primary">
            View Plans
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={() => setOpen(true)}>
            Buy Now
          </Button>
        )}
      </div>

      {open && !isAstroVynGoldProduct ? (
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
