import { useFieldArray } from "react-hook-form";
import { Plus, ImageIcon } from "lucide-react";

import { Button } from "@eugenios/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";

import SlideForm from "./SlideForm";
import { type CompleteFormData } from "./types";

type HeroSectionProps = {
  fields: ReturnType<typeof useFieldArray<CompleteFormData, "slides", "id">>["fields"];
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function HeroSection({ fields, onAdd, onRemove }: HeroSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Slides
          </div>
          <Button onClick={onAdd} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Slide
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fields.map((field, index) => (
            <SlideForm key={field.id} index={index} onRemove={() => onRemove(index)} total={fields.length} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
