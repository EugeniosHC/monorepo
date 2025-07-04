import { Button } from "@eugenios/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@eugenios/ui/components/dialog";
import { Image } from "@eugenios/types";
import { useDeleteImages } from "@eugenios/react-query/mutations/useGallery";

export default function ImageDeleteModal({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedImages,
  setSelectedImages,
}: {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  selectedImages: Image | Image[];
  setSelectedImages: (images: Image | Image[]) => void;
}) {
  const deleteImages = useDeleteImages();
  const deleteSelectedImages = () => {
    const keysToDelete = Array.isArray(selectedImages)
      ? selectedImages.map((image) => image.key)
      : [selectedImages.key];

    deleteImages.mutate(keysToDelete);
    setIsDeleteDialogOpen(false);
    setSelectedImages([]);
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir {Array.isArray(selectedImages) ? selectedImages.length : 1} imagem(ns)? Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={deleteSelectedImages} disabled={deleteImages.isPending}>
            {deleteImages.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
