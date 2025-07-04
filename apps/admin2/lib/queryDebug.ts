export function logQueryCacheStatus(queryClient: any) {
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();

  console.group("React Query Cache Status:");
  console.log(`Total de queries em cache: ${queries.length}`);

  queries.forEach((query: any) => {
    const { queryKey, state } = query;

    console.group(`Query: ${JSON.stringify(queryKey)}`);
    console.log(`Status: ${state.status}`);
    console.log(`Data Atualizada: ${new Date(state.dataUpdatedAt).toLocaleString()}`);
    console.log(`Last Updated: ${new Date(state.dataUpdatedAt).toLocaleString()}`);
    console.log(`Is stale: ${state.isStale}`);
    console.log(`Is fresh: ${!state.isStale}`);
    console.log(`Is fetching: ${state.isFetching}`);
    console.log(`Error: ${state.error}`);
    console.groupEnd();
  });

  console.groupEnd();
}
