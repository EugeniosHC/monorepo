"use client";

import React, { useState } from "react";
import { useImageGallery, useUploadImage } from "@/hooks/useImageGallery";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Input } from "@eugenios/ui/components/input";
import { ScrollArea } from "@eugenios/ui/components/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@eugenios/ui/components/dialog";
import { Upload, Search, Image as ImageIcon, CheckCircle2, Circle, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  selectedImage?: string;
  title?: string;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectImage,
  selectedImage,
  title = "Selecionar Imagem",
}: ImageGalleryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [localSelectedImage, setLocalSelectedImage] = useState<string>(selectedImage || "");

  // Hooks
  const { data: gallery, isLoading } = useImageGallery();
  const uploadImage = useUploadImage();

  // Filtrar imagens com base na pesquisa
  const filteredImages =
    gallery?.images.filter((image) => image.key.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  // Reset local selection when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelectedImage(selectedImage || "");
      setSearchQuery("");
    }
  }, [isOpen, selectedImage]);

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" não é uma imagem válida`);
        continue;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" é muito grande (máximo 10MB)`);
        continue;
      }

      try {
        const uploadedImage = await uploadImage.mutateAsync(file);
        // Auto-selecionar a imagem recém-enviada
        setLocalSelectedImage(uploadedImage.url);
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
      }
    }

    // Limpar input
    event.target.value = "";
  };

  const handleSelectImage = (imageUrl: string) => {
    setLocalSelectedImage(imageUrl);
  };

  const handleConfirmSelection = () => {
    onSelectImage(localSelectedImage);
    onClose();
  };

  const formatFileSize = (sizeStr: string) => {
    // O tamanho já vem formatado do backend, então só retornamos como está
    return sizeStr || "0 B";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="text-sm text-gray-500">Selecione uma imagem da galeria para utilizar</div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de ferramentas */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar imagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="modal-image-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="modal-image-upload">
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <span>
                    {uploadImage.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploadImage.isPending ? "Enviando..." : "Enviar"}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Grid de Imagens */}
          <ScrollArea className="h-[400px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Carregando imagens...</p>
                </div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "Nenhuma imagem encontrada" : "Nenhuma imagem na galeria"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? "Tente ajustar os termos de pesquisa" : "Comece enviando suas primeiras imagens"}
                  </p>
                  {!searchQuery && (
                    <label htmlFor="modal-image-upload">
                      <Button asChild variant="outline" className="cursor-pointer">
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Enviar Primeira Imagem
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
                {filteredImages.map((image) => (
                  <Card
                    key={image.key}
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-200 ${
                      localSelectedImage === image.url ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"
                    }`}
                    onClick={() => handleSelectImage(image.url)}
                  >
                    {/* Indicador de seleção */}
                    <div className="absolute top-2 left-2 z-10">
                      {localSelectedImage === image.url ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 bg-white rounded-full" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    {/* Botão de preview */}
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 bg-white/80 hover:bg-white rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImagePreview(image.url);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Imagem */}
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.key}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Informações da imagem */}
                    <div className="p-2">
                      <h4 className="font-medium text-xs text-gray-900 truncate mb-1">{image.key}</h4>
                      <div className="text-xs text-gray-500">{formatFileSize(image.size)}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmSelection} disabled={!localSelectedImage}>
            Selecionar Imagem
          </Button>
        </DialogFooter>

        {/* Modal de Preview */}
        {selectedImagePreview && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={() => setSelectedImagePreview(null)}
          >
            <div className="relative max-w-3xl max-h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-12 right-0 text-white hover:bg-white/10"
                onClick={() => setSelectedImagePreview(null)}
              >
                <X className="w-6 h-6" />
              </Button>
              <Image
                src={selectedImagePreview}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
