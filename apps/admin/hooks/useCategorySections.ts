import { CategorySection } from "@eugenios/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";

export const categorySections = {
  all: ["categorySections"] as const,
  lists: () => [...categorySections.all, "list"] as const,
};

// Novo hook para buscar TODAS as seções
export function useCategorySections() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery<CategorySection[] | null>({
    queryKey: categorySections.lists(),
    queryFn: async (): Promise<CategorySection[] | null> => {
      const response = await apiClient.get("/categorySection");
      return response.data as CategorySection[] | null;
    },
    enabled: !isLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
