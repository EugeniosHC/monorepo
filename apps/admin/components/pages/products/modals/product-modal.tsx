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
import { X, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Schema de validação
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  price: z.number().min(0, "Preço deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  duration: z.string().optional(),
  imageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string | null;
  imageUrl: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product | null; // null para criar, Product para editar
  isSubmitting?: boolean;
}

export function ProductModal({ isOpen, onClose, onSubmit, product = null, isSubmitting = false }: ProductModalProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      description: product?.description || "",
      duration: product?.duration || "",
      imageUrl: product?.imageUrl || "",
    },
  });

  // Reset form quando o modal abre/fecha ou produto muda
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: product?.name || "",
        price: product?.price || 0,
        description: product?.description || "",
        duration: product?.duration || "",
        imageUrl: product?.imageUrl || "",
      });
    }
  }, [isOpen, product, form]);

  const handleSubmit = async (data: ProductFormData) => {
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
            {isEditing ? "Editar Produto" : "Criar Novo Produto"}
            {isEditing && (
              <Badge variant="outline" className="text-xs">
                ID: {product.id}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do produto abaixo."
              : "Preencha as informações para criar um novo produto."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Produto */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Consulta de Fisioterapia" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preço */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Preço em euros (ex: 25.50)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duração */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 30 min, 1 hora, etc." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>Duração estimada do serviço (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o produto ou serviço..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>Descrição detalhada do produto ou serviço</FormDescription>
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
                  <FormLabel>Imagem do Produto</FormLabel>
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
                          <Image
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

                    <FormDescription>Selecione uma imagem da galeria ou envie uma nova imagem.</FormDescription>
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
                  "Atualizar Produto"
                ) : (
                  "Criar Produto"
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
export function useProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingProduct(null);
  };

  return {
    isOpen,
    editingProduct,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
