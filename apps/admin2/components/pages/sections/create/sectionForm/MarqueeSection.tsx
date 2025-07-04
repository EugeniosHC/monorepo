import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Type, Trash2 } from "lucide-react";

import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Label } from "@eugenios/ui/components/label";

import { type CompleteFormData } from "./types";

type MarqueeSectionProps = {
  fields: ReturnType<typeof useFieldArray<CompleteFormData, "highlights", "id">>["fields"];
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function MarqueeSection({ fields, onAdd, onRemove }: MarqueeSectionProps) {
  const { register } = useFormContext<CompleteFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Marquee Section
          </div>
          <Button onClick={onAdd} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Highlight
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Highlight {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    onClick={() => onRemove(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`highlights.${index}.title`}>Title</Label>
                  <Input {...register(`highlights.${index}.title`)} placeholder="Feature title" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor={`highlights.${index}.icon`}>Icon (optional)</Label>
                  <Input {...register(`highlights.${index}.icon`)} placeholder="Icon name or URL" className="mt-1" />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor={`highlights.${index}.description`}>Description</Label>
                <Textarea
                  {...register(`highlights.${index}.description`)}
                  placeholder="Feature description"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
