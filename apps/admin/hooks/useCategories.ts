import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "sonner";
import { Category, CreateCategory, EditCategory } from "@eugenios/types";

export const categoriesKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesKeys.all, "list"] as const,
};

export function useCategories() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: categoriesKeys.lists(),
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.get("/category");
      return response.data as Category[];
    },
    enabled: !isLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategory) => {
      const response = await apiClient.post("/category", data);
      return response.data;
    },

    // Optimistic update
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previousCategories = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          categoriesKeys.lists(),
          previousCategories.map((cat) => (cat.slug === newCategory.slug ? { ...cat, ...newCategory } : cat))
        );
      }

      return { previousCategories };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao criar categoria");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Categoria criada com sucesso");
    },
  });
}

export function useUpdateCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditCategory) => {
      const response = await apiClient.put(`/category/${data.slug}`, data);
      return response.data;
    },

    // Optimistic update
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previousCategories = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          categoriesKeys.lists(),
          previousCategories.map((cat) => (cat.slug === updatedCategory.slug ? { ...cat, ...updatedCategory } : cat))
        );
      }

      return { previousCategories };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao atualizar categoria");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso");
    },
  });
}

export function useDeleteCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/category/${id}`);
      return response.data;
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previousCategories = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          categoriesKeys.lists(),
          previousCategories.filter((cat) => cat.id !== id)
        );
      }

      return { previousCategories };
    },

    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao deletar categoria");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Categoria excluída com sucesso");
    },
  });
}

export function useAddProductsInCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; productId: string }) => {
      const response = await apiClient.post(`/category/add-product`, {
        categoryId: data.categoryId,
        productId: data.productId,
      });
      return response.data;
    },

    // OPTIMISTIC UPDATE
    onMutate: async ({ categoryId, productId }) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previousCategories = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          categoriesKeys.lists(),
          previousCategories.map((cat) => {
            if (cat.id === categoryId) {
              const alreadyExists = cat.products?.some((p) => p.id === productId);
              if (!alreadyExists) {
                return {
                  ...cat,
                  products: [
                    ...(cat.products || []),
                    {
                      id: productId,
                      name: "Produto (optimistic)",
                      price: 0,
                      description: "Carregando...",
                      imageUrl: "",
                    },
                  ],
                };
              }
            }
            return cat;
          })
        );
      }

      return { previousCategories };
    },

    // ROLLBACK on error
    onError: (_error, _vars, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previousCategories);
      }
      toast.error("Erro ao adicionar produto à categoria");
    },

    // REFRESH on settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Produto adicionado à categoria com sucesso");
    },
  });
}

export function useRemoveProductFromCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; productId: string }) => {
      const response = await apiClient.post(`/category/remove-product`, {
        categoryId: data.categoryId,
        productId: data.productId,
      });
      return response.data;
    },

    onMutate: async ({ categoryId, productId }) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previous = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      queryClient.setQueryData<Category[]>(categoriesKeys.lists(), (old = []) =>
        old.map((cat) =>
          cat.id === categoryId ? { ...cat, products: cat.products?.filter((p) => p.id !== productId) } : cat
        )
      );

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previous);
      }
      toast.error("Erro ao remover produto");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Produto removido com sucesso");
    },
  });
}

export function useAddSectionsInCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; sectionId: string }) => {
      const response = await apiClient.post(`/category/add-section`, {
        categoryId: data.categoryId,
        sectionId: data.sectionId,
      });
      return response.data;
    },

    onMutate: async ({ categoryId, sectionId }) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previous = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      queryClient.setQueryData<Category[]>(categoriesKeys.lists(), (old = []) =>
        old.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                sections: [...(cat.sections || []), { id: sectionId, title: "", content: "" }],
              }
            : cat
        )
      );

      return { previous };
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previous);
      }
      toast.error("Erro ao adicionar seção");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Seção adicionada com sucesso");
    },
  });
}
export function useRemoveSectionFromCategory() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; sectionId: string }) => {
      const response = await apiClient.post(`/category/remove-section`, {
        categoryId: data.categoryId,
        sectionId: data.sectionId,
      });
      return response.data;
    },

    onMutate: async ({ categoryId, sectionId }) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.lists() });

      const previous = queryClient.getQueryData<Category[]>(categoriesKeys.lists());

      queryClient.setQueryData<Category[]>(categoriesKeys.lists(), (old = []) =>
        old.map((cat) =>
          cat.id === categoryId ? { ...cat, sections: cat.sections?.filter((s) => s.id !== sectionId) } : cat
        )
      );

      return { previous };
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoriesKeys.lists(), context.previous);
      }
      toast.error("Erro ao remover seção");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },

    onSuccess: () => {
      toast.success("Seção removida com sucesso");
    },
  });
}
