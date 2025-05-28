"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@eugenios/ui/components/button";
import { Card } from "@eugenios/ui/components/card";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { Textarea } from "@eugenios/ui/components/textarea";
import ImageSelectorSection from "@/components/pages/gallery/ImageSelectorSection";
import { useCreateCategory } from "@eugenios/react-query/mutations/useCategories";

const formSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  slug: z.string().min(3, "Slug é obrigatório"),
  title: z.string().min(3, "Título é obrigatório"),
  subtitle: z.string().min(3, "Subtítulo é obrigatório"),
  description: z.string().min(3, "Descrição é obrigatória"),
  helpDescription: z.string().min(3, "Descrição de ajuda é obrigatória"),
  imageUrl: z.string().url("Imagem inválida").min(1, "URL da imagem é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateCategoryClient() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = (data: FormData) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        reset(); // limpa o formulário
        router.refresh();
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className=" font-bold">Criar Categoria: {watch("name")}</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Voltar para Dashboard
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Massagens" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" {...register("slug")} placeholder="Ex: massagens" />
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
              <p className="text-xs text-gray-500">Identificador único para URL (tenha cuidado ao alterar)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título para Exibição</Label>
              <Input id="title" {...register("title")} placeholder="Ex: Nossas Massagens" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input id="subtitle" {...register("subtitle")} placeholder="Ex: Conheça nossos serviços de massagem" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea id="description" {...register("description")} placeholder="Descrição detalhada..." rows={4} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpDescription">Descrição de Ajuda</Label>
            <Textarea id="helpDescription" {...register("helpDescription")} placeholder="Texto de ajuda..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Imagem</Label>
            <ImageSelectorSection onChange={(img) => setValue("imageUrl", img.url)} selectedUrl={imageUrl} />
            {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || createCategory.isPending}>
              {createCategory.isPending ? "Espere..." : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
