import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getProducts } from "@eugenios/services/src/productService";

export async function prefetchProducts(queryClient: QueryClient) {
  try {
    const products = await getProducts();
    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getAllProducts(),
      queryFn: () => products,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching products:", error);
    return queryClient; // Return client even on error to avoid breaking SSR
  }
}
