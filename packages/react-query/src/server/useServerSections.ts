import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getActiveSections, getSectionByWebsiteAndType, getSectionsByWebsite } from "@eugenios/services/sectionService";
import { SectionType } from "@eugenios/types";

export async function prefetchSectionsByWebsite(queryClient: QueryClient, websiteName: string) {
  try {
    const sections = await getSectionsByWebsite(websiteName);

    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getSectionsByWebsite(websiteName),
      queryFn: () => sections,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching sections by website:", error);
    return queryClient;
  }
}

export async function prefetchSectionByWebsiteAndType(queryClient: QueryClient, websiteId: string, type: SectionType) {
  try {
    const section = await getSectionByWebsiteAndType(websiteId, type);

    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getSectionByWebsiteAndType(websiteId, type),
      queryFn: () => section,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching section by website and type:", error);
    return queryClient; // Return client even on error to avoid breaking SSR
  }
}

export async function prefetchActiveSections(queryClient: QueryClient) {
  try {
    const sections = await getActiveSections();
    // Prefetch and cache the data
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.getActiveSections(),
      queryFn: () => sections,
    });

    return queryClient;
  } catch (error) {
    console.error("Error prefetching sections:", error);
    return queryClient; // Return client even on error to avoid breaking SSR
  }
}
