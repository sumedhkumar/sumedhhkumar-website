"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { Expert, ExpertSession, PaymentProvider } from "@/types";
import Button from "@/components/ui/Button";

/* ───────────────────────── constants ───────────────────────── */

const paymentOptions: { value: PaymentProvider; label: string }[] = [
  { value: "razorpay", label: "Pay with Razorpay" },
  { value: "stripe", label: "Pay with Stripe" },
  { value: "crypto", label: "Pay with Crypto" },
];

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
}: {
  expert: Expert;
  paymentsConfigured: boolean;
}) {
  const sessions = expert.sessions.filter((s) => s.active);

  /* state */
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.id ?? "",
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountAmountUsd, setDiscountAmountUsd] = useState(0);
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider>("razorpay");
  const [statusMessage, setStatusMessage] = useState("");

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
  const availMap = useMemo(
    () => buildAvailabilityMap(expert.id, selectedDurationMinutes),
    [expert.id, selectedDurationMinutes],
  );
  const slotsForDate = selectedDate
    ? (availMap.get(dateKey(selectedDate)) ?? [])
    : [];
  const originalFee = selectedSession?.feeUsd ?? 0;
  const finalAmount = Math.max(0, originalFee - discountAmountUsd);
  const paymentReady = Boolean(
    paymentsConfigured && selectedSession && selectedSlot,
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

  function continueToPayment() {
    if (!selectedSlot) {
      setStatusMessage("Select an appointment slot before making payment.");
      return;
    }

    setStatusMessage(
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
            return (
              <label
                key={option.value}
                className={`payment-option-card${isSelected ? " payment-option-selected" : ""}${!paymentReady ? " payment-option-disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="expertPaymentProvider"
                  value={option.value}
                  checked={isSelected}
                  disabled={!paymentReady}
                  onChange={() => setPaymentProvider(option.value)}
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

      {/* ── status ── */}
      {!paymentsConfigured && (
        <p className="body-compact" style={{ color: "#F59E0B" }}>
          Online payment configuration is pending.
        </p>
      )}

      {statusMessage && (
        <p className="body-compact" style={{ color: "#F59E0B" }}>
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
        Continue to Payment
      </Button>
    </div>
  );
}
