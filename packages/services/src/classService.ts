// services/categoryService.ts
import { AulasDaSemanaResponse } from "@eugenios/types";
import api from "@eugenios/services/axios";

export async function getMockData(date?: string): Promise<AulasDaSemanaResponse> {
  try {
    const params = date ? { date } : {};
    const response = await api.get("class/mock-data", { params });
    if (!response.data) {
      throw new Error("Nenhuma aula encontrada");
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    throw new Error("Falha ao buscar aulas");
  }
}

export async function getAllClasses(date?: string): Promise<AulasDaSemanaResponse> {
  try {
    const params = date ? { date } : {};
    const response = await api.get("class", { params });
    if (!response.data) {
      throw new Error("Nenhuma aula encontrada");
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    throw new Error("Falha ao buscar aulas");
  }
}
