// hooks/useImages.ts
import { useQuery } from "@tanstack/react-query";
import { Section, SectionType } from "@eugenios/types";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getActiveSections, getSectionByWebsiteAndType } from "@eugenios/services/sectionService";
import { getSectionsByWebsite } from "@eugenios/services/sectionService";

export function useSectionsByWebsite(websiteName: string) {
  return useQuery<Section[] | null>({
    queryKey: QueryKeys.getSectionsByWebsite(websiteName),
    queryFn: () => getSectionsByWebsite(websiteName),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}

export function useSectionByWebsiteAndType(websiteId: string, type: SectionType) {
  return useQuery<Section[] | null>({
    queryKey: QueryKeys.getSectionByWebsiteAndType(websiteId, type),
    queryFn: () => getSectionByWebsiteAndType(websiteId, type),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}

export function useActiveSections() {
  return useQuery<Record<SectionType, Section | null>>({
    queryKey: QueryKeys.getActiveSections(),
    queryFn: () => getActiveSections(), // No token needed here as it's a client-side request with cookies
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}
