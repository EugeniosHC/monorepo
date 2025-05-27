"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { X } from "lucide-react";

interface AdesaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdesaoModal({ isOpen, onClose }: AdesaoModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [errors, setErrors] = useState({
    nome: false,
    email: false,
    telefone: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      nome: formData.nome.trim() === "",
      email: !/^\S+@\S+\.\S+$/.test(formData.email),
      telefone: formData.telefone.trim().length < 9,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Aqui seria enviado para o backend
      console.log("Formulário enviado:", formData);

      // Resetar formulário e fechar modal
      setFormData({ nome: "", email: "", telefone: "" });
      onClose();

      // Feedback para o usuário (poderia ser um toast)
      alert("Solicitação de adesão enviada com sucesso! Entraremos em contato em breve.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl border-neutral-200">
        <div className="bg-neutral-900 text-white p-6 relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-wide">
              SOLICITAR <span className="font-semibold">ADESÃO</span>
            </DialogTitle>
            <DialogDescription className="text-white/70 pt-2">
              Preencha os dados abaixo para iniciar o seu processo de adesão ao Eugénios HC.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-white/90 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-neutral-800 font-medium">
              Nome completo
            </Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`rounded-xl border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 ${
                errors.nome ? "border-red-500" : ""
              }`}
              placeholder="Insira o seu nome completo"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">Por favor, insira o seu nome.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-800 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`rounded-xl border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="exemplo@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">Por favor, insira um email válido.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-neutral-800 font-medium">
              Telefone
            </Label>
            <Input
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={`rounded-xl border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 ${
                errors.telefone ? "border-red-500" : ""
              }`}
              placeholder="912 345 678"
            />
            {errors.telefone && (
              <p className="text-red-500 text-xs mt-1">Por favor, insira um número de telefone válido.</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
              ENVIAR SOLICITAÇÃO
            </Button>
          </DialogFooter>

          <p className="text-xs text-neutral-500 text-center pt-2">
            Ao enviar, concorda com a nossa política de privacidade e termos de utilização.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
