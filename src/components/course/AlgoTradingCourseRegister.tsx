"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, ShieldCheck, X } from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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
  subheading = "WhatsApp is collected only for course updates and support.",
}: AlgoTradingCourseRegisterProps = {}) {
  const [signupValues, setSignupValues] = useState({
    fullName: "",
    email: "",
    whatsappNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);

  // Cookie Consent States
  const [cookieConsentStatus, setCookieConsentStatus] = useState<'pending' | 'accepted' | 'denied'>('accepted');
  const [acceptCookiesToRememberMe, setAcceptCookiesToRememberMe] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

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

    const consentCookie = document.cookie.split('; ').find(row => row.startsWith('vyn_cookie_consent='));
    if (!consentCookie) {
      setCookieConsentStatus('pending');
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      const val = consentCookie.split('=')[1];
      setCookieConsentStatus(val === 'denied' ? 'denied' : 'accepted');
    }
  }, [defaultNext]);

  function sanitizeClientText(value: string) {
    return value.replace(/[<>]/g, "").trim();
  }

  function handleAcceptCookies() {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `vyn_cookie_consent=accepted; path=/; max-age=${maxAge}; SameSite=Lax`;
    setCookieConsentStatus('accepted');
    setShowBanner(false);
  }

  function handleDenyCookies() {
    if (window.confirm("If you deny cookies, some features of the website (like remembering your login for next time) may not work properly. Continue?")) {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `vyn_cookie_consent=denied; path=/; max-age=${maxAge}; SameSite=Lax`;
      setCookieConsentStatus('denied');
      setShowBanner(false);
    }
  }

  function setAuthCookiesAndRedirect(email: string, name: string) {
    const shouldRemember = cookieConsentStatus === 'accepted' || (cookieConsentStatus === 'denied' && acceptCookiesToRememberMe);
    
    // If remembered, set for 1 year. Otherwise, session cookie (no max-age).
    const maxAgeStr = shouldRemember ? `; max-age=${60 * 60 * 24 * 365}` : "";
    
    document.cookie = `vyn_user_email=${encodeURIComponent(email)}; path=/${maxAgeStr}; SameSite=Lax`;
    document.cookie = `vyn_user_name=${encodeURIComponent(name)}; path=/${maxAgeStr}; SameSite=Lax`;
    
    if (shouldRemember) {
       document.cookie = `vyn_cookie_consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }

    window.location.assign(defaultNext);
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setErrors({});

    const fullName = sanitizeClientText(signupValues.fullName);
    const email = sanitizeClientText(signupValues.email);
    const whatsappNumber = sanitizeClientText(signupValues.whatsappNumber);

    const nextErrors: FormErrors = {};

    if (fullName.length < 2) nextErrors.fullName = "Enter your full name.";
    if (!email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (whatsappNumber.length < 8) nextErrors.whatsappNumber = "Enter a valid WhatsApp number.";

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
          email,
          whatsappNumber,
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
    } catch (err) {
      setStatus({
        type: "error",
        message: "Network error saving registration.",
      });
      setLoading(false);
    }
  }

  const authCard = (
    <div className={authCardClassName} style={{ position: "relative" }}>
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
              Email address *
            </label>
            <input
              id={`${fieldIdPrefix}SignupEmail`}
              className="form-control"
              type="email"
              value={signupValues.email}
              onChange={(e) => setSignupValues({ ...signupValues, email: e.target.value })}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <FieldError id={`${fieldIdPrefix}SignupEmail-error`} message={errors.email} />
          </div>

          <div>
            <label className="form-label" htmlFor={`${fieldIdPrefix}SignupWhatsApp`}>
              WhatsApp Number *
            </label>
            <PhoneInput
              id={`${fieldIdPrefix}SignupWhatsApp`}
              className="form-control phone-input-wrapper"
              value={signupValues.whatsappNumber}
              onChange={(value) => setSignupValues({ ...signupValues, whatsappNumber: value ? String(value) : "" })}
              defaultCountry="IN"
              placeholder="+91..."
            />
            <style jsx global>{`
              .phone-input-wrapper {
                display: flex;
                align-items: center;
              }
              .phone-input-wrapper .PhoneInputCountry {
                margin-right: 0.5rem;
                display: flex;
                align-items: center;
              }
              .phone-input-wrapper input {
                border: none;
                background: transparent;
                flex: 1;
                outline: none;
                color: inherit;
                font-family: inherit;
                font-size: inherit;
                min-width: 0;
              }
            `}</style>
            <FieldError id={`${fieldIdPrefix}SignupWhatsApp-error`} message={errors.whatsappNumber} />
          </div>

          {cookieConsentStatus === 'denied' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="acceptCookiesRememberMe" 
                checked={acceptCookiesToRememberMe}
                onChange={(e) => setAcceptCookiesToRememberMe(e.target.checked)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="acceptCookiesRememberMe" style={{ fontSize: '0.875rem', lineHeight: 1.4, color: 'inherit', opacity: 0.8 }}>
                Accept cookies to remember me for my next visit
              </label>
            </div>
          )}

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

      {/* Discreet Cookie Toast */}
      {showBanner && cookieConsentStatus === 'pending' && (
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            left: "1rem",
            backgroundColor: "rgba(20, 20, 20, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.5rem",
            padding: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.4, paddingRight: "1rem" }}>
              We use cookies to enhance your experience. 
            </p>
            <button 
              onClick={() => setShowBanner(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={handleAcceptCookies}
              style={{
                flex: 1,
                padding: "0.4rem",
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: "0.25rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Accept
            </button>
            <button 
              onClick={handleDenyCookies}
              style={{
                flex: 1,
                padding: "0.4rem",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.25rem",
                fontSize: "0.8rem",
                cursor: "pointer"
              }}
            >
              Deny
            </button>
          </div>
        </div>
      )}
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
