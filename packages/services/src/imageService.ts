// services/categoryService.ts
import api from "@eugenios/services/axios";
import { Image, ImageGallery } from "@eugenios/types";

export async function getImages(serverToken?: string): Promise<ImageGallery> {
  try {
    const headers: Record<string, string> = {};

    // If we have a server token, use it in the headers
    if (serverToken) {
      headers["Cookie"] = `auth_token=${serverToken}`;
    }

    const response = await api.get("cloudflare", { headers });

    if (!response.data) {
      throw new Error("Nenhuma imagem encontrada");
    }
    return response.data as ImageGallery;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    throw new Error("Falha ao buscar imagem");
  }
}

export async function uploadImage(file: File): Promise<Image> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("cloudflare/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as Image;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error("Falha ao fazer upload da imagem");
  }
}

export async function deleteImages(
  keys: string[]
): Promise<{ deleted: string[]; notDeleted: string[]; inUse: string[] }> {
  try {
    const response = await api.delete("cloudflare/delete", {
      data: { keys },
    });

    return response.data as { deleted: string[]; notDeleted: string[]; inUse: string[] };
  } catch (error) {
    console.error("Erro ao deletar imagens:", error);
    throw new Error("Falha ao deletar imagens");
  }
}
