"use client";

import type React from "react";

import { useState } from "react";
import { Textarea } from "@eugenios/ui/components/textarea";
import { toast } from "sonner";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@eugenios/services/axios";

// Schema de validação com Zod
const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome é muito longo"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Por favor, insira um email válido")
    .max(255, "Email é muito longo"),
  subject: z
    .string()
    .min(1, "Assunto é obrigatório")
    .min(3, "Assunto deve ter pelo menos 3 caracteres")
    .max(200, "Assunto é muito longo"),
  message: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .min(10, "Mensagem deve ter pelo menos 10 caracteres")
    .max(2000, "Mensagem é muito longa"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const validateField = (field: keyof ContactFormData, value: string) => {
    const result = contactSchema.shape[field].safeParse(value);
    return result.success ? true : result.error.issues[0]?.message || "Campo inválido";
  };

  const onSubmit = async (data: ContactFormData) => {
    // Prevenir múltiplos envios
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await api.post("notifications/contact", data);

      if (response.status === 201 || response.status === 200) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contacto em breve.");
        reset();
      } else {
        throw new Error("Erro inesperado na resposta do servidor");
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);

      // Tratamento específico de diferentes tipos de erro
      if (error.response?.status === 400) {
        toast.error("Dados inválidos. Verifique as informações e tente novamente.");
      } else if (error.response?.status >= 500) {
        toast.error("Erro no servidor. Tente novamente em alguns minutos.");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-12 space-y-4">
        <Typography as="h2" variant="sectionTitle" className="text-center font-semibold text-neutral-800">
          Entre em Contato
        </Typography>
        <Typography as="p" variant="body" className="text-center ">
          Tem alguma dúvida ou precisa de mais informações? <br /> Preencha o formulário abaixo e entraremos em contato
          o mais breve possível.
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <input
                {...register("name", {
                  required: "Nome é obrigatório",
                  validate: (value) => validateField("name", value),
                })}
                id="name"
                placeholder="Nome"
                disabled={isSubmitting}
                className={`bg-white w-full rounded-full px-6 py-3 text-neutral-800 border placeholder-gray-500 focus:outline-none ${
                  errors.name ? "border-red-500" : "border-neutral-800"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-sm px-6">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <input
                {...register("email", {
                  required: "Email é obrigatório",
                  validate: (value) => validateField("email", value),
                })}
                id="email"
                type="email"
                placeholder="Email"
                disabled={isSubmitting}
                className={`bg-white w-full border rounded-full px-6 py-3 text-neutral-800 placeholder-gray-500 focus:outline-none ${
                  errors.email ? "border-red-500" : "border-neutral-800"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm px-6">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <input
              {...register("subject", {
                required: "Assunto é obrigatório",
                validate: (value) => validateField("subject", value),
              })}
              id="subject"
              placeholder="Assunto da mensagem"
              disabled={isSubmitting}
              className={`bg-white w-full border rounded-full px-6 py-3 text-neutral-800 placeholder-gray-500 focus:outline-none focus-visible:ring-none ${
                errors.subject ? "border-red-500" : "border-neutral-800"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors.subject && <p className="text-red-500 text-sm px-6">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <Textarea
              {...register("message", {
                required: "Mensagem é obrigatória",
                validate: (value) => validateField("message", value),
              })}
              id="message"
              placeholder="Escreva sua mensagem aqui..."
              disabled={isSubmitting}
              className={`text-lg min-h-[180px] bg-white border text-neutral-800 placeholder:text-gray-500 rounded-2xl px-4 py-3 shadow-md focus:outline-none focus-visible:ring-none ${
                errors.message ? "border-red-500" : "border-neutral-800"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors.message && <p className="text-red-500 text-sm px-4">{errors.message.message}</p>}
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <CustomButton variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1a2942]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center gap-2">Enviar Mensagem</span>
              )}
            </CustomButton>
          </div>
        </form>

        {/* Mapa */}
        <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.3569592277436!2d-8.532959923999071!3d41.388053695954014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd24591e42a19c87%3A0x3df3ffb8fab06e45!2sEug%C3%A9nios%20Health%20%26%20SPA%20Club!5e0!3m2!1spt-PT!2spt!4v1747839680427!5m2!1spt-PT!2spt"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização do Eugenics Health Club"
            className="h-full min-h-[400px]"
          ></iframe>
        </div>
      </div>
    </>
  );
}
