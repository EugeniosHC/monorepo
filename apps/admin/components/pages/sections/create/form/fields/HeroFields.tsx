"use client";

import { useEffect } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@eugenios/ui/components/input";
import { Button } from "@eugenios/ui/components/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@eugenios/ui/components/form";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Label } from "@eugenios/ui/src/components/label";
import ImageSelectorSection from "@/components/pages/gallery/ImageSelectorSection";
import { Image as ImageInterface } from "@eugenios/types";
import { FormData } from "../schema";

export default function HeroFields() {
  const { control, setValue } = useFormContext<FormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slides",
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hero Slides
            </div>{" "}
            <Button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  subtitle: "",
                  imageUrl: "",
                  imageAlt: "",
                  buttonIsVisible: true,
                  buttonText: "",
                  buttonUrl: "",
                })
              }
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar Slide
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.map((field, index) => (
              <SlideForm
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                control={control}
                total={fields.length}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

type SlideFormProps = {
  index: number;
  onRemove: () => void;
  control: any;
  total: number;
};

function SlideForm({ index, onRemove, control, total }: SlideFormProps) {
  const { setValue } = useFormContext<FormData>();

  // Verifica o estado do checkbox "Mostrar Botão"
  const buttonIsVisible = useWatch({
    control,
    name: `slides.${index}.buttonIsVisible`,
  });

  const imageUrl = useWatch({
    control,
    name: `slides.${index}.imageUrl`,
  });

  // Clear button fields when button is not visible
  useEffect(() => {
    if (!buttonIsVisible) {
      setValue(`slides.${index}.buttonText`, "");
      setValue(`slides.${index}.buttonUrl`, "");
    }
  }, [buttonIsVisible, index, setValue]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">Slide {index + 1}</h4>
        {total > 1 && (
          <Button
            type="button"
            onClick={onRemove}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormField
            control={control}
            name={`slides.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={control}
            name={`slides.${index}.subtitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          </div>
        </div>{" "}
        <div>
          <FormField
            control={control}
            name={`slides.${index}.imageAlt`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto Alternativo da Imagem</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      {/* Seção do botão */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <FormField
            control={control}
            name={`slides.${index}.buttonIsVisible`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <input type="checkbox" checked={field.value} onChange={field.onChange} />
                  Mostrar botão?
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>{" "}
        {buttonIsVisible && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                control={control}
                name={`slides.${index}.buttonText`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={control}
                name={`slides.${index}.buttonUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Botão</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" className="mt-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
