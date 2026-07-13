"use client";

import { useRouter } from "next/navigation";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CryptoPaymentConfig,
  PaymentProvider,
  TradingAgentProduct,
} from "@/types";
import {
  isSubscriptionAgentSlug,
  type AgentSubscriptionPlan,
} from "@/data/agent-subscription-plans";

import dynamic from "next/dynamic";
import type { PaymentDialogContent } from "@/components/payments/RazorpayPaymentDialogs";

const PaymentResultDialog = dynamic(() =>
  import("@/components/payments/RazorpayPaymentDialogs").then((mod) => mod.PaymentResultDialog)
);
const RazorpayVerificationOverlay = dynamic(() =>
  import("@/components/payments/RazorpayPaymentDialogs").then((mod) => mod.RazorpayVerificationOverlay)
);
import Button from "@/components/ui/Button";

type PurchaseState = {
  customerName: string;
  customerEmail: string;
  couponCode: string;
  couponMessage: string;
  discountAmountUsd: number;
  finalAmountUsd: number;
  paymentProvider: PaymentProvider;
  acceptedTerms: boolean;
  statusMessage: string;
  statusTone: "info" | "success" | "error";
  usdToInrRate: number | null;
  usdToInrRateSource: string | null;
  usdToInrRateFetchedAt: string;
  usdToInrEffectiveDateIst: string;
  exchangeRateFetchedAtUtc: string;
  exchangeRateFetchedAtIstDisplay: string;
  exchangeRateIsFallback: boolean;
  orderCreatedAtUtc: string;
  orderCreatedAtIstDisplay: string;
};

type CreateProductOrderResponse = {
  key?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  discountUsd?: number;
  finalPriceUsd?: number;
  finalPriceInr?: number;
  usdToInrRate?: number;
  usdToInrRateSource?: string;
  usdToInrRateFetchedAt?: string;
  usdToInrEffectiveDateIst?: string;
  exchangeRateFetchedAtUtc?: string;
  exchangeRateFetchedAtIstDisplay?: string;
  exchangeRateIsFallback?: boolean;
  orderCreatedAtUtc?: string;
  orderCreatedAtIstDisplay?: string;
  appliedCoupon?: string;
  selectedPlanId?: string;
  selectedPlanName?: string;
  subscriptionDuration?: string;
  originalPriceUsd?: number;
  payablePriceUsd?: number;
  message?: string;
};

type ExchangeRateResponse = {
  success?: boolean;
  rate?: number;
  source?: string;
  fetchedAt?: string;
  exchangeRateFetchedAtUtc?: string;
  exchangeRateFetchedAtIstDisplay?: string;
  exchangeRateIsFallback?: boolean;
  effectiveDateIst?: string;
  message?: string;
};

type VerifyProductPaymentResponse = {
  success?: boolean;
  orderId?: string;
  paymentId?: string;
  message?: string;
};

type PaymentFlowState =
  | "idle"
  | "creating-order"
  | "gateway-open"
  | "verifying-payment"
  | "success"
  | "failed"
  | "cancelled";

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
  };
  readonly: {
    contact: false;
  };
  hidden: {
    contact: false;
  };
  remember_customer: false;
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

type RazorpayWindow = Window & {
  Razorpay?: RazorpayConstructor;
};

const paymentOptions: { value: PaymentProvider; label: string }[] = [
  { value: "crypto", label: "Pay with Crypto" },
];

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

