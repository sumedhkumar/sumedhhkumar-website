"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";

type FormValues = {
  fullName: string;
  emailAddress: string;
  whatsappNumber: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  fullName: "",
  emailAddress: "",
  whatsappNumber: "",
  website: "",
};

const storageKey = "vyntegra_algo_course_lead";

function validate(values: FormValues) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedWhatsapp = values.whatsappNumber.replace(/\s/g, "");

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!emailPattern.test(values.emailAddress.trim())) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (!values.whatsappNumber.trim()) {
    errors.whatsappNumber = "Enter your WhatsApp number.";
  } else if (normalizedWhatsapp.length < 8 || normalizedWhatsapp.length > 16) {
    errors.whatsappNumber = "Enter a reasonable WhatsApp number.";
  }

  return errors;
}

export default function AlgoTradingCourseLeadForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (values.website.trim()) {
      setValues(initialValues);
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please complete the required fields before continuing.",
      });
      return;
    }

    setSubmitting(true);

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          fullName: values.fullName.trim(),
          emailAddress: values.emailAddress.trim(),
          whatsappNumber: values.whatsappNumber.trim(),
          submittedAt: new Date().toISOString(),
        }),
      );

      setStatus({
        type: "success",
        message: "Free access details saved. Redirecting...",
      });
      window.location.assign(algoTradingCourse.accessRoute);
    } catch {
      setSubmitting(false);
      setStatus({
        type: "error",
        message:
          "Your browser could not save the free access details. Please enable storage and try again.",
      });
    }
  }

  return (
    <form
      className="depth-panel algo-course-form"
      onSubmit={submitForm}
      noValidate
    >
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={(event) => updateField("website", event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        hidden
        aria-hidden="true"
      />

      <div>
        <p className="eyebrow">Free Access</p>
        <h2 className="subsection-title">Register for the free preview</h2>
        <p className="body-standard algo-course-form-copy">
          Intro Video, Lecture 0, and Lecture 1 are available before payment.
        </p>
      </div>

      <div>
        <label className="form-label" htmlFor="algoCourseFullName">
          Full name *
        </label>
        <input
          id="algoCourseFullName"
          name="fullName"
          type="text"
          required
          placeholder="Enter your full name"
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className="form-control"
          aria-describedby="algoCourseFullName-error"
        />
        <FieldError id="algoCourseFullName-error" message={errors.fullName} />
      </div>

      <div>
        <label className="form-label" htmlFor="algoCourseEmailAddress">
          Email address *
        </label>
        <input
          id="algoCourseEmailAddress"
          name="emailAddress"
          type="email"
          required
          placeholder="you@example.com"
          value={values.emailAddress}
          onChange={(event) => updateField("emailAddress", event.target.value)}
          className="form-control"
          aria-describedby="algoCourseEmailAddress-error"
        />
        <FieldError
          id="algoCourseEmailAddress-error"
          message={errors.emailAddress}
        />
      </div>

      <div>
        <label className="form-label" htmlFor="algoCourseWhatsappNumber">
          WhatsApp number *
        </label>
        <input
          id="algoCourseWhatsappNumber"
          name="whatsappNumber"
          type="tel"
          required
          placeholder="Enter your WhatsApp number"
          value={values.whatsappNumber}
          onChange={(event) =>
            updateField("whatsappNumber", event.target.value)
          }
          className="form-control"
          aria-describedby="algoCourseWhatsappNumber-error"
        />
        <FieldError
          id="algoCourseWhatsappNumber-error"
          message={errors.whatsappNumber}
        />
      </div>

      <p className="body-compact algo-course-trust-note">
        {algoTradingCourse.privacyNote}
      </p>

      {status ? (
        <div
          role="status"
          className="algo-course-status"
          style={{
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

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? "Opening Free Access..." : "Get Free Access"}
      </Button>
    </form>
  );
}
