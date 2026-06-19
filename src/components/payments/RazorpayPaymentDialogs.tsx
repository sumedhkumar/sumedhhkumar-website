"use client";

import Button from "@/components/ui/Button";

export type PaymentDialogContent = {
  title: string;
  body: string;
  supportLine?: string;
  note?: string;
};

const defaultSupportLine =
  "If you do not receive an email, contact support@vyntegra.in.";

export function RazorpayVerificationOverlay() {
  return (
    <div className="crypto-dialog-backdrop" role="presentation">
      <div
        className="crypto-dialog payment-verification-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="razorpay-verification-title"
        aria-describedby="razorpay-verification-message"
      >
        <div className="payment-verification-spinner" aria-hidden="true" />
        <div>
          <h4 id="razorpay-verification-title" className="card-title">
            Verifying your payment
          </h4>
          <p id="razorpay-verification-message" className="body-standard">
            Please wait while we securely confirm your payment with Razorpay. Do
            not close this page.
          </p>
          <p className="body-compact payment-verification-secondary">
            This usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentResultDialog({
  dialog,
  titleId,
  messageId,
  buttonLabel = "Done",
  onDone,
}: {
  dialog: PaymentDialogContent;
  titleId: string;
  messageId: string;
  buttonLabel?: string;
  onDone: () => void;
}) {
  const supportLine =
    dialog.supportLine === "" ? "" : dialog.supportLine ?? defaultSupportLine;

  return (
    <div className="crypto-dialog-backdrop" role="presentation">
      <div
        className="crypto-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <h4 id={titleId} className="card-title">
          {dialog.title}
        </h4>
        <p id={messageId} className="body-standard">
          {dialog.body}
        </p>
        {supportLine ? <p className="body-compact">{supportLine}</p> : null}
        {dialog.note ? <p className="body-compact">{dialog.note}</p> : null}
        <Button type="button" variant="primary" onClick={onDone}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
