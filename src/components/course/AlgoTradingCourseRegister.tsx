"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "signup" | "login";

type FormErrors = Record<string, string>;

type StatusMessage = {
  type: "success" | "error" | "info";
  message: string;
};

type RegistrationResponse = {
  ok?: boolean;
  message?: string;
  errors?: FormErrors;
  registration?: {
    id: string;
    fullName: string;
    whatsappNumber: string;
  } | null;
};

const courseSlug = "algo-trading";
const pendingRegistrationKey = "vyntegra_algo_course_pending_registration";

const initialSignupValues = {
  fullName: "",
  email: "",
  password: "",
  whatsappNumber: "",
};

const initialLoginValues = {
  email: "",
  password: "",
};

function sanitizeClientText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

function validateProfile(fullName: string, whatsappNumber: string) {
  const errors: FormErrors = {};
  const normalizedWhatsapp = whatsappNumber.replace(/\s/g, "");

  if (sanitizeClientText(fullName).length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!sanitizeClientText(whatsappNumber)) {
    errors.whatsappNumber = "Enter your WhatsApp number.";
  } else if (normalizedWhatsapp.length < 8 || normalizedWhatsapp.length > 20) {
    errors.whatsappNumber = "Enter a reasonable WhatsApp number.";
  }

  return errors;
}

function validateEmailPassword(email: string, password: string) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitizeClientText(email))) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }

  return errors;
}

function validateEmailOnly(email: string) {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitizeClientText(email))) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function getAttributionPayload() {
  if (typeof window === "undefined") {
    return { source: "course_register_page" };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    source: sanitizeClientText(searchParams.get("source") ?? "") || "course_register_page",
    utmSource: sanitizeClientText(searchParams.get("utm_source") ?? ""),
    utmMedium: sanitizeClientText(searchParams.get("utm_medium") ?? ""),
    utmCampaign: sanitizeClientText(searchParams.get("utm_campaign") ?? ""),
  };
}

function getSafeClientPath(value: string | null, fallbackPath: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(value, window.location.origin);

    if (parsed.origin !== window.location.origin) {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallbackPath;
  }
}

function getPostAuthTarget() {
  if (typeof window === "undefined") {
    return algoTradingCourse.accessRoute;
  }

  const searchParams = new URLSearchParams(window.location.search);

  return getSafeClientPath(
    searchParams.get("next"),
    algoTradingCourse.accessRoute,
  );
}

function getPendingRegistration() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.sessionStorage.getItem(pendingRegistrationKey);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue) as {
      fullName?: unknown;
      whatsappNumber?: unknown;
    };

    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
      whatsappNumber:
        typeof parsed.whatsappNumber === "string" ? parsed.whatsappNumber : "",
    };
  } catch {
    return null;
  }
}

function setPendingRegistration(fullName: string, whatsappNumber: string) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    fullName: sanitizeClientText(fullName),
    whatsappNumber: sanitizeClientText(whatsappNumber),
  };

  if (!payload.fullName && !payload.whatsappNumber) {
    return;
  }

  window.sessionStorage.setItem(
    pendingRegistrationKey,
    JSON.stringify(payload),
  );
}

function clearPendingRegistration() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(pendingRegistrationKey);
}

