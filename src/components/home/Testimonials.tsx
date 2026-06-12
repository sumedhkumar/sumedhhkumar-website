import { testimonials } from "@/data/testimonials";
import SectionIntro from "@/components/ui/SectionIntro";

export default function Testimonials() {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="section section-bg-secondary">
      <div className="container">
        <SectionIntro heading="What Customers Say" />
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.quote} className="standard-card">
              <p className="body-standard">{testimonial.quote}</p>
              <p className="tag" style={{ marginTop: 16 }}>
                {testimonial.attribution}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
