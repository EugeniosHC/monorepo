import { QueryClient } from "@tanstack/react-query";

/**
 * Função utilitária para prefetch de dados autenticados
 *
 * @param queryClient O cliente de query do React Query
 * @param queryKey A chave da query para armazenar os dados em cache
 * @param fetchFn A função que busca os dados, recebendo opcionalmente um token
 * @param authToken (Opcional) Token de autenticação (pode vir de cookies ou qualquer outra fonte)
 * @returns O cliente de query atualizado
 */
export async function prefetchProtectedData<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  fetchFn: (token?: string) => Promise<T>,
  authToken?: string
) {
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKey,
      queryFn: () => fetchFn(authToken),
    });

    return queryClient;
  } catch (error) {
    console.error(`Error prefetching data for key ${queryKey[0]}:`, error);
    return queryClient;
  }
}
