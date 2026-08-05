"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert, Send } from "lucide-react";
import Button from "@/components/ui/Button";

type CourseQueryFormProps = {
  registrationEmail?: string;
  registrationFullName?: string;
};

export default function CourseQueryForm({
  registrationEmail = "",
  registrationFullName = "",
}: CourseQueryFormProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (message.trim().length < 10) {
      setStatus({
        type: "error",
        message: "Please write a message of at least 10 characters.",
      });
      return;
    }

    if (message.trim().length > 3000) {
      setStatus({
        type: "error",
        message: "Please keep your message within 3000 characters.",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registrationFullName || "Masterclass Student",
          emailAddress: registrationEmail,
          message: message,
          subject: "Algo Trading Course Query",
          enquiryType: "contact"
        }),
      });
      
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setStatus({
          type: "error",
          message: result.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setMessage("");
      setStatus({
        type: "success",
        message: "Your query has been sent! We will reply via email shortly.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={submitForm}
      noValidate
      className="algo-course-query-form"
      style={{ display: "grid", gap: "12px", width: "100%", marginTop: "8px" }}
    >
      <textarea
        required
        rows={4}
        placeholder="Type your message or query here..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="form-control"
        disabled={sending || status?.type === "success"}
        style={{ 
          resize: "none", 
          borderRadius: "8px", 
          padding: "12px",
          border: "1px solid #E4DDCF",
          fontSize: "14px",
          color: "#111319",
          backgroundColor: status?.type === "success" ? "#F9FAFB" : "#FFFFFF"
        }}
      />

      {status ? (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            color: status.type === "success" ? "#047857" : "#EF6F6C",
            backgroundColor: status.type === "success" ? "#F1F8F5" : "#FEF2F2",
            padding: "10px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500
          }}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} strokeWidth={2} style={{ marginTop: "2px" }} />
          ) : (
            <CircleAlert size={16} strokeWidth={2} style={{ marginTop: "2px" }} />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      {!status || status.type === "error" ? (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button 
            type="submit" 
            variant="secondary" 
            disabled={sending} 
            style={{ width: "fit-content" }}
          >
            {sending ? "Sending..." : (
              <>
                <Send size={15} aria-hidden="true" />
                Send Query
              </>
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
