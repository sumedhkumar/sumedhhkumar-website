"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { getPublicContactDetails } from "@/data/site";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import SectionIntro from "@/components/ui/SectionIntro";

type FormValues = {
  fullName: string;
  emailAddress: string;
  message: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  fullName: "",
  emailAddress: "",
  message: "",
  website: "",
};

function validate(values: FormValues) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!emailPattern.test(values.emailAddress.trim())) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Write your enquiry message.";
  }

  if (values.message.trim().length > 3000) {
    errors.message = "Keep your message within 3000 characters.";
  }

  return errors;
}

export default function Contact() {
  const contact = getPublicContactDetails();
  const hasContact = Boolean(contact.email || contact.phone);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please complete the required fields before submitting.",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        errors?: FormErrors;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setStatus({
          type: "error",
          message: result.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setValues(initialValues);
      setErrors({});
      setStatus({
        type: "success",
        message:
          "Your enquiry has been submitted. Vyntegra will get back to you soon.",
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
    <section id="contact" className="section section-bg-primary">
      <div className="container contact-grid">
        <div>
          <SectionIntro
            heading="Contact Vyntegra"
            copy="Reach out for agent purchases, expert consultations, custom software requirements, or general questions."
          />
          {hasContact ? (
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="body-standard">
                  {contact.email}
                </a>
              ) : null}
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="body-standard">
                  {contact.phone}
                </a>
              ) : null}
            </div>
          ) : (
            <p className="body-standard">Contact details will be added soon.</p>
          )}
        </div>

        <form
          onSubmit={submitForm}
          noValidate
          className="depth-panel contact-panel"
          style={{ padding: 28, display: "grid", gap: 16 }}
        >
          <input
            type="text"
            name="website"
            value={values.website}
            onChange={(event) => updateField("website", event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden="true"
          />

          <div>
            <label className="form-label" htmlFor="contactFullName">
              Full Name *
            </label>
            <input
              id="contactFullName"
              name="fullName"
              type="text"
              required
              placeholder="Enter your full name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="contactFullName-error"
            />
            <FieldError
              id="contactFullName-error"
              message={errors.fullName}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="contactEmailAddress">
              Email Address *
            </label>
            <input
              id="contactEmailAddress"
              name="emailAddress"
              type="email"
              required
              placeholder="Enter your email address"
              value={values.emailAddress}
              onChange={(event) =>
                updateField("emailAddress", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="contactEmailAddress-error"
            />
            <FieldError
              id="contactEmailAddress-error"
              message={errors.emailAddress}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="contactMessage">
              Message *
            </label>
            <textarea
              id="contactMessage"
              name="message"
              required
              rows={5}
              minLength={10}
              maxLength={3000}
              placeholder="Tell us how Vyntegra can help."
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="contactMessage-error"
            />
            <FieldError id="contactMessage-error" message={errors.message} />
          </div>

          {status ? (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                color: status.type === "success" ? "#35C486" : "#EF6F6C",
              }}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={20} strokeWidth={1.75} />
              ) : (
                <CircleAlert size={20} strokeWidth={1.75} />
              )}
              <p className="body-compact" style={{ color: "inherit" }}>
                {status.message}
              </p>
            </div>
          ) : null}

          <Button type="submit" variant="primary" disabled={sending}>
            {sending ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </form>
      </div>
    </section>
  );
}
