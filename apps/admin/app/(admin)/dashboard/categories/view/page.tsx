// app/admin/page.tsx
import CategoryDashboardClient from "./client";
import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import { prefetchCategories } from "@eugenios/react-query/server/useServerCategories";
import { prefetchProducts } from "@eugenios/react-query/server/useServerProducts";
import { prefetchCategorySections } from "@eugenios/react-query/server/useServerCategorySections";

export const metadata = {
  title: "Dashboard Administrativo - Gerenciamento de Categorias",
  description: "Gerencie produtos e seções nas categorias",
};

export default async function CategoryDashboardPage() {
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  await Promise.all([
    prefetchCategories(queryClient),
    prefetchProducts(queryClient),
    prefetchCategorySections(queryClient),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <CategoryDashboardClient />
      </HydrationProvider>
    </>
  );
}
