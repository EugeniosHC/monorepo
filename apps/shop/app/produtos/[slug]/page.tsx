import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import {
  prefetchCategoryBySlug,
  prefetchRelatedCategories,
} from "@eugenios/react-query/src/server/useServerCategories";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import { CategoryDataClient } from "./client";

export default async function ProdutoDetalhePage({ params }: { params: { slug: string } }) {
  // 1. Acesse os parâmetros primeiro de forma síncrona
  const { slug } = params;

  // 2. Crie o client de query após acessar os parâmetros
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  // 3. Faça o prefetch usando o slug já extraído
  await Promise.all([prefetchCategoryBySlug(queryClient, slug), prefetchRelatedCategories(queryClient, slug)]);

  return (
    <HydrationProvider state={dehydrate(queryClient)}>
      {/* 4. Passe o slug já extraído */}
      <CategoryDataClient slug={slug} />
    </HydrationProvider>
  );
}
