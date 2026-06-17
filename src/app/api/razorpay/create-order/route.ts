import Razorpay from "razorpay";

export const runtime = "nodejs";

const testProduct = {
  productId: "test-agent",
  name: "Vyntegra Test Payment",
  priceInr: 100,
};

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidPhone(value: string) {
  return /^[+]?[0-9]{7,15}$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    productId?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
  };
  const productId = readRequiredString(body.productId);
  const customerName = readRequiredString(body.customerName);
  const customerEmail = readRequiredString(body.customerEmail);
  const customerPhone = readRequiredString(body.customerPhone);

  if (!customerName || !customerEmail || !customerPhone || !isValidPhone(customerPhone)) {
    return Response.json(
      { message: "Customer name, email, and valid phone number are required." },
      { status: 400 },
    );
  }

  if (productId !== testProduct.productId) {
    return Response.json(
      { message: "Invalid product selected." },
      { status: 400 },
    );
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const order = await razorpay.orders.create({
      amount: testProduct.priceInr * 100,
      currency: "INR",
      notes: {
        productId: testProduct.productId,
        productName: testProduct.name,
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    return Response.json({
      key: keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productName: testProduct.name,
    });
  } catch {
    return Response.json(
      { message: "Unable to create payment order." },
      { status: 500 },
    );
  }
}
