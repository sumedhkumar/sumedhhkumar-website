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
            heading="Contact Vyntegra"
            copy="Reach out for agent purchases, expert consultations, custom software requirements, or general questions."
          />
        </div>

        <div className="depth-panel contact-panel" style={{ padding: 28 }}>
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
