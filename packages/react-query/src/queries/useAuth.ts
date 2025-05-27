// hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { User } from "@eugenios/types";

import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { getUser } from "@eugenios/services/authService";

export function useUser() {
  return useQuery<User>({
    queryKey: QueryKeys.getUser(),
    queryFn: () => getUser(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (não busca novos dados durante este período)
    gcTime: 1000 * 60 * 60 * 48, // 48 horas (mantém no cache por mais tempo)
  });
}
