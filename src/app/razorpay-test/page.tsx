"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";

type CheckoutPhase = "idle" | "creating" | "verifying" | "success" | "error";

type CreateOrderResponse = {
  key?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  message?: string;
};

type VerifyPaymentResponse = {
  success?: boolean;
  orderId?: string;
  paymentId?: string;
  message?: string;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${checkoutScriptUrl}"]`,
    );

    if (existingScript?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existingScript ?? document.createElement("script");

    script.src = checkoutScriptUrl;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Razorpay Checkout could not be loaded."));
    };

    if (!existingScript) {
      document.body.appendChild(script);
    }
  });
}

async function readJsonResponse<T extends { message?: string }>(
  response: Response,
) {
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

function isValidPhone(value: string) {
  return /^[+]?[0-9]{7,15}$/.test(value);
}

export default function RazorpayTestPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [message, setMessage] = useState("");
  const completedRef = useRef(false);

  const customerNameValue = customerName.trim();
  const customerEmailValue = customerEmail.trim();
  const customerPhoneValue = customerPhone.trim();
  const processing = phase === "creating" || phase === "verifying";
  const hasRequiredFields = Boolean(
    customerNameValue &&
      customerEmailValue &&
      isValidPhone(customerPhoneValue),
  );
  const canPay = Boolean(hasRequiredFields && !processing);
  const buttonLabel = useMemo(() => {
    if (phase === "creating") {
      return "Creating order...";
    }

    if (phase === "verifying") {
      return "Verifying payment...";
    }

    return "Pay \u20b9100 Test Payment";
  }, [phase]);

  async function verifyPayment(response: RazorpayCheckoutResponse) {
    setPhase("verifying");
    setMessage("Verifying payment with Vyntegra backend...");

    try {
      const verificationResponse = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          productId: "test-agent",
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          customerPhone: customerPhoneValue,
        }),
      });
      const verificationResult =
        await readJsonResponse<VerifyPaymentResponse>(verificationResponse);

      if (!verificationResult.success) {
        throw new Error("Payment verification failed.");
      }

      setPhase("success");
      completedRef.current = true;
      setMessage(
        `Payment verified successfully. Order: ${verificationResult.orderId}. Payment: ${verificationResult.paymentId}.`,
      );
    } catch (error) {
      setPhase("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Payment verification failed.",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !customerNameValue ||
      !customerEmailValue ||
      !isValidPhone(customerPhoneValue)
    ) {
      setPhase("error");
      setMessage(
        "Enter your full name, email, and valid phone number before starting payment.",
      );
      return;
    }

    setPhase("creating");
    completedRef.current = false;
    setMessage("Loading Razorpay Checkout...");

    try {
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      setMessage("Creating a \u20b9100 test order...");
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "test-agent",
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          customerPhone: customerPhoneValue,
        }),
      });
      const order = await readJsonResponse<CreateOrderResponse>(orderResponse);

      if (
        !order.key ||
        !order.orderId ||
        !order.amount ||
        !order.currency ||
        !order.productName
      ) {
        throw new Error("Payment order response is incomplete.");
      }

      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Vyntegra",
        description: order.productName,
        order_id: order.orderId,
        prefill: {
          name: customerNameValue,
          email: customerEmailValue,
          contact: customerPhoneValue,
        },
        theme: {
          color: "#B8914A",
        },
        handler: (response) => {
          void verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            if (!completedRef.current) {
              setPhase("idle");
              setMessage("Payment window closed before completion.");
            }
          },
        },
      });

      checkout.on("payment.failed", () => {
        completedRef.current = true;
        setPhase("error");
        setMessage("Razorpay reported that the test payment failed.");
      });
      checkout.open();
      setMessage("Complete the test payment in the Razorpay window.");
    } catch (error) {
      setPhase("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Razorpay test payment.",
      );
    }
  }

  return (
    <main className="listing-page">
      <section
        className="checkout-card"
        style={{
          maxWidth: 560,
          margin: "0 auto",
          display: "grid",
          gap: 22,
        }}
      >
        <div>
          <p className="eyebrow">Internal Test Checkout</p>
          <h1 className="section-title" style={{ fontSize: 32 }}>
            Razorpay Test Payment
          </h1>
          <p className="body-standard" style={{ marginTop: 10 }}>
            Use this temporary page to test the \u20b9100 Razorpay order and
            backend verification flow.
          </p>
        </div>

        <div className="pricing-summary-card">
          <div className="pricing-row">
            <span>Product</span>
            <span>Vyntegra Test Payment</span>
          </div>
          <div className="pricing-row pricing-row-total">
            <span>Amount</span>
            <span>\u20b9100</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label className="form-label" htmlFor="razorpay-test-name">
            Full name
            <input
              id="razorpay-test-name"
              className="form-control"
              type="text"
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
                setMessage("");
                setPhase("idle");
              }}
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </label>

          <label className="form-label" htmlFor="razorpay-test-email">
            Email
            <input
              id="razorpay-test-email"
              className="form-control"
              type="email"
              value={customerEmail}
              onChange={(event) => {
                setCustomerEmail(event.target.value);
                setMessage("");
                setPhase("idle");
              }}
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </label>

          <label className="form-label" htmlFor="razorpay-test-phone">
            Phone number
            <input
              id="razorpay-test-phone"
              className="form-control"
              type="tel"
              value={customerPhone}
              onChange={(event) => {
                setCustomerPhone(event.target.value);
                setMessage("");
                setPhase("idle");
              }}
              autoComplete="tel"
              placeholder="+91 9876543210"
              required
            />
          </label>

          {!hasRequiredFields ? (
            <p className="body-compact">
              Enter a full name, email, and phone number to enable the test payment button.
            </p>
          ) : null}

          {message ? (
            <p
              className="body-compact"
              role={phase === "error" ? "alert" : "status"}
              style={{
                color:
                  phase === "success"
                    ? "var(--state-success)"
                    : phase === "error"
                      ? "var(--state-error)"
                      : "var(--foreground-muted)",
              }}
            >
              {message}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={!canPay}>
            {buttonLabel}
          </Button>
        </form>
      </section>
    </main>
  );
}
