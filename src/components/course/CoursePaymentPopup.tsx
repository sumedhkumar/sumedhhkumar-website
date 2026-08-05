"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, Tag, Ticket, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { algoTradingCourse } from "@/data/algo-trading-course";

type CoursePaymentPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CoursePaymentPopup({ isOpen, onClose }: CoursePaymentPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset state when opened
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError("");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === "LAUNCH25" || code === "VYNTEGRA") {
      setAppliedCoupon(code);
      setCouponInput("");
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        padding: "1rem",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={popupRef}
        style={{
          backgroundColor: "#FDFCF8", // Premium light off-white
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8F6F0 100%)",
          borderRadius: "var(--radius-card, 12px)",
          border: "1px solid rgba(184, 145, 74, 0.4)", // Softer gold border for light theme
          boxShadow: "0 0 50px rgba(184, 145, 74, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxWidth: "460px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          marginTop: "6vh", // Shift the box down a bit
        }}
      >
        {/* Decorative Top Glow */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, var(--accent-gold), transparent)", opacity: 0.9 }} />
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100px", background: "radial-gradient(ellipse at top, rgba(184, 145, 74, 0.1), transparent 70%)", pointerEvents: "none" }} />

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#6F747C",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "color 0.2s, background 0.2s",
            zIndex: 10,
          }}
          aria-label="Close popup"
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111319"; e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6F747C"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div style={{ padding: "24px 32px 20px", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.7rem",
              fontWeight: 700,
              color: "#111319", // Dark text for contrast
              marginBottom: "4px",
              textAlign: "center",
            }}
          >
            Unlock Full Access
          </h2>
          <p style={{ color: "#4A4D55", marginBottom: "16px", fontSize: "0.95rem", textAlign: "center", lineHeight: 1.5 }}>
            Join the masterclass to get lifetime access to all lectures, live weekend sessions, and our premium community.
          </p>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(184, 145, 74, 0.25)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Price Display */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#6F747C", fontSize: "0.95rem", fontWeight: 500 }}>Total</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                {appliedCoupon ? (
                  <>
                    <span style={{ fontSize: "1.1rem", textDecoration: "line-through", color: "#9CA0A7", fontWeight: 500 }}>
                      {algoTradingCourse.pricing.valueLabel}
                    </span>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "#111319", letterSpacing: "-0.5px" }}>
                      {algoTradingCourse.pricing.launchOfferLabel}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#111319", letterSpacing: "-0.5px" }}>
                    {algoTradingCourse.pricing.valueLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "0 0 12px 0" }} />

            {/* Coupon Section */}
            {appliedCoupon ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(53, 196, 134, 0.08)", border: "1px solid rgba(53, 196, 134, 0.25)", borderRadius: "6px", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#259865", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Tag size={15} aria-hidden="true" />
                  <span>Coupon <strong style={{ color: "#1B734C" }}>{appliedCoupon}</strong> applied</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ background: "none", border: "none", color: "#6F747C", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA0A7", pointerEvents: "none" }}>
                      <Ticket size={16} />
                    </div>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      style={{
                        width: "100%",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                        padding: "10px 12px 10px 36px",
                        color: "#111319",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        outline: "none",
                        transition: "border-color 0.2s, background-color 0.2s"
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--accent-gold)"; e.target.style.backgroundColor = "#FFFFFF"; }}
                      onBlur={(e) => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.backgroundColor = "#FAFAFA"; }}
                    />
                  </div>
                  <Button variant="primary" onClick={handleApplyCoupon} style={{ padding: "0 18px" }}>
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p style={{ color: "#DF4946", fontSize: "0.85rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                    <X size={14} /> {couponError}
                  </p>
                )}
                
                {/* Available Coupons */}
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontSize: "0.85rem", color: "#6F747C", fontWeight: 600, marginBottom: "8px" }}>Available Coupons</p>
                  <div 
                    onClick={() => { 
                      setAppliedCoupon("LAUNCH25");
                      setCouponInput("");
                      setCouponError("");
                    }}
                    style={{ 
                      display: "flex", alignItems: "center", justifyContent: "space-between", 
                      padding: "10px 12px", borderRadius: "6px", border: "1px dashed rgba(184, 145, 74, 0.4)", 
                      cursor: "pointer", backgroundColor: "#FCFAF5", transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9F6ED"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FCFAF5"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Tag size={15} color="#B8914A" />
                      <div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111319", display: "block" }}>LAUNCH25</span>
                        <span style={{ fontSize: "0.75rem", color: "#6F747C", marginTop: "2px", display: "block" }}>Save big on the full program</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#B8914A" }}>Apply</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Button
              href={algoTradingCourse.links.paymentLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              style={{ width: "100%", justifyContent: "center", padding: "16px 0", fontSize: "1.1rem", fontWeight: 600, boxShadow: "0 4px 14px rgba(184, 145, 74, 0.3)" }}
            >
              Proceed to Payment
            </Button>
            
            <Button
              href={algoTradingCourse.links.whatsappGroupUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: "1rem", fontWeight: 600 }}
            >
              <MessageCircle size={18} aria-hidden="true" />
              Join WhatsApp Community
            </Button>
          </div>

          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#6F747C", fontSize: "0.85rem", fontWeight: 500 }}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Secure payment powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
