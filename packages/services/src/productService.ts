// services/categoryService.ts
import api from "@eugenios/services/axios";
import { Product } from "@eugenios/types";

export async function getProducts(): Promise<Product[] | null> {
  try {
    const product = await api.get("product");
    if (!product.data) {
      throw new Error("Nenhum produto encontrado");
    }

    return product.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error("Falha ao buscar produtos");
  }
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const response = await api.post("product", product);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw new Error("Falha ao criar produto");
  }
}

export async function updateProduct(id: string, product: Omit<Product, "id">): Promise<Product> {
  try {
    const response = await api.put(`product/${id}`, product);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error("Falha ao atualizar produto");
  }
}

export async function deleteProduct(id: string): Promise<Product> {
  try {
    const response = await api.delete(`product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    throw new Error("Falha ao excluir produto");
  }
}
