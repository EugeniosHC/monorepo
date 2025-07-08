import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { HeroSection } from "@eugenios/types";
// Hook para obter uma section específica
/**
 * Custom hook to fetch a section by its ID.
 * 
 * @param id - The unique identifier of the section to fetch
 * @returns {UseQueryResult<HeroSection>} Query result containing the hero section data
 * @throws Will throw an error if the API request fails
 */
export function useSectionsById(id: string) {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["section", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/section/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}
