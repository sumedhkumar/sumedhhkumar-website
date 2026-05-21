import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experiments from "@/components/sections/Experiments";
import Content from "@/components/sections/Content";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Blog from "@/components/sections/Blog";
import Roadmap from "@/components/sections/Roadmap";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import CursorEffect from "@/components/ui/CursorEffect";
import SpotlightBackground from "@/components/ui/SpotlightBackground";

export default function Home() {
  return (
    <>
      <CursorEffect />
      <SpotlightBackground />
      <Navbar />
      <Hero />
      <About />
      <Experiments />
      <Content />
      <Services />
      <Testimonials />
      <Blog />
      <Roadmap />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
