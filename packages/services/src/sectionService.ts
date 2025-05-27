// services/sectionService.ts
import api from "@eugenios/services/axios";
import { Section } from "@eugenios/types";

export async function getSections(): Promise<Section[] | null> {
  try {
    const sections = await api.get("section");
    if (!sections.data) {
      throw new Error("Nenhuma seção encontrada");
    }
    return sections.data;
  } catch (error) {
    console.error("Erro ao buscar seções:", error);
    throw new Error("Falha ao buscar seções");
  }
}
