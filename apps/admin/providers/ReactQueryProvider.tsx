"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 5000, // 5 minutes
            retry: 1,
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      })
  );
  useEffect(() => {
    // Só executamos isso no lado do cliente
    if (typeof window !== "undefined") {
      try {
        const localStoragePersister = createSyncStoragePersister({
          storage: window.localStorage,
        });

        persistQueryClient({
          queryClient: queryClient as any, // Usar type assertion para contornar o erro de tipo
          persister: localStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24 horas
        });
      } catch (error) {
        console.error("Erro ao persistir o cliente de query:", error);
      }
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
