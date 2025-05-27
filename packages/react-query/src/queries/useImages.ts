// hooks/useImages.ts
import { useQuery } from "@tanstack/react-query";
import { ImageGallery } from "@eugenios/types";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getImages } from "@eugenios/services/imageService";

export function useImages() {
  return useQuery<ImageGallery>({
    queryKey: QueryKeys.getImages(),
    queryFn: () => getImages(), // No token needed here as it's a client-side request with cookies
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}
