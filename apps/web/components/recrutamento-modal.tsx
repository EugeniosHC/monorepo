"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { X, CheckCircle, AlertCircle, Paperclip, ChevronDown } from "lucide-react";
import { Typography } from "@eugenios/ui/src/components/ui/Typography";
import { motion, AnimatePresence } from "framer-motion";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import api from "@eugenios/services/axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@eugenios/ui/src/components/select";

interface RecrutamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const recrutamentoSchema = z.object({
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
  function: z.enum([
    "Personal Trainer",
    "Monitor de Sala",
    "Professor Aulas de Grupo",
    "Consultor Comercial",
    "Receção",
    "Serviços Gerais",
    "Nutricionista",
  ]),
  curriculo: z
    .any()
    .refine((files) => files?.length > 0, "Currículo é obrigatório")
    .refine((files) => files?.[0]?.size <= 10000000, "O arquivo deve ter no máximo 10MB")
    .refine((files) => files?.[0]?.type === "application/pdf", "Apenas arquivos PDF são aceitos"),
});

type RecrutamentoFormData = z.infer<typeof recrutamentoSchema>;

export function RecrutamentoModal({ isOpen, onClose }: RecrutamentoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<RecrutamentoFormData>({
    mode: "onChange",
  });

  const onSubmit = async (data: RecrutamentoFormData) => {
    // Prevenir múltiplos envios
    if (isSubmitting) return;

    // Processar os dados do arquivo
    const processedData = {
      ...data,
      curriculo: data.curriculo?.[0], // Extrair o primeiro arquivo do FileList
    };

    // Validação manual usando Zod
    const result = recrutamentoSchema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Dados inválidos";
      setError(errorMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Criar FormData para envio de arquivo
      const formData = new FormData();
      formData.append("name", processedData.name);
      formData.append("email", processedData.email);
      formData.append("phone", processedData.mobile_number);
      formData.append("function", processedData.function);
      if (processedData.curriculo) {
        formData.append("curriculo", processedData.curriculo);
      }

      const response = await api.post("notifications/candidatura", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        setShowSuccess(true);

        // Aguardar um pouco e fechar
        setTimeout(() => {
          reset();
          setShowSuccess(false);
          setError(null);
          setSelectedFile(null);
          setIsSelectOpen(false);
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
      setSelectedFile(null);
      setIsSelectOpen(false);
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
          <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[900px] max-h-[95vh] p-0 overflow-hidden border-0 rounded-2xl md:rounded-3xl shadow-2xl bg-transparent">
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
                      ENVIE O SEU CURRÍCULO
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
                          Currículo Enviado!
                        </h3>
                        <p className="text-neutral-600 leading-relaxed text-base md:text-lg max-w-xs md:max-w-sm mx-auto px-4 md:px-0">
                          Recebemos a sua candidatura. A nossa equipa entrará em contacto consigo nas próximas 24 horas.
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
                          Insira os seus dados no formulário abaixo{" "}
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
                                autoComplete="name"
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
                                autoComplete="tel"
                                className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 text-neutral-800 placeholder-gray-500 focus:outline-none text-sm md:text-base ${
                                  errors.mobile_number ? "border-red-500" : "border-neutral-800"
                                }`}
                              />
                              {errors.mobile_number && (
                                <p className="text-red-500 text-xs md:text-sm px-2">{errors.mobile_number?.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-1 md:space-y-2">
                              <input
                                {...register("email", {
                                  required: "Email é obrigatório",
                                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Formato de email inválido" },
                                })}
                                id="email"
                                type="email"
                                placeholder="Email *"
                                autoComplete="email"
                                className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 text-neutral-800 placeholder-gray-500 focus:outline-none focus-visible:ring-none text-sm md:text-base ${
                                  errors.email ? "border-red-500" : "border-neutral-800"
                                }`}
                              />
                              {errors.email && (
                                <p className="text-red-500 text-xs md:text-sm px-2">{errors.email?.message}</p>
                              )}
                            </div>
                            <div className="space-y-1 md:space-y-2 relative">
                              <Controller
                                name="function"
                                control={control}
                                rules={{ required: "Função é obrigatória" }}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    onOpenChange={setIsSelectOpen}
                                  >
                                    <SelectTrigger
                                      id="function"
                                      className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 pr-10 text-neutral-800 placeholder-gray-500 text-sm md:text-base appearance-none cursor-pointer ${
                                        errors.function ? "border-red-500" : "border-neutral-800"
                                      }`}
                                      style={{ height: "auto" }}
                                    >
                                      <SelectValue placeholder="Selecione uma função *" />
                                      <ChevronDown
                                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                          isSelectOpen ? "rotate-180" : "rotate-0"
                                        }`}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem className="text-md" value="Personal Trainer">
                                        Personal Trainer
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Monitor de Sala">
                                        Monitor de Sala
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Professor Aulas de Grupo">
                                        Professor Aulas de Grupo
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Consultor Comercial">
                                        Consultor Comercial
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Receção">
                                        Receção
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Serviços Gerais">
                                        Serviços Gerais
                                      </SelectItem>
                                      <SelectItem className="text-md" value="Nutricionista">
                                        Nutricionista
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.function && (
                                <p className="text-red-500 text-xs md:text-sm px-2">{errors.function?.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 md:space-y-2">
                            <div className="relative">
                              <input
                                {...register("curriculo", {
                                  required: "Currículo é obrigatório",
                                })}
                                id="curriculo"
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedFile(file.name);
                                  } else {
                                    setSelectedFile(null);
                                  }
                                }}
                              />
                              <div
                                className={`bg-white w-full border rounded-full px-4 py-2.5 md:px-6 md:py-3 pr-12 text-neutral-800 placeholder-gray-500 focus-within:outline-none text-sm md:text-base cursor-pointer transition-colors hover:bg-gray-50 ${
                                  errors.curriculo ? "border-red-500" : "border-neutral-800"
                                }`}
                              >
                                <span className={selectedFile ? "text-neutral-800" : "text-gray-500"}>
                                  {selectedFile || "Anexar currículo (PDF) *"}
                                </span>
                              </div>
                              {/* Ícone de anexo */}
                              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                            {errors.curriculo && (
                              <p className="text-red-500 text-xs md:text-sm px-2">
                                {typeof errors.curriculo.message === "string"
                                  ? errors.curriculo.message
                                  : "Currículo é obrigatório"}
                              </p>
                            )}
                            <Typography as="p" variant="caption" className="text-center text-xs md:text-sm px-4">
                              Ao clicar em "ENVIAR CANDIDATURA", autorizo o tratamento dos meu dados pessoais pela
                              entidade Eugénios HC, para efeitos de recrutamento e para envio das suas informações,
                              ofertas e promoções, durante 24 meses ou 24 meses após o último contacto.
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
                                <span className="flex items-center gap-2 text-sm md:text-base">Enviar Currículo</span>
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
