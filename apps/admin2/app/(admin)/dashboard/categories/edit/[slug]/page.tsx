// app/admin/categories/edit/[id]/page.tsx
import { Metadata } from "next";
import EditCategoryClient from "./client";
import { dehydrate } from "@tanstack/react-query";
import { prefetchCategoryBySlug } from "@eugenios/react-query/server/useServerCategories";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";

export const metadata: Metadata = {
  title: "Editar Categoria - Painel Administrativo",
  description: "Edite uma categoria existente",
};

export default async function EditCategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();
  await prefetchCategoryBySlug(queryClient, slug);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <EditCategoryClient categorySlug={params.slug} />
      </HydrationProvider>
    </>
  );
}
