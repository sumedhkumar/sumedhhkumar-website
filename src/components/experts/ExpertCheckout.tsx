"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type {
  CryptoPaymentConfig,
  Expert,
  ExpertSession,
  PaymentProvider,
} from "@/types";
import Button from "@/components/ui/Button";

/* ───────────────────────── constants ───────────────────────── */

const paymentOptions: { value: PaymentProvider; label: string }[] = [
  { value: "razorpay", label: "Pay with Razorpay" },
  { value: "stripe", label: "Pay with Stripe" },
  { value: "crypto", label: "Pay with Crypto" },
];

type CheckoutPhase = "idle" | "creating" | "verifying";

type CreateExpertOrderResponse = {
  key?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  purchaseName?: string;
  discountUsd?: number;
  finalPriceUsd?: number;
  appliedCoupon?: string;
  message?: string;
};

type VerifyExpertPaymentResponse = {
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

type RazorpayWindow = Window & {
  Razorpay?: RazorpayConstructor;
};

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

/** Availability windows and booking buffers are measured in minutes after midnight. */
const SLOT_INTERVAL_MINUTES = 15;
const BOOKING_BUFFER_MINUTES = 15;
const BOOKING_LOOKAHEAD_DAYS = 60;

const availabilityWindows = {
  weekday: {
    startMinutes: 18 * 60,
    endMinutes: 22 * 60,
  },
  weekend: {
    startMinutes: 12 * 60,
    endMinutes: 20 * 60,
  },
};

type BookedSlot = {
  expertId: string;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
};

// Replace this with persisted confirmed bookings when booking storage is enabled.
const confirmedBookings: BookedSlot[] = [];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ───────────────────── helpers ───────────────────── */

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

function isValidPhone(value: string) {
  return /^[+]?[0-9]{7,15}$/.test(value);
}

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

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesToTimeLabel(minutes: number) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}

function formatSlotRange(startMinutes: number, durationMinutes: number) {
  return `${minutesToTimeLabel(startMinutes)} - ${minutesToTimeLabel(startMinutes + durationMinutes)}`;
}

function getAvailabilityWindow(day: number) {
  return day === 0 || day === 6
    ? availabilityWindows.weekend
    : availabilityWindows.weekday;
}

function isBlockedByBookedSlot(
  dateKeyValue: string,
  expertId: string,
  slotStartMinutes: number,
  slotEndMinutes: number,
) {
  return confirmedBookings.some((booking) => {
    if (booking.expertId !== expertId || booking.dateKey !== dateKeyValue) {
      return false;
    }

    const blockedStart = booking.startMinutes - BOOKING_BUFFER_MINUTES;
    const blockedEnd = booking.endMinutes + BOOKING_BUFFER_MINUTES;

    return slotStartMinutes < blockedEnd && slotEndMinutes > blockedStart;
  });
}

function buildSlotsForDate(
  d: Date,
  expertId: string,
  durationMinutes: number,
) {
  const window = getAvailabilityWindow(d.getDay());
  const key = dateKey(d);
  const slots: string[] = [];

  for (
    let startMinutes = window.startMinutes;
    startMinutes + durationMinutes <= window.endMinutes;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = startMinutes + durationMinutes;

    if (!isBlockedByBookedSlot(key, expertId, startMinutes, endMinutes)) {
      slots.push(formatSlotRange(startMinutes, durationMinutes));
    }
  }

  return slots;
}

function buildAvailabilityMap(
  expertId: string,
  durationMinutes: number,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const today = new Date();
  for (let offset = 1; offset <= BOOKING_LOOKAHEAD_DAYS; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);

    const slots = buildSlotsForDate(d, expertId, durationMinutes);
    if (slots.length > 0) {
      map.set(dateKey(d), slots);
    }
  }
  return map;
}

/* ───────────────────── sub‑components ───────────────────── */

