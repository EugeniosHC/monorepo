"use client";

import { ReusableDataTable, DataTableConfig } from "@/components/ui/reusable-data-table";
import { Button } from "@eugenios/ui/components/button";
import { toast } from "sonner";
import { PageLoading, ButtonLoading } from "@/components/ui/loading";
import { ProductModal, useProductModal, ProductFormData } from "@/components/pages/products/modals/product-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@eugenios/ui/components/alert-dialog";
import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDuplicateProduct,
  useDeleteProduct,
  useInvalidateProducts,
} from "@/hooks/useProducts";

type Product = Record<string, unknown> & {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  duration?: string;
  imageUrl?: string;
};
import { useApiClient } from "@/hooks/useApiClient";
import Image from "next/image";

export default function ProductTable() {
  // Auth hook
  const { isAuthenticated, isLoading: authLoading } = useApiClient();

  // React Query hooks
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const duplicateProduct = useDuplicateProduct();
  const deleteProduct = useDeleteProduct();
  const { invalidateList } = useInvalidateProducts();

  // Modal hooks
  const { isOpen, editingProduct, openCreateModal, openEditModal, closeModal } = useProductModal();

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Se a autenticação ainda está carregando, mostra loading
  if (authLoading) {
    return <PageLoading />;
  }

  // Se não está autenticado, mostra mensagem
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para ver os produtos.</p>
      </div>
    );
  }
  // Handlers para o modal
  const handleCreateProduct = async (data: ProductFormData) => {
    await createProduct.mutateAsync(data);
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct.mutateAsync({
      id: editingProduct.id,
      ...data,
    });
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmation.product) return;
    await deleteProduct.mutateAsync(String(deleteConfirmation.product.id));
    setDeleteConfirmation({ isOpen: false, product: null });
  };

  // Configuração da tabela
  const tableConfig: DataTableConfig<Product> = {
    columns: [
      {
        key: "name",
        header: "Nome do Produto",
        hideable: false,
      },
      {
        key: "price",
        header: "Preço",
        type: "custom",
        render: (value) => (
          <span className="font-mono font-semibold text-green-600">
            {new Intl.NumberFormat("pt-PT", {
              style: "currency",
              currency: "EUR",
            }).format(Number(value))}
          </span>
        ),
        align: "right",
      },
      {
        key: "duration",
        header: "Duração",
        type: "custom",
        render: (value) => <span className="text-sm text-muted-foreground">{String(value) || "N/A"}</span>,
        align: "center",
      },
      {
        key: "description",
        header: "Descrição",
        type: "custom",
        render: (value) => (
          <span className="text-sm max-w-xs truncate block" title={typeof value === "string" ? value : undefined}>
            {typeof value === "string" ? value : ""}
          </span>
        ),
      },
      {
        key: "imageUrl",
        header: "Imagem",
        type: "custom",
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <Image
              src={typeof value === "string" ? value : ""}
              alt={typeof row.name === "string" ? row.name : ""}
              className="w-10 h-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNUMxOC44OSAyNSAxOCAyNC4xMSAxOCAyM1YxN0MxOCAxNS44OSAxOC44OSAxNSAyMCAxNUMyMS4xMSAxNSAyMiAxNS44OSAyMiAxN1YyM0MyMiAyNC4xMSAyMS4xMSAyNSAyMCAyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTIwIDMwQzE4Ljg5IDMwIDE4IDI5LjExIDE4IDI4QzE4IDI2Ljg5IDE4Ljg5IDI2IDIwIDI2QzIxLjExIDI2IDIyIDI2Ljg5IDIyIDI4QzIyIDI5LjExIDIxLjExIDMwIDIwIDMwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
              }}
            />
          </div>
        ),
        align: "center",
      },
    ],
    actions: [
      {
        label: "Ver Detalhes",
        onClick: (product) => {
          console.log("Ver detalhes do produto:", product);
          toast.info(`Visualizando detalhes de: ${product.name}`);
        },
      },
      {
        label: "Editar",
        onClick: (product) => {
          openEditModal({
            ...product,
            id: String(product.id),
            description: typeof product.description === "string" ? product.description : "",
            duration: typeof product.duration === "string" ? product.duration : null,
            imageUrl: typeof product.imageUrl === "string" ? product.imageUrl : "",
          });
        },
      },
      {
        label: "Duplicar",
        onClick: (product) => {
          duplicateProduct.mutate(String(product.id));
        },
      },
      {
        separator: true,
        label: "Eliminar",
        onClick: (product) => {
          setDeleteConfirmation({ isOpen: true, product });
        },
        variant: "destructive",
      },
    ],
    enableSelection: true,
    enablePagination: true,
    enableColumnVisibility: true,
    enableDragAndDrop: false,
    pageSize: 10,
    addButtonLabel: "Novo Produto",
    onAddClick: () => {
      openCreateModal();
    },
    onDataChange: (newData) => {
      console.log("Dados alterados localmente:", newData);
      // Com React Query, normalmente não manipulamos dados localmente
      // Os dados vêm sempre do servidor via cache
    },
    onSelectionChange: (selection) => {
      console.log("Produtos selecionados:", selection);
    },
  };

  // Estados de loading
  if (isLoading) {
    return <PageLoading text="Carregando produtos..." />;
  }

  // Estados de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error instanceof Error ? error.message : "Erro desconhecido"}</p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produtos</h2>
          <p className="text-muted-foreground">
            {products.length > 0 ? `${products.length} produtos encontrados` : "Nenhum produto encontrado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => invalidateList()} variant="outline" disabled={isLoading}>
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>
          {(createProduct.isPending ||
            updateProduct.isPending ||
            duplicateProduct.isPending ||
            deleteProduct.isPending) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ButtonLoading size="sm" />
              Processando...
            </div>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <ReusableDataTable data={products as Product[]} config={tableConfig as DataTableConfig<Product>} />
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhum produto disponível.</p>
          <Button onClick={() => refetch()} className="mt-4" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Carregar Produtos"}
          </Button>
        </div>
      )}

      {/* Modal de Produto */}
      <ProductModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      {/* Confirmação de Eliminação */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open: boolean) => !open && setDeleteConfirmation({ isOpen: false, product: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Produto</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.product
                ? `Tem certeza que deseja eliminar "${deleteConfirmation.product.name}"? Esta ação não pode ser desfeita.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteProduct.isPending}
              onClick={() => setDeleteConfirmation({ isOpen: false, product: null })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <div className="flex items-center gap-2">
                  <ButtonLoading size="sm" />
                  Eliminando...
                </div>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
