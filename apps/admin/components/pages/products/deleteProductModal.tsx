import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { Product } from "@eugenios/types";
import { useDeleteProduct } from "@eugenios/react-query/mutations/useProducts";
import { Alert, AlertDescription } from "@eugenios/ui/components/alert";
import { AlertCircle } from "lucide-react";

interface DeleteProductModalProps {
  product: Product;
  isDeleteProductModalOpen: boolean;
  setDeleteProductModalOpen: (isOpen: boolean) => void;
}

export default function DeleteProductModal({
  product,
  isDeleteProductModalOpen,
  setDeleteProductModalOpen,
}: DeleteProductModalProps) {
  const deleteProduct = useDeleteProduct();

  const handleDeleteProduct = async () => {
    await deleteProduct.mutateAsync(product.id);
    setDeleteProductModalOpen(false);
  };
  return (
    <Dialog open={isDeleteProductModalOpen} onOpenChange={() => setDeleteProductModalOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o produto &quot;{product.name}&quot;? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {deleteProduct.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{deleteProduct.error.message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteProductModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={deleteProduct.isPending} onClick={handleDeleteProduct}>
            {deleteProduct.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
