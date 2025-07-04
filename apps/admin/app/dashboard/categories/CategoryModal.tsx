"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@eugenios/ui/components/form";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Badge } from "@eugenios/ui/components/badge";
import { ButtonLoading } from "@/components/ui/loading";
import { ImageGalleryModal } from "@/components/ui/image-gallery-modal";
import { toast } from "sonner";
import { X, Eye, Image as ImageIcon, FolderPlus } from "lucide-react";

// Schema de validação
const categorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  subtitle: z.string().min(3, "Subtítulo deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  helpDescription: z.string().min(10, "Descrição de ajuda deve ter pelo menos 10 caracteres"),
  imageUrl: z.string().url("URL da imagem inválida").min(1, "URL da imagem é obrigatória"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  helpDescription: string;
  imageUrl: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category?: Category | null; // null para criar, Category para editar
  isSubmitting?: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  isSubmitting = false,
}: CategoryModalProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      title: category?.title || "",
      subtitle: category?.subtitle || "",
      description: category?.description || "",
      helpDescription: category?.helpDescription || "",
      imageUrl: category?.imageUrl || "",
    },
  });

  // Reset form quando o modal abre/fecha ou categoria muda
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: category?.name || "",
        slug: category?.slug || "",
        title: category?.title || "",
        subtitle: category?.subtitle || "",
        description: category?.description || "",
        helpDescription: category?.helpDescription || "",
        imageUrl: category?.imageUrl || "",
      });
    }
  }, [isOpen, category, form]);

  // Auto-gerar slug baseado no nome
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      // Erro já tratado pelos hooks de React Query
      console.error("Erro ao submeter formulário:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            {isEditing ? "Editar Categoria" : "Criar Nova Categoria"}
            {isEditing && (
              <Badge variant="outline" className="text-xs">
                ID: {category.id}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria abaixo."
              : "Preencha as informações para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome da Categoria */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Fisioterapia"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="fisioterapia" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>URL amigável (gerada automaticamente)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Serviços de Fisioterapia" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subtítulo */}
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tratamentos especializados" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada da categoria..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>Descrição principal da categoria</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição de Ajuda */}
            <FormField
              control={form.control}
              name="helpDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição de Ajuda *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais para ajudar os clientes..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>Informações extras para orientar os usuários</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Imagem */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem da Categoria</FormLabel>
                  <div className="space-y-3">
                    <FormControl>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsGalleryOpen(true)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {field.value ? "Alterar Imagem" : "Selecionar da Galeria"}
                        </Button>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newWindow = window.open(field.value, "_blank");
                              newWindow?.focus();
                            }}
                            disabled={isSubmitting}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>

                    {/* Preview da Imagem */}
                    {field.value && (
                      <div className="relative">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <ImageIcon className="h-4 w-4" />
                          Imagem Selecionada
                        </div>
                        <div className="relative w-full max-w-xs">
                          <img
                            src={field.value}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={() => {
                              form.setError("imageUrl", {
                                type: "manual",
                                message: "Erro ao carregar imagem.",
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => {
                              field.onChange("");
                            }}
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <FormDescription>Selecione uma imagem da galeria para representar esta categoria.</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <ButtonLoading size="sm" />
                    {isEditing ? "Atualizando..." : "Criando..."}
                  </>
                ) : isEditing ? (
                  "Atualizar Categoria"
                ) : (
                  "Criar Categoria"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Modal de Galeria de Imagens */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(imageUrl) => {
          form.setValue("imageUrl", imageUrl);
          setIsGalleryOpen(false);
        }}
      />
    </Dialog>
  );
}

// Hook para gerenciar o estado do modal
export function useCategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingCategory(null);
  };

  return {
    isOpen,
    editingCategory,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
