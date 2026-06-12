import { getPublicContactDetails } from "@/data/site";
import SectionIntro from "@/components/ui/SectionIntro";

export default function Contact() {
  const contact = getPublicContactDetails();
  const hasContact = Boolean(contact.email || contact.phone);

  return (
    <section id="contact" className="section section-bg-primary">
      <div className="container contact-grid">
        <div>
          <SectionIntro
            heading="Contact"
            copy="Have a question or need assistance? Reach out to Vyntegra and we will respond as soon as possible."
          />
          <p className="body-standard">We aim to respond within 24 hours.</p>
        </div>

        <div
          className="standard-card"
          style={{ padding: 28, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.20)" }}
        >
          {hasContact ? (
            <div style={{ display: "grid", gap: 12 }}>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="body-standard">
                  {contact.email}
                </a>
              ) : null}
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="body-standard">
                  {contact.phone}
                </a>
              ) : null}
            </div>
          ) : (
            <p className="body-standard">Contact details will be added soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}
