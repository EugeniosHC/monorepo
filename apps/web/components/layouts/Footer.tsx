"use client";

import { Facebook, Instagram, Youtube, Mail, Phone, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import { useState } from "react";
import api from "@eugenios/services/axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PageSection from "../PageSection";
import { ContactSection } from "../pages/home/ContactSection";

// Schema de validação com Zod
const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Por favor, insira um email válido")
    .max(255, "Email é muito longo"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export type FooterProps = {
  ImageComponent: React.ComponentType<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }>;
};

export default function Footer({ ImageComponent }: FooterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>();

  const validateEmail = (email: string) => {
    const result = newsletterSchema.safeParse({ email });
    return result.success ? true : result.error.issues[0]?.message || "Email inválido";
  };

  const onSubmit = async (data: NewsletterFormData) => {
    // Prevenir múltiplos envios
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setShowSuccess(false);

    try {
      const response = await api.post("closum/newsletter", data);

      if (response.status === 201 || response.status === 200) {
        setShowSuccess(true);
        reset();

        // Aguardar um pouco e limpar o sucesso
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        throw new Error("Erro inesperado na resposta do servidor");
      }
    } catch (error: any) {
      console.error("Erro ao enviar:", error);

      // Tratamento específico de diferentes tipos de erro
      if (error.response?.status === 400) {
        setSubmitError("Dados inválidos. Verifique as informações e tente novamente.");
      } else if (error.response?.status === 409) {
        setSubmitError("Este email já está registrado em nosso sistema.");
      } else if (error.response?.status >= 500) {
        setSubmitError("Erro no servidor. Tente novamente em alguns minutos.");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setSubmitError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        setSubmitError("Erro ao enviar solicitação. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageSection id="contactos" className="flex flex-col w-full py-20 bg-white">
        <ContactSection />
      </PageSection>
      <footer className="bg-primary text-white py-12">
        <div className="container px-8 mx-auto">
          {/* Top section - Newsletter + Social/Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
            <div className="flex flex-col h-full">
              <Typography as="h3" variant="title" className="font-semibold mb-3">
                Receba as últimas novidades
              </Typography>
              <Typography as="p" variant="footerText" className="text-white/80 mb-6">
                Subscreva hoje a nossa Newsletter e fique sempre a <br /> par das melhores dicas e treinos exclusivos.
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative max-w-md mb-auto mt-4">
                  <input
                    {...register("email", {
                      required: "Email é obrigatório",
                      validate: validateEmail,
                    })}
                    type="email"
                    placeholder="O seu email"
                    disabled={isSubmitting}
                    className={`w-full rounded-full px-6 py-4 text-black placeholder-gray-500 focus:outline-none ${
                      errors.email ? "border-2 border-red-500" : ""
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="Enviar"
                    className={`bg-primary p-3 rounded-full absolute top-1/2 right-1 translate-y-[-50%] mr-1 hover:bg-primary/90 transition-colors ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="text-white w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Mensagens de erro e sucesso */}
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-300 text-sm max-w-md">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.email.message}</span>
                  </div>
                )}

                {submitError && (
                  <div className="flex items-center gap-2 text-red-300 text-sm max-w-md">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {showSuccess && (
                  <div className="flex items-center gap-2 text-green-300 text-sm max-w-md">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Subscrição realizada com sucesso!</span>
                  </div>
                )}
              </form>
            </div>

            <div className="flex flex-col h-full ">
              <div className="flex items-center gap-6 mb-8">
                <Typography as="h3" variant="title" className="font-semibold text-white">
                  Siga-nos
                </Typography>
                <div className="flex gap-4">
                  <a
                    aria-label="Facebook"
                    href="https://www.facebook.com/eugenioshealthclubspa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white hover:bg-[#1877F2] rounded-full p-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#293c59"
                      className="w-6 h-6 text-primary group-hover:text-white transition-colors group-hover:fill-white"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 2a1 1 0 0 1 .993 .883l.007 .117v4a1 1 0 0 1 -.883 .993l-.117 .007h-3v1h3a1 1 0 0 1 .991 1.131l-.02 .112l-1 4a1 1 0 0 1 -.858 .75l-.113 .007h-2v6a1 1 0 0 1 -.883 .993l-.117 .007h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-6h-2a1 1 0 0 1 -.993 -.883l-.007 -.117v-4a1 1 0 0 1 .883 -.993l.117 -.007h2v-1a6 6 0 0 1 5.775 -5.996l.225 -.004h3z" />
                    </svg>
                  </a>
                  <a
                    aria-label="Instagram"
                    href="https://www.instagram.com/eugenioshc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-full p-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#293c59"
                      className="w-6 h-6 text-primary group-hover:fill-white transition-colors"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M16 3a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-8a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5zm-4 5a4 4 0 0 0 -3.995 3.8l-.005 .2a4 4 0 1 0 4 -4m4.5 -1.5a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1" />
                    </svg>
                  </a>
                  <a
                    aria-label="Youtube"
                    href="https://www.youtube.com/@eugenioshealthclubspa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white hover:bg-[#FF0000] rounded-full p-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#293c59"
                      className="w-6 h-6 text-primary group-hover:text-white transition-colors group-hover:fill-white"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 3a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-12a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5zm-9 6v6a1 1 0 0 0 1.514 .857l5 -3a1 1 0 0 0 0 -1.714l-5 -3a1 1 0 0 0 -1.514 .857z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex flex-col h-full justify-end items-start">
                <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                  Contactos
                </Typography>
                <Typography as="p" variant="footerText" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>252 312 585 - 911 182 532</span>
                </Typography>
                <Typography as="p" variant="footerText" className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href="mailto:apoioaocliente@eugenioshc.com" className="hover:underline">
                    apoioaocliente@eugenioshc.com
                  </a>
                </Typography>
              </div>
            </div>
          </div>

          {/* Middle section - Address + Hours/Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
            <div className="flex flex-col h-full">
              <div className="mb-auto">
                <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                  Morada
                </Typography>
                <address className="not-italic text-white/80 space-y-2 text-base">
                  <p>Rua Padre Avis de Brito 189</p>
                  <p>4760-234 Calendário</p>
                  <p>Vila Nova de Famalicão</p>
                </address>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                  Horário
                </Typography>
                <ul className="text-white/80 space-y-2 text-base">
                  <li>
                    <strong>De segunda-feira a sexta-feira:</strong> das 07:00 às 22:00
                  </li>
                  <li>
                    <strong>Sábado:</strong> das 08:00 às 20:00
                  </li>
                  <li>
                    <strong>Domingo e feriados:</strong> das 09:00 às 13:00
                  </li>
                </ul>
              </div>
              <div className="flex items-end justify-center">
                <ImageComponent
                  className="pb-1"
                  src="/images/logos/white.svg"
                  alt="Eugénios HC Logo"
                  width={50}
                  height={50}
                />
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/70 text-center md:text-left">
              <p>© {currentYear} Eugénios Health Club. Todos os direitos reservados.</p>
            </div>
            <div className="text-sm text-white/70 text-center space-y-1 md:space-y-0 md:space-x-4">
              <a href="/politica-privacidade" className="block md:inline hover:underline">
                Política de Privacidade
              </a>
              <a href="/termos-condicoes" className="block md:inline hover:underline">
                Termos e Condições de Uso
              </a>
              <a href="#" className="block md:inline hover:underline">
                Política de Cancelamento
              </a>
              <a
                href="https://www.livroreclamacoes.pt/Inicio/"
                target="_blank"
                rel="noopener noreferrer"
                className="block md:inline hover:underline"
              >
                Livro de Reclamações
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
