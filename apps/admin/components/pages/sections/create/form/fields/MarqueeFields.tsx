"use client";

import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@eugenios/ui/components/input";
import { Button } from "@eugenios/ui/components/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@eugenios/ui/components/form";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { FormData } from "../schema";
import { IconSelector } from "@/components/IconSelector";

export default function MarqueeFields() {
  const { control } = useFormContext<FormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "icons",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Marquee Highlights
          </div>
          <Button
            type="button"
            onClick={() =>
              append({
                icon: "",
                iconLibrary: "tabler",
                description: "",
              })
            }
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Adicionar Highlight
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fields.map((field, index) => (
            <HighlightForm
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
  );
}

type HighlightFormProps = {
  index: number;
  onRemove: () => void;
  control: any;
  total: number;
};

function HighlightForm({ index, onRemove, control, total }: HighlightFormProps) {
  const { setValue } = useFormContext<FormData>();

  // Watch the current icon library for this highlight
  const currentIconLibrary = useWatch({
    control,
    name: `icons.${index}.iconLibrary`,
  });

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">Highlight {index + 1}</h4>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormField
            control={control}
            name={`icons.${index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>{" "}
                <FormControl>
                  <IconSelector
                    selectedIcon={field.value || ""}
                    selectedLibrary={currentIconLibrary || "tabler"}
                    onSelect={(iconName, iconLibrary) => {
                      field.onChange(iconName);
                      setValue(`icons.${index}.iconLibrary`, iconLibrary);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={control}
            name={`icons.${index}.iconLibrary`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biblioteca</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || "tabler"} disabled className="bg-gray-50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-3">
          <FormField
            control={control}
            name={`highlights.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
