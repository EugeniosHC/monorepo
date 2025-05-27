// hooks/useCreateCategory.ts
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@eugenios/react-query/queryKeys";
import { Product } from "@eugenios/types";
import { createProduct, deleteProduct, updateProduct } from "@eugenios/services/productService";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Product, "id">) => {
      return await createProduct(data);
    },

    // Optimistic update
    onMutate: async (newProductData) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getAllProducts() });

      const previousProducts = queryClient.getQueryData<Product[]>(QueryKeys.getAllProducts());

      if (previousProducts) {
        // For creation, we don't update existing items since this is a new product
        // We'll let the actual query invalidation handle adding the new product
        queryClient.setQueryData<Product[]>(QueryKeys.getAllProducts(), previousProducts);
      }

      return { previousProducts };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QueryKeys.getAllProducts(), context.previousProducts);
      }
      toast.error(err.message || "Erro ao criar produto");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getAllProducts() });
    },

    onSuccess: () => {
      toast.success("Produto criado com sucesso");
    },
  });
}
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Product, "id"> }) => {
      return await updateProduct(id, data);
    },

    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getAllProducts() });

      const previousProducts = queryClient.getQueryData<Product[]>(QueryKeys.getAllProducts());

      if (previousProducts) {
        queryClient.setQueryData<Product[]>(
          QueryKeys.getAllProducts(),
          previousProducts.map((prod) => (prod.id === id ? { ...prod, ...data } : prod))
        );
      }

      return { previousProducts };
    },

    // Rollback
    onError: (err, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QueryKeys.getAllProducts(), context.previousProducts);
      }
      toast.error(err.message || "Erro ao atualizar produto");
    },

    // Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getAllProducts() });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getAllProducts() });
      toast.success("Produto atualizado com sucesso");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return await deleteProduct(productId);
    },

    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.getAllProducts() });

      const previousProducts = queryClient.getQueryData<Product[]>(QueryKeys.getAllProducts());

      if (previousProducts) {
        queryClient.setQueryData<Product[]>(
          QueryKeys.getAllProducts(),
          previousProducts.filter((prod) => prod.id !== productId)
        );
      }

      return { previousProducts };
    },

    onError: (err, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QueryKeys.getAllProducts(), context.previousProducts);
      }
      toast.error(err.message || "Erro ao deletar produto");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.getAllProducts() });
    },

    onSuccess: () => {
      toast.success("Produto excluído com sucesso");
    },
  });
}
