"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { FileUpload } from "@/components/FileUpload";
import { Upload } from "lucide-react";
import { useUploadImage } from "@eugenios/react-query/mutations/useGallery";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageUploadModal({
  isUploadOpen,
  setIsUploadOpen,
}: {
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const uploadImage = useUploadImage();

  const handleImageUpload = () => {
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    uploadImage.mutate(file);
    setFile(null);
    setIsUploadOpen(false);
  };

  return (
    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Imagem</DialogTitle>
          <DialogDescription>Faça upload de uma nova imagem para sua galeria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FileUpload onChange={(file) => setFile(file)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImageUpload} disabled={!file || uploadImage.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {uploadImage.isPending ? "Espere..." : "Fazer Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
