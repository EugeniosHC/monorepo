import { AulasDaSemanaResponse } from "@eugenios/types/src";

export interface ScheduleProps {
  aulas: AulasDaSemanaResponse;
  loading: boolean;
  error: boolean;
  selectedWeek?: Date;
  setSelectedWeek?: (date: Date) => void;
}

export interface FilterState {
  nomes: string[];
  categorias: string[];
  intensidades: string[];
  professores: string[];
  salas: string[];
}

export type ActiveTab = "terra" | "agua";

// Paleta elegante usando as cores do Tailwind config
export const categoryStyles = {
  Terra: "border-l-terrestre bg-terrestre-50 hover:bg-terrestre-100",
  Express: "border-l-xpress bg-white hover:bg-xpress-100",
  Água: "border-l-aqua bg-aqua-50 hover:bg-aqua-100",
};

export const intensityLabels = {
  0: "Relaxamento",
  1: "Suave",
  2: "Moderada",
  3: "Intensa",
  4: "Máxima",
} as const;
