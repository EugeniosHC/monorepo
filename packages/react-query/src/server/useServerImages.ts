import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getImages } from "@eugenios/services/src/imageService";
import { prefetchProtectedData } from "./prefetchUtils";


export async function prefetchImages(queryClient: QueryClient) {
  // Utilizando a função de utilidade para prefetch de dados protegidos
  return prefetchProtectedData(queryClient, QueryKeys.getImages(), getImages);
}
