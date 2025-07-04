// hooks/useImages.ts
import { useQuery } from "@tanstack/react-query";
import { AulasDaSemanaResponse } from "@eugenios/types";
import { QueryKeys } from "../queryKeys";
import { getMockData, getAllClasses } from "@eugenios/services/classService";

export function useClass(date?: string) {
  return useQuery<AulasDaSemanaResponse>({
    queryKey: QueryKeys.getClass(date),
    queryFn: () => {
      console.log("Making API call for date:", date);
      return getAllClasses(date);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (tempo muito menor para debug)
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}
