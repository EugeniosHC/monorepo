import MarqueeServices from "@/components/pages/home/MarqueeServices";
import AboutUs from "@/components/pages/home/AboutUs";
import Banner from "@/components/pages/home/Banner";
import ServicesSection from "@/components/pages/home/ServicesSection";
import FeedbackSection from "@/components/pages/home/FeedbackSection";
import RecruitmentSection from "@/components/pages/home/RecruitmentSection";
import PageSection from "@eugenios/ui/components/ui/PageSection";
import HeroSection from "@/components/pages/home/HeroSection";
import { ContactSection } from "@/components/pages/home/ContactSection";

export default function HomePage() {
  return (
    <div>
      {" "}
      <HeroSection />
      <section
        className="relative flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] shadow-lg"
        id="marquee"
      >
        <MarqueeServices />
      </section>
      <PageSection className="md:py-52 py-32 " id="sobre-nos">
        <AboutUs />
      </PageSection>
      <section
        className="bg-banner-gradient w-full pt-16 pb-36 md:py-8 relative md:mt-24 shadow-[inset_0_-40px_40px_-15px_rgba(0,0,0,0.2)]"
        id="banner"
      >
        <div className="container mx-auto px-8 flex flex-col md:flex-row">
          <Banner />
        </div>
      </section>
      <PageSection className="w-full h-full py-16 md:py-28" id="servicos">
        <ServicesSection />
      </PageSection>
      <PageSection id="feedback" className="w-full h-full py-16 md:py-28 relative">
        <FeedbackSection />
      </PageSection>
      <PageSection id="recrutamento" className="bg-neutral-100 py-16 md:py-32">
        <RecruitmentSection />
      </PageSection>
      <PageSection id="contactos" className="flex flex-col w-full py-20 bg-white">
        <ContactSection />
      </PageSection>
    </div>
  );
}
