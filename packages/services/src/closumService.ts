// services/sectionService.ts
import api from "@eugenios/services/axios";

export async function addLead(leadData: any): Promise<any> {
  try {
    const response = await api.post("closum/add-lead", leadData);
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar lead:", error);
    throw new Error("Falha ao adicionar lead");
  }
}