function StepIndicator({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const done = currentStep > step;
  const active = currentStep === step;
  return (
    <div
      className={`booking-step-item${active ? " booking-step-active" : ""}${done ? " booking-step-done" : ""}`}
    >
      <span className="booking-step-number">
        {done ? <CheckCircle2 size={16} strokeWidth={2} /> : step}
      </span>
      <span className="booking-step-label">{label}</span>
    </div>
  );
}

function CalendarMonth({
  year,
  month,
  availMap,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
  canPrev,
}: {
  year: number;
  month: number;
  availMap: Map<string, string[]>;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: React.ReactNode[] = [];

  // leading blanks
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`blank-${i}`} className="cal-cell cal-cell-empty" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = dateKey(d);
    const slots = availMap.get(key);
    const hasSlots = slots !== undefined && slots.length > 0;
    const isPast = d <= today;
    const isSelected = selectedDate !== null && isSameDay(d, selectedDate);
    const isToday = isSameDay(d, today);

    let cls = "cal-cell cal-cell-day";
    if (isPast) cls += " cal-cell-past";
    else if (hasSlots) cls += " cal-cell-available";
    else cls += " cal-cell-unavailable";
    if (isSelected) cls += " cal-cell-selected";
    if (isToday) cls += " cal-cell-today";

    cells.push(
      <button
        key={day}
        type="button"
        className={cls}
        disabled={isPast || !hasSlots}
        onClick={() => onSelectDate(d)}
        aria-label={`${day} ${MONTH_NAMES[month]}, ${hasSlots ? `${slots.length} slots available` : "no slots"}`}
        aria-pressed={isSelected}
      >
        <span className="cal-day-num">{day}</span>
        {hasSlots && !isPast && (
          <span className="cal-dot-row">
            {slots.slice(0, 4).map((_, i) => (
              <span key={i} className="cal-avail-dot" />
            ))}
          </span>
        )}
      </button>,
    );
  }

  return (
    <div className="cal-month-wrapper">
      <div className="cal-month-header">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <h3 className="cal-month-title">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={onNext}
          aria-label="Next month"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="cal-weekday-row">
        {WEEKDAY_NAMES.map((w) => (
          <span key={w} className="cal-weekday-label">
            {w}
          </span>
        ))}
      </div>
      <div className="cal-grid">{cells}</div>
      <div className="cal-legend">
        <span className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot-available" />
          Available
        </span>
        <span className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot-selected" />
          Selected
        </span>
        <span className="cal-legend-item">
          <span className="cal-legend-dot cal-legend-dot-unavail" />
          Unavailable
        </span>
      </div>
    </div>
  );
}

