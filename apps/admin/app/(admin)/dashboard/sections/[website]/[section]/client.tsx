"use client";

import SectionsTable from "@/components/pages/sections/SectionTable";
import { useSectionByWebsiteAndType } from "@eugenios/react-query/queries/useSections";
import { SectionType } from "@eugenios/types";

export default function SectionClient({ website, sectionType }: { website: string; sectionType: string }) {
  if (!website || (website !== "web" && website !== "shop")) {
    window.location.href = "/dashboard/sections";
  }

  if (sectionType && !Object.values(SectionType).includes(sectionType as SectionType)) {
    window.location.href = "/dashboard/sections";
  }

  const { data, isLoading, error } = useSectionByWebsiteAndType(website, sectionType as SectionType);

  console.log("Sections data:", data);

  return <SectionsTable data={data} isLoading={isLoading} error={error} />;
}
