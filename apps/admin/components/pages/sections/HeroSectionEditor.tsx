"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "@/components/pages/sections/HeroSection";
import type { SlideType } from "@/components/pages/sections/HeroSection";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Switch } from "@eugenios/ui/components/switch";
import { Label } from "@eugenios/ui/components/label";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Link,
  Save,
  Image as ImageIcon,
  X,
  Upload,
  Undo,
  ChevronLeft,
  Settings,
  LayoutDashboard,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@eugenios/ui/components/tooltip";
import { cn } from "@eugenios/ui/lib/utils";

export default function HeroSectionEditor() {
  const router = useRouter();
  const [slides, setSlides] = useState<SlideType[]>([
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
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [editMode, setEditMode] = useState<"title" | "subtitle" | "button" | "image" | null>(null);
  const [showTopBar, setShowTopBar] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showSlidesPanel, setShowSlidesPanel] = useState(false);

  // Handle the active edit mode
  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel edit mode or close slides panel
      if (e.key === "Escape") {
        if (editMode) {
          setEditMode(null);
        } else if (showSlidesPanel) {
          setShowSlidesPanel(false);
        }
      }

      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Left and right arrows to navigate slides
      if (!editMode) {
        if (e.key === "ArrowLeft") {
          handlePrevSlide();
        } else if (e.key === "ArrowRight") {
          handleNextSlide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, showSlidesPanel]);

  const handleEdit = (index: number, field: keyof SlideType, value: string | boolean) => {
    const newSlides = [...slides];
    newSlides[index] = {
      ...newSlides[index],
      [field]: value,
    };
    setSlides(newSlides);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setEditMode(null);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setEditMode(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          handleEdit(currentSlide, "image", e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving slides:", slides);
    // Show success message
    alert("Alterações guardadas com sucesso!");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const addNewSlide = () => {
    const newId = Math.max(...slides.map((s) => s.id)) + 1;
    const newSlide: SlideType = {
      id: newId,
      image: "/images/home/hero-default.jpg",
      alt: "Eugénios Health Club",
      title: "Novo\n#Slide#",
      subtitle: "Adicione seu texto",
      buttonText: "SAIBA MAIS",
      buttonUrl: "/",
      buttonIsVisible: true,
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    setShowSlidesPanel(false);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("Não é possível excluir o único slide existente.");
      return;
    }

    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);

    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Main Hero Section Preview */}
      <div className="w-full h-full">
        <HeroSection data={{ slides: [slides[currentSlide]] }} />
      </div>

      {/* Top Bar - Minimal Control */}
      <AnimatePresence>
        {showTopBar && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-md z-50 flex items-center justify-between px-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-white hover:text-white/80"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>

            <div className="text-white text-sm font-medium">
              Slide {currentSlide + 1} de {slides.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSlidesPanel(!showSlidesPanel)}
                className="text-white hover:text-white/80"
              >
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Slides</span>
              </Button>

              <Button variant="default" size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Guardar</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide/Show Top Bar Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTopBar(!showTopBar)}
        className="fixed top-3 right-3 z-50 h-8 w-8 p-0 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
      >
        {showTopBar ? <X className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
      </Button>

      {/* Slide Navigation - Always visible but subtle */}
      <div className="fixed bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-2">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20 p-0"
            onClick={handlePrevSlide}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {slides.map((_, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="icon"
              className={`h-2 w-2 rounded-full p-0 ${
                idx === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20 p-0"
            onClick={handleNextSlide}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slides Management Panel */}
      <AnimatePresence>
        {showSlidesPanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-12 right-0 bottom-0 w-72 bg-black/70 backdrop-blur-md z-40 text-white overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Gerenciar Slides</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSlidesPanel(false)}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-2 p-2 rounded-md ${
                      idx === currentSlide ? "bg-blue-500/20 border border-blue-500/40" : "hover:bg-white/10"
                    } cursor-pointer transition-colors`}
                    onClick={() => setCurrentSlide(idx)}
                  >
                    <div
                      className="h-12 w-16 rounded-md bg-cover bg-center overflow-hidden relative flex-shrink-0"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                    <div className="flex-grow truncate">
                      <div className="font-medium truncate">{slide.title?.split("\n")[0]}</div>
                      <div className="text-xs text-white/70 truncate">{slide.subtitle}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Tem certeza que deseja excluir o slide ${idx + 1}?`)) {
                          deleteSlide(idx);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewSlide}
                  className="w-full mt-4 border-dashed border-white/30 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Slide
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Editing Interface - Activated on click */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Edit Buttons */}
        <div className="absolute bottom-20 right-8 z-30">
          <div className="flex flex-col gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80 pointer-events-auto"
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
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80 pointer-events-auto"
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
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80 pointer-events-auto"
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
                    className="h-12 w-12 rounded-full bg-black/40 text-white border-white/20 hover:bg-blue-600/80 pointer-events-auto"
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
                  ref={inputRef as any}
                  value={slides[currentSlide].title || ""}
                  onChange={(e) => handleEdit(currentSlide, "title", e.target.value)}
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
                  ref={inputRef}
                  type="text"
                  value={slides[currentSlide].subtitle || ""}
                  onChange={(e) => handleEdit(currentSlide, "subtitle", e.target.value)}
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
                    value={slides[currentSlide].buttonText || ""}
                    onChange={(e) => handleEdit(currentSlide, "buttonText", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">URL do botão</Label>
                  <Input
                    type="text"
                    value={slides[currentSlide].buttonUrl || ""}
                    onChange={(e) => handleEdit(currentSlide, "buttonUrl", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                    placeholder="/"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={slides[currentSlide].buttonIsVisible}
                    onCheckedChange={(checked) => handleEdit(currentSlide, "buttonIsVisible", checked)}
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
                <div className="mb-2">
                  <Label className="text-white mb-2 block">URL da imagem</Label>
                  <Input
                    type="text"
                    value={slides[currentSlide].image || ""}
                    onChange={(e) => handleEdit(currentSlide, "image", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                    placeholder="/images/your-image.jpg"
                  />
                </div>

                <div className="mb-2">
                  <Label className="text-white mb-2 block">Texto alternativo</Label>
                  <Input
                    type="text"
                    value={slides[currentSlide].alt || ""}
                    onChange={(e) => handleEdit(currentSlide, "alt", e.target.value)}
                    className="bg-transparent border-white/30 text-white"
                    placeholder="Descrição da imagem para acessibilidade"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    onClick={() => {
                      if (imageInputRef.current) {
                        imageInputRef.current.click();
                      }
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar imagem
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

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
      </div>
    </div>
  );
}
