// app/admin/page.tsx
import ProductDashboardClient from "./client";
import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import { prefetchProducts } from "@eugenios/react-query/server/useServerProducts";

export const metadata = {
  title: "Dashboard Administrativo - Gerenciamento de Produtos",
  description: "Gerencie produtos e seções nas categorias",
};

export default async function ProductDashboardPage() {
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  await prefetchProducts(queryClient);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <ProductDashboardClient />
      </HydrationProvider>
    </>
  );
}
