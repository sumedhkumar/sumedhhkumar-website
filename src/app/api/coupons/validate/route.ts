import { validateCoupon } from "@/lib/coupon-validation";
import { calculateFinalPrice } from "@/lib/pricing";
import { products } from "@/data/products";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: string;
    amountUsd?: number;
    targetType?: "product" | "expert";
    productId?: string;
    expertId?: string;
    sessionId?: string;
    selectedPlanId?: string;
  };

  const amountUsd = Number(body.amountUsd ?? 0);

  if (body.targetType === "expert") {
    return Response.json(
      validateCoupon({
        code: body.code ?? "",
        amountUsd,
        target: {
          type: "expert",
          expertId: body.expertId ?? "",
          sessionId: body.sessionId ?? "",
        },
      }),
    );
  }

  const product = products.find(p => p.id === body.productId);
  if (!product || !body.selectedPlanId) {
    return Response.json({ ok: false, message: "Invalid product or plan selected.", discountAmountUsd: 0, finalAmountUsd: amountUsd });
  }

  const result = calculateFinalPrice(product.slug, body.selectedPlanId, body.code ?? "");
  return Response.json({
    ok: result.ok,
    message: result.message,
    discountAmountUsd: result.discountUsd,
    finalAmountUsd: result.finalPriceUsd,
  });
}
