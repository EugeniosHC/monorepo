import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";

import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Label } from "@eugenios/ui/components/label";
import { SectionType } from "@eugenios/types";
import { type CompleteFormData } from "./types";

type SectionConfigurationProps = {
  sectionType: SectionType;
  onSectionTypeChange: (value: SectionType) => void;
};

export default function SectionConfiguration({ sectionType, onSectionTypeChange }: SectionConfigurationProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CompleteFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Section Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Section Title</Label>
            <Input id="title" {...register("title")} placeholder="Enter section title" className="mt-1" />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="type">Section Type</Label>
            <Select value={sectionType} onValueChange={onSectionTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SectionType.HERO}>Hero Section</SelectItem>
                <SelectItem value={SectionType.MARQUEE}>Marquee Section</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="description">Section Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Enter section description"
            className="mt-1"
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