function getRazorpayConstructor() {
  return (window as RazorpayWindow).Razorpay;
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (getRazorpayConstructor()) {
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

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}



function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getStatusColor(tone: PurchaseState["statusTone"]) {
  if (tone === "success") {
    return "#86EFAC";
  }

  if (tone === "error") {
    return "#FCA5A5";
  }

  return "#F59E0B";
}

function createInitialState(product: TradingAgentProduct, selectedPlan?: AgentSubscriptionPlan): PurchaseState {
  let defaultCoupon = "";
  let defaultDiscountUsd = 0;
  let defaultFinalUsd = product.priceUsd;

  if (selectedPlan) {
    defaultCoupon = "EARLYACCESS";
    defaultDiscountUsd = selectedPlan.priceUsd * 0.5;
    defaultFinalUsd = selectedPlan.priceUsd - defaultDiscountUsd;
  }

  return {
    customerName: "",
    customerEmail: "",
    couponCode: defaultCoupon,
    couponMessage: "",
    discountAmountUsd: defaultDiscountUsd,
    finalAmountUsd: defaultFinalUsd,
    paymentProvider: "crypto",
    acceptedTerms: false,
    statusMessage: "",
    statusTone: "info",
    usdToInrRate: null,
    usdToInrRateSource: null,
    usdToInrRateFetchedAt: "",
    usdToInrEffectiveDateIst: "",
    exchangeRateFetchedAtUtc: "",
    exchangeRateFetchedAtIstDisplay: "",
    exchangeRateIsFallback: false,
    orderCreatedAtUtc: "",
    orderCreatedAtIstDisplay: "",
  };
}

type AgentPurchaseFormProps = {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
  selectedPlan?: AgentSubscriptionPlan;
  state: PurchaseState;
  setState: Dispatch<SetStateAction<PurchaseState>>;
};

type CryptoPaymentPanelProps =
  {
    targetType: "product";
    product: TradingAgentProduct;
    finalAmountUsd: number;
    couponCode?: string;
    cryptoPaymentConfig: CryptoPaymentConfig | null;
    selectedPlan?: AgentSubscriptionPlan;
  };

export function CryptoPaymentPanel(props: CryptoPaymentPanelProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [proofMessage, setProofMessage] = useState("");
  const [proofDialogMessage, setProofDialogMessage] = useState("");
  const [proofSending, setProofSending] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [querySending, setQuerySending] = useState(false);

  if (!props.cryptoPaymentConfig) {
    return (
      <div className="crypto-payment-panel">
        <h3 className="card-title">Pay with Crypto</h3>
        <p className="body-compact" style={{ color: "#F59E0B" }}>
          Crypto payment configuration is pending.
        </p>
      </div>
    );
  }

  const cryptoConfig = props.cryptoPaymentConfig;
  const purchaseName = props.selectedPlan
    ? `${props.product.name} - ${props.selectedPlan.name}`
    : props.product.name;
  const originalAmountUsd =
    props.selectedPlan?.originalPriceUsd ?? props.product.priceUsd;
  const formattedOriginalPrice = formatUsd(originalAmountUsd);
  const formattedFinalAmount = formatUsd(props.finalAmountUsd);
  const formattedDiscountAmount = formatUsd(
    Math.max(0, originalAmountUsd - props.finalAmountUsd),
  );
  const couponCode = props.couponCode ?? "";
  const couponLabel = couponCode.trim() ? couponCode.trim().toUpperCase() : "None";
  const purchaseLabel = "Product";
  const completionCopy =
    "Once the payment is confirmed, Vyntegra will provide the product/access details on your registered email.";
  const manualVerificationCopy =
    "I confirm that I have completed the payment and understand that Vyntegra will verify it manually before product/access details are shared.";

  function setTargetFields(formData: FormData) {
    formData.set("purchaseType", "product");
    formData.set("productId", props.product.id);
    if (props.selectedPlan) {
      formData.set("selectedPlanId", props.selectedPlan.id);
    }
  }

  function renderTargetHiddenFields() {
    return (
      <>
        <input type="hidden" name="purchaseType" value="product" />
        <input type="hidden" name="productId" value={props.product.id} />
        {props.selectedPlan ? (
          <>
            <input type="hidden" name="selectedPlanId" value={props.selectedPlan.id} />
            <input type="hidden" name="selectedPlanName" value={props.selectedPlan.name} />
            <input
              type="hidden"
              name="subscriptionDuration"
              value={props.selectedPlan.durationLabel}
            />
          </>
        ) : null}
      </>
    );
  }

  async function copyWalletAddress() {
    await navigator.clipboard.writeText(cryptoConfig.walletAddress);
    setCopyMessage("Wallet address copied.");
  }

  async function submitProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const emailAddress = String(formData.get("emailAddress") ?? "").trim();
    const confirmEmailAddress = String(
      formData.get("confirmEmailAddress") ?? "",
    ).trim();
    const screenshot = formData.get("paymentScreenshot");
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (emailAddress !== confirmEmailAddress) {
      setProofMessage(
        "Email addresses do not match. Please re-enter your email correctly.",
      );
      return;
    }

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      setProofMessage(
        "Please upload a clear payment screenshot before submitting.",
      );
      return;
    }

    if (!allowedTypes.includes(screenshot.type)) {
      setProofMessage(
        "Please upload a valid payment screenshot in JPG, PNG, WEBP, or PDF format.",
      );
      return;
    }

    if (screenshot.size > 5 * 1024 * 1024) {
      setProofMessage("File size is too large. Please upload a smaller file.");
      return;
    }

    formData.set("submissionType", "proof");
    formData.set("couponCode", couponCode);
    setTargetFields(formData);

    setProofSending(true);
    setProofMessage("");
    setProofDialogMessage("");

    try {
      const response = await fetch("/api/payments/crypto/submit", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { message?: string };

      if (response.ok) {
        setProofDialogMessage(
          result.message ??
            "Your payment proof has been submitted successfully. Our team will verify the payment and get back to you by email.",
        );
        form.reset();
      } else {
        setProofMessage(
          result.message ??
            "Payment proof could not be submitted. Please check the required fields and try again.",
        );
      }
    } catch {
      setProofMessage(
        "Payment proof could not be submitted. Please check the required fields and try again.",
      );
    } finally {
      setProofSending(false);
    }
  }

  async function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("submissionType", "query");
    formData.set("couponCode", couponCode);
    setTargetFields(formData);

    setQuerySending(true);
    setQueryMessage("");

    try {
      const response = await fetch("/api/payments/crypto/submit", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { message?: string };

      setQueryMessage(
        result.message ??
          "Your query could not be submitted. Please check the required fields and try again.",
      );

      if (response.ok) {
        form.reset();
      }
    } catch {
      setQueryMessage(
        "Your query could not be submitted. Please check the required fields and try again.",
      );
    } finally {
      setQuerySending(false);
    }
  }

  return (
    <section className="crypto-payment-panel">
      <div className="crypto-payment-heading">
        <div>
          <h3 className="card-title">Pay with Crypto</h3>
          <p className="body-compact">
            You can complete your payment using the crypto wallet details shown
            below.
          </p>
        </div>
        <span className="crypto-payment-badge">Manual verification</span>
      </div>

      <div className="crypto-payment-copy">
        <p>
          Scan the QR code or copy the wallet address carefully. Please send
          payment only using the token and network mentioned here.
        </p>
        <p>
          Payments sent to the wrong wallet address, wrong token, or wrong
          network may not be recoverable.
        </p>
        <p>
          After completing the payment, upload a clear payment screenshot and
          enter your details. Please enter and confirm your email address
          correctly because Vyntegra will use this email to contact you after
          verification.
        </p>
        <p>
          Uploading the screenshot does not automatically confirm the payment.
          Our team will manually verify the transaction and get back to you by
          email.
        </p>
        <p>
          {completionCopy}
        </p>
      </div>

      <div className="crypto-query-callout">
        <div>
          <strong>Have a Payment Query?</strong>
          <p>
            Not sure how to pay or want to confirm details before making the
            crypto payment? Send us your query and our team will respond within
            24 hours.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setQueryOpen((value) => !value)}
        >
          Ask before paying
        </Button>
      </div>

      {queryOpen ? (
        <form className="crypto-form" onSubmit={submitQuery}>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden />
          {renderTargetHiddenFields()}
          <div>
            <h4 className="card-title">Payment Query</h4>
            <p className="body-compact">
              Submit your question before making the payment. Vyntegra will
              respond within 24 hours.
            </p>
          </div>
          <label className="form-label">
            Full Name
            <input
              className="form-control"
              name="queryFullName"
              type="text"
              required
              placeholder="Enter your full name"
            />
          </label>
          <label className="form-label">
            Email Address
            <input
              className="form-control"
              name="queryEmailAddress"
              type="email"
              required
              placeholder="Enter your email address"
            />
          </label>
          <label className="form-label">
            Your Query
            <textarea
              className="form-control"
              name="queryMessage"
              required
              placeholder="Write your payment-related question here."
            />
          </label>
          {queryMessage ? (
            <p className="body-compact">{queryMessage}</p>
          ) : null}
          <Button type="submit" variant="secondary" disabled={querySending}>
            {querySending ? "Submitting..." : "Submit Query"}
          </Button>
        </form>
      ) : null}

      <div className="crypto-payment-details">
        <div className="crypto-qr-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cryptoConfig.qrImagePath}
            alt={`${cryptoConfig.token} ${cryptoConfig.network} wallet QR code`}
          />
        </div>
        <dl className="crypto-detail-list">
          <div>
            <dt>Payment Method</dt>
            <dd>Crypto Wallet Payment</dd>
          </div>
          <div>
            <dt>Token</dt>
            <dd>{cryptoConfig.token}</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>{cryptoConfig.network}</dd>
          </div>
          <div>
            <dt>Wallet Address</dt>
            <dd className="crypto-wallet-address">
              {cryptoConfig.walletAddress}
            </dd>
          </div>
          <div>
            <dt>{purchaseLabel}</dt>
            <dd>{purchaseName}</dd>
          </div>
          {props.selectedPlan ? (
            <div>
              <dt>Subscription Duration</dt>
              <dd>{props.selectedPlan.durationLabel}</dd>
            </div>
          ) : null}
          <div>
            <dt>Original Price</dt>
            <dd>{formattedOriginalPrice}</dd>
          </div>
          <div>
            <dt>Coupon Applied</dt>
            <dd>{couponLabel}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>{formattedDiscountAmount}</dd>
          </div>
          <div className="crypto-payment-total">
            <dt>Final Payable Amount</dt>
            <dd className="crypto-payable-amount">{formattedFinalAmount}</dd>
          </div>
        </dl>
      </div>

      <Button type="button" variant="secondary" onClick={copyWalletAddress}>
        Copy Wallet Address
      </Button>
      {copyMessage ? <p className="body-compact">{copyMessage}</p> : null}

      <p className="crypto-payment-warning">
        Please double-check the token, network, and wallet address before
        sending payment.
      </p>

      <form className="crypto-form" onSubmit={submitProof}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden />
        {renderTargetHiddenFields()}
        <input type="hidden" name="couponCode" value={couponCode} />
        <div>
          <h4 className="card-title">Submit Payment Proof</h4>
          <p className="body-compact">
            After making the payment, submit your details and payment
            screenshot. Vyntegra will verify the payment manually and respond by
            email.
          </p>
        </div>
        <label className="form-label">
          Full Name
          <input
            className="form-control"
            name="fullName"
            type="text"
            required
            placeholder="Enter your full name"
          />
        </label>
        <label className="form-label">
          Email Address
          <input
            className="form-control"
            name="emailAddress"
            type="email"
            required
            placeholder="Enter your email address"
          />
        </label>
        <label className="form-label">
          Confirm Email Address
          <input
            className="form-control"
            name="confirmEmailAddress"
            type="email"
            required
            placeholder="Re-enter your email address"
          />
        </label>
        <label className="form-label">
          Transaction Hash / Transaction ID
          <input
            className="form-control"
            name="transactionHash"
            type="text"
            required
            placeholder="Paste the transaction hash or payment ID"
          />
        </label>
        <label className="form-label">
          Payment Screenshot
          <span className="body-compact">
            Upload a clear screenshot of your completed payment.
          </span>
          <input
            className="form-control"
            name="paymentScreenshot"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            required
          />
        </label>
        <label className="body-compact crypto-checkbox-row">
          <input
            type="checkbox"
            name="acceptedManualVerification"
            value="true"
            required
          />
          <span>
            {manualVerificationCopy}
          </span>
        </label>
        {proofMessage ? <p className="body-compact">{proofMessage}</p> : null}
        <Button type="submit" variant="primary" disabled={proofSending}>
          {proofSending ? "Submitting..." : "Submit Payment Proof"}
        </Button>
      </form>

      {proofDialogMessage ? (
        <div
          className="crypto-dialog-backdrop"
          role="presentation"
          onClick={() => setProofDialogMessage("")}
        >
          <div
            className="crypto-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crypto-proof-dialog-title"
            aria-describedby="crypto-proof-dialog-message"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 id="crypto-proof-dialog-title" className="card-title">
              Payment Proof Submitted
            </h4>
            <p id="crypto-proof-dialog-message" className="body-standard">
              {proofDialogMessage}
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => setProofDialogMessage("")}
            >
              OK
            </Button>
          </div>
        </div>
      ) : null}

      <p className="crypto-verification-note">
        Crypto payments are verified manually. Please do not make duplicate
        payments unless our team asks you to.
      </p>
    </section>
  );
}

