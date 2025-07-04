"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, Info, Trash2, X } from "lucide-react";

import { cn } from "@eugenios/ui/lib/utils";
import { Button } from "@eugenios/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@eugenios/ui/components/dropdown-menu";
import { useImages } from "@eugenios/react-query/queries/useImages";
import ImageUploadModal from "@/components/pages/gallery/ImageUploadModal";
import ImageDeleteModal from "@/components/pages/gallery/ImageDeleteModal";
import { Image as ImageInterface } from "@eugenios/types";
import ImageDetailsModal from "@/components/pages/gallery/ImageDetailsModal";

export default function ImageGalleryDashboardClient() {
  const { data: ImageGallery, isError } = useImages();
  const [selectedImages, setSelectedImages] = useState<ImageInterface[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageInterface | null>(null);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "nameAZ" | "nameZA">("recent");

  if (isError) {
    return (
      <div className="container mx-auto p-6 min-h-screen space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Erro ao carregar a galeria de imagens</h1>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar as imagens. Tente novamente mais tarde.</p>
      </div>
    );
  }

  const toggleSelectImage = (image: ImageInterface) => {
    setSelectedImages((prev) => {
      // Verifica se a imagem já está selecionada pelo key
      const isSelected = prev.some((img) => img.key === image.key);

      if (isSelected) {
        return prev.filter((img) => img.key !== image.key);
      } else {
        return [...prev, image];
      }
    });
  };

  // Função para selecionar todas as imagens
  const selectAllImages = () => {
    if (!ImageGallery?.images) return;

    if (selectedImages.length === ImageGallery.images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...ImageGallery.images]);
    }
  };
  // Função para abrir os detalhes de uma imagem
  const openImageDetails = (image: any) => {
    setCurrentImage(image);
    setIsDetailsOpen(true);
  };

  // Função para ordenar as imagens
  const getSortedImages = () => {
    if (!ImageGallery?.images) return [];

    // Cria uma cópia para não modificar o array original
    const sortedImages = [...ImageGallery.images];

    switch (sortOrder) {
      case "recent":
        // Ordena por data mais recente (assumindo que LastModified é uma string de data)
        return sortedImages.sort((a, b) => {
          const dateA = new Date(a.LastModified || "");
          const dateB = new Date(b.LastModified || "");
          return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
        });

      case "oldest":
        // Ordena por data mais antiga
        return sortedImages.sort((a, b) => {
          const dateA = new Date(a.LastModified || "");
          const dateB = new Date(b.LastModified || "");
          return dateA.getTime() - dateB.getTime(); // Mais antigo primeiro
        });

      case "nameAZ":
        // Ordena por nome (A-Z)
        return sortedImages.sort((a, b) => a.key.localeCompare(b.key));

      case "nameZA":
        // Ordena por nome (Z-A)
        return sortedImages.sort((a, b) => b.key.localeCompare(a.key));

      default:
        return sortedImages;
    }
  };

  // Obter imagens ordenadas
  const sortedImages = getSortedImages();

  return (
    <div className="container mx-auto p-6 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Imagens</h1>
          <p className="text-muted-foreground">
            Gerencie as imagens da sua galeria. Selecione, visualize e organize suas imagens.
          </p>
        </div>{" "}
        <div className="flex items-center gap-2">
          {selectedImages.length > 0 ? (
            <>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir ({selectedImages.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedImages([])}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsUploadOpen(true)}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Adicionar Imagens
            </Button>
          )}
        </div>
      </div>
      {/* Barra de ferramentas */}{" "}
      <div className="flex items-center justify-between rounded-lg border bg-card p-2">
        <div className="flex items-center gap-2">
          {" "}
          <Button variant="ghost" size="sm" onClick={selectAllImages} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border",
                ImageGallery?.images && selectedImages.length === ImageGallery.images.length
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input"
              )}
            >
              {ImageGallery?.images && selectedImages.length === ImageGallery.images.length && (
                <Check className="h-3 w-3 text-current" />
              )}
            </div>
            <span>
              {ImageGallery?.images && selectedImages.length === ImageGallery.images.length
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Ordenar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("recent")}>Mais recentes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Mais antigos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("nameAZ")}>Nome (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("nameZA")}>Nome (Z-A)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>{" "}
      {/* Grid de imagens */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sortedImages &&
          sortedImages.length > 0 &&
          sortedImages.map((image, index) => (
            <div
              key={index}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-muted transition-all hover:opacity-90",
                selectedImages.some((img) => img.key === image.key) && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <div className="absolute left-2 top-2 z-10">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border bg-background transition-colors",
                    selectedImages.some((img) => img.key === image.key)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectImage(image);
                  }}
                >
                  {selectedImages.some((img) => img.key === image.key) && <Check className="h-3 w-3 text-current" />}
                </div>
              </div>
              <div
                className="absolute right-2 top-2 z-10 rounded-full bg-background p-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageDetails(image);
                }}
              >
                <Info className="h-4 w-4" />
              </div>
              <div className="h-full w-full" onClick={() => openImageDetails(image)}>
                <Image
                  src={image.url}
                  alt={image.key}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-medium">{image.key}</p>
              </div>
            </div>
          ))}
      </div>
      {/* Dialog para detalhes da imagem */}
      {currentImage && (
        <ImageDetailsModal
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          currentImage={currentImage}
        />
      )}
      {/* Dialog para upload de imagem */}
      <ImageUploadModal isUploadOpen={isUploadOpen} setIsUploadOpen={setIsUploadOpen} />
      {/* Dialog de confirmação para excluir */}{" "}
      <ImageDeleteModal
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedImages={selectedImages.length > 0 ? selectedImages : []}
        setSelectedImages={(images) => {
          // Handle both single image or array of images
          if (Array.isArray(images)) {
            setSelectedImages(images);
          } else {
            setSelectedImages([images]);
          }
        }}
      />
    </div>
  );
}
