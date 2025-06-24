// services/sectionService.ts
import api from "@eugenios/services/axios";
import { Section, SectionResponse, SectionType } from "@eugenios/types";

export async function getSectionsByWebsite(websiteName: string): Promise<Section[] | null> {
  try {
    const response = await api.get(`section/${websiteName}`);
    if (!response.data) {
      throw new Error("Nenhuma seção encontrada");
    }
    return response.data as Section[];
  } catch (error) {
    console.error("Erro ao buscar seções:", error);
    throw new Error("Falha ao buscar seções");
  }
}

export async function getSectionByWebsiteAndType(websiteId: string, type: SectionType): Promise<Section[] | null> {
  try {
    const response = await api.get(`section/${websiteId}/${type}`);
    if (!response.data) {
      return null; // Seção não encontrada
    }
    return response.data as Section[];
  } catch (error) {
    console.error("Erro ao buscar seção:", error);
    throw new Error("Falha ao buscar seção");
  }
}

export async function getActiveSections(): Promise<Record<SectionType, Section | null>> {
  try {
    const response = await api.get("section/active/web");
    if (!response.data) {
      throw new Error("Nenhuma seção encontrada");
    }

    // Create a record with all section types initialized to null
    const sections = Object.values(SectionType).reduce(
      (acc, type) => {
        acc[type as SectionType] = null;
        return acc;
      },
      {} as Record<SectionType, Section | null>
    );

    // Fill in the sections that are available
    (response.data as SectionResponse[]).forEach((item) => {
      sections[item.type] = item.section;
    });

    return sections;
  } catch (error) {
    console.error("Erro ao buscar seções:", error);
    throw new Error("Falha ao buscar seções");
  }
}

export async function createSection(section: Section, sectionName: string): Promise<Section> {
  try {
    const response = await api.post(`section/${sectionName}`, section);
    return response.data as Section;
  } catch (error) {
    console.error("Erro ao criar seção:", error);
    throw new Error("Falha ao criar seção");
  }
}
