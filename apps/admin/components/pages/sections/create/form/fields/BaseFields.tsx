"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@eugenios/ui/components/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@eugenios/ui/components/form";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { FileText } from "lucide-react";
import { Label } from "@eugenios/ui/src/components/label";
import { SectionType } from "@eugenios/types";
import { FormData } from "../schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";

export default function BaseFields() {
  const { control } = useFormContext<FormData>();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Criar Secção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Secção</FormLabel>
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
                name={`type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo da Secção</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SectionType.HERO}>Hero Section</SelectItem>
                          <SelectItem value={SectionType.MARQUEE}>Marquee Section</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-4">
            <FormField
              control={control}
              name={`description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
