// hooks/useCategories.ts
import { useQuery } from "@tanstack/react-query";
import { Category, CategoryWithMinPrice } from "@eugenios/types";

import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getCategories, getCategory, getRelatedCategories } from "@eugenios/services/categoryService";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: QueryKeys.getCategories(),
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}

export function useCategoryDataBySlug(slug: string) {
  return useQuery<Category | undefined>({
    queryKey: QueryKeys.getCategoryDataBySlug(slug),
    queryFn: () => getCategory(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 48, // 48 horas
  });
}

export function useRelatedCategories(slug: string) {
  return useQuery<CategoryWithMinPrice[]>({
    queryKey: QueryKeys.getRelatedCategories(slug),
    queryFn: () => getRelatedCategories(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 48, // 48 horas
  });
}
