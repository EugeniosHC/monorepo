"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionType } from "@eugenios/types";
import { formSchema, FormData } from "./schema";
import { Form } from "@eugenios/ui/components/form";
import { Button } from "@eugenios/ui/components/button";

import BaseFields from "./fields/BaseFields";
import HeroFields from "./fields/HeroFields";
import MarqueeFields from "./fields/MarqueeFields";
import { Separator } from "@eugenios/ui/src/components/separator";
import { useCreateSection } from "@eugenios/react-query/mutations/useSections";

export default function SectionForm({ websiteName }: { websiteName: string }) {
  const createSection = useCreateSection();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: SectionType.HERO,
      description: "",
      slides: [
        {
          title: "",
          subtitle: "",
          imageUrl: "",
          imageAlt: "",
          buttonIsVisible: true,
          buttonText: "",
          buttonUrl: "",
        },
      ],
    },
  });

  const type = useWatch({ control: form.control, name: "type" });

  // Clean up irrelevant fields when switching section type
  useEffect(() => {
    if (type === SectionType.HERO) {
      form.setValue("slides", [
        {
          title: "",
          subtitle: "",
          imageUrl: "",
          imageAlt: "",
          buttonIsVisible: true,
          buttonText: "",
          buttonUrl: "",
        },
      ]);
      form.unregister("icons");
    } else if (type === SectionType.MARQUEE) {
      form.setValue("icons", [{ icon: "", iconLibrary: "tabler", description: "" }]);
      form.unregister("slides");
    }
  }, [type, form]);

  const onSubmit = (data: FormData) => {
    console.log("SUBMIT DATA", data);

    const sectionData = {
      title: data.title,
      description: data.description,
      type: data.type,
      data: {
        // Dados específicos para o tipo de seção
        ...(data.type === SectionType.HERO ? { slides: data.slides } : { icons: data.icons }),
      },
    };

    createSection.mutate({
      section: sectionData,
      sectionName: websiteName,
    });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto w-full px-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <BaseFields />
                {type === SectionType.HERO && <HeroFields />}
                {type === SectionType.MARQUEE && <MarqueeFields />}
              </div>{" "}
              <Separator />
              <div className="flex justify-end">
                <Button type="submit" size="lg" className="px-8">
                  Criar Seção
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Form>
    </FormProvider>
  );
}
