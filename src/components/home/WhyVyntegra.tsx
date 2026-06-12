import {
  BadgeDollarSign,
  Clock3,
  Headphones,
  IdCard,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import SectionIntro from "@/components/ui/SectionIntro";

const cards = [
  {
    title: "Practical Product-Building Experience",
    icon: Wrench,
    copy: "Vyntegra focuses on usable digital products designed for real requirements.",
  },
  {
    title: "Tailored Solutions Instead of Generic Packages",
    icon: SlidersHorizontal,
    copy: "Each custom enquiry is reviewed against the customer’s actual needs.",
  },
  {
    title: "Transparent Pricing",
    icon: BadgeDollarSign,
    copy: "Ready-to-purchase products and consultations display clear USD pricing.",
  },
  {
    title: "Detailed Expert Profiles",
    icon: IdCard,
    copy: "Expert profiles publish real experience, qualifications, and professional links.",
  },
  {
    title: "Secure Payment Options",
    icon: ShieldCheck,
    copy: "Customers can choose from configured Razorpay, Stripe, and crypto-payment options.",
  },
  {
    title: "Direct Customer Support",
    icon: Headphones,
    copy: "Customers can contact Vyntegra for product, consultation, and enquiry support.",
  },
  {
    title: "Clear Response Timelines",
    icon: Clock3,
    copy: "Custom-solutions enquiries receive a response within 24 hours.",
  },
];

export default function WhyVyntegra() {
  return (
    <section id="why-vyntegra" className="section section-bg-primary">
      <div className="container">
        <SectionIntro heading="Why Vyntegra" />

        <div className="why-grid">
          {cards.map((card) => (
            <article key={card.title} className="standard-card">
              <card.icon size={20} color="#C7A56A" strokeWidth={1.75} />
              <h3 className="card-title" style={{ marginTop: 18 }}>
                {card.title}
              </h3>
              <p className="body-standard" style={{ marginTop: 12 }}>
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
