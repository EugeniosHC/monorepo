// app/admin/page.tsx

import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import SectionClient from "./client";
import { prefetchSectionsByWebsite } from "@eugenios/react-query/server/useServerSections";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Dashboard Administrativo - Gerenciamento de Produtos",
  description: "Gerencie produtos e seções nas categorias",
};

export default async function ProductDashboardPage(props: { params: Promise<{ website: string }> }) {
  const params = await props.params;
  const { website } = params;

  if (!website || (website !== "web" && website !== "shop")) {
    notFound();
  }

  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  await prefetchSectionsByWebsite(queryClient, website);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <SectionClient website={website} />
      </HydrationProvider>
    </>
  );
}
