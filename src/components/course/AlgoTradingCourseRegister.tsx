"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";

type FormErrors = Record<string, string>;

type StatusMessage = {
  type: "success" | "error" | "info";
  message: string;
};

type AlgoTradingCourseRegisterProps = {
  embedded?: boolean;
  compactEmbedded?: boolean;
  className?: string;
  attributionSource?: string;
  defaultNext?: string;
  heading?: string;
  subheading?: string;
};

export default function AlgoTradingCourseRegister({
  embedded = false,
  compactEmbedded = false,
  className = "",
  attributionSource = "",
  defaultNext = algoTradingCourse.accessRoute,
  heading = "Create Free Account",
  subheading = "Get instant access to 2 free lectures.",
}: AlgoTradingCourseRegisterProps = {}) {
  const [signupValues, setSignupValues] = useState({
    fullName: "",
    email: "",
    whatsappPrefix: "+91",
    whatsappNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isCompactEmbedded = embedded && compactEmbedded;
  const fieldIdPrefix = embedded ? "campaignCourse" : "course";
  const authCardClassName = [
    embedded ? "" : "depth-panel",
    "algo-course-auth-card",
    embedded ? "algo-course-auth-card-embedded" : "",
    isCompactEmbedded ? "algo-course-auth-card-compact-embedded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const hasEmailCookie = document.cookie.includes("vyn_user_email=");
    if (hasEmailCookie) {
      setHasRegistration(true);
      window.location.assign(defaultNext);
      return;
    }
  }, [defaultNext]);

  function sanitizeClientText(value: string) {
    return value.replace(/[<>]/g, "").trim();
  }

  function setAuthCookiesAndRedirect(email: string, name: string) {
    const maxAgeStr = rememberMe ? `; max-age=${60 * 60 * 24 * 365}` : "";

    // Store the name as the identifier (email may be empty for name-only login)
    const identifier = email || name;
    document.cookie = `vyn_user_email=${encodeURIComponent(identifier)}; path=/${maxAgeStr}; SameSite=Lax`;
    document.cookie = `vyn_user_name=${encodeURIComponent(name)}; path=/${maxAgeStr}; SameSite=Lax`;

    window.location.assign(defaultNext);
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setErrors({});

    const fullName = sanitizeClientText(signupValues.fullName);
    const email = sanitizeClientText(signupValues.email);

    const nextErrors: FormErrors = {};

    if (fullName.length < 2) nextErrors.fullName = "Enter your full name.";
    if (email && !email.includes("@")) nextErrors.email = "Enter a valid email.";

    const whatsappNumber = signupValues.whatsappNumber
      ? signupValues.whatsappPrefix + signupValues.whatsappNumber.replace(/\s/g, "")
      : "";

    if (signupValues.whatsappNumber && !/^\d{6,15}$/.test(signupValues.whatsappNumber.replace(/\s/g, ""))) {
      nextErrors.whatsappNumber = "Enter a valid phone number (digits only).";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? "/api/save-registration-local"
        : "/api/save-registration.php";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email: email || null,
          whatsappNumber: whatsappNumber || null,
          courseSlug: algoTradingCourse.slug,
          source: attributionSource,
        }),
      });

      if (response.ok) {
        setAuthCookiesAndRedirect(email, fullName);
      } else {
        const payload = await response.json().catch(() => ({}));
        setStatus({
          type: "error",
          message: payload.message || "Could not save registration.",
        });
        setLoading(false);
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error saving registration.",
      });
      setLoading(false);
    }
  }

  const authCard = (
    <div className={authCardClassName}>
      <div className="algo-course-auth-header">
        {!isCompactEmbedded ? <p className="eyebrow">Account Access</p> : null}
        <h2 className="subsection-title">{heading}</h2>
        <p className="body-compact">{subheading}</p>
      </div>

      {hasRegistration ? (
        <div className="algo-course-logged-in-panel">
          <div className="algo-course-auth-state-copy">
            <h3>You are logged in</h3>
          </div>
          <div className="algo-course-auth-action-row">
            <Button href={defaultNext} variant="primary">
              Continue to lessons
            </Button>
          </div>
        </div>
      ) : (
        <form className="algo-course-auth-form" onSubmit={handleSignup}>
          <div>
            <label className="form-label" htmlFor={`${fieldIdPrefix}SignupName`}>
              Full name *
            </label>
            <input
              id={`${fieldIdPrefix}SignupName`}
              className="form-control"
              value={signupValues.fullName}
              onChange={(e) => setSignupValues({ ...signupValues, fullName: e.target.value })}
              autoComplete="name"
              placeholder="Enter your full name"
            />
            <FieldError id={`${fieldIdPrefix}SignupName-error`} message={errors.fullName} />
          </div>

          <div>
            <label className="form-label" htmlFor={`${fieldIdPrefix}SignupEmail`}>
              Email address
            </label>
            <input
              id={`${fieldIdPrefix}SignupEmail`}
              className="form-control"
              type="email"
              value={signupValues.email}
              onChange={(e) => setSignupValues({ ...signupValues, email: e.target.value })}
              autoComplete="email"
              placeholder="you@example.com (optional)"
            />
            <FieldError id={`${fieldIdPrefix}SignupEmail-error`} message={errors.email} />
          </div>

          <div>
            <label className="form-label">
              WhatsApp Number
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                id={`${fieldIdPrefix}SignupWhatsAppPrefix`}
                className="form-control"
                value={signupValues.whatsappPrefix}
                onChange={(e) => setSignupValues({ ...signupValues, whatsappPrefix: e.target.value })}
                style={{ width: '7.5rem', flexShrink: 0 }}
                aria-label="Country prefix"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+60">🇲🇾 +60</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+973">🇧🇭 +973</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+82">🇰🇷 +82</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+62">🇮🇩 +62</option>
                <option value="+63">🇵🇭 +63</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+880">🇧🇩 +880</option>
                <option value="+94">🇱🇰 +94</option>
                <option value="+977">🇳🇵 +977</option>
                <option value="+27">🇿🇦 +27</option>
                <option value="+234">🇳🇬 +234</option>
                <option value="+254">🇰🇪 +254</option>
              </select>
              <input
                id={`${fieldIdPrefix}SignupWhatsApp`}
                className="form-control"
                type="tel"
                inputMode="numeric"
                value={signupValues.whatsappNumber}
                onChange={(e) => setSignupValues({ ...signupValues, whatsappNumber: e.target.value.replace(/[^\d\s]/g, "") })}
                placeholder="Optional"
                maxLength={15}
                style={{ flex: 1, minWidth: 0 }}
              />
            </div>
            <FieldError id={`${fieldIdPrefix}SignupWhatsApp-error`} message={errors.whatsappNumber} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="checkbox"
              id={`${fieldIdPrefix}RememberMe`}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ marginTop: '1px', cursor: 'pointer' }}
            />
            <label
              htmlFor={`${fieldIdPrefix}RememberMe`}
              style={{ fontSize: '0.875rem', lineHeight: 1.4, color: 'inherit', opacity: 0.8, cursor: 'pointer' }}
            >
              Remember me on this device
            </label>
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock My 2 Free Lectures"}
          </Button>
        </form>
      )}

      {status ? (
        <div className={`algo-course-auth-status algo-course-auth-status-${status.type}`}>
          {status.type === "error" ? <CircleAlert size={19} /> : <CheckCircle2 size={19} />}
          <p>{status.message}</p>
        </div>
      ) : null}
    </div>
  );

  if (embedded) {
    return authCard;
  }

  return (
    <main className="algo-course-page algo-course-register-page">
      <section className="section algo-course-register-hero">
        <div className="container algo-course-register-grid">
          <aside className="depth-panel algo-course-register-summary">
            <p className="eyebrow">Free Course Account</p>
            <h1 className="hero-title">{algoTradingCourse.name}</h1>
            <p className="body-standard">
              Create your account to unlock Lecture 1 + Lecture 2.
            </p>

            <div className="algo-course-register-trust">
              <ShieldCheck size={19} strokeWidth={1.75} aria-hidden="true" />
              <p>{algoTradingCourse.disclaimer}</p>
            </div>
          </aside>
          {authCard}
        </div>
      </section>
    </main>
  );
}
