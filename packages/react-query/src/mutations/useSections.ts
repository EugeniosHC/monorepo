// hooks/useCreateSection.ts
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { Section, CreateSectionData } from "@eugenios/types";
import { createSection } from "@eugenios/services/sectionService";



export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { section: CreateSectionData; sectionName: string }) => {
      return await createSection(data.section as Section, data.sectionName);
    }, // Optimistic update
    onMutate: async (data) => {
      // Cancel any outgoing refetches for all section-related queries
      await Promise.all([queryClient.cancelQueries({ queryKey: QueryKeys.getSectionsByWebsite(data.sectionName) })]);

      // Snapshot the previous values
      const previousActiveSections = queryClient.getQueryData<Record<string, Section | null>>(
        QueryKeys.getSectionsByWebsite(data.sectionName)
      );

      // Return a context object with the snapshotted values
      return { previousActiveSections };
    }, // Rollback

    onError: (err, data, context) => {
      if (context?.previousActiveSections) {
        queryClient.setQueryData(QueryKeys.getSectionsByWebsite(data.sectionName), context.previousActiveSections);
      }
      toast.error(err.message || "Erro ao criar seção");
    },

    onSuccess: () => {
      toast.success("Seção criada com sucesso");
    },
  });
}
