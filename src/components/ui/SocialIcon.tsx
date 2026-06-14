import type { SocialLink } from "@/types";

type SocialIconProps = {
  label: SocialLink["label"];
  size?: number;
};

export default function SocialIcon({ label, size = 18 }: SocialIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  };

  if (label === "YouTube") {
    return (
      <svg {...commonProps}>
        <rect
          x="3"
          y="6.5"
          width="18"
          height="11"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M10.25 9.35L15.1 12L10.25 14.65V9.35Z" fill="currentColor" />
      </svg>
    );
  }

  if (label === "Instagram") {
    return (
      <svg {...commonProps}>
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.8" cy="7.2" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (label === "Portfolio") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 12H19.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 4C14.1 6.1 15.2 8.75 15.2 12C15.2 15.25 14.1 17.9 12 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 4C9.9 6.1 8.8 8.75 8.8 12C8.8 15.25 9.9 17.9 12 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8.1 10.4H10V16.3H8.1V10.4Z" fill="currentColor" />
      <path
        d="M8 8.2C8 7.6 8.45 7.15 9.05 7.15C9.65 7.15 10.1 7.6 10.1 8.2C10.1 8.8 9.65 9.25 9.05 9.25C8.45 9.25 8 8.8 8 8.2Z"
        fill="currentColor"
      />
      <path
        d="M11.2 10.4H13V11.25C13.35 10.7 13.95 10.2 14.9 10.2C16.25 10.2 17 11.1 17 12.65V16.3H15.1V12.95C15.1 12.15 14.8 11.75 14.15 11.75C13.5 11.75 13.1 12.2 13.1 12.95V16.3H11.2V10.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
