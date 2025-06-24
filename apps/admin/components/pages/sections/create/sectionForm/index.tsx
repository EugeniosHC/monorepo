"use client";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "@eugenios/ui/components/button";
import { Separator } from "@eugenios/ui/components/separator";

import Header from "./Header";
import SectionConfiguration from "./SectionConfiguration";
import HeroSection from "./HeroSection";
import MarqueeSection from "./MarqueeSection";
import { completeFormSchema, type CompleteFormData, defaultSlide, defaultHighlight } from "./types";
import { SectionType } from "@eugenios/types";
import { useCreateSection } from "@eugenios/react-query/mutations/useSections";

export default function SectionForm({ websiteName }: { websiteName: string }) {
  const [sectionType, setSectionType] = useState<SectionType>(SectionType.HERO);
  const createSection = useCreateSection();
  const form = useForm<CompleteFormData>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: sectionType,
      slides: [defaultSlide()],
      highlights: [], // Start with empty highlights for HERO
    },
  });

  const {
    fields: slideFields,
    append: appendSlide,
    remove: removeSlide,
  } = useFieldArray({
    control: form.control,
    name: "slides",
  });

  const {
    fields: highlightFields,
    append: appendHighlight,
    remove: removeHighlight,
  } = useFieldArray({
    control: form.control,
    name: "highlights",
  });
  async function onSubmit() {
    const isValid = await form.trigger();
    if (!isValid) {
      console.log("Form is invalid, please check the errors.");
      console.log("Form errors:", form.formState.errors);
      return; // Prevent submission when form is invalid
    }

    const formData = form.getValues();

    // Preparar dados baseado no tipo de seção
    const sectionData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      data: {
        // Dados específicos para o tipo de seção
        ...(sectionType === SectionType.HERO ? { slides: formData.slides } : { highlights: formData.highlights }),
      },
    };

    createSection.mutate({
      section: sectionData,
      sectionName: websiteName,
    });

    console.log("Final data:", sectionData);
  }
  function handleSectionTypeChange(value: SectionType) {
    setSectionType(value);
    form.setValue("type", value);

    // Clear validation errors
    form.clearErrors();

    // Reset arrays based on section type
    if (value === SectionType.HERO) {
      // For HERO: ensure we have slides and clear highlights
      form.setValue("slides", [defaultSlide()]);
      form.setValue("highlights", []);
    } else if (value === SectionType.MARQUEE) {
      // For MARQUEE: ensure we have highlights and clear slides
      form.setValue("highlights", [defaultHighlight()]);
      form.setValue("slides", []);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto w-full px-4">
          <Header />
          <div className="space-y-6">
            <SectionConfiguration sectionType={sectionType} onSectionTypeChange={handleSectionTypeChange} />
            {sectionType === SectionType.HERO && (
              <HeroSection fields={slideFields} onAdd={() => appendSlide(defaultSlide())} onRemove={removeSlide} />
            )}
            {sectionType === SectionType.MARQUEE && (
              <MarqueeSection
                fields={highlightFields}
                onAdd={() => appendHighlight(defaultHighlight())}
                onRemove={removeHighlight}
              />
            )}
            <Separator />
            <div className="flex justify-end">
              <Button onClick={onSubmit} size="lg" className="px-8">
                Create Section
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
