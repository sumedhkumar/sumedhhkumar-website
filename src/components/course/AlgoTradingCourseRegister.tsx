"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { algoTradingCourse } from "@/data/algo-trading-course";
import { getPublicContactDetails } from "@/data/site";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabaseAuthConfigurationMessage } from "@/lib/supabase/env";

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

type AlgoTradingCourseRegisterProps = {
  embedded?: boolean;
  compactEmbedded?: boolean;
  initialMode?: AuthMode;
  className?: string;
  attributionSource?: string;
  defaultNext?: string;
  heading?: string;
  subheading?: string;
  modeHrefPath?: string;
  modeHrefHash?: string;
};

const courseSlug = "algo-trading";
const pendingRegistrationKey = "vyntegra_algo_course_pending_registration";
const manualCountryCodeValue = "manual";
const courseLogoutHref = `/auth/logout?next=${encodeURIComponent(algoTradingCourse.registerRoute)}`;
const courseAccessLinkIssueCopy =
  "You are signed in, but your course registration was not found. Please log out and register again, or contact support.";

type PendingRegistration = {
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug: string;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  intendedNext: string;
};

const whatsappCountryOptions = [
  { label: "India +91", value: "+91" },
  { label: "Pakistan +92", value: "+92" },
  { label: "UAE +971", value: "+971" },
  { label: "United States/Canada +1", value: "+1" },
  { label: "United Kingdom +44", value: "+44" },
  { label: "Singapore +65", value: "+65" },
  { label: "Australia +61", value: "+61" },
  { label: "Other / manual country code", value: manualCountryCodeValue },
];

type WhatsappInputValues = {
  whatsappCountryCode: string;
  whatsappManualCountryCode: string;
  whatsappLocalNumber: string;
};

const initialSignupValues = {
  fullName: "",
  email: "",
  password: "",
  whatsappCountryCode: "+91",
  whatsappManualCountryCode: "",
  whatsappLocalNumber: "",
};

const initialLoginValues = {
  email: "",
  password: "",
};

function sanitizeClientText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

function normalizeCountryCode(value: string) {
  const trimmedValue = value.trim();
  const withPlus = trimmedValue.startsWith("+")
    ? trimmedValue
    : `+${trimmedValue}`;

  return `+${withPlus.replace(/\D/g, "")}`;
}

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function buildWhatsappNumber(values: WhatsappInputValues) {
  const selectedCountryCode =
    values.whatsappCountryCode === manualCountryCodeValue
      ? values.whatsappManualCountryCode
      : values.whatsappCountryCode;
  const countryCode = normalizeCountryCode(selectedCountryCode);
  const localNumber = normalizePhoneDigits(values.whatsappLocalNumber);

  if (!countryCode || countryCode === "+") {
    return {
      value: "",
      error: "Enter a country code.",
    };
  }

  if (!/^\+\d{1,4}$/.test(countryCode)) {
    return {
      value: "",
      error: "Enter a valid country code starting with +.",
    };
  }

  if (!localNumber) {
    return {
      value: "",
      error: "Enter your WhatsApp number.",
    };
  }

  if (localNumber.length < 6 || localNumber.length > 15) {
    return {
      value: "",
      error: "Enter a reasonable WhatsApp number.",
    };
  }

  return {
    value: `${countryCode}${localNumber}`,
    error: "",
  };
}

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (
    !message ||
    message.includes("Invalid path specified in request URL") ||
    message.includes("Supabase Auth is not configured")
  ) {
    return supabaseAuthConfigurationMessage;
  }

  return message;
}

function validateProfile(fullName: string, whatsappNumber: string) {
  const errors: FormErrors = {};
  const whatsappDigits = normalizePhoneDigits(whatsappNumber);

  if (sanitizeClientText(fullName).length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!sanitizeClientText(whatsappNumber)) {
    errors.whatsappNumber = "Enter your WhatsApp number.";
  } else if (!whatsappNumber.startsWith("+")) {
    errors.whatsappNumber = "Enter a WhatsApp number with country code.";
  } else if (whatsappDigits.length < 8 || whatsappDigits.length > 18) {
    errors.whatsappNumber = "Enter a reasonable WhatsApp number.";
  }

  return errors;
}

