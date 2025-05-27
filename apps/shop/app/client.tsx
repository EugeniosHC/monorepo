import HeroSection from "@/components/pages/home/HeroSection";
import WellnessGrid from "@/components/pages/home/BentoGrid";
import ClientSupportSection from "@/components/sections/ClientSupportSection";
import BannerSection from "@/components/pages/home/BannerSection";
import PageSection from "@eugenios/ui/components/ui/PageSection";

export default function HomeClient() {
  return (
    <div>
      <HeroSection />

      <PageSection className="mt-16 mb-12" id="grid">
        <WellnessGrid />
      </PageSection>

      <PageSection className="mt-16 mb-12" id="grid">
        <ClientSupportSection />
      </PageSection>

      <BannerSection />
    </div>
  );
}
