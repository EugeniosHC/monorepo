"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { Textarea } from "@eugenios/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@eugenios/ui/components/dialog";

import { useCategoryDataBySlug } from "@eugenios/react-query/queries/useCategories";
import { useDeleteCategory, useUpdateCategory } from "@eugenios/react-query/mutations/useCategories";
import ImageSelectorSection from "@/components/pages/gallery/ImageSelectorSection";

const editCategorySchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  slug: z.string().min(3, "Slug é obrigatório"),
  title: z.string().min(3, "Título é obrigatório"),
  subtitle: z.string().min(3, "Subtítulo é obrigatório"),
  description: z.string().min(3, "Descrição é obrigatória"),
  helpDescription: z.string().min(3, "Descrição de ajuda é obrigatória"),
  imageUrl: z.string().url("Imagem inválida").min(1, "URL da imagem é obrigatória"),
});

type EditCategoryFormData = z.infer<typeof editCategorySchema>;

export default function EditCategoryClient({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      title: "",
      subtitle: "",
      description: "",
      helpDescription: "",
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl");

  // Fetch category data
  const { data: category, isLoading } = useCategoryDataBySlug(categorySlug);

  // Reset form when category loads
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        title: category.title || "",
        subtitle: category.subtitle || "",
        description: category.description,
        helpDescription: category.helpDescription || "",
        imageUrl: category.imageUrl || "",
      });
    }
  }, [category, reset]);

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const onSubmit = (data: EditCategoryFormData) => {
    updateCategory.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard/categories");
      },
    });
  };

  const handleDelete = (slug: string) => {
    deleteCategory.mutate(slug, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.push("/dashboard/categories");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 flex items-center justify-center min-h-[300px]">
          <p className="text-lg">Carregando dados da categoria...</p>
        </Card>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 flex items-center justify-center min-h-[300px]">
          <p className="text-lg">Categoria não encontrada.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className=" font-bold">Editar Categoria: {watch("name")}</h4>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Voltar para Dashboard
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">Excluir Categoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Categoria</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a categoria &quot;{watch("name")}&quot;? Esta ação não pode ser
                  desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(category.slug)}
                  disabled={deleteCategory.isPending}
                >
                  {deleteCategory.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Massagens" aria-invalid={!!errors.name} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" {...register("slug")} placeholder="Ex: massagens" aria-invalid={!!errors.slug} />
              <p className="text-xs text-gray-500">Identificador único para URL (tenha cuidado ao alterar)</p>
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título para Exibição</Label>
              <Input id="title" {...register("title")} placeholder="Ex: Nossas Massagens" />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input id="subtitle" {...register("subtitle")} placeholder="Ex: Conheça nossos serviços de massagem" />
              {errors.subtitle && <p className="text-red-500 text-sm">{errors.subtitle.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição detalhada da categoria..."
              rows={4}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpDescription">Descrição de Ajuda</Label>
            <Textarea
              id="helpDescription"
              {...register("helpDescription")}
              placeholder="Texto de ajuda explicativo sobre a categoria..."
              rows={3}
            />
            {errors.helpDescription && <p className="text-red-500 text-sm">{errors.helpDescription.message}</p>}
          </div>

          <div className="space-y-2">
            <ImageSelectorSection
              selectedUrl={imageUrl || ""}
              onChange={(img) => setValue("imageUrl", img.url, { shouldValidate: true })}
            />

            {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateCategory.isPending}>
              {updateCategory.isPending ? "Guardando..." : "Guardar Alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
