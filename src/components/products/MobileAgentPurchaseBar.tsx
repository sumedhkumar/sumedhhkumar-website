"use client";

import { useState } from "react";
import type { TradingAgentProduct } from "@/types";
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
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useAgentPurchaseState(product);

  return (
    <>
      <div className="mobile-purchase-bar">
        <div>
          <p className="body-compact">{product.name}</p>
          <p className="product-price" style={{ fontSize: 24 }}>
            {formatUsd(product.priceUsd)}
          </p>
        </div>
        <Button type="button" variant="primary" onClick={() => setOpen(true)}>
          Buy Now
        </Button>
      </div>

      {open ? (
        <MobileAgentPurchaseSheet
          product={product}
          paymentsConfigured={paymentsConfigured}
          state={state}
          setState={setState}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
