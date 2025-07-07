"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ImmersiveEditor from "@/components/editor/ImmersiveEditor";
import HeroSection from "@/components/pages/sections/HeroSection";
import type { SlideType } from "@/components/pages/sections/HeroSection";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Switch } from "@eugenios/ui/components/switch";
import { Label } from "@eugenios/ui/components/label";
import { Edit, Link, Image as ImageIcon, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@eugenios/ui/components/tooltip";
import { ImageGalleryModal } from "@/components/image-gallery";

export default function HeroSectionEditorPage() {
  const router = useRouter();
  const [editMode, setEditMode] = useState<"title" | "subtitle" | "button" | "image" | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeSlideUpdate, setActiveSlideUpdate] = useState<{
    updateFn: ((field: keyof SlideType, value: any) => void) | null;
    slide: SlideType | null;
  }>({ updateFn: null, slide: null });

  const initialSlides: SlideType[] = [
    {
      id: 1,
      image: "/images/home/hero-1.jpg",
      alt: "Eugénios Health Club - Área de treino premium",
      title: "Os melhores\nTreinam Juntos",
      subtitle: "7 dias grátis",
      buttonText: "SABER MAIS",
      buttonUrl: "/",
      buttonIsVisible: true,
    },
    {
      id: 2,
      image: "/images/home/hero-2.jpg",
      alt: "Eugénios Health Club - Piscina exclusiva",
      title: "Exclusividade\nPara #Ti#",
      subtitle: "Espaço único",
      buttonText: "CONHECER",
      buttonIsVisible: true,
    },
    {
      id: 3,
      image: "/images/home/hero-3.jpg",
      alt: "Eugénios Health Club - Aulas exclusivas",
      title: "Aulas\n#Exclusivas#",
      subtitle: "Várias modalidades",
      buttonText: "VER AULAS",
      buttonIsVisible: true,
    },
  ];

  const handleSave = (slides: SlideType[]) => {
    // Here you would typically save to your backend
    console.log("Saving slides:", slides);
    // Show success message
    alert("Alterações guardadas com sucesso!");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const createNewSlide = (): SlideType => {
    const newId = Math.max(...initialSlides.map((s) => s.id)) + 1;
    return {
      id: newId,
      image: "/images/home/hero-default.jpg",
      alt: "Eugénios Health Club",
      title: "Novo\n#Slide#",
      subtitle: "Adicione seu texto",
      buttonText: "SAIBA MAIS",
      buttonUrl: "/",
      buttonIsVisible: true,
    };
  };

  const renderPreview = (slide: SlideType) => {
    console.log("renderPreview called with slide image:", slide.image);
    // Create a unique key combining id and image URL to force re-render when image changes
    const key = `slide-${slide.id}-${slide.image}`;
    return <HeroSection key={key} data={{ slides: [{ ...slide }] }} />;
  };

  // No longer needed as we're using the image gallery

  const renderEditor = (slide: SlideType, onUpdate: (field: keyof SlideType, value: any) => void) => {
    return (
      <>
        {/* Floating Edit Buttons */}
        <div className="absolute bottom-20 right-8 z-30">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80"
                    onClick={() => setEditMode("title")}
                  >
                    <span className="font-bold text-lg">T</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Editar título</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80"
                    onClick={() => setEditMode("subtitle")}
                  >
                    <span className="font-light text-sm">Aa</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Editar subtítulo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80"
                    onClick={() => setEditMode("button")}
                  >
                    <Link className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Editar botão</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80"
                    onClick={() => setEditMode("image")}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Alterar imagem de fundo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Active Edit Overlays */}
        <div className="container h-full relative flex flex-col justify-center items-center pointer-events-none">
          {/* Title Editor Overlay */}
          {editMode === "title" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md rounded-xl p-6 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-medium">Editar Título</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-72">
                <Label className="text-white mb-2 block">Título (use # para destaque)</Label>
                <textarea
                  value={slide.title || ""}
                  onChange={(e) => onUpdate("title", e.target.value)}
                  className="bg-transparent border border-white/30 text-white w-full h-32 rounded-md p-2 resize-none"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (setEditMode(null), e.preventDefault())}
                />
                <div className="text-xs text-white/70 mt-1">Use # em volta de texto para destacar, ex: #Texto#</div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Subtitle Editor Overlay */}
          {editMode === "subtitle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md rounded-xl p-6 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-medium">Editar Subtítulo</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-72">
                <Label className="text-white mb-2 block">Subtítulo</Label>
                <Input
                  type="text"
                  value={slide.subtitle || ""}
                  onChange={(e) => onUpdate("subtitle", e.target.value)}
                  className="bg-transparent border-white/30 text-white"
                  onKeyDown={(e) => e.key === "Enter" && (setEditMode(null), e.preventDefault())}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Button Editor Overlay */}
          {editMode === "button" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md rounded-xl p-6 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-medium">Editar Botão</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-72 grid gap-4">
                <div>
                  <Label className="text-white mb-2 block">Texto do botão</Label>
                  <Input
                    type="text"
                    value={slide.buttonText || ""}
                    onChange={(e) => onUpdate("buttonText", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">URL do botão</Label>
                  <Input
                    type="text"
                    value={slide.buttonUrl || ""}
                    onChange={(e) => onUpdate("buttonUrl", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                    placeholder="/"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={slide.buttonIsVisible}
                    onCheckedChange={(checked) => onUpdate("buttonIsVisible", checked)}
                    id="button-visible"
                  />
                  <Label htmlFor="button-visible" className="text-white">
                    Mostrar botão
                  </Label>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Image Editor Overlay */}
          {editMode === "image" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md rounded-xl p-6 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-medium">Alterar Imagem de Fundo</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-72 grid gap-4">
                <div>
                  <div className="rounded-md overflow-hidden mb-3 aspect-video bg-gray-800">
                    {slide.image ? (
                      <img 
                        src={slide.image} 
                        alt={slide.alt || "Preview"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <Label className="text-white mb-2 block">Texto alternativo</Label>
                  <Input
                    type="text"
                    value={slide.alt || ""}
                    onChange={(e) => onUpdate("alt", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                    placeholder="Descrição da imagem para acessibilidade"
                  />
                </div>

                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  onClick={() => {
                    // Store both the update function and the current slide
                    setActiveSlideUpdate({
                      updateFn: onUpdate,
                      slide: slide
                    });
                    setIsGalleryOpen(true);
                  }}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Selecionar da Galeria
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(null)}
                  className="mt-2 w-full border-white/30 text-white hover:bg-white/10"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </>
    );
  };

  const renderItemPreview = (slide: SlideType) => {
    return {
      title: slide.title?.split("\n")[0] || "Slide",
      subtitle: slide.subtitle,
      image: slide.image,
    };
  };

  return (
    <>
      <ImmersiveEditor
        items={initialSlides}
        onSave={handleSave}
        onBack={handleBack}
        editorTitle="Hero Section"
        renderPreview={renderPreview}
        renderEditor={renderEditor}
        createNewItem={createNewSlide}
        renderItemPreview={renderItemPreview}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(imageUrl) => {
          console.log("Image selected:", imageUrl);
          console.log("Active slide update:", activeSlideUpdate);
          
          if (activeSlideUpdate.updateFn) {
            // Call the update function with the image field and selected URL
            activeSlideUpdate.updateFn("image", imageUrl);
            
            // Close the modals
            setIsGalleryOpen(false);
            setEditMode(null);
            
            console.log("Image updated successfully");
          } else {
            console.error("No update handler available");
          }
        }}
        selectedImage={activeSlideUpdate.slide?.image || ""}
        title="Selecionar Imagem de Fundo"
      />
      />
    </>
  );
}
