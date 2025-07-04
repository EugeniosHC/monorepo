"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { useImages } from "@eugenios/react-query/queries/useImages";
import { Image as ImageInterface } from "@eugenios/types";
import { cn } from "@eugenios/ui/lib/utils";
import { Button } from "@eugenios/ui/components/button";
import { Check } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageInterface) => void;
}

export default function ImageGallerySelectorModal({ isOpen, onClose, onSelect }: Props) {
  const { data: ImageGallery } = useImages();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl px-6 py-4">
          <DialogHeader className="flex items-center justify-between mb-4 gap-2">
            <DialogTitle className="text-xl font-semibold">📷 Selecionar Imagem da Galeria</DialogTitle>
            <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
              Fazer Upload
            </Button>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[70vh] overflow-y-auto">
            {ImageGallery?.images?.map((image) => (
              <div
                key={image.key}
                className={cn(
                  "relative group aspect-square rounded-lg overflow-hidden border shadow-sm bg-muted cursor-pointer"
                )}
                onMouseEnter={() => setHovered(image.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <Image
                  src={image.url}
                  alt={image.key}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-xs text-white font-medium">
                  {image.key}
                </div>

                {/* Botão flutuante de selecionar */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      onSelect(image);
                      onClose();
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <ImageUploadModal isUploadOpen={isUploadOpen} setIsUploadOpen={setIsUploadOpen} />
    </div>
  );
}
