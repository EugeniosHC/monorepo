"use client";

import { useState } from "react";
import { Section } from "@eugenios/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@eugenios/ui/components/accordion";

interface ProductInfoAccordionProps {
  sections?: Section[];
  title?: string;
  subtitle?: string;
}

export default function ProductInfoAccordion({
  sections,
  title = "INFORMAÇÕES DO PRODUTO",
  subtitle = "Detalhes importantes",
}: ProductInfoAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Toggle section open/closed
  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  const renderSectionContent = (section: Section) => {
    return (
      <AccordionItem value={section.id} key={section.id}>
        <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
        <AccordionContent className="text-base">{section.content}</AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <>
      <div className="text-center mb-10">
        <h3 className="font-bold tracking-tight">{title}</h3>
        <div className="mt-1 mx-auto w-8 h-0.5 bg-primary/80"></div>
      </div>
      {sections && sections.length > 0 ? (
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {sections.map((section) => renderSectionContent(section))}
        </Accordion>
      ) : (
        <div className="container mx-auto px-4 py-8 md:py-36 text-center">
          Nenhuma informação disponível para este produto.
        </div>
      )}
    </>
  );
}
