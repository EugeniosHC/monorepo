// @ts-ignore
import { useDrop } from "react-dnd";
import { useRouter } from "next/navigation";
import { Category, Product, CategorySection } from "@eugenios/types";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { Eye, Trash2 } from "lucide-react";
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
import { ItemTypes, DragItem } from "@eugenios/types";
import {
  useAddProductsInCategory,
  useAddSectionsInCategory,
  useDeleteCategory,
  useRemoveProductFromCategory,
  useRemoveSectionFromCategory,
} from "@eugenios/react-query/mutations/useCategories";
import Link from "next/link";
import { EditProductModal } from "../products/editProductModal";
import Image from "next/image";

interface CategoryDropAreaProps {
  category: Category;
  products: Product[] | null;
  sections: CategorySection[] | null;
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
}

export const CategoryDropArea = ({
  category,
  products,
  sections,
  activeCategory,
  setActiveCategory,
}: CategoryDropAreaProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  const isActive = category.id === activeCategory;
  return (
    <Card
      className={`p-4 mb-4 ${isActive ? "ring-2 ring-blue-500" : ""} ${isOver ? "bg-blue-50" : "bg-white"}`}
      onClick={() => setActiveCategory(category.id)}
    >
      <div className="flex justify-between mb-4">
        <div>
          <h5 className="font-bold">{category.name}</h5>
          <Badge variant="outline" className="mt-1">
            {category.slug}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            aria-label="Editar"
            variant="outline"
            size="sm"
            className="text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation(); // Evita ativar o click da Card
              router.push(`/dashboard/categories/edit/${category.slug}`);
            }}
          >
            Editar
          </Button>
          <Link
            href={`${process.env.NEXT_PUBLIC_SHOP_URL}/produtos/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver categoria"
          >
            <Button variant="outline" size="sm" aria-label="Ver categoria">
              <Eye className="w-4 h-4 text-neutral-500 hover:text-blue-700" />
            </Button>
          </Link>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                aria-label="Excluir categoria"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Evita ativar o click da Card
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Categoria</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a categoria &quot;{category.name}&quot;? Esta ação não pode ser
                  desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  {deleteCategory.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div ref={drop} className="min-h-[100px] p-2 border-2 border-dashed border-gray-300 rounded">
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Produtos ({categoryProducts?.length || 0})</h4>
          <div className="space-y-2">
            {!categoryProducts || categoryProducts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Arraste produtos para aqui</p>
            ) : (
              categoryProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded bg-white">
                  <div className="flex items-center gap-2">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <span>{product.name}</span>
                  </div>

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveProductFromCategory(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Seções ({categorySections?.length || 0})</h4>
          <div className="space-y-2">
            {!categorySections || categorySections.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Arraste seções para aqui</p>
            ) : (
              categorySections?.map((section) => (
                <div key={section.id} className="flex justify-between items-center p-2 border rounded bg-white">
                  <span>{section.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSectionFromCategory(section.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isEditModalOpen={editModalOpen}
          setIsEditModalOpen={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingProduct(null);
          }}
        />
      )}
    </Card>
  );
};

export default CategoryDropArea;
