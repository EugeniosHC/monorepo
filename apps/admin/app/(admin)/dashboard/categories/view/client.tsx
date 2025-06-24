"use client";

import { useState } from "react";
// @ts-ignore
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { useProducts } from "@eugenios/react-query/queries/useProducts";
import { useCategorySections } from "@eugenios/react-query/queries/useCategorySections";
import { useCategories } from "@eugenios/react-query/queries/useCategories";
import QueryDebugger from "@/components/debug/QueryDebugger";
import DraggableProduct from "@/components/pages/categories/DraggableProduct";
import DraggableSection from "@/components/pages/categories/DraggableSection";
import CategoryDropArea from "@/components/pages/categories/CategoryDropArea";
import { Plus } from "lucide-react";
import { CreateProductModal } from "@/components/pages/products/createProductModal";

export default function CategoryboardClient() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);

  const { data: categories = [], isLoading: isLoadingCategories, isError: isErrorCategories } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts();
  const { data: sections = [], isLoading: isLoadingSections, isError: isErrorSections } = useCategorySections();

  // Verificar se todos os dados estão sendo carregados
  const isLoading = isLoadingCategories || isLoadingProducts || isLoadingSections;

  const isError = isErrorCategories || isErrorProducts || isErrorSections;



  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center">Erro ao carregar dados.</div>;
  }


  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-6 min-h-screen">
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => router.push("/dashboard/categories/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Criar Nova Categoria
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-semibold mb-4">Categorias</h3>
            <div className="space-y-4 pb-8">
              {categories.length === 0 ? (
                <p className="text-gray-500">Nenhuma categoria encontrada.</p>
              ) : (
                categories.map((category) => (
                  <CategoryDropArea
                    key={category.id}
                    category={category}
                    products={products}
                    sections={sections}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />
                ))
              )}
            </div>
          </div>
          <div className="col-span-1 sticky top-24 self-start z-10">
            <div className="mb-8">
              <div className="flex items-center justify gap-2 mb-4">
                <h5 className="font-semibold">Produtos Disponíveis</h5>
                <Button variant="outline" onClick={() => setCreateProductModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="border rounded p-4 bg-gray-50 max-h-[300px] overflow-y-auto">
                {!products ? (
                  <p className="text-gray-500">Nenhum produto disponível.</p>
                ) : (
                  products
                    // Filtrar produtos que já estão em alguma categoria
                    .filter(
                      (product) => !categories.some((category) => category.products?.some((p) => p.id === product.id))
                    )
                    .map((product) => <DraggableProduct key={product.id} product={product} />)
                )}
                {products &&
                  products?.length > 0 &&
                  products?.filter(
                    (product) => !categories.some((category) => category.products?.some((p) => p.id === product.id))
                  ).length === 0 && (
                    <p className="text-gray-500 italic">Todos os produtos já foram atribuídos a categorias</p>
                  )}
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Seções Disponíveis</h5>
              <div className="border rounded p-4 bg-gray-50 max-h-[300px] overflow-y-auto">
                {!sections ? (
                  <p className="text-gray-500">Nenhuma seção disponível.</p>
                ) : (
                  sections?.map((section) => <DraggableSection key={section.id} section={section} />)
                )}
              </div>
            </div>
          </div>{" "}
        </div>
        <CreateProductModal
          isCreateModalOpen={isCreateProductModalOpen}
          setIsCreateModalOpen={setCreateProductModalOpen}
        />
      </div>

      {/* Debug component - apenas em ambiente de desenvolvimento */}
      {process.env.NODE_ENV === "development" && <QueryDebugger />}
    </DndProvider>
  );
}
