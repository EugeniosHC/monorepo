import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "sonner";

export interface ExpressClass {
  id?: string;
  nome: string; // "ABS" ou "FUNCIONAL"
  diaSemana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horaInicio: string;
  duracao: number;
  sala: string;
  professor: string;
  intensidade: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpressClassScheduleProposal {
  id: string;
  titulo: string;
  criadoPor: string;
  emailCriador: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO" | "IMPLEMENTADO";
  aprovadoPor?: string;
  emailAprovador?: string;
  dataAprovacao?: string;
  createdAt: string;
  updatedAt: string;
  aulasProposta: ExpressClass[];
}

export interface CreateExpressScheduleDto {
  titulo: string;
  classes: {
    nome: string;
    diaSemana: number;
    horaInicio: string;
    intensidade: string;
  }[];
}

export const expressClassesKeys = {
  all: ["express-classes"] as const,
  lists: () => [...expressClassesKeys.all, "list"] as const,
  proposals: () => [...expressClassesKeys.all, "proposals"] as const,
};

// Hook para listar aulas Express ativas
export function useExpressClasses() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: expressClassesKeys.lists(),
    queryFn: async (): Promise<ExpressClass[]> => {
      const response = await apiClient.get("/class/express");
      return response.data;
    },
    enabled: !isLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para listar propostas de horários Express
export function useExpressClassProposals() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: expressClassesKeys.proposals(),
    queryFn: async (): Promise<ExpressClassScheduleProposal[]> => {
      const response = await apiClient.get("/class/express-schedule");
      return response.data;
    },
    enabled: !isLoading && isAuthenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Hook para criar proposta de horário Express
export function useCreateExpressSchedule() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpressScheduleDto) => {
      const response = await apiClient.post("/class/express-schedule", data);
      return response.data;
    },

    onMutate: async (newSchedule) => {
      await queryClient.cancelQueries({ queryKey: expressClassesKeys.proposals() });

      const previousProposals = queryClient.getQueryData<ExpressClassScheduleProposal[]>(
        expressClassesKeys.proposals()
      );

      // Optimistic update
      if (previousProposals) {
        const optimisticProposal: ExpressClassScheduleProposal = {
          id: "temp-" + Date.now(),
          titulo: newSchedule.titulo,
          criadoPor: "Você",
          emailCriador: "",
          status: "PENDENTE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aulasProposta: newSchedule.classes.map((c) => ({
            nome: c.nome,
            diaSemana: c.diaSemana,
            horaInicio: c.horaInicio,
            intensidade: c.intensidade,
            duracao: 15,
            sala: "Estúdio X",
            professor: "Monitor de Sala",
          })),
        };

        queryClient.setQueryData<ExpressClassScheduleProposal[]>(expressClassesKeys.proposals(), [
          optimisticProposal,
          ...previousProposals,
        ]);
      }

      return { previousProposals };
    },

    onError: (err, _, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(expressClassesKeys.proposals(), context.previousProposals);
      }
      toast.error(err.message || "Erro ao criar proposta de horário");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expressClassesKeys.proposals() });
    },

    onSuccess: () => {
      toast.success("Proposta de horário criada com sucesso!");
    },
  });
}

// Hook para aprovar/rejeitar proposta
export function useUpdateProposalStatus() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; status: "APROVADO" | "REJEITADO"; motivo?: string }) => {
      const response = await apiClient.patch(`/class/express-schedule/${data.id}/status`, {
        status: data.status,
        motivoRejeicao: data.motivo,
      });
      return response.data;
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: expressClassesKeys.proposals() });

      const previousProposals = queryClient.getQueryData<ExpressClassScheduleProposal[]>(
        expressClassesKeys.proposals()
      );

      if (previousProposals) {
        queryClient.setQueryData<ExpressClassScheduleProposal[]>(
          expressClassesKeys.proposals(),
          previousProposals.map((proposal) =>
            proposal.id === data.id
              ? { ...proposal, status: data.status, dataAprovacao: new Date().toISOString() }
              : proposal
          )
        );
      }

      return { previousProposals };
    },

    onError: (err, _, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(expressClassesKeys.proposals(), context.previousProposals);
      }
      toast.error(err.message || "Erro ao atualizar status da proposta");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expressClassesKeys.proposals() });
      queryClient.invalidateQueries({ queryKey: expressClassesKeys.lists() });
    },

    onSuccess: (_, variables) => {
      const message = variables.status === "APROVADO" ? "Proposta aprovada com sucesso!" : "Proposta rejeitada";
      toast.success(message);
    },
  });
}

// Função utilitária para obter estatísticas
export function useExpressClassStats() {
  const { data: expressClasses = [] } = useExpressClasses();
  const { data: proposals = [] } = useExpressClassProposals();

  const stats = {
    totalActive: expressClasses.length,
    totalProposals: proposals.length,
    pendingProposals: proposals.filter((p) => p.status === "PENDENTE").length,
    approvedProposals: proposals.filter((p) => p.status === "APROVADO").length,
    classesByDay: [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      day,
      dayName: day === 0 ? "Domingo" : ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][day],
      count: expressClasses.filter((c) => c.diaSemana === day).length,
    })),
  };

  return stats;
}

// Funções utilitárias para usar no componente
export function useExpressClassUtils() {
  const { data: expressClasses = [] } = useExpressClasses();

  const getClassForSlot = (dia: number, hora: string): ExpressClass | undefined => {
    return expressClasses.find((cls) => cls.diaSemana === dia && cls.horaInicio === hora);
  };

  const isSlotOccupied = (dia: number, hora: string): boolean => {
    return !!getClassForSlot(dia, hora);
  };

  return {
    getClassForSlot,
    isSlotOccupied,
  };
}
