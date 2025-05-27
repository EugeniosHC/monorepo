import { QueryClient } from "@tanstack/react-query";

// src/getQueryClient.ts
export function createDefaultQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 5000,
        retry: 0,
      },
    },
  });
}

export function createCachedQueryClient(cacheFn: <T extends (...args: any[]) => any>(fn: T) => T) {
  return cacheFn(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 5000,
          retry: 0,
        },
      },
    });
  });
}
