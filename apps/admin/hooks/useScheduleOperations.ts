import { ScheduleStatus } from "./useSchedules";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";

// Re-exportar o enum ScheduleStatus
export { ScheduleStatus } from "./useSchedules";

// Interface para criar uma nova classe
export interface CreateClassDTO {
  nome: string;
  categoria: string;
  diaSemana: number;
  horaInicio: string;
  duracao: number;
  sala: string;
  professor: string;
  intensidade: string;
  custo?: number;
}

// Interface para criar um novo schedule
export interface CreateScheduleDTO {
  titulo: string;
  descricao?: string;
  orcamento?: number;
  aulas: CreateClassDTO[];
}

// Hook para obter um schedule específico por ID
export function useScheduleById(id: string) {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["schedule", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Schedule>(`/schedules/${id}`);
      return data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// Hook para criar um novo schedule
export function useCreateSchedule() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async (scheduleData: CreateScheduleDTO) => {
      const { data } = await apiClient.post<Schedule>("/schedules", scheduleData);
      return data;
    },
  });
}

// Hook para atualizar um schedule
export function useUpdateSchedule() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduleData }: { id: string; scheduleData: Partial<CreateScheduleDTO> }) => {
      // Corrigido para atender ao formato esperado pelo backend: UpdateScheduleDto que estende CreateScheduleDto
      const { data } = await apiClient.put<Schedule>(`/schedules`, {
        id, // Usar id diretamente, não scheduleId
        ...scheduleData,
      });
      return data;
    },
    onSuccess: (updatedSchedule) => {
      // Invalidar todas as queries relacionadas a schedules
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", updatedSchedule.id] });

      // Se for um schedule ativo, invalidar também a query do schedule ativo
      if (updatedSchedule.status === ScheduleStatus.ATIVO) {
        queryClient.invalidateQueries({ queryKey: ["active-schedule"] });
      }

      // Atualizar diretamente o cache do schedule específico
      queryClient.setQueryData(["schedule", updatedSchedule.id], updatedSchedule);
    },
  });
}

// Hook para atualizar o status de um schedule
export function useUpdateScheduleStatus() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      nota,
      dataAtivacao,
    }: {
      id: string;
      status: ScheduleStatus;
      nota?: string;
      dataAtivacao?: string;
    }) => {
      const { data } = await apiClient.post<Schedule>(`/schedules/status`, {
        scheduleId: id,
        novoStatus: status,
        nota,
        dataAtivacao,
      });
      return data;
    },
    // Atualização otimista para melhorar a experiência do usuário
    onMutate: async ({ id, status }) => {
      // Cancelar quaisquer refetchs pendentes para não sobrescrever nossa atualização otimista
      await queryClient.cancelQueries({ queryKey: ["schedules"] });
      await queryClient.cancelQueries({ queryKey: ["active-schedule"] });
      await queryClient.cancelQueries({ queryKey: ["schedule", id] });

      // Salvar o estado anterior para rollback em caso de erro
      const previousSchedules = queryClient.getQueryData(["schedules"]);

      // Realizar a atualização otimista da lista de schedules
      queryClient.setQueryData(["schedules"], (old: any) => {
        if (!old || !old.schedules) return old;

        return {
          ...old,
          schedules: old.schedules.map((schedule: Schedule) =>
            schedule.id === id ? { ...schedule, status } : schedule
          ),
        };
      });

      // Retornar o contexto para uso em onError
      return { previousSchedules };
    },
    onError: (err, variables, context) => {
      // Em caso de erro, reverter para o estado anterior
      if (context?.previousSchedules) {
        queryClient.setQueryData(["schedules"], context.previousSchedules);
      }
    },
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a schedules
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["active-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", data.id] });
    },
  });
}

// Hook para excluir um schedule
export function useDeleteSchedule() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/schedules/${id}`);
        return id;
      } catch (error: any) {
        // Capturar a mensagem de erro específica do backend
        const errorMessage =
          error?.response?.data?.message ||
          "Erro ao excluir a programação. Verifique se ela está no estado de rascunho ou rejeitada.";

        // Lançar o erro com a mensagem para ser capturada no componente
        throw new Error(errorMessage);
      }
    },
    // Atualização otimista para melhorar a experiência do usuário
    onMutate: async (id) => {
      // Cancelar quaisquer refetchs pendentes para não sobrescrever nossa atualização otimista
      await queryClient.cancelQueries({ queryKey: ["schedules"] });

      // Salvar o estado anterior para rollback em caso de erro
      const previousSchedules = queryClient.getQueryData(["schedules"]);

      // Realizar a atualização otimista da lista de schedules
      queryClient.setQueryData(["schedules"], (old: any) => {
        if (!old || !old.schedules) return old;

        return {
          ...old,
          schedules: old.schedules.filter((schedule: Schedule) => schedule.id !== id),
        };
      });

      // Retornar o contexto para uso em onError
      return { previousSchedules };
    },
    onError: (err, id, context) => {
      // Em caso de erro, reverter para o estado anterior
      if (context?.previousSchedules) {
        queryClient.setQueryData(["schedules"], context.previousSchedules);
      }
    },
    onSuccess: (id) => {
      // Invalidar todas as queries relacionadas a schedules
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", id] });
    },
  });
}

// Hook para adicionar uma aula a um schedule
export function useAddClassToSchedule() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async ({ scheduleId, classData }: { scheduleId: string; classData: CreateClassDTO }) => {
      const { data } = await apiClient.post<ScheduleClass>(`/schedules/${scheduleId}/classes`, classData);
      return data;
    },
  });
}

// Hook para atualizar uma aula em um schedule
export function useUpdateClassInSchedule() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      classId,
      classData,
    }: {
      scheduleId: string;
      classId: string;
      classData: Partial<CreateClassDTO>;
    }) => {
      const { data } = await apiClient.put<ScheduleClass>(`/schedules/${scheduleId}/classes/${classId}`, classData);
      return data;
    },
  });
}

// Hook para remover uma aula de um schedule
export function useRemoveClassFromSchedule() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async ({ scheduleId, classId }: { scheduleId: string; classId: string }) => {
      await apiClient.delete(`/schedules/${scheduleId}/classes/${classId}`);
    },
  });
}

// Interface para schedule
export interface Schedule {
  id: string;
  titulo: string;
  descricao?: string;
  orcamento?: number;
  status: ScheduleStatus;
  criadoPor: string;
  emailCriador: string;
  dataAtivacao?: string;
  dataDesativacao?: string;
  aprovadoPor?: string;
  emailAprovador?: string;
  dataAprovacao?: string;
  notaAprovacao?: string;
  createdAt: string;
  updatedAt: string;
  aulas: ScheduleClass[];
  statusHistory?: StatusHistoryItem[];
  isOriginal: boolean;
  previousVersion?: string;
  nextVersion?: string;
  substituidoId?: string;
  substituido?: {
    id: string;
    titulo: string;
    status: ScheduleStatus;
  };
}

// Interface para aula dentro de um schedule
export interface ScheduleClass {
  id: string;
  nome: string;
  categoria: string;
  diaSemana: number;
  horaInicio: string;
  duracao: number;
  sala: string;
  professor: string;
  intensidade: string;
  custo?: number;
}

// Interface para item de histórico
export interface StatusHistoryItem {
  id: string;
  statusAntigo: ScheduleStatus;
  statusNovo: ScheduleStatus;
  alteradoPor: string;
  emailAlterador: string;
  nota?: string;
  createdAt: string;
}
