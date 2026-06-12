import { validateCoupon } from "@/lib/coupon-validation";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: string;
    amountUsd?: number;
    targetType?: "product" | "expert";
    productId?: string;
    expertId?: string;
    sessionId?: string;
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

  return Response.json(
    validateCoupon({
      code: body.code ?? "",
      amountUsd,
      target: {
        type: "product",
        productId: body.productId ?? "",
      },
    }),
  );
}
