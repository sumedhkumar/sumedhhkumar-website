"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, KeyRound, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import FieldError from "@/components/ui/FieldError";
import { algoTradingCourse } from "@/data/algo-trading-course";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AlgoTradingCoursePasswordResetProps = {
  initialRecoveryAllowed: boolean;
};

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

type StatusMessage = {
  type: "success" | "error" | "info";
  message: string;
};

function validatePasswords(password: string, confirmPassword: string) {
  const errors: FormErrors = {};

  if (!password) {
    errors.password = "Enter a new password.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
}

export default function AlgoTradingCoursePasswordReset({
  initialRecoveryAllowed,
}: AlgoTradingCoursePasswordResetProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusMessage>({
    type: "info",
    message: "Checking your password reset link...",
  });
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function getSupabaseClientOrWarn() {
    try {
      return createSupabaseBrowserClient();
    } catch {
      setStatus({
        type: "error",
        message:
          "Password reset is not configured yet. Add the public Supabase Auth environment variables.",
      });
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      const supabase = getSupabaseClientOrWarn();

      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session && initialRecoveryAllowed) {
        setHasRecoverySession(true);
        setStatus({
          type: "info",
          message: "Enter a new password for your Vyntegra course account.",
        });
        return;
      }

      setHasRecoverySession(false);
      setStatus({
        type: "error",
        message:
          "This reset link is invalid or expired. Request a new link from the course login page.",
      });
    }

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [initialRecoveryAllowed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({
      type: "info",
      message: "Updating your password...",
    });

    const nextErrors = validatePasswords(password, confirmPassword);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted password fields.",
      });
      return;
    }

    const supabase = getSupabaseClientOrWarn();

    if (!supabase) {
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({
        type: "error",
        message:
          "Your password could not be updated. Request a fresh reset link and try again.",
      });
      setSubmitting(false);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setStatus({
      type: "success",
      message: "Your password has been updated.",
    });
    setSubmitting(false);
  }

  return (
    <main className="algo-course-page algo-course-reset-page">
      <section className="section algo-course-register-hero">
        <div className="container algo-course-reset-shell">
          <div className="depth-panel algo-course-reset-card">
            <div className="algo-course-reset-icon">
              <KeyRound size={24} strokeWidth={1.75} aria-hidden="true" />
            </div>

            <div className="algo-course-auth-header">
              <p className="eyebrow">Account Security</p>
              <h1 className="section-title">Reset Password</h1>
              <p className="body-standard">
                Set a new password for your Vyntegra Trading Automation
                Masterclass account.
              </p>
            </div>

            <div
              className={`algo-course-auth-status algo-course-auth-status-${status.type}`}
              role="status"
            >
              {status.type === "success" ? (
                <CheckCircle2 size={19} strokeWidth={1.75} aria-hidden="true" />
              ) : status.type === "error" ? (
                <CircleAlert size={19} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <KeyRound size={19} strokeWidth={1.75} aria-hidden="true" />
              )}
              <p>{status.message}</p>
            </div>

            {status.type === "success" ? (
              <Button href={algoTradingCourse.registerRoute} variant="primary">
                Continue to Course Login
              </Button>
            ) : (
              <form className="algo-course-auth-form" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label" htmlFor="newPassword">
                    New password *
                  </label>
                  <input
                    id="newPassword"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={!hasRecoverySession || submitting}
                    placeholder="Enter a new password"
                    type="password"
                    aria-describedby="newPassword-error"
                  />
                  <FieldError
                    id="newPassword-error"
                    message={errors.password}
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="confirmNewPassword">
                    Confirm new password *
                  </label>
                  <input
                    id="confirmNewPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={!hasRecoverySession || submitting}
                    placeholder="Confirm your new password"
                    type="password"
                    aria-describedby="confirmNewPassword-error"
                  />
                  <FieldError
                    id="confirmNewPassword-error"
                    message={errors.confirmPassword}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!hasRecoverySession || submitting}
                >
                  {submitting ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            )}

            <div className="algo-course-register-trust">
              <ShieldCheck size={19} strokeWidth={1.75} aria-hidden="true" />
              <p>{algoTradingCourse.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
