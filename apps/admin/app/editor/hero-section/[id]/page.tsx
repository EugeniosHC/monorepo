"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import ImmersiveEditor from "@/components/editor/ImmersiveEditor";
import HeroSection from "@/components/pages/sections/HeroSection";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Switch } from "@eugenios/ui/components/switch";
import { Label } from "@eugenios/ui/components/label";
import { Link, Image as ImageIcon, X, Loader2, AlertTriangle, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@eugenios/ui/components/tooltip";
import { ImageGalleryModal } from "@/components/image-gallery";
import { useSectionsById, useUpdateSection } from "@/hooks/useSections";
import type { Slide, SlideItem } from "@eugenios/types";
import Image from "next/image";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function HeroSectionEditorPage({ params }: EditorPageProps) {
  const { id } = use(params); // Unwrap params using React.use()
  const router = useRouter();
  const [editMode, setEditMode] = useState<"title" | "subtitle" | "button" | "image" | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });
  const [activeSlideUpdate, setActiveSlideUpdate] = useState<{
    updateFn: ((field: keyof SlideItem, value: string | boolean) => void) | null;
    slide: SlideItem | null;
  }>({ updateFn: null, slide: null });
  const { data: sectionRaw, isLoading, isError } = useSectionsById(id);
  let section: import("@eugenios/types").Section | undefined = undefined;
  const updateSectionMutation = useUpdateSection();

  // Function to show notifications
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 bg-blue-500/20 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-white text-xl font-medium mb-2">Carregando Editor</h2>
          <p className="text-white/70 text-sm">Preparando sua seção hero...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !sectionRaw) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-6">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-white text-xl font-medium mb-2">Erro ao Carregar</h2>
          <p className="text-white/70 text-sm mb-6">
            Não foi possível carregar a seção. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  section = sectionRaw as import("@eugenios/types").Section;
  if (section.type !== "HERO") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-6">
            <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-white text-xl font-medium mb-2">Tipo de Seção Incorreto</h2>
          <p className="text-white/70 text-sm mb-2">A seção solicitada não é do tipo HERO.</p>
          <p className="text-white/50 text-xs mb-6">
            Tipo atual: <span className="font-mono bg-white/10 px-2 py-1 rounded">{section.type}</span>
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Convert slides from API (without id) to SlideItems (with id) for editor
  const slides: SlideItem[] = (section?.data?.slides || []).map((slide: Slide) => ({
    ...slide,
  }));

  const handleSave = async (slides: SlideItem[]) => {
    try {
      // ...existing code...
      // Convert SlideItems back to Slides (remove id) for API
      const slidesForApi: Slide[] = slides.map((slide) => {
        const slideCopy = { ...slide };
        delete (slideCopy as Partial<SlideItem>).id;
        return slideCopy;
      });
      // ...existing code...
      await updateSectionMutation.mutateAsync({
        id: section.id,
        data: { slides: slidesForApi },
      });
      showNotification("success", "Alterações guardadas com sucesso!");
    } catch (error: unknown) {
      console.error("Error saving:", error);
      let errorMessage = "Erro ao guardar alterações. Tente novamente.";
      if (typeof error === "object" && error !== null) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        errorMessage = err?.response?.data?.message || err?.message || errorMessage;
      }
      showNotification("error", errorMessage);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const createNewSlide = (): SlideItem => {
    return {
      id: Date.now(), // Generate a temporary unique ID
      imageUrl: "/images/home/hero-1.jpg",
      imageAlt: "Eugénios Health Club",
      title: "Novo\n#Slide#",
      subtitle: "Adicione seu texto",
      buttonText: "SAIBA MAIS",
      buttonUrl: "/",
      buttonIsVisible: true,
      buttonIcon: "arrow-right",
    };
  };

  const renderPreview = (slide: SlideItem) => {
    const key = `slide-${slide.imageUrl}`;
    // Convert SlideItem to SlideType for HeroSection
    const slideType = {
      id: slide.id,
      image: slide.imageUrl,
      alt: slide.imageAlt,
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      buttonUrl: slide.buttonUrl,
      buttonIsVisible: slide.buttonIsVisible,
    };
    return <HeroSection key={key} data={{ slides: [slideType] }} />;
  };

  // No longer needed as we're using the image gallery

  const renderEditor = (slide: SlideItem, onUpdate: (field: keyof SlideItem, value: string | boolean) => void) => {
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
                    {slide.imageUrl ? (
                      <Image
                        src={slide.imageUrl}
                        alt={slide.imageAlt || "Preview"}
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
                    value={slide.imageAlt || ""}
                    onChange={(e) => onUpdate("imageAlt", e.target.value)}
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
                      slide: slide,
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

  const renderItemPreview = (slide: SlideItem) => {
    return {
      title: slide.title?.split("\n")[0] || "Slide",
      subtitle: slide.subtitle,
      image: slide.imageUrl,
    };
  };

  return (
    <>
      <ImmersiveEditor
        items={slides}
        onSave={handleSave}
        onBack={handleBack}
        editorTitle="Hero Section"
        renderPreview={renderPreview}
        renderEditor={renderEditor}
        createNewItem={createNewSlide}
        renderItemPreview={renderItemPreview}
      />

      {/* Saving Overlay */}
      {updateSectionMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-6 text-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-white font-medium">Guardando alterações...</p>
            <p className="text-white/70 text-sm mt-1">Por favor aguarde</p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 right-4 z-[110] max-w-sm"
          >
            <div
              className={`rounded-lg p-4 shadow-lg backdrop-blur-md ${
                notification.type === "success"
                  ? "bg-green-600/90 border border-green-500/30"
                  : "bg-red-600/90 border border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === "success" ? (
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
                )}
                <p className="text-white font-medium text-sm">{notification.message}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                  className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 ml-auto flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(imageUrl) => {
          console.log("Image selected:", imageUrl);
          console.log("Active slide update:", activeSlideUpdate);

          if (activeSlideUpdate.updateFn) {
            // Call the update function with the image field and selected URL
            activeSlideUpdate.updateFn("imageUrl", imageUrl);

            // Close the modals
            setIsGalleryOpen(false);
            setEditMode(null);

            console.log("Image updated successfully");
          } else {
            console.error("No update handler available");
          }
        }}
        selectedImage={activeSlideUpdate.slide?.imageUrl || ""}
        title="Selecionar Imagem de Fundo"
      />
    </>
  );
}
