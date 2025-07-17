import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "sonner";

// Tipos baseados no backend
export interface Image {
  key: string;
  url: string;
  size: string;
  LastModified: string;
}

export interface ImageGallery {
  images: Image[];
}

export interface DeleteImagesResponse {
  deleted: string[];
  notDeleted: string[];
  inUse: string[];
}

// Query Keys
export const imageKeys = {
  all: ["images"] as const,
  gallery: () => [...imageKeys.all, "gallery"] as const,
};

// Hook para buscar galeria de imagens
export function useImageGallery() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: imageKeys.gallery(),
    queryFn: async (): Promise<ImageGallery> => {
      const response = await apiClient.get("/cloudflare");
      return response.data as ImageGallery;
    },
    enabled: !isLoading && isAuthenticated, // Só executa quando autenticado
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para upload de imagem
export function useUploadImage() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<Image> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/cloudflare/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data as Image;
    },
    onSuccess: (newImage) => {
      // Adicionar a nova imagem ao cache da galeria
      queryClient.setQueryData<ImageGallery>(imageKeys.gallery(), (old) => {
        if (!old) return { images: [newImage] };
        return {
          images: [newImage, ...old.images], // Adicionar no início
        };
      });

      toast.success("Imagem enviada com sucesso!");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao enviar imagem";
      toast.error(`Erro ao enviar imagem: ${errorMessage}`);
    },
  });
}

// Hook para eliminar imagens
export function useDeleteImages() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keys: string[] | string): Promise<DeleteImagesResponse> => {
      const response = await apiClient.delete("/cloudflare/delete", {
        data: { keys },
      });
      return response.data as DeleteImagesResponse;
    },
    onSuccess: (result) => {
      // Remover imagens eliminadas do cache
      if (result.deleted.length > 0) {
        queryClient.setQueryData<ImageGallery>(imageKeys.gallery(), (old) => {
          if (!old) return old;
          return {
            images: old.images.filter((img) => !result.deleted.includes(img.key)),
          };
        });
      }

      // Mensagens de feedback
      if (result.deleted.length > 0) {
        toast.success(`${result.deleted.length} imagem(ns) eliminada(s) com sucesso!`);
      }

      if (result.inUse.length > 0) {
        toast.warning(`${result.inUse.length} imagem(ns) não eliminada(s) - em uso por produtos.`);
      }

      if (result.notDeleted.length > 0) {
        toast.error(`${result.notDeleted.length} imagem(ns) não puderam ser eliminadas.`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao eliminar imagens";
      toast.error(`Erro ao eliminar imagens: ${errorMessage}`);
    },
  });
}

// Hook para invalidar cache da galeria
export function useInvalidateImageGallery() {
  const queryClient = useQueryClient();

  return {
    invalidateGallery: () => queryClient.invalidateQueries({ queryKey: imageKeys.gallery() }),
    refetchGallery: () => queryClient.refetchQueries({ queryKey: imageKeys.gallery() }),
  };
}
