"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Carregar DevTools apenas em desenvolvimento e de forma dinâmica
const ReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === "development"
      ? import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools)
      : Promise.resolve(() => null),
  { ssr: false }
);

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 15, // 15 minutos
            retry: 1,
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false, // Desativa o refetch automático ao focar a janela
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
          hydrateOptions: {
            defaultOptions: {
              queries: {
                structuralSharing: true, // Otimiza a comparação entre dados
              },
            },
          },
        });
      } catch (error) {
        console.error("Erro ao persistir o cliente de query:", error);
      }
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
