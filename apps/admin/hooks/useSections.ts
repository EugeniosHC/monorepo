import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { HeroSection, Slide, SlideItem } from "@eugenios/types";

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
    gcTime: 0, // Disable garbage collection for this query
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook to update a section by its ID.
 *
 * @returns {UseMutationResult} Mutation result for updating the section
 */
export function useUpdateSection() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { slides: (Slide | SlideItem)[] } }) => {
      console.log("🔥🔥🔥 FRONTEND DEBUG START 🔥🔥🔥");
      console.log("Raw data received:", data);
      console.log("First slide raw:", data.slides[0]);
      console.log("First slide buttonText:", data.slides[0]?.buttonText);
      console.log("First slide buttonUrl:", data.slides[0]?.buttonUrl);
      console.log("🔥🔥🔥 FRONTEND DEBUG END 🔥🔥🔥");

      // Direct pass-through to see what happens
      const response = await apiClient.put(`/section/${id}`, { data });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific section
      queryClient.invalidateQueries({ queryKey: ["section", variables.id] });
      // Also invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error: any) => {
      console.error("Error updating section:", error);
      // Let the component handle the error display
      throw error;
    },
  });
}
