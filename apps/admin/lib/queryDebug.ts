import type { QueryClient, Query } from "@tanstack/react-query";
export function logQueryCacheStatus(queryClient: QueryClient) {
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();

  console.group("React Query Cache Status:");
  console.log(`Total de queries em cache: ${queries.length}`);

  queries.forEach((query: Query) => {
    const { queryKey, state } = query;

    console.group(`Query: ${JSON.stringify(queryKey)}`);
    console.log(`Status: ${state.status}`);
    console.log(`Data Atualizada: ${new Date(state.dataUpdatedAt).toLocaleString()}`);
    console.log(`Last Updated: ${new Date(state.dataUpdatedAt).toLocaleString()}`);
    // Removed isStale and isFetching (not available on QueryState)
    console.log(`Error: ${state.error}`);
    console.groupEnd();
  });

  console.groupEnd();
}
