export const site = {
  name: "Vyntegra",
  founderName: "Sumedh Kumar",
  founderSubtitle: "Founder, Vyntegra",
  founderTemporaryCopy:
    "Sumedh Kumar is the founder of Vyntegra. Additional founder information will be added soon.",
  founderSocialLinks: [
    {
      label: "YouTube",
      href: "https://www.youtube.com/@Sumedhhkumar/",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/sumedhhkumar.ai/",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/sumedhkumar-bhalerao/",
    },
  ],
};

export function getPublicContactDetails() {
  return {
    email: process.env.NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL ?? "",
    phone: process.env.NEXT_PUBLIC_VYNTEGRA_CONTACT_PHONE ?? "",
  };
}

export const availabilityText =
  "Weekdays: 6:00 PM to 10:00 PM IST · Weekends: 12:00 PM to 8:00 PM IST";
