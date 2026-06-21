"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

type ExpertBookingEnquiryFormProps = {
  expertName: string;
  expertSlug: string;
  disabled?: boolean;
};

export default function ExpertBookingEnquiryForm({
  expertName,
  expertSlug,
  disabled = false,
}: ExpertBookingEnquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  async function submitEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          emailAddress,
          enquiryType: "expert_booking",
          expertSlug,
          website: "",
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Your booking enquiry could not be sent.");
      }

      setFullName("");
      setEmailAddress("");
      setStatus({
        type: "success",
        message:
          "Your booking enquiry has been received. The Vyntegra team will contact you soon.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your booking enquiry could not be sent.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="booking-enquiry" className="expert-booking-enquiry" aria-labelledby="booking-enquiry-heading">
      <div className="expert-booking-enquiry-heading">
        <p className="eyebrow">Talk to {expertName}</p>
        <h2 id="booking-enquiry-heading" className="card-title">Request a consultation</h2>
        <p className="body-compact">Share your details and the Vyntegra team will contact you soon about availability and next steps.</p>
      </div>

      <div className="expert-enquiry-price-list" aria-label="Consultation pricing">
        <div><span>30 minutes</span><strong>$49</strong></div>
        <div><span>1 hour</span><strong>$79</strong></div>
      </div>

      <form className="expert-enquiry-form" onSubmit={submitEnquiry}>
        <div>
          <label className="form-label" htmlFor={`expert-enquiry-name-${expertSlug}`}>Full name</label>
          <input
            id={`expert-enquiry-name-${expertSlug}`}
            className="form-control"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            required
            disabled={disabled || sending}
          />
        </div>
        <div>
          <label className="form-label" htmlFor={`expert-enquiry-email-${expertSlug}`}>Email</label>
          <input
            id={`expert-enquiry-email-${expertSlug}`}
            className="form-control"
            type="email"
            value={emailAddress}
            onChange={(event) => setEmailAddress(event.target.value)}
            placeholder="you@example.com"
            required
            disabled={disabled || sending}
          />
        </div>
        {status ? (
          <p className={`expert-enquiry-status expert-enquiry-status-${status.type}`} role="status">
            {status.type === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}
            <span>{status.message}</span>
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={disabled || sending}>
          {sending ? "Sending enquiry..." : "Request Consultation"}
        </Button>
      </form>
    </section>
  );
}
