import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import { useMemo } from "react";

export interface Aula {
  id: string;
  nome: string;
  categoria: string;
  professor: string;
  sala: string;
  hora_inicio: string;
  hora_fim: string;
  intensidade: number;
  vagas_disponiveis: number;
  vagas_totais: number;
}

export interface AulaDoDia {
  dia: string;
  data: string;
  aulas: Aula[];
}

export interface AulasDaSemanaResponse {
  aulas_da_semana: AulaDoDia[];
}

const QUERY_KEYS = {
  getClasses: (date?: string) => (date ? (["classes", date] as const) : (["classes"] as const)),
  getActiveSchedule: ["active-schedule"] as const,
  getPendingSchedules: ["pending-schedules"] as const,
  getImplementedSchedules: ["implemented-schedules"] as const,
};

export function useClasses(date?: string) {
  const { apiClient, isAuthenticated, isLoading: authLoading } = useApiClient();

  const classQuery = useQuery<AulasDaSemanaResponse>({
    queryKey: QUERY_KEYS.getClasses(date),
    queryFn: async () => {
      const params = date ? { date } : {};
      const response = await apiClient.get("class/mock-data", { params });
      return response.data as AulasDaSemanaResponse;
    },
    enabled: isAuthenticated && !authLoading,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 48, // 48 horas
  });

  return {
    data: classQuery.data,
    isLoading: classQuery.isLoading || authLoading,
    isError: classQuery.isError,
    error: classQuery.error,
    refetch: classQuery.refetch,
  };
}

export function useActiveSchedule() {
  const { apiClient, isAuthenticated, isLoading: authLoading } = useApiClient();

  const scheduleQuery = useQuery({
    queryKey: QUERY_KEYS.getActiveSchedule,
    queryFn: async () => {
      const response = await apiClient.get("class/schedules", {
        params: { type: "ATUAL" },
      });
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
  });

  return {
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading || authLoading,
    isError: scheduleQuery.isError,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}

export function usePendingSchedules() {
  const { apiClient, isAuthenticated, isLoading: authLoading } = useApiClient();

  const scheduleQuery = useQuery({
    queryKey: QUERY_KEYS.getPendingSchedules,
    queryFn: async () => {
      const response = await apiClient.get("class/schedules", {
        params: { type: "PENDENTE" },
      });
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
  });

  return {
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading || authLoading,
    isError: scheduleQuery.isError,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}

export function useImplementedSchedules() {
  const { apiClient, isAuthenticated, isLoading: authLoading } = useApiClient();

  const scheduleQuery = useQuery({
    queryKey: QUERY_KEYS.getImplementedSchedules,
    queryFn: async () => {
      const response = await apiClient.get("class/schedules", {
        params: { type: "IMPLEMENTADO" },
      });
      return response.data;
    },
    enabled: isAuthenticated && !authLoading,
  });

  return {
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading || authLoading,
    isError: scheduleQuery.isError,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}

// Hook para obter dados de uma data específica
export function useClassesByDate(date: string) {
  const { apiClient, isAuthenticated, isLoading: authLoading } = useApiClient();

  return useQuery<AulasDaSemanaResponse>({
    queryKey: QUERY_KEYS.getClasses(date),
    queryFn: async () => {
      const response = await apiClient.get("class/mock-data", {
        params: { date },
      });
      return response.data as AulasDaSemanaResponse;
    },
    enabled: isAuthenticated && !authLoading && !!date,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 48, // 48 horas
  });
}
