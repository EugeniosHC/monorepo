// app/admin/page.tsx

import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import SectionClient from "./client";
import {
  prefetchSectionByWebsiteAndType,
  prefetchSectionsByWebsite,
} from "@eugenios/react-query/server/useServerSections";
import { notFound } from "next/navigation";
import { SectionType } from "@eugenios/types/src";

export const metadata = {
  title: "Dashboard Administrativo - Gestão de Secções",
  description: "Gerencie seções",
};

export default async function ProductDashboardPage(props: { params: Promise<{ website: string; section: string }> }) {
  const params = await props.params;
  const { website, section } = params;

  if (!website || (website !== "web" && website !== "shop")) {
    notFound();
  }

  if (!section) {
    notFound();
  }

  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  const sectionType = section.toUpperCase();
  if (!Object.values(SectionType).includes(sectionType as SectionType)) {
    notFound();
  }

  await prefetchSectionByWebsiteAndType(queryClient, website, sectionType as SectionType);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <SectionClient website={website} sectionType={sectionType} />
      </HydrationProvider>
    </>
  );
}