function validateSignupEmailPassword(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors = validateEmailPassword(email, password);

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
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

function getAttributionPayload(defaultSource = "course_register_page") {
  if (typeof window === "undefined") {
    return { source: defaultSource };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    source: sanitizeClientText(searchParams.get("source") ?? "") || defaultSource,
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

function getPostAuthTarget(fallbackPath: string = algoTradingCourse.accessRoute) {
  if (typeof window === "undefined") {
    return fallbackPath;
  }

  const searchParams = new URLSearchParams(window.location.search);

  return getSafeClientPath(
    searchParams.get("next"),
    fallbackPath,
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

    const parsed = JSON.parse(storedValue) as Partial<Record<keyof PendingRegistration, unknown>>;

    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      whatsappNumber:
        typeof parsed.whatsappNumber === "string" ? parsed.whatsappNumber : "",
      courseSlug: typeof parsed.courseSlug === "string" ? parsed.courseSlug : "",
      source: typeof parsed.source === "string" ? parsed.source : "",
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : "",
      utmMedium: typeof parsed.utmMedium === "string" ? parsed.utmMedium : "",
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : "",
      intendedNext: typeof parsed.intendedNext === "string" ? parsed.intendedNext : "",
    };
  } catch {
    return null;
  }
}

function getPendingAttributionPayload(pendingRegistration: PendingRegistration) {
  return {
    source: sanitizeClientText(pendingRegistration.source),
    utmSource: sanitizeClientText(pendingRegistration.utmSource),
    utmMedium: sanitizeClientText(pendingRegistration.utmMedium),
    utmCampaign: sanitizeClientText(pendingRegistration.utmCampaign),
  };
}

function hasUsablePendingRegistration(
  pendingRegistration: PendingRegistration | null,
): pendingRegistration is PendingRegistration {
  return Boolean(
    pendingRegistration?.courseSlug === courseSlug &&
      pendingRegistration.fullName &&
      pendingRegistration.whatsappNumber,
  );
}

function hasCompleteCourseRegistration(
  registration: RegistrationResponse["registration"],
) {
  return Boolean(
    registration?.fullName?.trim() && registration.whatsappNumber?.trim(),
  );
}

function setPendingRegistration(
  fullName: string,
  whatsappNumber: string,
  {
    email = "",
    source,
    defaultNext = algoTradingCourse.accessRoute,
  }: {
    email?: string;
    source: string;
    defaultNext?: string;
  },
) {
  if (typeof window === "undefined") {
    return;
  }

  const attribution = getAttributionPayload(source);
  const payload = {
    fullName: sanitizeClientText(fullName),
    email: sanitizeClientText(email),
    whatsappNumber: sanitizeClientText(whatsappNumber),
    courseSlug,
    ...attribution,
    intendedNext: getPostAuthTarget(defaultNext),
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

function WhatsappNumberFields({
  idPrefix,
  values,
  errorMessage,
  onChange,
  compact = false,
}: {
  idPrefix: string;
  values: WhatsappInputValues;
  errorMessage?: string;
  onChange: (values: WhatsappInputValues) => void;
  compact?: boolean;
}) {
  const isManualCountryCode =
    values.whatsappCountryCode === manualCountryCodeValue;
  const errorId = `${idPrefix}Whatsapp-error`;
  const whatsappGridStyle = compact && !isManualCountryCode
    ? {
        display: "grid",
        gap: 8,
        gridTemplateColumns: "minmax(112px, 0.84fr) minmax(0, 1.16fr)",
      }
    : { display: "grid", gap: 8 };

  return (
    <div>
      <label className="form-label" htmlFor={`${idPrefix}WhatsappLocal`}>
        WhatsApp number *
      </label>
      <div style={whatsappGridStyle}>
        <select
          className="form-control"
          value={values.whatsappCountryCode}
          onChange={(event) =>
            onChange({
              ...values,
              whatsappCountryCode: event.target.value,
            })
          }
          aria-label="WhatsApp country code"
        >
          {whatsappCountryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isManualCountryCode ? (
          <input
            className="form-control"
            value={values.whatsappManualCountryCode}
            onChange={(event) =>
              onChange({
                ...values,
                whatsappManualCountryCode: event.target.value,
              })
            }
            autoComplete="tel-country-code"
            inputMode="tel"
            placeholder="+1"
            type="tel"
            aria-label="Manual WhatsApp country code"
          />
        ) : null}

        <input
          id={`${idPrefix}WhatsappLocal`}
          className="form-control"
          value={values.whatsappLocalNumber}
          onChange={(event) =>
            onChange({
              ...values,
              whatsappLocalNumber: event.target.value,
            })
          }
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="Phone number"
          type="tel"
          aria-describedby={errorId}
        />
      </div>
      <FieldError id={errorId} message={errorMessage} />
    </div>
  );
}

export default function AlgoTradingCourseRegister({
  embedded = false,
  compactEmbedded = false,
  initialMode = "signup",
  className = "",
  attributionSource = "course_register_page",
  defaultNext = algoTradingCourse.accessRoute,
  heading = "Register or log in to continue",
  subheading = "Your email comes from Supabase Auth. WhatsApp is collected only for course updates and support.",
  modeHrefPath = algoTradingCourse.registerRoute,
  modeHrefHash = "",
}: AlgoTradingCourseRegisterProps = {}) {
  const [activeMode, setActiveMode] = useState<AuthMode>(initialMode);
  const [signupValues, setSignupValues] = useState(initialSignupValues);
  const [loginValues, setLoginValues] = useState(initialLoginValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "signup" | "login" | "reset" | "retry" | null
  >(null);
  const [hasCourseRegistration, setHasCourseRegistration] = useState(false);
  const [courseAccessLinkIssue, setCourseAccessLinkIssue] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState("");
  const supportEmail = getPublicContactDetails().email;
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
  const modeHrefSeparator = modeHrefPath.includes("?") ? "&" : "?";
  const compactLoginHref = `${modeHrefPath}${modeHrefSeparator}mode=login${modeHrefHash}`;
  const compactSignupHref = `${modeHrefPath}${modeHrefHash}`;

  function getAuthCallbackReturnPath() {
    if (typeof window === "undefined") {
      return algoTradingCourse.registerRoute;
    }

    const search = window.location.search || "";
    const hash = embedded ? "#register" : window.location.hash || "";

    return `${window.location.pathname}${search}${hash}`;
  }

  const redirectToPostAuthTarget = useCallback(function redirectToPostAuthTarget() {
    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(getPostAuthTarget(defaultNext));
  }, [defaultNext]);

  function getSupabaseClientOrWarn() {
    try {
      return createSupabaseBrowserClient();
    } catch (error) {
      setStatus({
        type: "error",
        message: getAuthErrorMessage(error),
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

  const saveCourseRegistration = useCallback(async function saveCourseRegistration(
    fullName: string,
    whatsappNumber: string,
    attributionPayload?: ReturnType<typeof getAttributionPayload>,
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
        ...(attributionPayload ?? getAttributionPayload(attributionSource)),
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
    redirectToPostAuthTarget();
  }, [attributionSource, redirectToPostAuthTarget]);

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
      setSignedInEmail(user.email ?? "");

      try {
        const existingRegistration = await loadCourseRegistration();

        if (hasCompleteCourseRegistration(existingRegistration)) {
          clearPendingRegistration();
          setHasCourseRegistration(true);
          setCourseAccessLinkIssue(false);
          setStatus(null);
          redirectToPostAuthTarget();
          return;
        }

        if (hasUsablePendingRegistration(pendingRegistration)) {
          await saveCourseRegistration(
            pendingRegistration.fullName,
            pendingRegistration.whatsappNumber,
            getPendingAttributionPayload(pendingRegistration),
          );
          return;
        }

        setHasCourseRegistration(false);
        setCourseAccessLinkIssue(true);
        setStatus(null);
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
  }, [redirectToPostAuthTarget, saveCourseRegistration]);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const confirmPassword = isCompactEmbedded
      ? signupValues.password
      : sanitizeClientText(
          event.currentTarget.querySelector<HTMLInputElement>(
            `#${fieldIdPrefix}SignupConfirmPassword`,
          )?.value ?? "",
        );
    const whatsappResult = buildWhatsappNumber(signupValues);
    const profileErrors = validateProfile(
      signupValues.fullName,
      whatsappResult.value,
    );
    const authErrors = validateSignupEmailPassword(
      signupValues.email,
      signupValues.password,
      confirmPassword,
    );
    const nextErrors = {
      ...profileErrors,
      ...authErrors,
      ...(whatsappResult.error
        ? { whatsappNumber: whatsappResult.error }
        : {}),
    };
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      return;
    }

    setLoadingAction("signup");
    setPendingRegistration(signupValues.fullName, whatsappResult.value, {
      email: signupValues.email,
      source: attributionSource,
      defaultNext,
    });

    const { data, error } = await supabase.auth.signUp({
      email: sanitizeClientText(signupValues.email),
      password: signupValues.password,
      options: {
        data: {
          full_name: sanitizeClientText(signupValues.fullName),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getAuthCallbackReturnPath())}`,
      },
    });

    if (error) {
      setStatus({
        type: "error",
        message: getAuthErrorMessage(error),
      });
      setLoadingAction(null);
      return;
    }

    if (data.session) {
      try {
        await saveCourseRegistration(
          signupValues.fullName,
          whatsappResult.value,
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
        "Check your email to confirm your account, then log in to continue to Lecture 1 + Lecture 2.",
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
        message: getAuthErrorMessage(error),
      });
      setLoadingAction(null);
      return;
    }

    setSignedInEmail(data.user?.email ?? sanitizeClientText(loginValues.email));

    try {
      const existingRegistration = await loadCourseRegistration();

      if (hasCompleteCourseRegistration(existingRegistration)) {
        clearPendingRegistration();
        setHasCourseRegistration(true);
        setCourseAccessLinkIssue(false);
        setStatus(null);
        setLoadingAction(null);
        redirectToPostAuthTarget();
        return;
      }

      const pendingRegistration = getPendingRegistration();

      if (hasUsablePendingRegistration(pendingRegistration)) {
        await saveCourseRegistration(
          pendingRegistration.fullName,
          pendingRegistration.whatsappNumber,
          getPendingAttributionPayload(pendingRegistration),
        );
        return;
      }

      setHasCourseRegistration(false);
      setCourseAccessLinkIssue(true);
      setStatus(null);
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

  async function handleRetryAccessCheck() {
    setStatus(null);
    setErrors({});
    setLoadingAction("retry");

    try {
      const existingRegistration = await loadCourseRegistration();

      if (hasCompleteCourseRegistration(existingRegistration)) {
        clearPendingRegistration();
        setHasCourseRegistration(true);
        setCourseAccessLinkIssue(false);
        setStatus(null);
        setLoadingAction(null);
        redirectToPostAuthTarget();
        return;
      }

      const pendingRegistration = getPendingRegistration();

      if (hasUsablePendingRegistration(pendingRegistration)) {
        await saveCourseRegistration(
          pendingRegistration.fullName,
          pendingRegistration.whatsappNumber,
          getPendingAttributionPayload(pendingRegistration),
        );
        return;
      }

      setCourseAccessLinkIssue(true);
      setStatus({
        type: "error",
        message: "Course registration could not be linked from this session.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Course registration could not be saved.",
      });
    } finally {
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
        message: getAuthErrorMessage(error),
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

  function handleLogoutLinkClick() {
    clearPendingRegistration();
  }

  const authCard = (
    <div className={authCardClassName}>
            <div className="algo-course-auth-header">
              {!isCompactEmbedded ? (
                <p className="eyebrow">Account Access</p>
              ) : null}
              <h2 className="subsection-title">{heading}</h2>
              <p className="body-compact">{subheading}</p>
            </div>

            {hasCourseRegistration ? (
              <div className="algo-course-logged-in-panel">
                <div className="algo-course-auth-state-copy">
                  <h3>You are logged in</h3>
                </div>
                <div className="algo-course-signed-in-note">
                  <CheckCircle2 size={19} strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    You are logged in{signedInEmail ? ` as ${signedInEmail}` : ""}.
                  </span>
                </div>

                <div className="algo-course-auth-action-row">
                  <Button href={algoTradingCourse.accessRoute} variant="primary">
                    {isCompactEmbedded
                      ? "Continue to My Lectures"
                      : "Continue to lessons"}
                  </Button>
                  <Button
                    href={courseLogoutHref}
                    variant="secondary"
                    onClick={handleLogoutLinkClick}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            ) : courseAccessLinkIssue ? (
              <div className="algo-course-auth-issue-panel">
                <div className="algo-course-auth-state-copy">
                  <h3>Course access could not be linked</h3>
                  <p>{courseAccessLinkIssueCopy}</p>
                </div>

                <div className="algo-course-auth-action-row algo-course-auth-action-row-issue">
                  <Button
                    href={courseLogoutHref}
                    variant="secondary"
                    onClick={handleLogoutLinkClick}
                  >
                    Log out
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleRetryAccessCheck}
                    disabled={loadingAction === "retry"}
                  >
                    {loadingAction === "retry" ? "Retrying..." : "Retry"}
                  </Button>
                  {supportEmail ? (
                    <Button
                      href={`mailto:${supportEmail}`}
                      variant="secondary"
                    >
                      Contact support
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {!isCompactEmbedded ? (
                  <div className="algo-course-auth-tabs" role="tablist" aria-label="Course auth options">
                    <button
                      type="button"
                      className={activeMode === "signup" ? "is-active" : ""}
                      onClick={() => {
                        setActiveMode("signup");
                        setErrors({});
                        setStatus(null);
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
                        setStatus(null);
                      }}
                    >
                      Log in
                    </button>
                  </div>
                ) : null}

                {activeMode === "signup" ? (
                  <form className="algo-course-auth-form" onSubmit={handleSignup}>
                    <div>
                      <label className="form-label" htmlFor={`${fieldIdPrefix}SignupName`}>
                        Full name *
                      </label>
                      <input
                        id={`${fieldIdPrefix}SignupName`}
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
                        aria-describedby={`${fieldIdPrefix}SignupName-error`}
                      />
                      <FieldError
                        id={`${fieldIdPrefix}SignupName-error`}
                        message={errors.fullName}
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor={`${fieldIdPrefix}SignupEmail`}>
                        Email address *
                      </label>
                      <input
                        id={`${fieldIdPrefix}SignupEmail`}
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
                        aria-describedby={`${fieldIdPrefix}SignupEmail-error`}
                      />
                      <FieldError
                        id={`${fieldIdPrefix}SignupEmail-error`}
                        message={errors.email}
                      />
                    </div>

                    {isCompactEmbedded ? (
                      <WhatsappNumberFields
                        idPrefix={`${fieldIdPrefix}Signup`}
                        values={signupValues}
                        onChange={(nextValues) =>
                          setSignupValues((current) => ({
                            ...current,
                            ...nextValues,
                          }))
                        }
                        errorMessage={errors.whatsappNumber}
                        compact={isCompactEmbedded}
                      />
                    ) : null}

                    <div>
                      <label
                        className="form-label"
                        htmlFor={`${fieldIdPrefix}SignupPassword`}
                      >
                        Password *
                      </label>
                      <input
                        id={`${fieldIdPrefix}SignupPassword`}
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
                        aria-describedby={`${fieldIdPrefix}SignupPassword-error`}
                      />
                      <FieldError
                        id={`${fieldIdPrefix}SignupPassword-error`}
                        message={errors.password}
                      />
                    </div>

                    {!isCompactEmbedded ? (
                      <div>
                        <label
                          className="form-label"
                          htmlFor={`${fieldIdPrefix}SignupConfirmPassword`}
                        >
                          Confirm password *
                        </label>
                        <input
                          id={`${fieldIdPrefix}SignupConfirmPassword`}
                          className="form-control"
                          autoComplete="new-password"
                          placeholder="Confirm your password"
                          type="password"
                          aria-describedby={`${fieldIdPrefix}SignupConfirmPassword-error`}
                        />
                        <FieldError
                          id={`${fieldIdPrefix}SignupConfirmPassword-error`}
                          message={errors.confirmPassword}
                        />
                      </div>
                    ) : null}

                    {!isCompactEmbedded ? (
                      <WhatsappNumberFields
                        idPrefix={`${fieldIdPrefix}Signup`}
                        values={signupValues}
                        onChange={(nextValues) =>
                          setSignupValues((current) => ({
                            ...current,
                            ...nextValues,
                          }))
                        }
                        errorMessage={errors.whatsappNumber}
                      />
                    ) : null}

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loadingAction === "signup"}
                    >
                      {loadingAction === "signup"
                        ? isCompactEmbedded
                          ? "Unlocking..."
                          : "Creating Account..."
                        : isCompactEmbedded
                          ? "Unlock My 2 Free Lectures"
                          : "Create Free Account"}
                    </Button>

                    {isCompactEmbedded ? (
                      <a
                        className="algo-course-auth-mode-link"
                        href={compactLoginHref}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveMode("login");
                          setErrors({});
                          setStatus(null);
                        }}
                      >
                        Already registered? Log in
                      </a>
                    ) : null}
                  </form>
                ) : (
                  <form className="algo-course-auth-form" onSubmit={handleLogin}>
                    <div>
                      <label className="form-label" htmlFor={`${fieldIdPrefix}LoginEmail`}>
                        Email address *
                      </label>
                      <input
                        id={`${fieldIdPrefix}LoginEmail`}
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
                        aria-describedby={`${fieldIdPrefix}LoginEmail-error`}
                      />
                      <FieldError
                        id={`${fieldIdPrefix}LoginEmail-error`}
                        message={errors.email}
                      />
                    </div>

                    <div>
                      <div className="algo-course-password-label-row">
                        <label
                          className="form-label"
                          htmlFor={`${fieldIdPrefix}LoginPassword`}
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
                        id={`${fieldIdPrefix}LoginPassword`}
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
                        aria-describedby={`${fieldIdPrefix}LoginPassword-error`}
                      />
                      <FieldError
                        id={`${fieldIdPrefix}LoginPassword-error`}
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
                        : isCompactEmbedded
                          ? "Continue to My Lectures"
                          : "Log In and Continue"}
                    </Button>

                    {isCompactEmbedded ? (
                      <a
                        className="algo-course-auth-mode-link"
                        href={compactSignupHref}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveMode("signup");
                          setErrors({});
                          setStatus(null);
                        }}
                      >
                        Need free access? Sign up
                      </a>
                    ) : null}
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

            {!isCompactEmbedded ? (
              <div className="algo-course-auth-footnote">
                <span>Next</span>
                <p>
                  After registration you will be sent to the protected free
                  access page.
                </p>
                <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
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

          {authCard}
        </div>
      </section>
    </main>
  );
}
