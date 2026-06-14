import AboutVyntegra from "@/components/home/AboutVyntegra";
import Contact from "@/components/home/Contact";
import Founder from "@/components/home/Founder";
import Hero from "@/components/home/Hero";
import ProductPathways from "@/components/home/ProductPathways";
import Testimonials from "@/components/home/Testimonials";
import TrustStrip from "@/components/home/TrustStrip";
import WhyVyntegra from "@/components/home/WhyVyntegra";

export default function Home() {
  return (
    <main className="home-page">
      <Hero />
      <TrustStrip />
      <ProductPathways />
      <WhyVyntegra />
      <AboutVyntegra />
      <Founder />
      <Testimonials />
      <Contact />
    </main>
  );
}
