// @ts-ignore
import { useDrop } from "react-dnd";
import { useRouter } from "next/navigation";
import { Category, CategorySection, ItemTypes, DragItem } from "@eugenios/types";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { Eye, Trash2, Package, Grid3X3, X, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@eugenios/ui/components/dialog";
import { useState } from "react";
import {
  useAddProductsInCategory,
  useAddSectionsInCategory,
  useDeleteCategory,
  useRemoveProductFromCategory,
  useRemoveSectionFromCategory,
} from "@/hooks/useCategories";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string | null;
  imageUrl: string;
}

interface CategoryDropAreaProps {
  category: Category;
  products: Product[] | null;
  sections: CategorySection[] | null;
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  onEditCategory?: (category: Category) => void;
}

export const CategoryDropArea = ({
  category,
  products,
  sections,
  activeCategory,
  setActiveCategory,
  onEditCategory,
}: CategoryDropAreaProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const addProductsInCategory = useAddProductsInCategory();
  const removeProductFromCategory = useRemoveProductFromCategory();
  const addSectionInCategory = useAddSectionsInCategory();
  const removeSectionFromCategory = useRemoveSectionFromCategory();
  const deleteCategory = useDeleteCategory();

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.SECTION],
    drop: (item: DragItem) => {
      if (item.type === ItemTypes.PRODUCT) {
        handleProductDrop(category.id, item.id);
      } else if (item.type === ItemTypes.SECTION) {
        handleSectionDrop(category.id, item.id);
      }
    },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Obtenha os produtos e seções associadas a esta categoria
  const categoryProducts = products?.filter((product) => category.products?.some((p) => p.id === product.id));
  const categorySections = sections?.filter((section) => category.sections?.some((s) => s.id === section.id));

  // Manipular o drop de um produto
  const handleProductDrop = (categoryId: string, productId: string) => {
    addProductsInCategory.mutate({ categoryId, productId });
  };

  // Manipular o drop de uma seção
  const handleSectionDrop = (categoryId: string, sectionId: string) => {
    addSectionInCategory.mutate({ categoryId, sectionId });
  };

  // Remover um produto da categoria
  const handleRemoveProductFromCategory = (productId: string) => {
    removeProductFromCategory.mutate({ categoryId: category.id, productId });
  };

  // Remover uma seção da categoria
  const handleRemoveSectionFromCategory = (sectionId: string) => {
    removeSectionFromCategory.mutate({ categoryId: category.id, sectionId });
  };

  const handleDeleteCategory = (id: string) => {
    try {
      deleteCategory.mutateAsync(id);
    } catch (e) {
      console.error("Error deleting category:", e);
    } finally {
      setShowDeleteDialog(false);
    }
  };
  const isActive = activeCategory === category.id;

  return (
    <Card
      ref={drop as any}
      className={`group transition-all duration-200 cursor-pointer ${
        isOver
          ? "border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200"
          : isActive
            ? "border-blue-300 bg-blue-25 shadow-md"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={() => setActiveCategory(isActive ? "" : category.id)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{category.title.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-500">/{category.slug}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Link href={`/dashboard/categories/edit/${category.slug}`} passHref>
              <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            {onEditCategory && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(category);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza de que deseja excluir a categoria "{category.title}"? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteCategory(category.id)}>
                    Excluir
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas com badges */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            <Package className="w-3 h-3 mr-1" />
            {categoryProducts?.length || 0} produtos
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Grid3X3 className="w-3 h-3 mr-1" />
            {categorySections?.length || 0} seções
          </Badge>
          {category.imageUrl && (
            <Badge variant="outline" className="text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Com imagem
            </Badge>
          )}
        </div>

        {/* Conteúdo expandido */}
        {isActive && (
          <div className="mt-6 space-y-6 border-t pt-6">
            {/* Produtos da categoria */}
            {categoryProducts && categoryProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Produtos Associados
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {categoryProducts.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="relative group p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-sm transition-all"
                    >
                      {/* Botão X no canto superior direito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProductFromCategory(product.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors z-10"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-green-600 font-medium">
                            {new Intl.NumberFormat("pt-PT", {
                              style: "currency",
                              currency: "EUR",
                            }).format(product.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seções da categoria */}
            {categorySections && categorySections.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Grid3X3 className="w-4 h-4 mr-2 text-purple-600" />
                    Seções Associadas
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {categorySections.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {categorySections.map((section) => (
                    <div
                      key={section.id}
                      className="relative group p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border hover:shadow-sm transition-all"
                    >
                      {/* Botão X no canto superior direito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSectionFromCategory(section.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors z-10"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                          <Grid3X3 className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900 flex-1 truncate">{section.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Área de drop visual */}
            {isOver && (
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center bg-blue-50">
                <div className="text-blue-600">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Solte aqui para adicionar à categoria</p>
                  <p className="text-sm text-blue-500">Produtos e seções podem ser arrastados para cá</p>
                </div>
              </div>
            )}

            {/* Mensagem se não houver conteúdo */}
            {(!categoryProducts || categoryProducts.length === 0) &&
              (!categorySections || categorySections.length === 0) &&
              !isOver && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-gray-400 mb-3">
                    <Package className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium">Esta categoria está vazia</p>
                  <p className="text-sm text-gray-500">Arraste produtos e seções para organizá-los aqui</p>
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CategoryDropArea;
