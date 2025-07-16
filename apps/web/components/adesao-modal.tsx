"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Typography } from "@eugenios/ui/src/components/ui/Typography";
import { motion, AnimatePresence } from "framer-motion";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import api from "@eugenios/services/axios";

interface AdesaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const adesaoSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  email: z.string().min(1, "Email é obrigatório").email("Formato de email inválido"),
  mobile_number: z
    .string()
    .min(1, "Telefone é obrigatório")
    .min(9, "Telefone deve ter pelo menos 9 dígitos")
    .regex(/^[0-9+\-\s()]+$/, "Telefone deve conter apenas números e símbolos válidos"),
});

type AdesaoFormData = z.infer<typeof adesaoSchema>;

export function AdesaoModal({ isOpen, onClose }: AdesaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdesaoFormData>({
    mode: "onChange",
  });

  const onSubmit = async (data: AdesaoFormData) => {
    // Prevenir múltiplos envios
    if (isSubmitting) return;

    // Validação manual usando Zod
    const result = adesaoSchema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Dados inválidos";
      setError(errorMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post("closum/add-lead", result.data);

      if (response.status === 201 || response.status === 200) {
        setShowSuccess(true);

        // Aguardar um pouco e fechar
        setTimeout(() => {
          reset();
          setShowSuccess(false);
          setError(null);
          onClose();
        }, 3000);
      } else {
        throw new Error("Erro inesperado na resposta do servidor");
      }
    } catch (error: any) {
      console.error("Erro ao enviar:", error);

      // Tratamento específico de diferentes tipos de erro
      if (error.response?.status === 400) {
        setError("Dados inválidos. Verifique as informações e tente novamente.");
      } else if (error.response?.status === 409) {
        setError("Este email já está registrado em nosso sistema.");
      } else if (error.response?.status >= 500) {
        setError("Erro no servidor. Tente novamente em alguns minutos.");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        setError("Erro ao enviar solicitação. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setShowSuccess(false);
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          {/* Overlay personalizado com animação */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Conteúdo do modal */}
          <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[700px] max-h-[95vh] p-0 overflow-hidden border-0 rounded-2xl md:rounded-3xl shadow-2xl bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94],
                opacity: { duration: 0.2 },
              }}
              className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden"
            >
              {/* Botão de fechar customizado */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/20 backdrop-blur-sm p-2 opacity-80 hover:opacity-100 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X className="h-4 w-4 text-white" />
                <span className="sr-only">Fechar</span>
              </button>
              {/* Conteúdo principal */}
              <div className="relative overflow-hidden">
                {/* Header Luxuoso */}
                <DialogHeader className="bg-primary text-white px-6 py-8 md:px-12 md:py-12 space-y-4 md:space-y-6">
                  <DialogTitle className="text-center">
                    <Typography as="span" variant="title" className="text-lg md:text-2xl lg:text-3xl">
                      FAÇA PARTE DA #FAMÍLIAEUGÉNIOS
                    </Typography>
                  </DialogTitle>
                </DialogHeader>

                {/* Conteúdo do formulário */}
                <div className="px-6 pb-6 md:px-12 md:pb-10">
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center py-12"
                      >
                        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                          <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3 md:mb-4">
                          Solicitação Enviada!
                        </h3>
                        <p className="text-neutral-600 leading-relaxed text-base md:text-lg max-w-xs md:max-w-sm mx-auto px-4 md:px-0">
                          Recebemos a sua solicitação de adesão. A nossa equipa entrará em contacto consigo nas próximas
                          24 horas.
                        </p>
                      </motion.div>
                    ) : error ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center py-12"
                      >
                        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                          <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3 md:mb-4">
                          Ops! Algo deu errado
                        </h3>
                        <p className="text-neutral-600 leading-relaxed text-base md:text-lg max-w-xs md:max-w-sm mx-auto px-4 md:px-0 mb-6">
                          {error}
                        </p>
                        <div className="flex items-center justify-center pt-2 md:pt-4">
                          <CustomButton
                            variant="primary"
                            onClick={() => setError(null)}
                            className="w-full max-w-xs flex justify-center items-center"
                          >
                            Tentar Novamente
                          </CustomButton>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <Typography
                          as="p"
                          variant="body"
                          className="text-center py-3 md:py-4 text-sm md:text-base px-4 md:px-0"
                        >
                          Preencha o formulário e entraremos em contacto consigo.
                        </Typography>
                        <motion.form
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmit(onSubmit)}
                          className="space-y-4 md:space-y-6 mt-3 md:mt-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-1 md:space-y-2">
                              <input
                                {...register("name", {
                                  required: "Nome é obrigatório",
                                  minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
                                  maxLength: { value: 50, message: "Nome deve ter no máximo 50 caracteres" },
                                })}
                                id="name"
                                placeholder="Nome *"
                                className={`bg-white w-full rounded-full px-4 py-2.5 md:px-6 md:py-3 text-neutral-800 border placeholder-gray-500 focus:outline-none text-sm md:text-base ${
                                  errors.name ? "border-red-500" : "border-neutral-800"
                                }`}
                              />
                              {errors.name && (
                                <p className="text-red-500 text-xs md:text-sm px-2">{errors.name?.message}</p>
                              )}
                            </div>
                            <div className="space-y-1 md:space-y-2">
                              <input
                                {...register("mobile_number", {
                                  required: "Telefone é obrigatório",
                                  minLength: { value: 9, message: "Telefone deve ter pelo menos 9 dígitos" },
                                  pattern: {
                                    value: /^[0-9+\-\s()]+$/,
                                    message: "Telefone deve conter apenas números e símbolos válidos",
                                  },
                                })}
                                id="mobile_number"
                                type="tel"
                                placeholder="Telefone *"
                                className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 text-neutral-800 placeholder-gray-500 focus:outline-none text-sm md:text-base ${
                                  errors.mobile_number ? "border-red-500" : "border-neutral-800"
                                }`}
                              />
                              {errors.mobile_number && (
                                <p className="text-red-500 text-xs md:text-sm px-2">{errors.mobile_number?.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 md:space-y-2">
                            <input
                              {...register("email", {
                                required: "Email é obrigatório",
                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Formato de email inválido" },
                              })}
                              id="email"
                              type="email"
                              placeholder="Email *"
                              className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 text-neutral-800 placeholder-gray-500 focus:outline-none focus-visible:ring-none text-sm md:text-base ${
                                errors.email ? "border-red-500" : "border-neutral-800"
                              }`}
                            />
                            {errors.email && (
                              <p className="text-red-500 text-xs md:text-sm px-2">{errors.email?.message}</p>
                            )}
                            <Typography
                              as="p"
                              variant="caption"
                              className="text-center text-xs md:text-sm px-2 md:px-0"
                            >
                              Ao enviar este formulário, você concorda com <br />
                              os nossos{" "}
                              <a href="/termos-condicoes" className="text-primary underline">
                                Termos de Serviço
                              </a>{" "}
                              e{" "}
                              <a href="/politica-privacidade" className="text-primary underline">
                                Política de Privacidade
                              </a>
                              .
                            </Typography>
                          </div>

                          <div className="flex items-center justify-center pt-2 md:pt-4">
                            <CustomButton
                              variant="primary"
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full max-w-xs md:max-w-none md:w-auto"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center gap-2 text-sm md:text-base">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-[#1a2942]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Enviando...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-sm md:text-base">Enviar Mensagem</span>
                              )}
                            </CustomButton>
                          </div>
                        </motion.form>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
