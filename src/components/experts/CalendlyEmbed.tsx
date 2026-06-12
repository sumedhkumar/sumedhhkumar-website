"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Expert } from "@/types";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize: boolean;
      }) => void;
    };
  }
}

export default function CalendlyEmbed({
  expert,
  enabled,
}: {
  expert: Expert;
  enabled: boolean;
}) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState(
    "Booking configuration is pending.",
  );

  useEffect(() => {
    if (!enabled || !parentRef.current) {
      setMessage("Booking configuration is pending.");
      return;
    }

    let cancelled = false;

    async function loadCalendly() {
      const response = await fetch("/api/bookings/calendly-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId: expert.id }),
      });
      const result = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !result.url || cancelled) {
        setMessage(result.message ?? "Booking configuration is pending.");
        return;
      }

      await new Promise<void>((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://assets.calendly.com/assets/external/widget.js"]',
        );

        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

      if (!cancelled && parentRef.current && window.Calendly) {
        window.Calendly.initInlineWidget({
          url: result.url,
          parentElement: parentRef.current,
          resize: true,
        });
        setMessage("");
      }
    }

    loadCalendly();

    return () => {
      cancelled = true;
    };
  }, [enabled, expert.id]);

  useEffect(() => {
    function handleCalendlyMessage(event: MessageEvent) {
      if (event.origin !== "https://calendly.com") {
        return;
      }

      const eventName = (event.data as { event?: string }).event;

      if (!eventName?.startsWith("calendly.")) {
        return;
      }

      if (eventName === "calendly.event_scheduled") {
        fetch("/api/bookings/calendly-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expertId: expert.id, payload: event.data }),
        }).finally(() => {
          router.push(`/experts/${expert.slug}/confirmation`);
        });
      }
    }

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [expert.id, expert.slug, router]);

  if (message) {
    return (
      <div className="empty-state">
        <h2 className="card-title">Booking configuration is pending.</h2>
        <p className="body-compact">
          Please contact Vyntegra support with your payment confirmation.
        </p>
      </div>
    );
  }

  return <div ref={parentRef} style={{ minHeight: 720 }} />;
}
