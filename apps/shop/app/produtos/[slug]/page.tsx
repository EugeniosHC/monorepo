import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import {
  prefetchCategoryBySlug,
  prefetchRelatedCategories,
} from "@eugenios/react-query/src/server/useServerCategories";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import { CategoryDataClient } from "./client";

export default async function ProdutoDetalhePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  await Promise.all([prefetchCategoryBySlug(queryClient, slug), prefetchRelatedCategories(queryClient, slug)]);

  return (
    <HydrationProvider state={dehydrate(queryClient)}>
      <CategoryDataClient slug={slug} />
    </HydrationProvider>
  );
}
