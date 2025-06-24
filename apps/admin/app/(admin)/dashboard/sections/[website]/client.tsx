"use client";

import SectionsTable from "@/components/pages/sections/SectionTable";
import { useSectionsByWebsite } from "@eugenios/react-query/queries/useSections";

export default function SectionClient({ website }: { website: string }) {
  if (!website || (website !== "web" && website !== "shop")) {
    window.location.href = "/dashboard/sections";
  }

  const { data, isLoading, error } = useSectionsByWebsite(website);

  console.log("Sections data:", data);

  return <SectionsTable data={data} isLoading={isLoading} error={error} />;
}
