"use client";

import { useState } from "react";
import { useImageGallery, useUploadImage, useDeleteImages } from "@/hooks/useImageGallery";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { Input } from "@eugenios/ui/components/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@eugenios/ui/components/alert-dialog";
import {
  Upload,
  Trash2,
  Download,
  Search,
  Grid3X3,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  X,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PageLoading, ButtonLoading } from "@/components/ui/loading";

export default function GalleryPage() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Hooks
  const { data: gallery, isLoading, error, refetch } = useImageGallery();
  const uploadImage = useUploadImage();
  const deleteImages = useDeleteImages();

  // Filtrar imagens com base na pesquisa
  const filteredImages =
    gallery?.images.filter((image) => image.key.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  // Handlers
  const handleImageSelect = (imageKey: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageKey) ? prev.filter((key) => key !== imageKey) : [...prev, imageKey]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map((img) => img.key));
    }
  };

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
        await uploadImage.mutateAsync(file);
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
      }
    }

    // Limpar input
    event.target.value = "";
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return;

    try {
      await deleteImages.mutateAsync(selectedImages);
      setSelectedImages([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao eliminar imagens:", error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para a área de transferência!");
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (sizeStr: string) => {
    // O tamanho já vem formatado do backend, então só retornamos como está
    return sizeStr || "0 B";
  };

  const formatDate = (dateStr: string) => {
    // As datas já vêm formatadas do backend, então só retornamos como estão
    return dateStr || "Data não disponível";
  };

  if (isLoading) {
    return <PageLoading text="Carregando galeria..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <ImageIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar galeria</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar as imagens.</p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galeria de Imagens</h1>
          <p className="text-gray-600 mt-1">Gerencie suas imagens e recursos visuais</p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="image-upload">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploadImage.isPending ? "Enviando..." : "Enviar Imagens"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total de Imagens</p>
              <p className="text-2xl font-bold text-gray-900">{gallery?.images.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Selecionadas</p>
              <p className="text-2xl font-bold text-gray-900">{selectedImages.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Grid3X3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Filtradas</p>
              <p className="text-2xl font-bold text-gray-900">{filteredImages.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Upload className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Upload em Progresso</p>
              <p className="text-2xl font-bold text-gray-900">{uploadImage.isPending ? "1" : "0"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de ferramentas */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar imagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSelectAll} disabled={filteredImages.length === 0}>
              {selectedImages.length === filteredImages.length ? "Desselecionar Todas" : "Selecionar Todas"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedImages.length > 0 && (
              <>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedImages.length} selecionada(s)
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteImages.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Grid de Imagens */}
      {filteredImages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <ImageIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "Nenhuma imagem encontrada" : "Nenhuma imagem na galeria"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Tente ajustar os termos de pesquisa" : "Comece enviando suas primeiras imagens"}
          </p>
          {!searchQuery && (
            <label htmlFor="image-upload">
              <Button asChild variant="outline" className="cursor-pointer">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Primeira Imagem
                </span>
              </Button>
            </label>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <Card
              key={image.key}
              className="group relative overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Checkbox de seleção */}
              <div className="absolute top-2 left-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                  onClick={() => handleImageSelect(image.key)}
                >
                  {selectedImages.includes(image.key) ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Ações da imagem */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={() => setSelectedImagePreview(image.url)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={() => handleCopyUrl(image.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={() => handleDownloadImage(image.url, image.key)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Imagem */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={image.url}
                  alt={image.key}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Informações da imagem */}
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{image.key}</h4>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{image.LastModified ? formatDate(image.LastModified) : "Data não disponível"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Preview */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
              onClick={() => setSelectedImagePreview(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={selectedImagePreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Dialog de confirmação de eliminação */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Imagens</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar {selectedImages.length} imagem(ns) selecionada(s)? Esta ação não pode ser
              desfeita.
              {selectedImages.length > 0 && (
                <div className="mt-2 text-sm text-orange-600">
                  ⚠️ Imagens que estão em uso por produtos não serão eliminadas.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteImages.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              disabled={deleteImages.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteImages.isPending ? (
                <div className="flex items-center gap-2">
                  <ButtonLoading size="sm" />
                  Eliminando...
                </div>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