export default function AlgoTradingCourseRegister() {
  const [activeMode, setActiveMode] = useState<AuthMode>("signup");
  const [signupValues, setSignupValues] = useState(initialSignupValues);
  const [loginValues, setLoginValues] = useState(initialLoginValues);
  const [profileValues, setProfileValues] = useState({
    fullName: "",
    whatsappNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "google" | "signup" | "login" | "profile" | "reset" | null
  >(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState("");

  function getSupabaseClientOrWarn() {
    try {
      return createSupabaseBrowserClient();
    } catch {
      setStatus({
        type: "error",
        message:
          "Course account access is not configured yet. Add the public Supabase Auth environment variables.",
      });
      return null;
    }
  }

  async function loadCourseRegistration() {
    const response = await fetch("/api/course-registrations", {
      method: "GET",
    });
    const payload = (await response.json().catch(() => ({}))) as RegistrationResponse;

    if (!response.ok || payload.ok === false) {
      throw new Error(
        payload.message ?? "Course registration could not be loaded.",
      );
    }

    return payload.registration ?? null;
  }

  async function saveCourseRegistration(
    fullName: string,
    whatsappNumber: string,
  ) {
    const nextErrors = validateProfile(fullName, whatsappNumber);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      throw new Error("Please complete your course registration details.");
    }

    const response = await fetch("/api/course-registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseSlug,
        fullName: sanitizeClientText(fullName),
        whatsappNumber: sanitizeClientText(whatsappNumber),
        ...getAttributionPayload(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as RegistrationResponse;

    if (!response.ok || payload.ok === false) {
      setErrors(payload.errors ?? {});
      throw new Error(
        payload.message ?? "Course registration could not be saved.",
      );
    }

    clearPendingRegistration();
    window.location.assign(getPostAuthTarget());
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateAuthenticatedState() {
      const supabase = getSupabaseClientOrWarn();

      if (!supabase) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) {
        return;
      }

      const pendingRegistration = getPendingRegistration();
      const metadataFullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "";
      setSignedInEmail(user.email ?? "");

      try {
        const existingRegistration = await loadCourseRegistration();

        if (existingRegistration) {
          clearPendingRegistration();
          window.location.assign(getPostAuthTarget());
          return;
        }

        if (
          pendingRegistration?.fullName &&
          pendingRegistration.whatsappNumber
        ) {
          await saveCourseRegistration(
            pendingRegistration.fullName,
            pendingRegistration.whatsappNumber,
          );
          return;
        }

        setProfileValues({
          fullName: pendingRegistration?.fullName || metadataFullName,
          whatsappNumber: pendingRegistration?.whatsappNumber || "",
        });
        setNeedsProfileCompletion(true);
        setStatus({
          type: "info",
          message:
            "Complete your course registration details to continue to the free course preview.",
        });
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Course registration could not be checked.",
        });
      }
    }

    hydrateAuthenticatedState();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGoogleAuth() {
    setStatus(null);
    setErrors({});
    setLoadingAction("google");
    setPendingRegistration(signupValues.fullName, signupValues.whatsappNumber);

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      setLoadingAction(null);
      return;
    }

    const nextPath = `${window.location.pathname}${window.location.search || ""}`;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      setLoadingAction(null);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const profileErrors = validateProfile(
      signupValues.fullName,
      signupValues.whatsappNumber,
    );
    const authErrors = validateEmailPassword(
      signupValues.email,
      signupValues.password,
    );
    const nextErrors = { ...profileErrors, ...authErrors };
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      return;
    }

    setLoadingAction("signup");
    setPendingRegistration(signupValues.fullName, signupValues.whatsappNumber);

    const { data, error } = await supabase.auth.signUp({
      email: sanitizeClientText(signupValues.email),
      password: signupValues.password,
      options: {
        data: {
          full_name: sanitizeClientText(signupValues.fullName),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`${window.location.pathname}${window.location.search || ""}`)}`,
      },
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      setLoadingAction(null);
      return;
    }

    if (data.session) {
      try {
        await saveCourseRegistration(
          signupValues.fullName,
          signupValues.whatsappNumber,
        );
      } catch (saveError) {
        setStatus({
          type: "error",
          message:
            saveError instanceof Error
              ? saveError.message
              : "Course registration could not be saved.",
        });
        setLoadingAction(null);
      }
      return;
    }

    setStatus({
      type: "success",
      message:
        "Check your email to confirm your account, then log in to continue to the free course preview.",
    });
    setLoadingAction(null);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const nextErrors = validateEmailPassword(
      loginValues.email,
      loginValues.password,
    );
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      return;
    }

    setLoadingAction("login");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeClientText(loginValues.email),
      password: loginValues.password,
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      setLoadingAction(null);
      return;
    }

    setSignedInEmail(data.user?.email ?? sanitizeClientText(loginValues.email));

    try {
      const existingRegistration = await loadCourseRegistration();

      if (existingRegistration) {
        window.location.assign(getPostAuthTarget());
        return;
      }

      setNeedsProfileCompletion(true);
      setActiveMode("signup");
      setStatus({
        type: "info",
        message:
          "Your account is active. Add your name and WhatsApp number to finish course registration.",
      });
    } catch (loadError) {
      setStatus({
        type: "error",
        message:
          loadError instanceof Error
            ? loadError.message
            : "Course registration could not be checked.",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleProfileCompletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoadingAction("profile");

    try {
      await saveCourseRegistration(
        profileValues.fullName,
        profileValues.whatsappNumber,
      );
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Course registration could not be saved.",
      });
      setLoadingAction(null);
    }
  }

  async function handlePasswordResetRequest() {
    setStatus(null);

    const nextErrors = validateEmailOnly(loginValues.email);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Enter your account email, then request the reset link.",
      });
      return;
    }

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      return;
    }

    setLoadingAction("reset");

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      sanitizeClientText(loginValues.email),
      {
        redirectTo,
      },
    );

    if (error) {
      setStatus({
        type: "error",
        message:
          "Password reset could not be started. Please check the auth configuration and try again.",
      });
      setLoadingAction(null);
      return;
    }

    setStatus({
      type: "success",
      message:
        "If the email is registered, a password reset link has been sent.",
    });
    setLoadingAction(null);
  }

  return (
    <main className="algo-course-page algo-course-register-page">
      <section className="section algo-course-register-hero">
        <div className="container algo-course-register-grid">
          <aside className="depth-panel algo-course-register-summary">
            <p className="eyebrow">Free Course Account</p>
            <h1 className="hero-title">{algoTradingCourse.name}</h1>
            <p className="body-standard">
              Create your account to continue to the free course preview.
            </p>

            <div className="algo-course-register-highlights">
              <div>
                <span>Platforms</span>
                <strong>MT5 + TradingView</strong>
              </div>
              <div>
                <span>Program format</span>
                <strong>3-month weekend program</strong>
              </div>
              <div>
                <span>Next step</span>
                <strong>Free preview access</strong>
              </div>
            </div>

            <div className="algo-course-register-trust">
              <ShieldCheck size={19} strokeWidth={1.75} aria-hidden="true" />
              <p>{algoTradingCourse.disclaimer}</p>
            </div>
          </aside>

          <div className="depth-panel algo-course-auth-card">
            <div className="algo-course-auth-header">
              <p className="eyebrow">Account Access</p>
              <h2 className="subsection-title">
                Register or log in to continue
              </h2>
              <p className="body-compact">
                Your email comes from Supabase Auth. WhatsApp is collected only
                for course updates and support.
              </p>
            </div>

            {needsProfileCompletion ? (
              <form className="algo-course-auth-form" onSubmit={handleProfileCompletion}>
                <div className="algo-course-signed-in-note">
                  <CheckCircle2 size={19} strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    Signed in{signedInEmail ? ` as ${signedInEmail}` : ""}.
                  </span>
                </div>

                <div>
                  <label className="form-label" htmlFor="courseProfileFullName">
                    Full name *
                  </label>
                  <input
                    id="courseProfileFullName"
                    className="form-control"
                    value={profileValues.fullName}
                    onChange={(event) =>
                      setProfileValues((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    autoComplete="name"
                    placeholder="Enter your full name"
                    aria-describedby="courseProfileFullName-error"
                  />
                  <FieldError
                    id="courseProfileFullName-error"
                    message={errors.fullName}
                  />
                </div>

                <div>
                  <label
                    className="form-label"
                    htmlFor="courseProfileWhatsapp"
                  >
                    WhatsApp number *
                  </label>
                  <input
                    id="courseProfileWhatsapp"
                    className="form-control"
                    value={profileValues.whatsappNumber}
                    onChange={(event) =>
                      setProfileValues((current) => ({
                        ...current,
                        whatsappNumber: event.target.value,
                      }))
                    }
                    autoComplete="tel"
                    placeholder="Enter your WhatsApp number"
                    type="tel"
                    aria-describedby="courseProfileWhatsapp-error"
                  />
                  <FieldError
                    id="courseProfileWhatsapp-error"
                    message={errors.whatsappNumber}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingAction === "profile"}
                >
                  {loadingAction === "profile"
                    ? "Saving Registration..."
                    : "Finish Registration"}
                </Button>
              </form>
            ) : (
              <>
                <div className="algo-course-auth-tabs" role="tablist" aria-label="Course auth options">
                  <button
                    type="button"
                    className={activeMode === "signup" ? "is-active" : ""}
                    onClick={() => {
                      setActiveMode("signup");
                      setErrors({});
                    }}
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    className={activeMode === "login" ? "is-active" : ""}
                    onClick={() => {
                      setActiveMode("login");
                      setErrors({});
                    }}
                  >
                    Log in
                  </button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="algo-course-google-button"
                  onClick={handleGoogleAuth}
                  disabled={loadingAction === "google"}
                >
                  <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
                  {loadingAction === "google"
                    ? "Opening Google..."
                    : "Continue with Google"}
                </Button>

                {activeMode === "signup" ? (
                  <form className="algo-course-auth-form" onSubmit={handleSignup}>
                    <div>
                      <label className="form-label" htmlFor="courseSignupName">
                        Full name *
                      </label>
                      <input
                        id="courseSignupName"
                        className="form-control"
                        value={signupValues.fullName}
                        onChange={(event) =>
                          setSignupValues((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        autoComplete="name"
                        placeholder="Enter your full name"
                        aria-describedby="courseSignupName-error"
                      />
                      <FieldError
                        id="courseSignupName-error"
                        message={errors.fullName}
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="courseSignupEmail">
                        Email address *
                      </label>
                      <input
                        id="courseSignupEmail"
                        className="form-control"
                        value={signupValues.email}
                        onChange={(event) =>
                          setSignupValues((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        autoComplete="email"
                        placeholder="you@example.com"
                        type="email"
                        aria-describedby="courseSignupEmail-error"
                      />
                      <FieldError
                        id="courseSignupEmail-error"
                        message={errors.email}
                      />
                    </div>

                    <div>
                      <label
                        className="form-label"
                        htmlFor="courseSignupPassword"
                      >
                        Password *
                      </label>
                      <input
                        id="courseSignupPassword"
                        className="form-control"
                        value={signupValues.password}
                        onChange={(event) =>
                          setSignupValues((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        autoComplete="new-password"
                        placeholder="Create a password"
                        type="password"
                        aria-describedby="courseSignupPassword-error"
                      />
                      <FieldError
                        id="courseSignupPassword-error"
                        message={errors.password}
                      />
                    </div>

                    <div>
                      <label
                        className="form-label"
                        htmlFor="courseSignupWhatsapp"
                      >
                        WhatsApp number *
                      </label>
                      <input
                        id="courseSignupWhatsapp"
                        className="form-control"
                        value={signupValues.whatsappNumber}
                        onChange={(event) =>
                          setSignupValues((current) => ({
                            ...current,
                            whatsappNumber: event.target.value,
                          }))
                        }
                        autoComplete="tel"
                        placeholder="Enter your WhatsApp number"
                        type="tel"
                        aria-describedby="courseSignupWhatsapp-error"
                      />
                      <FieldError
                        id="courseSignupWhatsapp-error"
                        message={errors.whatsappNumber}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loadingAction === "signup"}
                    >
                      {loadingAction === "signup"
                        ? "Creating Account..."
                        : "Create Free Account"}
                    </Button>
                  </form>
                ) : (
                  <form className="algo-course-auth-form" onSubmit={handleLogin}>
                    <div>
                      <label className="form-label" htmlFor="courseLoginEmail">
                        Email address *
                      </label>
                      <input
                        id="courseLoginEmail"
                        className="form-control"
                        value={loginValues.email}
                        onChange={(event) =>
                          setLoginValues((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        autoComplete="email"
                        placeholder="you@example.com"
                        type="email"
                        aria-describedby="courseLoginEmail-error"
                      />
                      <FieldError
                        id="courseLoginEmail-error"
                        message={errors.email}
                      />
                    </div>

                    <div>
                      <div className="algo-course-password-label-row">
                        <label
                          className="form-label"
                          htmlFor="courseLoginPassword"
                        >
                          Password *
                        </label>
                        <button
                          type="button"
                          onClick={handlePasswordResetRequest}
                          disabled={loadingAction === "reset"}
                        >
                          {loadingAction === "reset"
                            ? "Sending..."
                            : "Forgot password?"}
                        </button>
                      </div>
                      <input
                        id="courseLoginPassword"
                        className="form-control"
                        value={loginValues.password}
                        onChange={(event) =>
                          setLoginValues((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        type="password"
                        aria-describedby="courseLoginPassword-error"
                      />
                      <FieldError
                        id="courseLoginPassword-error"
                        message={errors.password}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loadingAction === "login"}
                    >
                      {loadingAction === "login"
                        ? "Checking Access..."
                        : "Log In and Continue"}
                    </Button>
                  </form>
                )}
              </>
            )}

            {status ? (
              <div
                className={`algo-course-auth-status algo-course-auth-status-${status.type}`}
                role="status"
              >
                {status.type === "error" ? (
                  <CircleAlert size={19} strokeWidth={1.75} aria-hidden="true" />
                ) : status.type === "success" ? (
                  <CheckCircle2 size={19} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <KeyRound size={19} strokeWidth={1.75} aria-hidden="true" />
                )}
                <p>{status.message}</p>
              </div>
            ) : null}

            <div className="algo-course-auth-footnote">
              <span>Next</span>
              <p>
                After registration you will be sent to the protected free
                access page.
              </p>
              <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
