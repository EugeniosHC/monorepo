"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@eugenios/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@eugenios/ui/hooks/use-media-query";

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const visible = isMobile ? 1 : 3;

  const next = () => {
    if (index < images.length - visible) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className={cn("flex gap-4 transition-all duration-300 ease-in-out")}>
        {images.slice(index, index + visible).map((img, i) => (
          <motion.div
            key={index + i}
            className="w-full aspect-[4/3] flex-shrink-0 rounded-lg overflow-hidden border"
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.5, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Image src={img.src} alt={img.alt} width={600} height={450} className="object-cover w-full h-full" />
          </motion.div>
        ))}
      </div>

      {/* Botões de navegação */}
      {images.length > visible && (
        <>
          <button
            onClick={prev}
            disabled={index === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            disabled={index >= images.length - visible}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
}
