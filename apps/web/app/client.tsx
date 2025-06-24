"use client";

import MarqueeServices from "@/components/pages/home/MarqueeServices";
import AboutUs from "@/components/pages/home/AboutUs";
import Banner from "@/components/pages/home/Banner";
import ServicesSection from "@/components/pages/home/ServicesSection";
import FeedbackSection from "@/components/pages/home/FeedbackSection";
import RecruitmentSection from "@/components/pages/home/RecruitmentSection";
import PageSection from "@eugenios/ui/components/ui/PageSection";
import HeroSection from "@/components/pages/home/HeroSection";
import { ContactSection } from "@/components/pages/home/ContactSection";
import { useActiveSections } from "@eugenios/react-query/src/queries/useSections";
import { SectionType } from "@eugenios/types";
import { useState, useEffect } from "react";

export default function HomeClient() {
  const { data: sectionsData, isLoading, isError } = useActiveSections();
  const [sectionsByType, setSectionsByType] = useState<Record<SectionType, any>>({} as Record<SectionType, any>);
  const [isDataProcessed, setIsDataProcessed] = useState(false);

  useEffect(() => {
    if (sectionsData) {
      const processedSections: Record<SectionType, any> = {} as Record<SectionType, any>;

      try {
        // Loop through all section types to process them
        Object.values(SectionType).forEach((type) => {
          const sectionType = type as SectionType;
          const sectionData = sectionsData[sectionType];

          // Skip if no section data exists for this type
          if (!sectionData) {
            processedSections[sectionType] = null;
            return;
          }

          let parsedData = null;
          if (sectionData.data) {
            // Parse the data if it's a string (JSON)
            if (typeof sectionData.data === "string") {
              try {
                parsedData = JSON.parse(sectionData.data as unknown as string);
              } catch (e) {
                console.error(`Error parsing JSON data for section type ${sectionType}:`, e);
                parsedData = sectionData.data;
              }
            } else {
              parsedData = sectionData.data;
            }
          }

          // Store the processed section
          processedSections[sectionType] = {
            ...sectionData,
            data: parsedData,
          };
        });

        setSectionsByType(processedSections);
        setIsDataProcessed(true);
      } catch (error) {
        console.error("Error processing sections data:", error);
        setIsDataProcessed(true);
      }
    } else if (isError || (!isLoading && !sectionsData)) {
      setIsDataProcessed(true);
    }
  }, [sectionsData, isLoading, isError]);

  // Debug logging
  useEffect(() => {
    if (isDataProcessed) {
      console.log("Sections by type:", sectionsByType);
    }
  }, [isDataProcessed, sectionsByType]);

  console.log("Sections data:", sectionsData?.[SectionType.HERO]);
  return (
    <div>
      <HeroSection data={sectionsByType[SectionType.HERO]?.data || null} />
      <section
        className="relative flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] shadow-lg"
        id="marquee"
      >
        <MarqueeServices />
      </section>
      <PageSection className="md:py-52 py-32" id="sobre-nos">
        <AboutUs data={sectionsByType[SectionType.ABOUTUS]?.data} />
      </PageSection>
      <section
        className="bg-banner-gradient w-full pt-16 pb-36 md:py-8 relative md:mt-24 shadow-[inset_0_-40px_40px_-15px_rgba(0,0,0,0.2)]"
        id="banner"
      >
        <div className="container mx-auto px-8 flex flex-col md:flex-row">
          <Banner data={sectionsByType[SectionType.BANNER]?.data} />
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
