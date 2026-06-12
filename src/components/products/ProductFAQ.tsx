"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { ProductFaqItem } from "@/types";

export default function ProductFAQ({ faqs }: { faqs: ProductFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    faqs.length > 0 ? 0 : null,
  );

  return (
    <div>
      {faqs.map((faq, index) => {
        const open = openIndex === index;

        return (
          <div
            key={faq.question}
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "18px 0",
                background: "transparent",
                border: 0,
                color: "#F8F4EC",
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.45,
                textAlign: "left",
              }}
            >
              <span>{faq.question}</span>
              {open ? (
                <Minus size={20} color="#C7A56A" strokeWidth={1.75} />
              ) : (
                <Plus size={20} color="#C7A56A" strokeWidth={1.75} />
              )}
            </button>
            {open ? (
              <p className="body-standard" style={{ paddingBottom: 18 }}>
                {faq.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
