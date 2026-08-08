import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Process from '../components/Process.jsx';
import Pricing from '../components/Pricing.jsx';
import FAQ from '../components/FAQ.jsx';
import CTA from '../components/CTA.jsx';
import SEO from '../components/SEO.jsx';

export default function Home() {
  return (
    <>
      <SEO
        title="ArpanMentors — 1:1 NEET UG Mentorship"
        description="Personal and group NEET UG mentorship from Arpan Sarkar — weekly Zoom sessions, custom roadmaps, direct WhatsApp access."
        path="/"
      />
      <Hero />
      <About />
      <Process />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
