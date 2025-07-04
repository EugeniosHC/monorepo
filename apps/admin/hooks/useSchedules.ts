import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";

// Enum para status
export enum ScheduleStatus {
  ATIVO = "ATIVO",
  PENDENTE = "PENDENTE",
  APROVADO = "APROVADO",
  REJEITADO = "REJEITADO",
  SUBSTITUIDO = "SUBSTITUIDO",
  RASCUNHO = "RASCUNHO",
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
  atualizadoPor?: string; // Nome de quem atualizou
  createdAt: string;
  updatedAt: string;
  aulas: ScheduleClass[];
  statusHistory?: StatusHistoryItem[];
  isOriginal: boolean;
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

// Hook para listar todos os schedules
export function useListSchedules(status?: ScheduleStatus) {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["schedules", { status }],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      const { data } = await apiClient.get(`/schedules${params}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000, // 10 segundos (mantém fresh por 10s)
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  });
}

// Hook para obter um schedule específico
export function useScheduleDetails(id: string) {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["schedule", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schedules/${id}`);
      return data;
    },
    enabled: !!id, // Só executa se houver um ID
    refetchOnWindowFocus: false,
  });
}

// Hook para obter o schedule ativo
export function useActiveSchedule() {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["active-schedule"],
    queryFn: async () => {
      const { data } = await apiClient.get("/schedules/active");
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000, // 10 segundos (mantém fresh por 10s)
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  });
}

// Hook para obter o histórico de schedules
export function useScheduleHistory() {
  const { apiClient } = useApiClient();

  return useQuery({
    queryKey: ["schedule-history"],
    queryFn: async () => {
      const { data } = await apiClient.get("/schedules/history");
      return data;
    },
    refetchOnWindowFocus: false,
  });
}

// Hook para duplicar um schedule
export function useDuplicateSchedule() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, novoTitulo }: { scheduleId: string; novoTitulo?: string }) => {
      const { data } = await apiClient.post("/schedules/duplicate", {
        scheduleId,
        novoTitulo,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a schedules
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

// Hook para alterar o status de um schedule
export function useChangeScheduleStatus() {
  const { apiClient } = useApiClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      novoStatus,
      nota,
    }: {
      scheduleId: string;
      novoStatus: ScheduleStatus;
      nota?: string;
    }) => {
      const { data } = await apiClient.post("/schedules/status", {
        scheduleId,
        novoStatus,
        nota,
      });
      return data;
    },
  });
}
