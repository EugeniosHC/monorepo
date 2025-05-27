import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getSections } from "@eugenios/services/src/sectionService";

export async function prefetchSections(queryClient: QueryClient) {
  try {
    const sections = await getSections();

    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getAllSections(),
      queryFn: () => sections,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching sections:", error);
    return queryClient;
  }
}
