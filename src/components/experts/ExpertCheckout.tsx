"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import type { CalComSlot, Expert, ExpertSession } from "@/types";
import Button from "@/components/ui/Button";

type CheckoutPhase = "idle" | "creating" | "verifying";

type ExchangeRateResponse = {
  success?: boolean;
  rate?: number;
  source?: string;
  fetchedAt?: string;
  effectiveDateIst?: string;
  message?: string;
};

type CreateExpertOrderResponse = {
  key?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  purchaseName?: string;
  discountUsd?: number;
  finalPriceUsd?: number;
  finalPriceInr?: number;
  usdToInrRate?: number;
  usdToInrRateSource?: string;
  usdToInrRateFetchedAt?: string;
  usdToInrEffectiveDateIst?: string;
  appliedCoupon?: string;
  message?: string;
};

type VerifyExpertPaymentResponse = {
  success?: boolean;
  bookingConfirmed?: boolean;
  fallbackBookingLinkSent?: boolean;
  supportFollowupRequired?: boolean;
  message?: string;
};

type SlotsResponse = {
  success?: boolean;
  slots?: CalComSlot[];
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

const checkoutScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
const LOOKAHEAD_DAYS = 60;
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

const refundPolicy = `Booking and refund policy

30-minute expert sessions are confirmed only after successful Razorpay payment and successful booking creation. Live available slots are shown before payment wherever Cal.com availability is available.

If Vyntegra cannot confirm or deliver your paid consultation, we will offer a replacement slot. If a mutually acceptable replacement slot cannot be arranged, the consultation payment will be refunded.

Customer no-show, late arrival, or voluntary cancellation close to the session time may not be eligible for refund unless Vyntegra decides otherwise. Refunds, where approved, are processed to the original payment method as per payment gateway and banking timelines.`;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatInr(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatIstTimestamp(value?: string) {
  if (!value) {
    return "Loading";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })
    .format(date)
    .replace(",", "")
    .replace(/\s/g, " ");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    script.onerror = () => reject(new Error("Razorpay Checkout could not be loaded."));

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

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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
  availMap: Map<string, CalComSlot[]>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: React.ReactNode[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(<div key={`blank-${index}`} className="cal-cell cal-cell-empty" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const slots = availMap.get(dateKey(date)) ?? [];
    const hasSlots = slots.length > 0;
    const isPast = date <= today;
    const isSelected = selectedDate !== null && isSameDay(date, selectedDate);
    const isToday = isSameDay(date, today);

    let className = "cal-cell cal-cell-day";
    if (isPast) className += " cal-cell-past";
    else if (hasSlots) className += " cal-cell-available";
    else className += " cal-cell-unavailable";
    if (isSelected) className += " cal-cell-selected";
    if (isToday) className += " cal-cell-today";

    cells.push(
      <button
        key={day}
        type="button"
        className={className}
        disabled={isPast || !hasSlots}
        onClick={() => onSelectDate(date)}
        aria-label={`${day} ${MONTH_NAMES[month]}, ${hasSlots ? `${slots.length} slots available` : "no slots"}`}
        aria-pressed={isSelected}
      >
        <span className="cal-day-num">{day}</span>
        {hasSlots && !isPast ? (
          <span className="cal-dot-row">
            {slots.slice(0, 4).map((slot) => (
              <span key={slot.startUtc} className="cal-avail-dot" />
            ))}
          </span>
        ) : null}
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
        {WEEKDAY_NAMES.map((weekday) => (
          <span key={weekday} className="cal-weekday-label">
            {weekday}
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
  slots: CalComSlot[];
  selectedSlot: CalComSlot | null;
  onSelectSlot: (slot: CalComSlot) => void;
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
        {slots.map((slot) => {
          const selected = selectedSlot?.startUtc === slot.startUtc;
          return (
            <button
              key={slot.startUtc}
              type="button"
              className={`slot-chip${selected ? " slot-chip-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onSelectSlot(slot)}
            >
              <Clock size={14} strokeWidth={1.5} />
              <span>{slot.timeLabel}</span>
              <small>IST</small>
              {selected ? (
                <CheckCircle2
                  className="slot-chip-check"
                  size={16}
                  strokeWidth={2}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExpertCheckout({
  expert,
  paymentsConfigured,
}: {
  expert: Expert;
  paymentsConfigured: boolean;
}) {
  const sessions = expert.sessions.filter(
    (session) => session.active && session.durationMinutes === 30,
  );
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalComSlot | null>(null);
  const [slots, setSlots] = useState<CalComSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountAmountUsd, setDiscountAmountUsd] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeFetchedAt, setExchangeFetchedAt] = useState("");
  const [exchangeEffectiveDateIst, setExchangeEffectiveDateIst] = useState("");
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const checkoutCompletedRef = useRef(false);

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const originalFee = selectedSession?.feeUsd ?? 0;
  const finalAmountUsd = Math.max(0, originalFee - discountAmountUsd);
  const finalAmountInr =
    exchangeRate !== null ? Number((finalAmountUsd * exchangeRate).toFixed(2)) : null;
  const customerNameValue = customerName.trim();
  const customerEmailValue = customerEmail.trim();
  const customerDetailsReady = Boolean(
    customerNameValue &&
      isValidEmail(customerEmailValue),
  );
  const paymentReady = Boolean(
    paymentsConfigured &&
      selectedSession &&
      selectedSlot &&
      customerDetailsReady &&
      checkoutPhase === "idle",
  );
  const currentStep = !selectedSessionId ? 1 : !selectedDate ? 2 : !selectedSlot ? 3 : 4;

  const availMap = useMemo(() => {
    const map = new Map<string, CalComSlot[]>();
    for (const slot of slots) {
      const existing = map.get(slot.dateKey) ?? [];
      existing.push(slot);
      map.set(slot.dateKey, existing);
    }
    return map;
  }, [slots]);

  const slotsForDate = selectedDate
    ? availMap.get(dateKey(selectedDate)) ?? []
    : [];

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

  const goNextMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  }, []);

  const goPrevMonth = useCallback(() => {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  }, []);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  useEffect(() => {
    let cancelled = false;

    async function loadExchangeRate() {
      try {
        const response = await fetch("/api/exchange-rates/usd-inr");
        const result = await readJsonResponse<ExchangeRateResponse>(response);

        if (!cancelled && result.success && typeof result.rate === "number") {
          setExchangeRate(result.rate);
          setExchangeFetchedAt(result.fetchedAt ?? "");
          setExchangeEffectiveDateIst(result.effectiveDateIst ?? "");
        }
      } catch {
        if (!cancelled) {
          setExchangeRate(null);
        }
      }
    }

    void loadExchangeRate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError("");

      try {
        const start = dateKey(addDays(today, 1));
        const end = dateKey(addDays(today, LOOKAHEAD_DAYS));
        const response = await fetch(
          `/api/experts/${expert.id}/calcom-slots?${new URLSearchParams({
            start,
            end,
          }).toString()}`,
        );
        const result = await readJsonResponse<SlotsResponse>(response);

        if (!cancelled) {
          setSlots(result.slots ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(
            error instanceof Error
              ? error.message
              : "Live booking availability could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [expert.id, today]);

  function setStatus(message: string, tone: "info" | "success" | "error" = "info") {
    setStatusMessage(message);
    setStatusTone(tone);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStatusMessage("");
  }

  async function applyCoupon() {
    if (!selectedSession) {
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          amountUsd: originalFee,
          targetType: "expert",
          expertId: expert.id,
          sessionId: selectedSession.id,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        discountAmountUsd?: number;
      };

      setCouponMessage(result.message ?? "Coupon code is invalid or inactive.");
      setDiscountAmountUsd(result.discountAmountUsd ?? 0);
    } catch {
      setCouponMessage("Coupon code could not be checked. Please try again.");
      setDiscountAmountUsd(0);
    }
  }

  async function verifyRazorpayPayment(response: RazorpayCheckoutResponse) {
    checkoutCompletedRef.current = true;
    setCheckoutPhase("verifying");
    setStatus("Verifying payment with Vyntegra backend...");

    try {
      const verificationResponse = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
      const verificationResult =
        await readJsonResponse<VerifyExpertPaymentResponse>(verificationResponse);

      if (!verificationResult.success) {
        throw new Error("Payment verification failed.");
      }

      if (verificationResult.bookingConfirmed) {
        setStatus(
          "Payment successful. Your expert session has been booked. Confirmation details have been sent by email.",
          "success",
        );
      } else if (verificationResult.fallbackBookingLinkSent) {
        setStatus(
          "Payment successful. We could not auto-confirm the selected slot, so a private booking link has been emailed to you. You can also contact support@vyntegra.in.",
          "success",
        );
      } else {
        setStatus(
          "Payment successful. Vyntegra support will contact you to arrange the expert session or process a refund if needed.",
          "success",
        );
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Payment verification failed.",
        "error",
      );
    } finally {
      setCheckoutPhase("idle");
    }
  }

  async function startRazorpayCheckout() {
    if (!selectedSession || !selectedSlot) {
      setStatus("Select a live available slot before making payment.", "error");
      return;
    }

    if (!customerDetailsReady) {
      setStatus(
        "Enter your full name and valid email before payment.",
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

      setStatus("Creating secure Razorpay order...");
      const trimmedCouponCode = couponCode.trim();
      const orderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "expert",
          expertId: expert.id,
          slug: expert.slug,
          sessionId: selectedSession.id,
          slotStartUtc: selectedSlot.startUtc,
          customerName: customerNameValue,
          customerEmail: customerEmailValue,
          ...(trimmedCouponCode ? { couponCode: trimmedCouponCode } : {}),
        }),
      });
      const order = await readJsonResponse<CreateExpertOrderResponse>(orderResponse);

      if (
        !order.key ||
        !order.orderId ||
        !order.amount ||
        !order.currency ||
        !order.purchaseName
      ) {
        throw new Error("Payment order response is incomplete.");
      }

      if (typeof order.discountUsd === "number") {
        setDiscountAmountUsd(order.discountUsd);
      }

      if (order.appliedCoupon) {
        setCouponMessage("Coupon applied.");
      }

      if (typeof order.usdToInrRate === "number") {
        setExchangeRate(order.usdToInrRate);
      }

      setExchangeFetchedAt(order.usdToInrRateFetchedAt ?? exchangeFetchedAt);
      setExchangeEffectiveDateIst(
        order.usdToInrEffectiveDateIst ?? exchangeEffectiveDateIst,
      );

      const checkout = new Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Vyntegra",
        description: order.purchaseName,
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

  return (
    <div className="checkout-card checkout-card-v2">
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

      <div className="booking-steps-bar">
        <StepIndicator step={1} currentStep={currentStep} label="Session" />
        <span className="booking-step-line" />
        <StepIndicator step={2} currentStep={currentStep} label="Date" />
        <span className="booking-step-line" />
        <StepIndicator step={3} currentStep={currentStep} label="Time" />
        <span className="booking-step-line" />
        <StepIndicator step={4} currentStep={currentStep} label="Payment" />
      </div>

      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">1</span>
          Choose a Session
        </legend>
        <div className="session-option-grid">
          {sessions.map((session: ExpertSession) => {
            const selected = selectedSessionId === session.id;
            return (
              <label
                key={session.id}
                className={`session-option-card${selected ? " session-option-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="session"
                  value={session.id}
                  checked={selected}
                  onChange={() => {
                    setSelectedSessionId(session.id);
                    setSelectedSlot(null);
                    setDiscountAmountUsd(0);
                    setCouponMessage("");
                    setStatusMessage("");
                  }}
                  className="sr-only"
                />
                <span className="session-option-radio">
                  {selected ? <span className="session-option-radio-dot" /> : null}
                </span>
                <div className="session-option-body">
                  <strong>{session.label}</strong>
                  <span className="session-option-meta">
                    <Clock size={13} strokeWidth={1.5} />
                    {session.durationMinutes} minutes
                  </span>
                </div>
                <span className="session-option-price">{formatUsd(session.feeUsd)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">2</span>
          Pick a Date
        </legend>
        <p className="body-compact" style={{ marginBottom: 14 }}>
          Live available slots are loaded from Cal.com and shown in IST.
        </p>
        {slotsLoading ? (
          <p className="body-compact" style={{ color: "#F59E0B" }}>
            Loading live availability...
          </p>
        ) : slotsError ? (
          <p className="body-compact" style={{ color: "#FCA5A5" }}>
            {slotsError}
          </p>
        ) : (
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
        )}
      </fieldset>

      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">3</span>
          Select a Time Slot
        </legend>

        {selectedDate && slotsForDate.length > 0 ? (
          <TimeSlotPicker
            slots={slotsForDate}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setStatusMessage("");
            }}
            dateLabel={dateFormatter.format(selectedDate)}
          />
        ) : (
          <p className="body-compact" style={{ color: "#9CA0A7" }}>
            {selectedDate
              ? "No Cal.com slots are available on this date."
              : "Pick an available date first to see Cal.com time slots."}
          </p>
        )}

        {selectedSlot ? (
          <div className="booking-confirm-badge">
            <CheckCircle2 size={18} strokeWidth={2} />
            <span>
              <strong>{selectedSlot.displayLabel}</strong> - pending Razorpay
              payment and booking confirmation
            </span>
          </div>
        ) : null}
      </fieldset>

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
            onChange={(event) => setCouponCode(event.target.value)}
            className="form-control"
          />
          <Button type="button" variant="secondary" onClick={applyCoupon}>
            Apply
          </Button>
        </div>
        {couponMessage ? (
          <p className="body-compact" style={{ marginTop: 8 }}>
            {couponMessage}
          </p>
        ) : null}
      </div>

      <div className="pricing-summary-card">
        <div className="pricing-row pricing-row-total">
          <span>Payable amount:</span>
          <span>
            {discountAmountUsd > 0 ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#9CA0A7" }}>
                  {formatUsd(originalFee)}
                </span>{" "}
                {formatUsd(finalAmountUsd)}
              </>
            ) : (
              formatUsd(finalAmountUsd)
            )}
          </span>
        </div>
        <div className="pricing-row">
          <span>USD to INR conversion:</span>
          <span>
            {exchangeRate !== null ? `${formatInr(exchangeRate, 4)} / USD` : "Loading"}
          </span>
        </div>
        <div className="pricing-row">
          <span>Conversion timestamp:</span>
          <span>{formatIstTimestamp(exchangeFetchedAt || exchangeEffectiveDateIst)}</span>
        </div>
        <div className="pricing-row pricing-row-total">
          <span>Razorpay payable amount:</span>
          <span>{finalAmountInr !== null ? formatInr(finalAmountInr) : "Loading"}</span>
        </div>
      </div>

      <fieldset className="booking-section">
        <legend className="booking-section-legend">
          <span className="booking-section-num">4</span>
          Payment
        </legend>
        <p className="body-compact" style={{ marginBottom: 12 }}>
          Razorpay is the only payment method for Talk to Expert sessions.
        </p>
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
        </div>
      </fieldset>

      <div className="booking-section booking-section-divider">
        <h2 className="card-title" style={{ fontSize: 18 }}>
          Booking and refund policy
        </h2>
        <p className="body-compact" style={{ marginTop: 10, whiteSpace: "pre-line" }}>
          {refundPolicy}
        </p>
      </div>

      {!paymentsConfigured ? (
        <p className="body-compact" style={{ color: "#F59E0B" }}>
          Razorpay payment configuration is pending.
        </p>
      ) : null}

      {statusMessage ? (
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
      ) : null}

      <Button
        type="button"
        variant="primary"
        disabled={!paymentReady}
        onClick={startRazorpayCheckout}
      >
        {checkoutPhase === "idle"
          ? "Pay with Razorpay"
          : checkoutPhase === "creating"
            ? "Creating order..."
            : "Verifying payment..."}
      </Button>
    </div>
  );
}
