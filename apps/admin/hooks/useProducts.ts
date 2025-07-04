import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "sonner";

// Tipos
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string | null;
  imageUrl: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  description: string;
  duration?: string;
  imageUrl?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  available: () => [...productKeys.all, "available"] as const,
};

// Hook para buscar todos os produtos
export function useProducts() {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async (): Promise<Product[]> => {
      const response = await apiClient.get("/product");
      return response.data || [];
    },
    enabled: !isLoading && isAuthenticated, // Só executa quando autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  });
}

// Hook para buscar um produto específico
export function useProduct(id: string) {
  const { apiClient, isAuthenticated, isLoading } = useApiClient();

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async (): Promise<Product> => {
      const response = await apiClient.get(`/product/${id}`);
      return response.data;
    },
    enabled: !!id && !isLoading && isAuthenticated, // Só executa quando autenticado e ID válido
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook para criar produto
export function useCreateProduct() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData): Promise<Product> => {
      const response = await apiClient.post("/product", data);
      return response.data;
    },
    onSuccess: (newProduct) => {
      // Invalidar e refetch a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Adicionar o novo produto ao cache (otimização otimista)
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);

      toast.success(`Produto "${newProduct.name}" criado com sucesso!`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao criar produto";
      toast.error(`Erro ao criar produto: ${errorMessage}`);
    },
  });
}

// Hook para atualizar produto
export function useUpdateProduct() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProductData): Promise<Product> => {
      const response = await apiClient.put(`/product/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      // Invalidar a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Atualizar o produto específico no cache
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct);

      toast.success(`Produto "${updatedProduct.name}" atualizado com sucesso!`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao atualizar produto";
      toast.error(`Erro ao atualizar produto: ${errorMessage}`);
    },
  });
}

// Hook para duplicar produto
export function useDuplicateProduct() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<Product> => {
      const response = await apiClient.post(`/product/${productId}/duplicate`);
      return response.data;
    },
    onSuccess: (duplicatedProduct) => {
      // Invalidar a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Adicionar o produto duplicado ao cache
      queryClient.setQueryData(productKeys.detail(duplicatedProduct.id), duplicatedProduct);

      toast.success(`Produto "${duplicatedProduct.name}" duplicado com sucesso!`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao duplicar produto";
      toast.error(`Erro ao duplicar produto: ${errorMessage}`);
    },
  });
}

// Hook para eliminar produto
export function useDeleteProduct() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      await apiClient.delete(`/product/${productId}`);
    },
    onSuccess: (_, productId) => {
      // Invalidar a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Remover o produto específico do cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });

      toast.success("Produto eliminado com sucesso!");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Erro ao eliminar produto";
      toast.error(`Erro ao eliminar produto: ${errorMessage}`);
    },
  });
}

// Hook para invalidar cache de produtos manualmente
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    invalidateProduct: (id: string) => queryClient.invalidateQueries({ queryKey: productKeys.detail(id) }),
  };
}
