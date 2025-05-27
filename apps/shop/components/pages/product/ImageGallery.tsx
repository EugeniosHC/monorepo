"use client";

import Image from "next/image";
import { Category } from "@eugenios/types";
import { motion } from "framer-motion";
import { useMediaQuery } from "@eugenios/ui/hooks/use-media-query";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@eugenios/ui/components/skeleton";

interface ImageGalleryProps {
  CategoryData: Category;
}

/**
 * Displays a responsive image gallery for a category, adapting layout and navigation for mobile and desktop.
 *
 * On mobile devices, renders a horizontally scrollable carousel with snap points, navigation buttons, and slide indicators. On desktop, displays a vertical list of images with hover animations. Shows a loading skeleton until the layout is determined.
 *
 * @param CategoryData - The category data containing the main image and associated product images to display in the gallery.
 */
export function ImageGallery({ CategoryData }: ImageGalleryProps) {
  const [isMediaQueryReady, setIsMediaQueryReady] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = [
    {
      src: CategoryData.imageUrl,
      alt: `Imagem principal de ${CategoryData.name}`,
    },
    ...(CategoryData.products?.map((p) => ({
      src: p.imageUrl || "/placeholder.svg",
      alt: `Imagem do produto ${p.name}`,
    })) ?? []),
  ];

  // Efeito para marcar quando a media query estiver pronta
  useEffect(() => {
    setIsMediaQueryReady(true);
  }, [isMobile]);

  // Efeito para rastrear mudanças na posição de rolagem
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const handleScroll = () => {
      if (!carouselRef.current) return;
      
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      
      if (index !== activeImageIndex) {
        setActiveImageIndex(index);
      }
    };

    const carouselElement = carouselRef.current;
    carouselElement.addEventListener('scroll', handleScroll);
    
    return () => {
      carouselElement.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, activeImageIndex]);

  // Função para navegar para uma imagem específica
  const navigateToImage = (index: number) => {
    if (!carouselRef.current) return;
    
    const newIndex = Math.max(0, Math.min(index, allImages.length - 1));
    const targetScrollPosition = newIndex * carouselRef.current.offsetWidth;
    
    carouselRef.current.scrollTo({
      left: targetScrollPosition,
      behavior: 'smooth'
    });
    
    setActiveImageIndex(newIndex);
  };

  // Funções de navegação
  const goToPrevious = () => navigateToImage(activeImageIndex - 1);
  const goToNext = () => navigateToImage(activeImageIndex + 1);  // Estado de carregamento - exibe um skeleton enquanto determina o layout
  if (!isMediaQueryReady) {
    return (
      <div className="w-full">
        <Skeleton className="w-full aspect-[4/3] rounded-xl" />
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 justify-center">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-3 h-2 rounded-full" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
          <Skeleton className="w-20 h-8 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isMobile ? (
        // Carrossel horizontal para mobile
        <div 
          ref={carouselRef}
          className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >          {allImages.map((img, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full snap-start carousel-item"
              style={{ flex: '0 0 100%' }}
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden border">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                  quality={95}
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Layout vertical para desktop
        <motion.div className="w-full flex flex-col gap-8">
          {allImages.map((img, idx) => (
            <motion.div
              key={idx}
              className="w-full aspect-[4/3] rounded-xl overflow-hidden border"
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={600}
                className="object-cover w-full h-full"
                quality={95}
                priority={idx === 0}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Controles de navegação para mobile */}
      {isMobile && allImages.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
          <button 
            onClick={goToPrevious}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Imagem anterior"
            disabled={activeImageIndex === 0}
            type="button"
          >
            <ChevronLeft size={24} className={activeImageIndex === 0 ? "text-gray-400" : ""} />
          </button>
          <button 
            onClick={goToNext}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Próxima imagem"
            disabled={activeImageIndex === allImages.length - 1}
            type="button"
          >
            <ChevronRight size={24} className={activeImageIndex === allImages.length - 1 ? "text-gray-400" : ""} />
          </button>
        </div>
      )}
      
      {/* Indicadores de slides para mobile */}
      {isMobile && allImages.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => navigateToImage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeImageIndex 
                  ? "bg-primary w-3" 
                  : "bg-gray-300"
              }`}
              aria-label={`Ir para imagem ${idx + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}
