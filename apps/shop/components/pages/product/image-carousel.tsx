"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@eugenios/ui/lib/utils";
import { useMediaQuery } from "@eugenios/ui/hooks/use-media-query";

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
  onSelectImage?: (index: number) => void;
  className?: string;
}

export default function ImageCarousel({ images, onSelectImage, className }: ImageCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Número de imagens visíveis por vez
  const visibleImages = isMobile ? 2 : 3;

  const prev = () => {
    setStartIndex(Math.max(0, startIndex - visibleImages));
  };

  const next = () => {
    setStartIndex(Math.min(images.length - visibleImages, startIndex + visibleImages));
  };

  const handleImageClick = (index: number) => {
    if (onSelectImage) {
      onSelectImage(index);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 relative">
        {images.slice(startIndex, startIndex + visibleImages).map((image, index) => (
          <div
            key={startIndex + index}
            className="border rounded-lg overflow-hidden cursor-pointer aspect-square"
            onClick={() => handleImageClick(startIndex + index)}
          >
            {" "}
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={300}
              height={300}
              quality={95}
              priority
              className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
              style={{
                maxHeight: "100%",
                width: "100%",
              }}
            />
          </div>
        ))}
      </div>

      {images.length > visibleImages && (
        <>
          <button
            onClick={prev}
            disabled={startIndex === 0}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white hover:bg-white rounded-full p-1 shadow-md z-10 transition-opacity",
              startIndex === 0 ? "opacity-0 cursor-not-allowed" : "opacity-100"
            )}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            disabled={startIndex >= images.length - visibleImages}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white hover:bg-white rounded-full p-1 shadow-md z-10 transition-opacity",
              startIndex >= images.length - visibleImages ? "opacity-0 cursor-not-allowed" : "opacity-100"
            )}
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
