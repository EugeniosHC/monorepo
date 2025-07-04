import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "sonner";

// Interface adaptada para o novo modelo backend
export interface ClassDetails {
  id?: string;
  categoria: string; // Será convertido para ClassCategory no backend
  nome: string;
  diaSemana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horaInicio: string;
  duracao: number;
  sala?: string; // Adicionado para compatibilidade com o novo modelo
  professor?: string; // Adicionado para compatibilidade com o novo modelo
  intensidade?: string; // Adicionado para compatibilidade com o novo modelo
  custo?: number; // Opcional, com valor 0 para aulas gratuitas
}

export interface ClassScheduleProposal {
  titulo: string;
  descricao?: string;
  aulas: ClassDetails[]; // Alterado de classesList para aulas para manter consistência com o backend
  orcamento?: number; // Alterado de orcamentoTotal para orcamento
}

// Hook para criar uma nova proposta de horário de aulas
export function useCreateClassSchedule() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClassScheduleProposal) => {
      // Preparar os dados para o novo formato da API
      const formattedData = {
        titulo: data.titulo,
        descricao: data.descricao || "",
        orcamento: data.orcamento,
        aulas: data.aulas.map((aula) => ({
          nome: aula.nome,
          categoria: aula.categoria.toUpperCase(), // Converter para o formato do enum (TERRA, AGUA, EXPRESS)
          diaSemana: aula.diaSemana,
          horaInicio: aula.horaInicio,
          duracao: aula.duracao,
          sala: aula.sala || (aula.categoria === "Express" ? "Estúdio X" : "Sala Principal"),
          professor: aula.professor || (aula.categoria === "Express" ? "Monitor de Sala" : "Professor"),
          intensidade: aula.intensidade || "Moderada",
          custo: aula.categoria === "Express" ? undefined : aula.custo,
        })),
      };

      // Usar a nova rota de schedules
      const response = await apiClient.post("/schedules", formattedData);
      return response.data;
    },

    onMutate: async (newSchedule) => {
      // Cancelar queries pendentes para evitar sobrescrever nossos dados otimistas
      await queryClient.cancelQueries({ queryKey: ["pending-schedules"] });

      // Snapshot do valor anterior
      const previousData = queryClient.getQueryData(["pending-schedules"]);

      // Simulação otimista de um novo schedule
      queryClient.setQueryData(["pending-schedules"], (old: any) => {
        const newScheduleData = {
          id: `temp-${Date.now()}`,
          titulo: newSchedule.titulo,
          criadoPor: "Você",
          status: "RASCUNHO", // Alterado para o novo status padrão
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aulas: newSchedule.aulas, // Alterado de classesList para aulas
        };

        if (!old || !old.data || !old.data.schedules) {
          return {
            data: {
              schedules: [newScheduleData],
            },
          };
        }

        return {
          ...old,
          data: {
            ...old.data,
            schedules: [newScheduleData, ...old.data.schedules],
          },
        };
      });

      return { previousData };
    },

    onError: (err, _, context) => {
      // Reverter para o valor anterior em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(["pending-schedules"], context.previousData);
      }
      toast.error(err.message || "Erro ao criar proposta de horário");
    },

    onSettled: () => {
      // Revalidar os dados independentemente do resultado
      queryClient.invalidateQueries({ queryKey: ["pending-schedules"] });
    },

    onSuccess: () => {
      toast.success("Proposta de horário criada com sucesso!");
    },
  });
}

// Constantes úteis para o formulário de criação
export const CLASS_CONSTANTS = {
  DIAS_SEMANA: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  HORARIOS_DISPONIVEIS: [
    "07:00",
    "07:15",
    "07:30",
    "07:45",
    "08:00",
    "08:15",
    "08:30",
    "08:45",
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
    "10:30",
    "10:45",
    "11:00",
    "11:15",
    "11:30",
    "11:45",
    "12:00",
    "12:15",
    "12:30",
    "12:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00",
    "15:15",
    "15:30",
    "15:45",
    "16:00",
    "16:15",
    "16:30",
    "16:45",
    "17:00",
    "17:15",
    "17:30",
    "17:45",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
    "19:00",
    "19:15",
    "19:30",
    "19:45",
    "20:00",
    "20:15",
    "20:30",
    "20:45",
    "21:00",
    "21:15",
    "21:30",
    "21:45",
    "22:00",
  ],
  // Horários específicos para aulas Express (apenas meias horas)
  HORARIOS_EXPRESS: [
    "07:30",
    "08:30",
    "09:30",
    "10:30",
    "11:30",
    "12:30",
    "13:30",
    "14:30",
    "15:30",
    "16:30",
    "17:30",
    "18:30",
    "19:30",
    "20:30",
    "21:30",
  ],
  DURACOES_PADRAO: [30, 45, 50, 60],
  // Duração fixa para Express
  DURACAO_EXPRESS: 15,
  CATEGORIAS: ["Terra", "Agua", "Express"],
  AULAS_POR_CATEGORIA: {
    Terra: ["Circuit Training", "Pilates", "Cycling", "GAP", "YourfitJump", "Local", "Zumba", "Yourfit Fight"],
    Agua: ["Hidro", "Natação N1", "Natação N2", "Natação N3", "Natação Bebes", "Natação Adultos"],
    Express: ["ABS", "Funcional"],
  },
  // Cores para cada categoria
  CORES_CATEGORIA: {
    Terra: "#ffa752",
    Agua: "#7e8da2",
    Express: "#a7a7a7",
  },
} as const;
