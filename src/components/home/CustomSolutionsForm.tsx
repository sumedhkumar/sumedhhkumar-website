"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import SectionIntro from "@/components/ui/SectionIntro";

const categories = [
  {
    title: "Custom Trading Systems",
    body: "Convert your strategy, indicator logic, or execution process into a structured software workflow.",
  },
  {
    title: "Trading Automation Workflows",
    body: "Build workflows that connect trading logic with tools, platforms, alerts, execution steps, or review systems where technically possible.",
  },
  {
    title: "Business Websites",
    body: "Build premium websites for brands, services, products, consultants, and businesses that need a professional online presence.",
  },
  {
    title: "Dashboards and Internal Tools",
    body: "Create dashboards, trackers, admin panels, reporting tools, and workflow systems for business operations.",
  },
  {
    title: "AI Tool Integrations",
    body: "Use AI tools to support workflows, content systems, internal operations, decision support, or software automation.",
  },
];

const solutionOptions = [
  "Custom Trading Systems",
  "Trading Automation Workflows",
  "Business Websites",
  "Dashboards and Internal Tools",
  "AI Tool Integrations",
  "Other Tailored Digital Solution",
];

const timelineOptions = [
  "Within 1 Month",
  "1 to 3 Months",
  "3 to 6 Months",
  "Flexible or To Be Discussed",
];

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
];

const maxFileSizeBytes = 10 * 1024 * 1024;

type FormValues = {
  fullName: string;
  emailAddress: string;
  phoneOrWhatsapp: string;
  companyOrOrganization: string;
  solutionType: string;
  requirementsDescription: string;
  preferredTimeline: string;
  approximateBudget: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | "supportingFile", string>>;

const initialValues: FormValues = {
  fullName: "",
  emailAddress: "",
  phoneOrWhatsapp: "",
  companyOrOrganization: "",
  solutionType: "",
  requirementsDescription: "",
  preferredTimeline: "",
  approximateBudget: "",
  website: "",
};

function hasAllowedExtension(fileName: string) {
  return allowedExtensions.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
}

function validate(values: FormValues, file: File | null) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!emailPattern.test(values.emailAddress.trim())) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (!values.phoneOrWhatsapp.trim()) {
    errors.phoneOrWhatsapp = "Enter your phone or WhatsApp number.";
  }

  if (!values.solutionType) {
    errors.solutionType = "Select the type of solution required.";
  }

  if (values.requirementsDescription.trim().length < 30) {
    errors.requirementsDescription =
      "Describe your requirements in at least 30 characters.";
  }

  if (values.requirementsDescription.trim().length > 3000) {
    errors.requirementsDescription =
      "Keep your requirements within 3000 characters.";
  }

  if (!values.preferredTimeline) {
    errors.preferredTimeline = "Select your preferred timeline.";
  }

  if (file && !hasAllowedExtension(file.name)) {
    errors.supportingFile =
      "Upload a PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or ZIP file.";
  }

  if (file && file.size > maxFileSizeBytes) {
    errors.supportingFile = "Upload a file smaller than or equal to 10 MB.";
  }

  return errors;
}

