"use client";

import { useState } from "react";
import { CreateSectionModal } from "./CreateSectionModal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@eugenios/ui/components/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { useCategorySections } from "@/hooks/useCategorySections";
import { useCategories } from "@/hooks/useCategories";
import DraggableProduct from "./DraggableProduct";
import DraggableSection from "./DraggableSection";
import CategoryDropArea from "./CategoryDropArea";
import { CategoryModal, useCategoryModal } from "./CategoryModal";
import { ProductModal, useProductModal } from "@/components/pages/products/modals/product-modal";
import { useCreateProduct } from "@/hooks/useProducts";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Plus, Package, Grid3X3, FolderPlus, ChevronDown } from "lucide-react";
import { CreateProductData } from "@/hooks/useProducts";
import { CreateCategory, EditCategory } from "@eugenios/types";

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] = useState(false);

  // Hook para gerenciar o modal de categoria
  const {
    isOpen: isCategoryModalOpen,
    editingCategory,
    openCreateModal: openCategoryCreateModal,
    openEditModal: openCategoryEditModal,
    closeModal: closeCategoryModal,
  } = useCategoryModal();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  // Hook para gerenciar o modal de produto
  const {
    isOpen: isProductModalOpen,
    editingProduct,
    openCreateModal: openProductCreateModal,
    closeModal: closeProductModal,
  } = useProductModal();
  const createProduct = useCreateProduct();

  const { data: categories = [], isLoading: isLoadingCategories, isError: isErrorCategories } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts();
  const { data: rawSections, isLoading: isLoadingSections, isError: isErrorSections } = useCategorySections();
  const sections = (rawSections ?? []) as import("@eugenios/types").CategorySection[];

  // Verificar se todos os dados estão sendo carregados
  const isLoading = isLoadingCategories || isLoadingProducts || isLoadingSections;
  const isError = isErrorCategories || isErrorProducts || isErrorSections;

  // Calcular estatísticas
  const availableProducts =
    products?.filter(
      (product) => !categories.some((category) => category.products?.some((p) => p.id === product.id))
    ) || [];

  // Handler para criar produto
  const handleCreateProduct = async (data: CreateProductData) => {
    await createProduct.mutateAsync(data);
  };

  // Handler para criar categoria
  const handleCreateCategory = async (data: CreateCategory) => {
    await createCategory.mutateAsync(data);
  };

  // Handler para atualizar categoria
  const handleUpdateCategory = async (data: EditCategory) => {
    if (!editingCategory) return;
    await updateCategory.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600">Não foi possível carregar as informações. Tente recarregar a página.</p>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="py-4 md:py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Categorias</h1>
            <p className="text-gray-600 mt-1">Organize produtos e seções em categorias</p>
          </div>

          {/* Dropdown para criar novos itens */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => openCategoryCreateModal()}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Categoria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openProductCreateModal()}>
                <Package className="w-4 h-4 mr-2" />
                Novo Produto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateSectionModalOpen(true)}>
                <Grid3X3 className="w-4 h-4 mr-2" />
                Nova Seção
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid3X3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{products?.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Produtos Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{availableProducts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Grid3X3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Seções</p>
                <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Layout principal com mais espaço para sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Área principal das categorias */}
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
              <Badge variant="secondary" className="text-sm">
                {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
              </Badge>
            </div>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Grid3X3 className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
                  <p className="text-gray-600 mb-4">
                    Comece criando sua primeira categoria para organizar seus produtos.
                  </p>
                  <Button onClick={() => openCategoryCreateModal()} className="bg-blue-600 hover:bg-blue-700">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Criar Primeira Categoria
                  </Button>
                </Card>
              ) : (
                categories.map((category) => (
                  <CategoryDropArea
                    key={category.id}
                    category={category}
                    products={products}
                    sections={sections}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    onEditCategory={openCategoryEditModal}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar expandida com produtos e seções disponíveis */}
          <div className="xl:col-span-2 space-y-6">
            {/* Produtos Disponíveis */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Produtos Disponíveis
                </h3>
                <Badge variant="outline" className="text-sm font-medium">
                  {availableProducts.length}
                </Badge>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {availableProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      {products?.length === 0 ? "Nenhum produto disponível" : "Todos os produtos foram atribuídos"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Arraste produtos aqui para organizá-los</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableProducts.map((product) => (
                      <DraggableProduct key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Seções Disponíveis */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2 text-purple-600" />
                  Seções Disponíveis
                </h3>
                <Badge variant="outline" className="text-sm font-medium">
                  {sections.length}
                </Badge>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <Grid3X3 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Nenhuma seção disponível</p>
                    <p className="text-xs text-gray-400 mt-1">Crie seções para organizar melhor suas categorias</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section: import("@eugenios/types").CategorySection) => (
                      <DraggableSection key={section.id} section={section} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Modais */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={closeCategoryModal}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          category={editingCategory}
          isSubmitting={createCategory.isPending || updateCategory.isPending}
        />
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={closeProductModal}
          onSubmit={handleCreateProduct}
          product={editingProduct}
          isSubmitting={createProduct.isPending}
        />
        <CreateSectionModal
          isCreateModalOpen={isCreateSectionModalOpen}
          setIsCreateModalOpen={setIsCreateSectionModalOpen}
        />
      </div>
    </DndProvider>
  );
}
