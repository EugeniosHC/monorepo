// Exemplo de como usar a função de utilidade em outras queries protegidas
import { QueryClient } from "@tanstack/react-query";
import { prefetchProtectedData } from "./prefetchUtils";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getImages } from "@eugenios/services/src/imageService";

// Função para prefetch de imagens
export async function prefetchGalleryImages(queryClient: QueryClient) {
  return prefetchProtectedData(queryClient, QueryKeys.getImages(), getImages);
}

// Você pode adicionar mais funções de prefetch para outros recursos protegidos aqui
// Por exemplo:

// export async function prefetchUserData(queryClient: QueryClient) {
//   return prefetchProtectedData(
//     queryClient,
//     userQueryKeys.getUserData(),
//     getUserData
//   );
// }

// export async function prefetchProtectedProducts(queryClient: QueryClient) {
//   return prefetchProtectedData(
//     queryClient,
//     produtosQueryKeys.getAllProducts(),
//     getAllProducts
//   );
// }
