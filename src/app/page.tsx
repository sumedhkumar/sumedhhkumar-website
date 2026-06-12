import AboutVyntegra from "@/components/home/AboutVyntegra";
import Contact from "@/components/home/Contact";
import CoreOfferings from "@/components/home/CoreOfferings";
import CustomSolutionsForm from "@/components/home/CustomSolutionsForm";
import ExpertsPreview from "@/components/home/ExpertsPreview";
import FeaturedAgents from "@/components/home/FeaturedAgents";
import Founder from "@/components/home/Founder";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import TrustStrip from "@/components/home/TrustStrip";
import WhyVyntegra from "@/components/home/WhyVyntegra";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <CoreOfferings />
      <FeaturedAgents />
      <ExpertsPreview />
      <CustomSolutionsForm />
      <WhyVyntegra />
      <AboutVyntegra />
      <Founder />
      <Testimonials />
      <Contact />
    </main>
  );
}
