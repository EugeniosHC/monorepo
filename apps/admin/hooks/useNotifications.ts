import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";

interface SendScheduleNotificationParams {
  prevScheduleId: string;
  newScheduleId: string;
  emailTo?: string;
}

interface ScheduleChangesResponse {
  prevSchedule: {
    id: string;
    titulo: string;
  };
  newSchedule: {
    id: string;
    titulo: string;
  };
  changesByDay: Record<string, any>;
  totalChanges: number;
}

/**
 * Hook para enviar notificação de alterações de schedule
 */
export function useSendScheduleNotification() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async (params: SendScheduleNotificationParams) => {
      const { data } = await apiClient.post<ScheduleChangesResponse>(
        "/notifications/send-schedule-notification",
        params
      );
      return data;
    },
  });
}

/**
 * Hook para obter diferenças entre schedules sem enviar email
 */
export function useScheduleChanges(prevScheduleId?: string, newScheduleId?: string) {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["scheduleChanges", prevScheduleId, newScheduleId],
    queryFn: async () => {
      if (!prevScheduleId || !newScheduleId) {
        return null;
      }
      const { data } = await apiClient.get<ScheduleChangesResponse>(
        `/notifications/schedule-changes?prevScheduleId=${prevScheduleId}&newScheduleId=${newScheduleId}`
      );
      return data;
    },
    enabled: !!prevScheduleId && !!newScheduleId,
    staleTime: 0, // Considerar os dados obsoletos imediatamente
    cacheTime: 0, // Não armazenar em cache
    refetchOnWindowFocus: true, // Recarregar ao focar na janela
  });
}
