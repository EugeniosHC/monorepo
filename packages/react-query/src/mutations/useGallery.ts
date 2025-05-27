// hooks/useGallery.ts
import { Image, ImageGallery } from "@eugenios/types";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { deleteImages, uploadImage } from "@eugenios/services/imageService";

interface DeleteImagesResponse {
  deleted: string[];
  notDeleted: string[];
  inUse: string[];
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: File) => {
      return await uploadImage(data);
    }, // Optimistic update
    onMutate: async (newFile) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getImages() });

      const previousImageGallery = queryClient.getQueryData<ImageGallery>(QueryKeys.getImages());

      if (previousImageGallery) {
        // Create a temporary optimistic image entry
        const optimisticImage: Image = {
          key: URL.createObjectURL(newFile),
          url: URL.createObjectURL(newFile),
          size: String(newFile.size),
          LastModified: new Date().toISOString(),
        };

        // Update the ImageGallery by adding the new image to the images array
        queryClient.setQueryData<ImageGallery>(QueryKeys.getImages(), {
          ...previousImageGallery,
          images: [...previousImageGallery.images, optimisticImage],
        });
      }

      return { previousImageGallery };
    }, // Rollback
    onError: (err, _, context) => {
      if (context?.previousImageGallery) {
        queryClient.setQueryData(QueryKeys.getImages(), context.previousImageGallery);
      }
      toast.error(err.message || "Erro ao criar imagem");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getImages() });
    },

    onSuccess: () => {
      toast.success("Upload com sucesso");
    },
  });
}

export function useDeleteImages() {
  const queryClient = useQueryClient();

  return useMutation<DeleteImagesResponse, Error, string[]>({
    mutationFn: async (keys) => {
      return await deleteImages(keys);
    },

    onError: (err) => {
      toast.error(err.message || "Erro ao excluir imagem(s).");
    },

    onSuccess: (response, keys) => {
      const { deleted, notDeleted, inUse } = response;

      if (deleted.length > 0) {
        // Atualiza cache manualmente: remove apenas as imagens realmente excluídas
        const current = queryClient.getQueryData<ImageGallery>(QueryKeys.getImages());

        if (current) {
          const filtered = current.images.filter((image) => !deleted.includes(image.key));

          queryClient.setQueryData(QueryKeys.getImages(), {
            ...current,
            images: filtered,
          });
        }

        toast.success(`${deleted.length} imagem(ns) excluída(s) com sucesso.`);
      }

      if (notDeleted.length > 0) {
        toast.error(`${notDeleted.length} imagem(ns) não foram excluídas.`);
      }

      if (inUse.length > 0) {
        toast.info(`${inUse.length} imagem(ns) estão em uso e não foram excluídas.`);
      }
    },
  });
}
