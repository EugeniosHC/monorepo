// hooks/useCreateCategory.ts
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { Category, CreateCategory, EditCategory } from "@eugenios/types";
import {
  addProductInCategory,
  addSectionInCategory,
  createCategory,
  deleteCategory,
  removeProductFromCategory,
  removeSectionFromCategory,
  updateCategory,
} from "@eugenios/services/categoryService";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategory) => {
      return await createCategory(data);
    },

    // Optimistic update
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previousCategories = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          QueryKeys.getCategories(),
          previousCategories.map((cat) => (cat.slug === updatedCategory.slug ? { ...cat, ...updatedCategory } : cat))
        );
      }

      return { previousCategories };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QueryKeys.getCategories(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao criar categoria");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Categoria criada com sucesso");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditCategory) => {
      return await updateCategory(data);
    },

    // Optimistic update
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previousCategories = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          QueryKeys.getCategories(),
          previousCategories.map((cat) => (cat.slug === updatedCategory.slug ? { ...cat, ...updatedCategory } : cat))
        );
      }

      return { previousCategories };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QueryKeys.getCategories(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao atualizar categoria");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categorySlug: string) => {
      return await deleteCategory(categorySlug);
    },

    onMutate: async (categorySlug: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previousCategories = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          QueryKeys.getCategories(),
          previousCategories.filter((cat) => cat.slug !== categorySlug)
        );
      }

      return { previousCategories };
    },

    onError: (err, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(QueryKeys.getCategories(), context.previousCategories);
      }
      toast.error(err.message || "Erro ao deletar categoria");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Categoria excluída com sucesso");
    },
  });
}

export function useAddProductsInCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; productId: string }) => {
      return await addProductInCategory(data.categoryId, data.productId);
    },

    // OPTIMISTIC UPDATE
    onMutate: async ({ categoryId, productId }) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previousCategories = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          QueryKeys.getCategories(),
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
        queryClient.setQueryData(QueryKeys.getCategories(), context.previousCategories);
      }
      toast.error("Erro ao adicionar produto à categoria");
    },

    // REFRESH on settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Produto adicionado à categoria com sucesso");
    },
  });
}

export function useRemoveProductFromCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; productId: string }) => {
      return await removeProductFromCategory(data.categoryId, data.productId);
    },

    onMutate: async ({ categoryId, productId }) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previous = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      queryClient.setQueryData<Category[]>(QueryKeys.getCategories(), (old = []) =>
        old.map((cat) =>
          cat.id === categoryId ? { ...cat, products: cat.products?.filter((p) => p.id !== productId) } : cat
        )
      );

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QueryKeys.getCategories(), context.previous);
      }
      toast.error("Erro ao remover produto");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Produto removido com sucesso");
    },
  });
}

export function useAddSectionsInCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; sectionId: string }) => {
      return await addSectionInCategory(data.categoryId, data.sectionId);
    },

    onMutate: async ({ categoryId, sectionId }) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previous = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      queryClient.setQueryData<Category[]>(QueryKeys.getCategories(), (old = []) =>
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
        queryClient.setQueryData(QueryKeys.getCategories(), context.previous);
      }
      toast.error("Erro ao adicionar seção");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Seção adicionada com sucesso");
    },
  });
}
export function useRemoveSectionFromCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { categoryId: string; sectionId: string }) => {
      return await removeSectionFromCategory(data.categoryId, data.sectionId);
    },

    onMutate: async ({ categoryId, sectionId }) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getCategories() });

      const previous = queryClient.getQueryData<Category[]>(QueryKeys.getCategories());

      queryClient.setQueryData<Category[]>(QueryKeys.getCategories(), (old = []) =>
        old.map((cat) =>
          cat.id === categoryId ? { ...cat, sections: cat.sections?.filter((s) => s.id !== sectionId) } : cat
        )
      );

      return { previous };
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QueryKeys.getCategories(), context.previous);
      }
      toast.error("Erro ao remover seção");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getCategories() });
    },

    onSuccess: () => {
      toast.success("Seção removida com sucesso");
    },
  });
}
