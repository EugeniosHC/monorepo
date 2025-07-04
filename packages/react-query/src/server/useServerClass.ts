import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../queryKeys";
import { getMockData, getAllClasses } from "@eugenios/services/classService";

export async function prefetchClass(queryClient: QueryClient, date?: string) {
  try {
    const classData = await getAllClasses(date);
    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getClass(date),
      queryFn: () => classData,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching class:", error);
    return queryClient; // Return client even on error to avoid breaking SSR
  }
}
