import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getUser } from "@eugenios/services/src/authService";


export function prefetchUser(queryClient: QueryClient) {
  try {
    // Prefetch and cache the data
    queryClient.prefetchQuery({
      queryKey: QueryKeys.getUser(),
      queryFn: () => getUser(),
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching user:", error);
    return queryClient;
  }
}
