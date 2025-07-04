"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Button } from "@eugenios/ui/components/button";
import ImageSelectorSection from "../gallery/ImageSelectorSection";
import { Product } from "@eugenios/types";
import { useUpdateProduct } from "@eugenios/react-query/mutations/useProducts";

// Schema Zod
const schema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url({ message: "URL inválida" }),
  duration: z.string().optional(),
  description: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

interface EditProductModalProps {
  product: Product;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

export function EditProductModal({ product, isEditModalOpen, setIsEditModalOpen }: EditProductModalProps) {
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name || "",
      price: product.price ?? 0,
      imageUrl: product.imageUrl || "",
      duration: product.duration || "",
      description: product.description || "",
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = (data: FormData) => {
    updateProduct.mutate(
      { id: product.id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no produto e clique em guardar quando terminar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" className="col-span-3" {...register("name")} />
              {errors.name && <span className="text-red-500 col-span-4 text-sm">{errors.name.message}</span>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <Input type="number" step="0.01" id="price" className="col-span-3" {...register("price")} />
              {errors.price && <span className="text-red-500 col-span-4 text-sm">{errors.price.message}</span>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Imagem
              </Label>
              <div className="col-span-3">
                <ImageSelectorSection
                  selectedUrl={imageUrl || ""}
                  onChange={(img) => setValue("imageUrl", img.url, { shouldValidate: true })}
                />
                {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />}
                {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duração
              </Label>
              <Input id="duration" className="col-span-3" {...register("duration")} />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descrição
              </Label>
              <Textarea id="description" rows={3} className="col-span-3" {...register("description")} />
              {errors.description && (
                <span className="text-red-500 col-span-4 text-sm">{errors.description.message}</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Guardando..." : "Guardar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
