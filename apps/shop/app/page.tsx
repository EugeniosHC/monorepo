import { dehydrate } from "@tanstack/react-query";
import { prefetchCategories } from "@eugenios/react-query/src/server/useServerCategories";
import HydrationProvider from "@/providers/HydrationProvider";
import HomeClient from "./client";
import { cache } from "react";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";

export default async function HomePage() {
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient(); // <- aqui você chama a função

  await prefetchCategories(queryClient);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <HomeClient />
      </HydrationProvider>
    </>
  );
}
