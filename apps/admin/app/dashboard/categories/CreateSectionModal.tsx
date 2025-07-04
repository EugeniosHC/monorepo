"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Grid3X3 } from "lucide-react";
import { toast } from "sonner";

interface CreateSectionModalProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export function CreateSectionModal({ isCreateModalOpen, setIsCreateModalOpen }: CreateSectionModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    // Simular criação da seção (placeholder)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Seção criada com sucesso!");

      // Limpar formulário e fechar modal
      setTitle("");
      setContent("");
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error("Erro ao criar seção");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setIsCreateModalOpen(false);
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-purple-600" />
            Criar Nova Seção
          </DialogTitle>
          <DialogDescription>Preencha os detalhes da nova seção e clique em criar quando terminar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Seção *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Sobre Nós"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o conteúdo da seção..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Seção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
