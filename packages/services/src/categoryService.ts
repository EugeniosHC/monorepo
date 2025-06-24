// services/categoryService.ts
import { Category, CategoryWithMinPrice, CreateCategory, EditCategory } from "@eugenios/types";
import api from "@eugenios/services/axios";
 
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get("category");
    if (!response.data) {
      throw new Error("Nenhuma categoria encontrada");
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error("Falha ao buscar categorias");
  }
}
export async function getCategory(slug: string): Promise<Category> {
  try {
    const response = await api.get(`category/${slug}`);
    if (!response.data) {
      throw new Error("Nenhuma categoria encontrada");
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    throw new Error("Falha ao buscar categoria");
  }
}

export async function getRelatedCategories(slug: string): Promise<CategoryWithMinPrice[]> {
  try {
    const response = await api.get(`category/related/${slug}`);
    if (!response.data) {
      throw new Error("Nenhuma categoria relacionada encontrada");
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar categorias relacionadas:", error);
    throw new Error("Falha ao buscar categorias relacionadas");
  }
}

export async function createCategory(data: CreateCategory): Promise<Category> {
  const response = await api.post(`category`, data);

  if (response.status !== 201) {
    throw new Error(response.data.message);
  }

  return response.data;
}

export async function updateCategory(data: EditCategory): Promise<Category> {
  try {
    const response = await api.put(`category/${data.slug}`, data);

    if (response.status !== 200) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw new Error(`Erro ao atualizar categoria: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function deleteCategory(id: string): Promise<Category> {
  return api.delete(`category/${id}`);
}

export async function addProductInCategory(categoryId: string, productId: string): Promise<Category> {
  const response = await api.post(`/category/add-product`, {
    categoryId,
    productId,
  });
  return response.data;
}

export async function removeProductFromCategory(categoryId: string, productId: string): Promise<Category> {
  const response = await api.post(`/category/remove-product`, {
    categoryId,
    productId,
  });
  return response.data;
}

export async function addSectionInCategory(categoryId: string, sectionId: string): Promise<Category> {
  try {
    const response = await api.post(`/category/add-section`, {
      categoryId,
      sectionId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar seção à categoria:", error);
    throw new Error("Falha ao adicionar seção à categoria");
  }
}

export async function removeSectionFromCategory(categoryId: string, sectionId: string): Promise<Category> {
  const response = await api.post(`/category/remove-section`, {
    categoryId,
    sectionId,
  });
  return response.data;
}
