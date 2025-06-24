import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getCategorySections } from "@eugenios/services/categorySectionService";
import { CategorySection } from "@eugenios/types";
import { useQuery } from "@tanstack/react-query";

// Novo hook para buscar TODAS as seções
export function useCategorySections() {
  return useQuery<CategorySection[] | null>({
    queryKey: QueryKeys.getAllCategorySections(),
    queryFn: () => getCategorySections(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}
