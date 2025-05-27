// hooks/useProdutos.ts
import { useQuery } from "@tanstack/react-query";
import { Product, SearchData } from "@eugenios/types";

import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getProducts } from "@eugenios/services/productService";

// Função para buscar produtos por pesquisa usando a API Route
async function fetchGetProductsBySearch(query: string): Promise<SearchData> {
  console.log(`FETCH: Buscando produtos por pesquisa "${query}" da API Route /api/products/search?q=...`);
  // Use absolute URL for server-side compatibility
  const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" : "";
  const res = await fetch(`${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`);

  if (!res.ok) {
    // Lida com erros de resposta HTTP
    const errorData = await res.json();
    throw new Error(errorData.message || `Erro ao buscar produtos por "${query}": ${res.status}`);
  }

  return res.json();
}

export function useProductsBySearch(query: string) {
  return useQuery<SearchData>({
    queryKey: QueryKeys.getProductsBySearch(query),
    queryFn: () => fetchGetProductsBySearch(query), // Usa a função fetch que chama a API Route
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}

// Novo hook para buscar TODOS os produtos
export function useProducts() {
  return useQuery<Product[] | null>({
    queryKey: QueryKeys.getAllProducts(),
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}
