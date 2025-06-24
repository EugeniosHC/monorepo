import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getCategories, getCategory, getRelatedCategories } from "@eugenios/services/categoryService";


export async function prefetchCategories(queryClient: QueryClient) {
  try {
    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getCategories(),
      queryFn: () => getCategories(),
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching categories:", error);
    return queryClient; // Return client even on error to avoid breaking SSR
  }
}

/**
 * Prefetch category data by slug using API route
 */
export async function prefetchCategoryBySlug(queryClient: QueryClient, slug: string) {
  try {
    // Prefetch and cache the category data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getCategoryDataBySlug(slug),
      queryFn: () => getCategory(slug),
    });

    return queryClient;
  } catch (error) {
    console.error(`Error prefetching data for category ${slug}:`, error);
    return queryClient;
  }
}

export async function prefetchRelatedCategories(queryClient: QueryClient, slug: string) {
  try {
    // Prefetch and cache the related categories data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getRelatedCategories(slug),
      queryFn: () => getRelatedCategories(slug),
    });

    return queryClient;
  } catch (error) {
    console.error(`Error prefetching related categories for ${slug}:`, error);
    return queryClient;
  }
}
