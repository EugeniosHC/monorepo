"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Badge } from "@eugenios/ui/components/badge";
import { ComponentLoading } from "@/components/ui/loading";
import { useImageGallery, useUploadImage, useDeleteImages, useInvalidateImageGallery } from "@/hooks/useImageGallery";
import { Upload, Search, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  selectedImageUrl?: string;
}

export function ImageGalleryModal({ isOpen, onClose, onSelectImage, selectedImageUrl }: ImageGalleryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [tempSelectedImage, setTempSelectedImage] = useState<string | null>(selectedImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: gallery, isLoading, error, refetch } = useImageGallery();
  const uploadImage = useUploadImage();
  const deleteImages = useDeleteImages();
  const { invalidateGallery } = useInvalidateImageGallery();

  // Filtrar imagens baseado na busca
  const filteredImages =
    gallery?.images.filter((image) => image.key.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Verificar se o arquivo existe
      if (!file) continue;

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} não é uma imagem válida.`);
        continue;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 10MB.`);
        continue;
      }

      try {
        await uploadImage.mutateAsync(file);
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
      }
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setTempSelectedImage(imageUrl);
  };

  const handleConfirmSelection = () => {
    if (tempSelectedImage) {
      onSelectImage(tempSelectedImage);
      onClose();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      toast.warning("Selecione imagens para eliminar.");
      return;
    }

    if (!confirm(`Eliminar ${selectedImages.length} imagem(ns) selecionada(s)?`)) {
      return;
    }

    try {
      await deleteImages.mutateAsync(selectedImages);
      setSelectedImages([]);
    } catch (error) {
      console.error("Erro ao eliminar imagens:", error);
    }
  };

  const toggleImageSelection = (imageKey: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageKey) ? prev.filter((key) => key !== imageKey) : [...prev, imageKey]
    );
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedImages([]);
    setTempSelectedImage(selectedImageUrl || null);
    onClose();
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Galeria de Imagens</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-600 mb-4">
              Erro ao carregar galeria: {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Galeria de Imagens</DialogTitle>
            <DialogDescription>Selecione uma imagem ou envie novas imagens para a galeria.</DialogDescription>
          </DialogHeader>

          {/* Controles */}
          <div className="flex items-center gap-4 py-4 border-b">
            {/* Upload */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadImage.isPending ? "Enviando..." : "Enviar Imagens"}
            </Button>

            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Eliminar selecionadas */}
            {selectedImages.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                disabled={deleteImages.isPending}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar ({selectedImages.length})
              </Button>
            )}

            {/* Atualizar */}
            <Button onClick={() => invalidateGallery()} variant="outline" disabled={isLoading}>
              Atualizar
            </Button>
          </div>

          {/* Grid de imagens */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <ComponentLoading text="Carregando galeria..." />
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Nenhuma imagem encontrada para a busca." : "Nenhuma imagem na galeria."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Enviar Primeira Imagem
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.key}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      tempSelectedImage === image.url
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectImage(image.url)}
                  >
                    {/* Checkbox para seleção múltipla */}
                    <div
                      className="absolute top-2 left-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImageSelection(image.key);
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedImages.includes(image.key) ? "bg-primary border-primary" : "bg-white border-gray-300"
                        }`}
                      >
                        {selectedImages.includes(image.key) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    {/* Indicador de seleção atual */}
                    {tempSelectedImage === image.url && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Imagem */}
                    <Image
                      src={image.url}
                      alt={image.key}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />

                    {/* Overlay com informações */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <div className="text-white text-xs space-y-1">
                        <p className="font-medium truncate">{image.key}</p>
                        <div className="flex justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {image.size}
                          </Badge>
                          <span className="text-xs">{image.LastModified}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="border-t pt-4">
            <div className="flex items-center gap-2 flex-1">
              {filteredImages.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {filteredImages.length} imagem(ns) {searchTerm && "encontrada(s)"}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSelection} disabled={!tempSelectedImage}>
              Selecionar Imagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Input oculto para upload */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
    </>
  );
}
