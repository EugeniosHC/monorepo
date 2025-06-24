import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getCategorySections } from "@eugenios/services/src/categorySectionService";

export async function prefetchCategorySections(queryClient: QueryClient) {
  try {
    const sections = await getCategorySections();

    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getAllCategorySections(),
      queryFn: () => sections,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching sections:", error);
    return queryClient;
  }
}