function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  dateLabel,
}: {
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  dateLabel: string;
}) {
  return (
    <div className="slot-picker-panel">
      <div className="slot-picker-header">
        <Clock size={16} strokeWidth={2} />
        <span>
          Available slots for <strong>{dateLabel}</strong>
        </span>
        <span className="slot-picker-count">{slots.length} open</span>
      </div>
      <div className="slot-picker-grid">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            className={`slot-chip${selectedSlot === slot ? " slot-chip-selected" : ""}`}
            aria-pressed={selectedSlot === slot}
            onClick={() => onSelectSlot(slot)}
          >
            <Clock size={14} strokeWidth={1.5} />
            <span>{slot}</span>
            <small>IST</small>
            {selectedSlot === slot && (
              <CheckCircle2
                className="slot-chip-check"
                size={16}
                strokeWidth={2}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── main component ─────────────────────── */

export default function ExpertCheckout({
  expert,
  paymentsConfigured,
  cryptoPaymentConfig,
}: {
  expert: Expert;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
}) {
  const sessions = expert.sessions.filter((s) => s.active);

  /* state */
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.id ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountAmountUsd, setDiscountAmountUsd] = useState(0);
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider>(
      !paymentsConfigured && cryptoPaymentConfig ? "crypto" : "razorpay",
    );
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("idle");
  const checkoutCompletedRef = useRef(false);

  /* calendar navigation */
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const goNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  /* derived */
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedDurationMinutes = selectedSession?.durationMinutes ?? 30;
  const availMap = buildAvailabilityMap(expert.id, selectedDurationMinutes);
  const slotsForDate = selectedDate
    ? (availMap.get(dateKey(selectedDate)) ?? [])
    : [];
  const originalFee = selectedSession?.feeUsd ?? 0;
  const finalAmount = Math.max(0, originalFee - discountAmountUsd);
  const cryptoConfigured = Boolean(cryptoPaymentConfig);
  const customerNameValue = customerName.trim();
  const customerEmailValue = customerEmail.trim();
  const customerPhoneValue = customerPhone.trim();
  const customerDetailsReady =
    paymentProvider === "crypto" ||
    Boolean(
      customerNameValue &&
        isValidEmail(customerEmailValue) &&
        isValidPhone(customerPhoneValue),
    );
  const selectedPaymentConfigured =
    paymentProvider === "crypto"
      ? cryptoConfigured
      : paymentProvider === "razorpay"
        ? paymentsConfigured
        : false;
  const paymentReady = Boolean(
    selectedPaymentConfigured &&
      selectedSession &&
      selectedDate &&
      selectedSlot &&
      customerDetailsReady &&
      checkoutPhase === "idle",
  );
  const currentStep = !selectedSessionId ? 1 : !selectedDate ? 2 : !selectedSlot ? 3 : 4;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }),
    [],
  );

  /* handlers */
  function handleSelectDate(d: Date) {
    setSelectedDate(d);
    setSelectedSlot("");
    setStatusMessage("");
  }

  async function applyCoupon() {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode,
        amountUsd: originalFee,
        targetType: "expert",
        expertId: expert.id,
        sessionId: selectedSessionId,
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      discountAmountUsd?: number;
    };

    setCouponMessage(result.message ?? "Coupon code is invalid or inactive.");
    setDiscountAmountUsd(result.discountAmountUsd ?? 0);
  }

  function setStatus(message: string, tone: "info" | "success" | "error" = "info") {
    setStatusMessage(message);
    setStatusTone(tone);
  }

  async function verifyRazorpayPayment(response: RazorpayCheckoutResponse) {
    if (!selectedSession || !selectedDate || !selectedSlot) {
      setStatus("Select an appointment slot before payment verification.", "error");
      setCheckoutPhase("idle");
      return;
    }

    checkoutCompletedRef.current = true;
    setCheckoutPhase("verifying");
    setStatus("Verifying payment with Vyntegra backend...");

    try {
      const trimmedCouponCode = couponCode.trim();
      const verificationResponse = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "expert",
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          expertId: expert.id,
          slug: expert.slug,
          sessionId: selectedSession.id,
          appointmentDate: dateKey(selectedDate),
          appointmentSlot: selectedSlot,
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          customerPhone: customerPhoneValue,
          ...(trimmedCouponCode ? { couponCode: trimmedCouponCode } : {}),
        }),
      });
      const verificationResult =
        await readJsonResponse<VerifyExpertPaymentResponse>(
          verificationResponse,
        );

      if (!verificationResult.success) {
        throw new Error("Payment verification failed.");
      }

      setStatus(
        "Payment verified successfully. Vyntegra will confirm your consultation booking by email after internal processing.",
        "success",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Payment verification failed.",
        "error",
      );
    } finally {
      setCheckoutPhase("idle");
    }
  }

  async function startRazorpayCheckout() {
    if (!selectedSession || !selectedDate || !selectedSlot) {
      setStatus("Select an appointment slot before making payment.", "error");
      return;
    }

    if (
      !customerNameValue ||
      !isValidEmail(customerEmailValue) ||
      !isValidPhone(customerPhoneValue)
    ) {
      setStatus(
        "Enter your full name, valid email, and valid phone number before payment.",
        "error",
      );
      return;
    }

    setCheckoutPhase("creating");
    checkoutCompletedRef.current = false;
    setStatus("Loading Razorpay Checkout...");

    try {
      await loadRazorpayScript();
      const Razorpay = getRazorpayConstructor();

      if (!Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const trimmedCouponCode = couponCode.trim();
      setStatus("Creating secure Razorpay order...");
      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "expert",
          expertId: expert.id,
          slug: expert.slug,
          sessionId: selectedSession.id,
          appointmentDate: dateKey(selectedDate),
          appointmentSlot: selectedSlot,
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          customerPhone: customerPhoneValue,
          ...(trimmedCouponCode ? { couponCode: trimmedCouponCode } : {}),
        }),
      });
      const order =
        await readJsonResponse<CreateExpertOrderResponse>(orderResponse);

      if (
        !order.key ||
        !order.orderId ||
        !order.amount ||
        !order.currency ||
        !order.productName
      ) {
        throw new Error("Payment order response is incomplete.");
      }

      if (typeof order.discountUsd === "number") {
        setDiscountAmountUsd(order.discountUsd);
      }

      if (order.appliedCoupon) {
        setCouponMessage("Coupon applied.");
      }

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
          contact: customerPhoneValue,
        },
        theme: {
          color: "#B8914A",
        },
        handler: (checkoutResponse) => {
          void verifyRazorpayPayment(checkoutResponse);
        },
        modal: {
          ondismiss: () => {
            if (!checkoutCompletedRef.current) {
              setCheckoutPhase("idle");
              setStatus("Payment window closed before completion.");
            }
          },
        },
      });

      checkout.on("payment.failed", () => {
        checkoutCompletedRef.current = true;
        setCheckoutPhase("idle");
        setStatus("Razorpay reported that the payment failed.", "error");
      });
      checkout.open();
      setStatus("Complete the payment in the Razorpay window.");
    } catch (error) {
      setCheckoutPhase("idle");
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to start Razorpay payment.",
        "error",
      );
    }
  }

  function continueToPayment() {
    if (!selectedSession || !selectedDate || !selectedSlot) {
      setStatus("Select an appointment slot before making payment.", "error");
      return;
    }

    if (paymentProvider === "crypto") {
      if (!cryptoConfigured) {
        setStatus("Crypto payment configuration is pending.", "error");
        return;
      }

      const params = new URLSearchParams({
        session: selectedSession.id,
        date: dateKey(selectedDate),
        slot: selectedSlot,
        amount: finalAmount.toFixed(2),
      });
      const trimmedCouponCode = couponCode.trim();

      if (trimmedCouponCode) {
        params.set("coupon", trimmedCouponCode);
      }

      window.location.assign(
        `/experts/${expert.slug}/crypto-payment?${params.toString()}`,
      );
      return;
    }

    if (paymentProvider === "razorpay") {
      void startRazorpayCheckout();
      return;
    }

    if (!paymentsConfigured) {
      setStatus("Online payment configuration is pending.", "error");
      return;
    }

    setStatus(
      "Payment gateway initiation is pending in this build. Your appointment is not confirmed until payment verification succeeds.",
    );
  }

  /* render */
  return (
    <div className="checkout-card checkout-card-v2">
      {/* ── heading ── */}
      <div className="checkout-header-v2">
        <div className="checkout-header-icon">
          <Sparkles size={22} strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="section-title" style={{ fontSize: 28 }}>
            Book a Consultation
          </h1>
          <p className="body-compact" style={{ marginTop: 4 }}>
            with <strong>{expert.fullName}</strong>
          </p>
        </div>
      </div>

      {/* ── step progress ── */}
      <div className="booking-steps-bar">
        <StepIndicator step={1} currentStep={currentStep} label="Session" />
        <span className="booking-step-line" />
        <StepIndicator step={2} currentStep={currentStep} label="Date" />
        <span className="booking-step-line" />
        <StepIndicator step={3} currentStep={currentStep} label="Time" />
        <span className="booking-step-line" />
        <StepIndicator step={4} currentStep={currentStep} label="Payment" />
      </div>

      {/* ── step 1: session ── */}
      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">1</span>
          Choose a Session
        </legend>
        <div className="session-option-grid">
          {sessions.map((session: ExpertSession) => {
            const isSelected = selectedSessionId === session.id;
            return (
              <label
                key={session.id}
                className={`session-option-card${isSelected ? " session-option-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="session"
                  value={session.id}
                  checked={isSelected}
                  onChange={() => {
                    setSelectedSessionId(session.id);
                    setSelectedSlot("");
                    setDiscountAmountUsd(0);
                    setCouponMessage("");
                    setStatusMessage("");
                  }}
                  className="sr-only"
                />
                <span className="session-option-radio">
                  {isSelected && <span className="session-option-radio-dot" />}
                </span>
                <div className="session-option-body">
                  <strong>{session.label}</strong>
                  <span className="session-option-meta">
                    <Clock size={13} strokeWidth={1.5} />
                    {session.durationMinutes} minutes
                  </span>
                </div>
                <span className="session-option-price">
                  {formatUsd(session.feeUsd)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ── step 2: date ── */}
      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">2</span>
          Pick a Date
        </legend>
        <p className="body-compact" style={{ marginBottom: 14 }}>
          Select from the calendar below. Dates with availability are
          highlighted.
        </p>
        <CalendarMonth
          year={viewYear}
          month={viewMonth}
          availMap={availMap}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
          canPrev={canGoPrev}
        />
      </fieldset>

      {/* ── step 3: time slot ── */}
      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">3</span>
          Select a Time Slot
        </legend>

        {selectedDate && slotsForDate.length > 0 ? (
          <TimeSlotPicker
            slots={slotsForDate}
            selectedSlot={selectedSlot}
            onSelectSlot={(s) => {
              setSelectedSlot(s);
              setStatusMessage("");
            }}
            dateLabel={dateFormatter.format(selectedDate)}
          />
        ) : (
          <p className="body-compact" style={{ color: "#9CA0A7" }}>
            {selectedDate
              ? "No slots available on this date."
              : "Pick a date first to see available time slots."}
          </p>
        )}

        {selectedSlot && selectedDate && (
          <div className="booking-confirm-badge">
            <CheckCircle2 size={18} strokeWidth={2} />
            <span>
              <strong>
                {dateFormatter.format(selectedDate)}, {selectedSlot} IST
              </strong>{" "}
              — pending payment confirmation
            </span>
          </div>
        )}
      </fieldset>

      {/* ── coupon ── */}
      <div className="booking-section booking-section-divider">
        <label className="form-label" htmlFor="expertCoupon">
          Coupon Code
        </label>
        <div className="coupon-input-row">
          <input
            id="expertCoupon"
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="form-control"
          />
          <Button type="button" variant="secondary" onClick={applyCoupon}>
            Apply
          </Button>
        </div>
        {couponMessage && (
          <p className="body-compact" style={{ marginTop: 8 }}>
            {couponMessage}
          </p>
        )}
      </div>

      {/* ── pricing summary ── */}
      <div className="pricing-summary-card">
        <div className="pricing-row">
          <span>Original Fee</span>
          <span>{formatUsd(originalFee)}</span>
        </div>
        <div className="pricing-row">
          <span>Discount</span>
          <span className="pricing-discount">
            {discountAmountUsd > 0 ? `−${formatUsd(discountAmountUsd)}` : formatUsd(0)}
          </span>
        </div>
        <div className="pricing-row pricing-row-total">
          <span>Total</span>
          <span>{formatUsd(finalAmount)}</span>
        </div>
      </div>

      {/* ── payment options ── */}
      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">4</span>
          Payment
        </legend>

        {!selectedSlot && (
          <p className="body-compact" style={{ color: "#9CA0A7", marginBottom: 10 }}>
            Complete steps 1–3 to unlock payment options.
          </p>
        )}

        <div className="payment-option-grid">
          {paymentOptions.map((option) => {
            const isSelected = paymentProvider === option.value;
            const optionDisabled =
              !selectedSlot ||
              (option.value === "crypto"
                ? !cryptoConfigured
                : option.value === "razorpay"
                  ? !paymentsConfigured
                  : true);
            return (
              <label
                key={option.value}
                className={`payment-option-card${isSelected ? " payment-option-selected" : ""}${optionDisabled ? " payment-option-disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="expertPaymentProvider"
                  value={option.value}
                  checked={isSelected}
                  disabled={optionDisabled}
                  onChange={() => {
                    setPaymentProvider(option.value);
                    setStatusMessage("");
                  }}
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

      {paymentProvider !== "crypto" ? (
        <div className="booking-section booking-section-divider">
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label className="form-label" htmlFor="expertCustomerName">
                Full name
              </label>
              <input
                id="expertCustomerName"
                type="text"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  setStatusMessage("");
                }}
                className="form-control"
                style={{ marginTop: 8 }}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="expertCustomerEmail">
                Email
              </label>
              <input
                id="expertCustomerEmail"
                type="email"
                placeholder="you@example.com"
                value={customerEmail}
                onChange={(event) => {
                  setCustomerEmail(event.target.value);
                  setStatusMessage("");
                }}
                className="form-control"
                style={{ marginTop: 8 }}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="expertCustomerPhone">
                Phone number
              </label>
              <input
                id="expertCustomerPhone"
                type="tel"
                placeholder="+91 9876543210"
                value={customerPhone}
                onChange={(event) => {
                  setCustomerPhone(event.target.value);
                  setStatusMessage("");
                }}
                className="form-control"
                style={{ marginTop: 8 }}
                required
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* ── status ── */}
      {!paymentsConfigured && (
        <p className="body-compact" style={{ color: "#F59E0B" }}>
          {cryptoConfigured
            ? "Stripe/Razorpay configuration is pending. Crypto payment is available."
            : "Online payment configuration is pending."}
        </p>
      )}

      {statusMessage && (
        <p
          className="body-compact"
          style={{
            color:
              statusTone === "success"
                ? "#86EFAC"
                : statusTone === "error"
                  ? "#FCA5A5"
                  : "#F59E0B",
          }}
        >
          {statusMessage}
        </p>
      )}

      {/* ── CTA ── */}
      <Button
        type="button"
        variant="primary"
        disabled={!paymentReady}
        onClick={continueToPayment}
      >
        {checkoutPhase === "idle"
          ? paymentProvider === "razorpay"
            ? "Pay with Razorpay"
            : paymentProvider === "crypto"
              ? "Continue to Crypto Payment"
              : "Continue to Payment"
          : checkoutPhase === "creating"
            ? "Creating order..."
            : "Verifying payment..."}
      </Button>
    </div>
  );
}