export default function CustomSolutionsForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const fileSummary = useMemo(() => {
    if (!file) {
      return "PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or ZIP - Maximum 10 MB";
    }

    return file.name;
  }, [file]);

  function updateField(
    field: keyof FormValues,
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values, file);
    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please complete the required fields before submitting."
      });
      return;
    }

    setSending(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("sourcePage", "Homepage Custom Solutions Section");

    if (file) {
      formData.append("supportingFile", file);
    }

    try {
      const response = await fetch("/api/custom-solutions", {
        method: "POST",
        body: formData,
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
          message:
            result.message ??
            "Something went wrong. Please try again.",
        });
        return;
      }

      setValues(initialValues);
      setFile(null);
      setErrors({});
      setStatus({
        type: "success",
        message:
          "Your requirement has been submitted. Vyntegra will review it and respond within 24 hours.",
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
    <section id="custom-solutions" className="section section-bg-secondary">
      <div className="container custom-solutions-grid">
        <div>
          <SectionIntro
            heading="What you can build with Vyntegra"
            copy=""
          />
          <div style={{ display: "grid", gap: 12 }}>
            {categories.map((category) => (
              <div
                key={category.title}
                className="solution-chip standard-card"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <CheckCircle2
                  size={20}
                  color="#B8914A"
                  strokeWidth={1.75}
                  style={{ flex: "0 0 auto", marginTop: 2 }}
                />
                <div>
                  <span className="body-standard" style={{ fontWeight: 700 }}>{category.title}</span>
                  <p className="body-compact" style={{ marginTop: 4 }}>{category.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={submitForm}
          noValidate
          className="depth-panel"
          style={{
            padding: 32,
            display: "grid",
            gap: 18,
          }}
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
            <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Tell us what you want to build</h2>
            <p className="body-standard" style={{ marginBottom: 24, color: "var(--foreground-muted)" }}>
              Share your requirement in detail. The more specific you are, the better we can understand the scope.
            </p>
            <label className="form-label" htmlFor="fullName">
              Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Enter your full name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="fullName-error"
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </div>

          <div>
            <label className="form-label" htmlFor="emailAddress">
              Email *
            </label>
            <input
              id="emailAddress"
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
              aria-describedby="emailAddress-error"
            />
            <FieldError id="emailAddress-error" message={errors.emailAddress} />
          </div>

          <div>
            <label className="form-label" htmlFor="phoneOrWhatsapp">
              Phone / WhatsApp *
            </label>
            <input
              id="phoneOrWhatsapp"
              name="phoneOrWhatsapp"
              type="tel"
              required
              placeholder="Enter your phone or WhatsApp number"
              value={values.phoneOrWhatsapp}
              onChange={(event) =>
                updateField("phoneOrWhatsapp", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="phoneOrWhatsapp-error"
            />
            <FieldError
              id="phoneOrWhatsapp-error"
              message={errors.phoneOrWhatsapp}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="companyOrOrganization">
              Company or Organization
            </label>
            <input
              id="companyOrOrganization"
              name="companyOrOrganization"
              type="text"
              placeholder="Optional"
              value={values.companyOrOrganization}
              onChange={(event) =>
                updateField("companyOrOrganization", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="solutionType">
              Type of Solution Required *
            </label>
            <select
              id="solutionType"
              name="solutionType"
              required
              value={values.solutionType}
              onChange={(event) => updateField("solutionType", event.target.value)}
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="solutionType-error"
            >
              <option value="" disabled>
                Select a solution type
              </option>
              {solutionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldError id="solutionType-error" message={errors.solutionType} />
          </div>

          <div>
            <label className="form-label" htmlFor="requirementsDescription">
              Project requirement *
            </label>
            <textarea
              id="requirementsDescription"
              name="requirementsDescription"
              required
              rows={6}
              minLength={30}
              maxLength={3000}
              placeholder="Describe what you want to build, the problem it should solve, and any platforms or tools it should connect with."
              value={values.requirementsDescription}
              onChange={(event) =>
                updateField("requirementsDescription", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="requirementsDescription-error"
            />
            <FieldError
              id="requirementsDescription-error"
              message={errors.requirementsDescription}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="preferredTimeline">
              Expected timeline *
            </label>
            <select
              id="preferredTimeline"
              name="preferredTimeline"
              required
              value={values.preferredTimeline}
              onChange={(event) =>
                updateField("preferredTimeline", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
              aria-describedby="preferredTimeline-error"
            >
              <option value="" disabled>
                Select a preferred timeline
              </option>
              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FieldError
              id="preferredTimeline-error"
              message={errors.preferredTimeline}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="approximateBudget">
              Approximate budget
            </label>
            <input
              id="approximateBudget"
              name="approximateBudget"
              type="text"
              placeholder="Optional"
              value={values.approximateBudget}
              onChange={(event) =>
                updateField("approximateBudget", event.target.value)
              }
              className="form-control"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <span className="form-label">Supporting File</span>
            <label
              htmlFor="supportingFile"
              className="upload-panel"
              style={{
                minHeight: 104,
                display: "grid",
                placeItems: "center",
                gap: 8,
                padding: 18,
                marginTop: 8,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Upload size={20} color="#B8914A" strokeWidth={1.75} />
              <span className="body-standard">
                Upload an optional supporting file
              </span>
              <span className="body-compact">{fileSummary}</span>
            </label>
            <input
              id="supportingFile"
              name="supportingFile"
              type="file"
              accept={allowedExtensions.join(",")}
              onChange={updateFile}
              style={{ display: "none" }}
              aria-describedby="supportingFile-error"
            />
            <FieldError
              id="supportingFile-error"
              message={errors.supportingFile}
            />
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
            Submit Requirement
          </Button>
        </form>
      </div>
    </section>
  );
}