export function AgentPurchaseForm({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
  selectedPlan,
  state,
  setState,
}: AgentPurchaseFormProps) {
  const router = useRouter();
  const [paymentFlowState, setPaymentFlowState] =
    useState<PaymentFlowState>("idle");
  const [successDialog, setSuccessDialog] =
    useState<PaymentDialogContent | null>(null);
  const [failureDialog, setFailureDialog] =
    useState<PaymentDialogContent | null>(null);
  const checkoutCompletedRef = useRef(false);
  const unavailableMessage = "This product is not currently available for purchase.";
  const configurationMessage = "Online purchase configuration is pending.";
  const cryptoConfigured = Boolean(cryptoPaymentConfig);
  const customerNameValue = state.customerName.trim();
  const customerEmailValue = state.customerEmail.trim();
  const customerDetailsRequired = state.paymentProvider === "razorpay";
  const customerDetailsReady =
    !customerDetailsRequired ||
    Boolean(
      customerNameValue &&
        isValidEmail(customerEmailValue),
    );
  const selectedPaymentConfigured =
    state.paymentProvider === "crypto"
      ? cryptoConfigured
      : state.paymentProvider === "razorpay"
        ? paymentsConfigured
        : false;
  const blockingMessage = product.active
    ? selectedPaymentConfigured
      ? ""
      : configurationMessage
    : unavailableMessage;
  const buyDisabled =
    !product.active ||
    !selectedPaymentConfigured ||
    !state.acceptedTerms ||
    paymentFlowState === "creating-order" ||
    paymentFlowState === "gateway-open" ||
    paymentFlowState === "verifying-payment" ||
    paymentFlowState === "success" ||
    !customerDetailsReady;
  const buyButtonLabel =
    paymentFlowState === "creating-order"
      ? "Creating order..."
      : paymentFlowState === "gateway-open"
        ? "Payment window open..."
        : paymentFlowState === "verifying-payment"
          ? "Verifying payment..."
          : state.paymentProvider === "razorpay"
            ? "Pay with Razorpay"
            : "Continue to Crypto Payment";
  const couponDisabled = false;

  useEffect(() => {
    if (!paymentsConfigured && cryptoConfigured && state.paymentProvider !== "crypto") {
      setState((current) => ({
        ...current,
        paymentProvider: "crypto",
      }));
    }
  }, [cryptoConfigured, paymentsConfigured, setState, state.paymentProvider]);

  useEffect(() => {
    let cancelled = false;

    async function loadExchangeRate() {
      try {
        const response = await fetch("/api/exchange-rates/usd-inr");
        const result = await readJsonResponse<ExchangeRateResponse>(response);

        if (!cancelled && result.success && typeof result.rate === "number") {
          setState((current) => ({
            ...current,
            usdToInrRate: result.rate ?? current.usdToInrRate,
            usdToInrRateSource: result.source ?? current.usdToInrRateSource,
            usdToInrRateFetchedAt:
              result.exchangeRateFetchedAtUtc ??
              result.fetchedAt ??
              current.usdToInrRateFetchedAt,
            usdToInrEffectiveDateIst:
              result.effectiveDateIst ?? current.usdToInrEffectiveDateIst,
            exchangeRateFetchedAtUtc:
              result.exchangeRateFetchedAtUtc ??
              result.fetchedAt ??
              current.exchangeRateFetchedAtUtc,
            exchangeRateFetchedAtIstDisplay:
              result.exchangeRateFetchedAtIstDisplay ??
              current.exchangeRateFetchedAtIstDisplay,
            exchangeRateIsFallback:
              result.exchangeRateIsFallback ?? current.exchangeRateIsFallback,
          }));
        }
      } catch {
        // Backend order creation remains the source of truth for charge amount.
      }
    }

    void loadExchangeRate();
    return () => {
      cancelled = true;
    };
  }, [setState]);

  async function applyCoupon() {
    if (couponDisabled) {
      setState((current) => ({
        ...current,
        couponCode: "",
        couponMessage: "Coupons are not available for this subscription checkout.",
        discountAmountUsd: 0,
        finalAmountUsd: product.priceUsd,
      }));
      return;
    }

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: state.couponCode,
        amountUsd: product.priceUsd,
        targetType: "product",
        productId: product.id,
        selectedPlanId: selectedPlan?.id,
      }),
    });
    const result = (await response.json()) as {
      ok?: boolean;
      message?: string;
      discountAmountUsd?: number;
      finalAmountUsd?: number;
    };

    setState((current) => ({
      ...current,
      couponMessage: result.ok
        ? "Coupon applied."
        : result.message ?? "This coupon code is not valid.",
      discountAmountUsd: result.discountAmountUsd ?? 0,
      finalAmountUsd: result.finalAmountUsd ?? product.priceUsd,
    }));
  }

  function setStatus(message: string, tone: PurchaseState["statusTone"] = "info") {
    setState((current) => ({
      ...current,
      statusMessage: message,
      statusTone: tone,
    }));
  }

  function closeSuccessDialog() {
    setSuccessDialog(null);
    router.refresh();
  }

  function closeFailureDialog() {
    setFailureDialog(null);
    setPaymentFlowState("idle");
  }

  async function verifyRazorpayPayment(response: RazorpayCheckoutResponse) {
    checkoutCompletedRef.current = true;
    setPaymentFlowState("verifying-payment");
    setStatus("");

    try {
      const couponCode = state.couponCode.trim();
      const verificationResponse = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          productId: product.id,
          slug: product.slug,
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          ...(selectedPlan ? { selectedPlanId: selectedPlan.id } : {}),
          ...(couponCode ? { couponCode } : {}),
        }),
      });
      const verificationResult =
        await readJsonResponse<VerifyProductPaymentResponse>(
          verificationResponse,
        );

      if (
        !verificationResult.success ||
        verificationResult.orderId !== response.razorpay_order_id ||
        verificationResult.paymentId !== response.razorpay_payment_id
      ) {
        throw new Error("Payment verification failed.");
      }

      setPaymentFlowState("success");
      setStatus("");
      setSuccessDialog({
        title: "Payment successful",
        body: "Please check your email for next steps.",
        note:
          "Vyntegra will share access/setup details after payment verification/internal processing.",
      });
    } catch {
      setPaymentFlowState("failed");
      setStatus("Payment verification failed.", "error");
      setFailureDialog({
        title: "Payment verification failed",
        body:
          "We could not verify the payment automatically. If money was deducted, please contact support@vyntegra.in with your payment details.",
        supportLine: "",
      });
    }
  }

  async function startRazorpayCheckout() {
    if (!product.id || !product.slug || !product.name) {
      setStatus("Invalid product selected.", "error");
      return;
    }

    if (
      !customerNameValue ||
      !isValidEmail(customerEmailValue)
    ) {
      setStatus(
        "Enter your full name and valid email before payment.",
        "error",
      );
      return;
    }

    setPaymentFlowState("creating-order");
    checkoutCompletedRef.current = false;
    setStatus("Loading Razorpay Checkout...");

    try {
      await loadRazorpayScript();
      const Razorpay = getRazorpayConstructor();

      if (!Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const couponCode = state.couponCode.trim();
      setStatus("Creating secure Razorpay order...");
      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          slug: product.slug,
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          ...(selectedPlan ? { selectedPlanId: selectedPlan.id } : {}),
          ...(couponCode ? { couponCode } : {}),
        }),
      });
      const order =
        await readJsonResponse<CreateProductOrderResponse>(orderResponse);

      if (
        !order.key ||
        !order.orderId ||
        !order.amount ||
        !order.currency ||
        !order.productName
      ) {
        throw new Error("Payment order response is incomplete.");
      }

      setState((current) => ({
        ...current,
        discountAmountUsd:
          typeof order.discountUsd === "number"
            ? order.discountUsd
            : current.discountAmountUsd,
        finalAmountUsd:
          typeof order.finalPriceUsd === "number"
            ? order.finalPriceUsd
            : current.finalAmountUsd,
        couponMessage: order.appliedCoupon
          ? "Coupon applied."
          : current.couponMessage,
        usdToInrRate: order.usdToInrRate ?? current.usdToInrRate,
        usdToInrRateSource: order.usdToInrRateSource ?? current.usdToInrRateSource,
        usdToInrRateFetchedAt:
          order.exchangeRateFetchedAtUtc ??
          order.usdToInrRateFetchedAt ??
          current.usdToInrRateFetchedAt,
        usdToInrEffectiveDateIst:
          order.usdToInrEffectiveDateIst ??
          current.usdToInrEffectiveDateIst,
        exchangeRateFetchedAtUtc:
          order.exchangeRateFetchedAtUtc ??
          order.usdToInrRateFetchedAt ??
          current.exchangeRateFetchedAtUtc,
        exchangeRateFetchedAtIstDisplay:
          order.exchangeRateFetchedAtIstDisplay ??
          current.exchangeRateFetchedAtIstDisplay,
        exchangeRateIsFallback:
          order.exchangeRateIsFallback ?? current.exchangeRateIsFallback,
        orderCreatedAtUtc:
          order.orderCreatedAtUtc ?? current.orderCreatedAtUtc,
        orderCreatedAtIstDisplay:
          order.orderCreatedAtIstDisplay ?? current.orderCreatedAtIstDisplay,
      }));

      const checkout = new Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Vyntegra",
        description: order.productName,
        order_id: order.orderId,
        prefill: {
          name: customerNameValue,
          email: customerEmailValue,
        },
        readonly: {
          contact: false,
        },
        hidden: {
          contact: false,
        },
        remember_customer: false,
        theme: {
          color: "#B8914A",
        },
        handler: (response) => {
          void verifyRazorpayPayment(response);
        },
        modal: {
          ondismiss: () => {
            if (!checkoutCompletedRef.current) {
              setPaymentFlowState("cancelled");
              setStatus("Payment was not completed. You can try again when ready.");
            }
          },
        },
      });

      checkout.on("payment.failed", () => {
        checkoutCompletedRef.current = true;
        setPaymentFlowState("failed");
        setStatus("Razorpay reported that the payment failed.", "error");
      });
      checkout.open();
      setPaymentFlowState("gateway-open");
      setStatus("Complete the payment in the Razorpay window.");
    } catch (error) {
      setPaymentFlowState("failed");
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to start Razorpay payment.",
        "error",
      );
    }
  }

  async function buyNow() {
    if (buyDisabled) {
      return;
    }

    if (state.paymentProvider === "razorpay") {
      await startRazorpayCheckout();
      return;
    }

    if (state.paymentProvider === "crypto") {
      const params = new URLSearchParams({
        amount: state.finalAmountUsd.toFixed(2),
      });
      const couponCode = state.couponCode.trim();

      if (couponCode) {
        params.set("coupon", couponCode);
      }

      if (selectedPlan) {
        params.set("plan", selectedPlan.id);
      }

      window.location.href = `/ai-trading-agents/${product.slug}/crypto-payment?${params.toString()}`;
      return;
    }

    setState((current) => ({
      ...current,
      statusMessage: configurationMessage,
      statusTone: "info",
    }));
  }

  return (
    <div className="purchase-stack">
      <div className="purchase-panel-header">
        <h2 className="card-title">Purchase this agent</h2>
        <p className="product-price">{formatUsd(product.priceUsd)}</p>
        {selectedPlan ? (
          <p className="body-compact">
            {selectedPlan.name} - {selectedPlan.durationLabel}
          </p>
        ) : null}
      </div>

      {state.paymentProvider !== "crypto" ? (
        <div className="purchase-buyer-grid">
          <div className="purchase-field">
            <label className="form-label" htmlFor={`${product.id}-customer-name`}>
              Full name
            </label>
            <input
              id={`${product.id}-customer-name`}
              type="text"
              placeholder="Enter your full name"
              value={state.customerName}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customerName: event.target.value,
                  statusMessage: "",
                }))
              }
              className="form-control"
              required
            />
          </div>
          <div className="purchase-field">
            <label className="form-label" htmlFor={`${product.id}-customer-email`}>
              Email
            </label>
            <input
              id={`${product.id}-customer-email`}
              type="email"
              placeholder="you@example.com"
              value={state.customerEmail}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  customerEmail: event.target.value,
                  statusMessage: "",
                }))
              }
              className="form-control"
              required
            />
          </div>
        </div>
      ) : null}

      <div className="purchase-coupon-row">
        <div className="purchase-field">
          <label className="form-label" htmlFor={`${product.id}-coupon`}>
            Coupon code
          </label>
          <input
            id={`${product.id}-coupon`}
            type="text"
            placeholder="Enter coupon code"
            value={state.couponCode}
            disabled={couponDisabled}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                couponCode: event.target.value,
              }))
            }
            className="form-control"
          />
        </div>
        <Button type="button" variant="secondary" onClick={applyCoupon} disabled={couponDisabled}>
          Apply
        </Button>
      </div>
      {couponDisabled ? (
        <p className="body-compact">Coupons are not available for this subscription checkout.</p>
      ) : null}

      <div className="purchase-pricing-summary">
        <div className="purchase-pricing-row purchase-pricing-row-payable">
          <span className="body-compact">Payable amount:</span>
          <span className="body-compact">
            {state.discountAmountUsd > 0 ? (
              <>
                <span style={{ color: "#9CA0A7", textDecoration: "line-through" }}>
                  {formatUsd(product.priceUsd)}
                </span>{" "}
                {formatUsd(state.finalAmountUsd)}
              </>
            ) : (
              formatUsd(state.finalAmountUsd)
            )}
          </span>
        </div>

      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="form-label">Payment Options</legend>
        <div className="payment-option-grid">
          {paymentOptions.map((option) => {
            const optionDisabled =
              option.value === "crypto"
                ? !cryptoConfigured
                : !paymentsConfigured;
            const isSelected = state.paymentProvider === option.value;

            return (
            <label
              key={option.value}
              className={`payment-option-card${isSelected ? " payment-option-selected" : ""}${optionDisabled ? " payment-option-disabled" : ""}`}
            >
              <input
                type="radio"
                name={`${product.id}-payment`}
                value={option.value}
                checked={isSelected}
                disabled={optionDisabled}
                onChange={() =>
                  setState((current) => ({
                    ...current,
                    paymentProvider: option.value,
                    statusMessage: "",
                  }))
                }
                className="sr-only"
              />
              <span className="payment-option-radio">
                {isSelected && <span className="payment-option-radio-dot" />}
              </span>
              {option.label}
            </label>
            );
          })}
        </div>
      </fieldset>

      <label className="body-compact purchase-terms-row">
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
            accentColor: "#B8914A",
            alignSelf: "flex-start",
            flex: "0 0 auto",
          }}
        />
        <span>
          I have read the risk disclaimer and agree to the{" "}
          <a
            href="/terms#ai-trading-software-agents-risk-disclaimer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#D8CBA6", textDecoration: "underline" }}
          >
            Terms & Conditions
          </a>
          {" "}and{" "}
          <a
            href="/refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#D8CBA6", textDecoration: "underline" }}
          >
            Cancellation and Refund Policy
          </a>
          .
        </span>
      </label>

      {state.couponMessage || blockingMessage || state.statusMessage ? (
        <div className="purchase-message-stack" aria-live="polite">
          {state.couponMessage ? (
            <p className="body-compact">{state.couponMessage}</p>
          ) : null}

          {blockingMessage ? (
            <p className="body-compact" style={{ color: "#F59E0B" }}>
              {blockingMessage}
            </p>
          ) : null}

          {state.statusMessage ? (
            <p
              className="body-compact"
              style={{ color: getStatusColor(state.statusTone) }}
            >
              {state.statusMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button type="button" variant="primary" disabled={buyDisabled} onClick={buyNow}>
        {buyButtonLabel}
      </Button>
      {paymentFlowState === "verifying-payment" ? (
        <RazorpayVerificationOverlay />
      ) : null}
      {successDialog ? (
        <PaymentResultDialog
          dialog={successDialog}
          titleId="product-payment-success-title"
          messageId="product-payment-success-message"
          onDone={closeSuccessDialog}
        />
      ) : null}
      {failureDialog ? (
        <PaymentResultDialog
          dialog={failureDialog}
          titleId="product-payment-failure-title"
          messageId="product-payment-failure-message"
          buttonLabel="Close"
          onDone={closeFailureDialog}
        />
      ) : null}
    </div>
  );
}

export function useAgentPurchaseState(product: TradingAgentProduct, selectedPlan?: AgentSubscriptionPlan) {
  return useState<PurchaseState>(() => createInitialState(product, selectedPlan));
}

function AgentSubscriptionCtaCard({ product }: { product: TradingAgentProduct }) {
  return (
    <div className="purchase-stack astro-gold-cta-stack">
      <div className="purchase-panel-header">
        <h2 className="card-title">Subscription access for {product.name}</h2>
        <p className="product-price">From {formatUsd(product.priceUsd)}</p>
      </div>
      <p className="body-compact">
        Choose a demo or live-evaluation subscription term before checkout.
      </p>
      <Button href={`/ai-trading-agents/${product.slug}/plans`} variant="primary">
        View Plans
      </Button>
    </div>
  );
}

export default function AgentPurchaseCard({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
}) {
  const [state, setState] = useAgentPurchaseState(product);

  if (isSubscriptionAgentSlug(product.slug)) {
    return (
      <aside id="purchase" className="purchase-card desktop-purchase-card">
        <AgentSubscriptionCtaCard product={product} />
      </aside>
    );
  }

  return (
    <aside id="purchase" className="purchase-card desktop-purchase-card">
      <AgentPurchaseForm
        product={product}
        paymentsConfigured={paymentsConfigured}
        cryptoPaymentConfig={cryptoPaymentConfig}

        state={state}
        setState={setState}
      />
    </aside>
  );
}

export function AgentCheckoutPaymentPanel({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
  selectedPlan,
}: {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
  selectedPlan: AgentSubscriptionPlan;
}) {
  const [state, setState] = useAgentPurchaseState(product, selectedPlan);

  return (
    <aside id="purchase" className="purchase-card">
      <AgentPurchaseForm
        product={product}
        paymentsConfigured={paymentsConfigured}
        cryptoPaymentConfig={cryptoPaymentConfig}
        selectedPlan={selectedPlan}
        state={state}
        setState={setState}
      />
    </aside>
  );
}
