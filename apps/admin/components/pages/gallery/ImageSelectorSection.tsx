import { useState, useEffect } from "react";
import ImageGallerySelectorModal from "@/components/pages/gallery/ImageGallerySelectorModal";
import { Button } from "@eugenios/ui/components/button";
import { Image as ImageInterface } from "@eugenios/types";
import clsx from "clsx";
import { ImageIcon, Replace } from "lucide-react";

interface Props {
  onChange: (image: ImageInterface) => void;
  selectedUrl: string;
}

export default function ImageSelectorSection({ onChange, selectedUrl }: Props) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageInterface | null>(null);

  useEffect(() => {
    if (selectedUrl && !selectedImage) {
      setSelectedImage(selectedImage);
    }
  }, [selectedUrl]);

  const handleSelect = (image: ImageInterface) => {
    setSelectedImage(image);
    onChange(image);
    setIsGalleryOpen(false);
  };

  return (
    <div className="space-y-2">
      {selectedImage?.url ? (
        <div className="relative group w-full max-w-xs">
          <img
            src={selectedImage.url}
            alt="Imagem selecionada"
            className="w-full h-48 object-cover rounded-xl border shadow-sm"
          />
          <div
            className={clsx(
              "absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition"
            )}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-2"
            >
              <Replace className="w-4 h-4" />
              Trocar Imagem
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsGalleryOpen(true)}
          className="flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Selecionar Imagem da Galeria
        </Button>
      )}

      <ImageGallerySelectorModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
