import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Checkbox } from "@eugenios/ui/components/checkbox";
import { Label } from "@eugenios/ui/components/label";
import ImageSelectorSection from "@/components/pages/gallery/ImageSelectorSection";
import { Image as ImageInterface } from "@eugenios/types";

import { type CompleteFormData } from "./types";

type SlideFormProps = {
  index: number;
  onRemove: () => void;
  total: number;
};

export default function SlideForm({ index, onRemove, total }: SlideFormProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CompleteFormData>();

  // Verifica o estado do checkbox "Mostrar Botão"
  const buttonIsVisible = useWatch({
    control,
    name: `slides.${index}.buttonIsVisible`,
  });

  // Verifica o valor atual da imagem
  const imageUrl = useWatch({
    control,
    name: `slides.${index}.imageUrl`,
  });

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">Slide {index + 1}</h4>
        {total > 1 && (
          <Button onClick={onRemove} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`slides.${index}.title`}>Titulo</Label>
          <Input {...register(`slides.${index}.title`)} placeholder="Slide title" className="mt-1" />
          {errors.slides?.[index]?.title && (
            <p className="text-red-500 text-sm mt-1">{errors.slides[index].title.message}</p>
          )}
        </div>{" "}
        <div>
          <Label htmlFor={`slides.${index}.subtitle`}>Subtitulo</Label>
          <Input {...register(`slides.${index}.subtitle`)} placeholder="Slide subtitle" className="mt-1" />
          {errors.slides?.[index]?.subtitle && (
            <p className="text-red-500 text-sm mt-1">{errors.slides[index].subtitle.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="imageUrl" className="text-right">
            Imagem
          </Label>
          <div className="col-span-3">
            <ImageSelectorSection
              selectedUrl={imageUrl || ""}
              onChange={(img: ImageInterface) =>
                setValue(`slides.${index}.imageUrl`, img.url, { shouldValidate: true })
              }
            />
            {errors.slides?.[index]?.imageUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.slides[index].imageUrl.message}</p>
            )}
          </div>
        </div>{" "}
        <div>
          <Label htmlFor={`slides.${index}.imageAlt`}>Image Alt</Label>
          <Input {...register(`slides.${index}.imageAlt`)} placeholder="Image Alt" className="mt-1" />
          {errors.slides?.[index]?.imageAlt && (
            <p className="text-red-500 text-sm mt-1">{errors.slides[index].imageAlt.message}</p>
          )}
        </div>
      </div>
      {/* Seção do botão */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <Controller
            name={`slides.${index}.buttonIsVisible`}
            control={control}
            render={({ field }) => (
              <Checkbox id={`slides.${index}.buttonIsVisible`} checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor={`slides.${index}.buttonVisible`}>Mostrar Botão</Label>
        </div>{" "}
        {buttonIsVisible && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`slides.${index}.buttonText`}>Texto do botão</Label>
              <Input {...register(`slides.${index}.buttonText`)} placeholder="Call to action" className="mt-1" />
              {errors.slides?.[index]?.buttonText && (
                <p className="text-red-500 text-sm mt-1">{errors.slides[index].buttonText.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor={`slides.${index}.buttonUrl`}>URL do botão</Label>
              <Input {...register(`slides.${index}.buttonUrl`)} placeholder="https://example.com" className="mt-1" />
              {errors.slides?.[index]?.buttonUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.slides[index].buttonUrl.message}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
