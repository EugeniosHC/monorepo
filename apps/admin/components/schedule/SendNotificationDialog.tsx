import { useState } from "react";
import { Button } from "@eugenios/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@eugenios/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eugenios/ui/components/tabs";
import { Input } from "@eugenios/ui/components/input";
import { Badge } from "@eugenios/ui/components/badge";
import { Card, CardContent } from "@eugenios/ui/components/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@eugenios/ui/components/accordion";
import { toast } from "sonner";
import { useSendScheduleNotification, useScheduleChanges } from "@/hooks/useNotifications";
import { Plus, Minus, Pencil, AlertCircle } from "lucide-react";

// Define interfaces for better type safety
interface ClassData {
  nome: string;
  categoria: string;
  horaInicio?: string;
  hora_inicio?: string; // Support both formats
  duracao: number;
  sala: string;
  professor: string;
  intensidade?: string | number;
}

interface ClassChange {
  old: ClassData;
  new: ClassData;
}

interface DayData {
  hasChanges: boolean;
  added: ClassData[];
  removed: ClassData[];
  modified: ClassChange[];
}

// Define the response from the API
interface ScheduleChangesResponse {
  prevSchedule: {
    id: string;
    titulo: string;
  } | null;
  newSchedule: {
    id: string;
    titulo: string;
  };
  changesByDay: Record<string, DayData>;
  totalChanges: number;
}

interface ChangesData {
  totalChanges: number;
  prevSchedule?: ScheduleChangesResponse["prevSchedule"];
  changesByDay?: Record<string, DayData>;
}

interface SendNotificationDialogProps {
  prevScheduleId: string;
  newScheduleId: string;
  prevScheduleTitle: string;
  newScheduleTitle: string;
  children?: React.ReactNode;
}

export function SendNotificationDialog({
  prevScheduleId,
  newScheduleId,
  prevScheduleTitle,
  newScheduleTitle,
  children,
}: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("alteracoes");
  const { mutate: sendNotification, isPending: isSending } = useSendScheduleNotification();
  const {
    data: changesData,
    isLoading: isLoadingChanges,
    error,
  } = useScheduleChanges(open ? prevScheduleId : undefined, open ? newScheduleId : undefined);

  // Normalize the data structure to handle potential undefined values
  const normalizedChangesData: ChangesData = (changesData as ScheduleChangesResponse)
    ? {
        totalChanges: (changesData as ScheduleChangesResponse).totalChanges || 0,
        prevSchedule: (changesData as ScheduleChangesResponse).prevSchedule || null,
        changesByDay: (changesData as ScheduleChangesResponse).changesByDay || {},
      }
    : {
        totalChanges: 0,
        prevSchedule: null,
        changesByDay: {},
      };

  // Função para obter o dia da semana em português
  const getDayName = (dayNumber: number): string => {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[dayNumber] || `Dia ${dayNumber}`;
  };

  // Função para obter cor com base na categoria
  const getCategoryColor = (category: string): string => {
    const normalizedCategory = category?.toUpperCase() || "";

    switch (normalizedCategory) {
      case "TERRA":
        return "bg-terrestre-100 text-terrestre-800";
      case "AGUA":
      case "ÁGUA":
        return "bg-aqua-100 text-aqua-800";
      case "EXPRESS":
        return "bg-xpress-100 text-xpress-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to normalize class data properties
  const normalizeClassData = (aula: Partial<ClassData>): ClassData => {
    if (!aula) return {} as ClassData;

    return {
      nome: aula.nome || "Aula sem nome",
      categoria: aula.categoria || "Terra",
      horaInicio: aula.horaInicio || aula.hora_inicio || "00:00",
      duracao: aula.duracao || 0,
      sala: aula.sala || "Sala não especificada",
      professor: aula.professor || "Professor não especificado",
      intensidade: aula.intensidade || 2,
    };
  };

  const handleSendNotification = () => {
    if (!email) {
      toast.error("Email obrigatório", {
        description: "Por favor, forneça um email para enviar a notificação.",
      });
      return;
    }

    // Simple regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email inválido", {
        description: "Por favor, forneça um email válido.",
      });
      return;
    }

    sendNotification(
      {
        prevScheduleId,
        newScheduleId,
        emailTo: email,
      },
      {
        onSuccess: () => {
          toast.success("Notificação enviada", {
            description: `As alterações foram enviadas para ${email}`,
          });
          setOpen(false);
        },
        onError: (error: { message?: string }) => {
          toast.error("Erro ao enviar notificação", {
            description: error.message || "Ocorreu um erro ao enviar a notificação",
          });
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          setActiveTab("alteracoes");
        }
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            Enviar Notificação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {(changesData as ScheduleChangesResponse)?.prevSchedule
              ? "Notificação de Alterações de Horário"
              : "Notificação de Novo Horário"}
          </DialogTitle>
          <DialogDescription>
            {(changesData as ScheduleChangesResponse)?.prevSchedule ? (
              <>
                Visualize e envie as diferenças entre <strong>{prevScheduleTitle}</strong> e{" "}
                <strong>{newScheduleTitle}</strong>.
              </>
            ) : (
              <>
                Visualize e envie as aulas do horário <strong>{newScheduleTitle}</strong>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="alteracoes">Ver Alterações</TabsTrigger>
            <TabsTrigger value="email">Enviar Email</TabsTrigger>
          </TabsList>

          <TabsContent value="alteracoes" className="h-[50vh] overflow-auto pr-2">
            {isLoadingChanges ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Carregando alterações...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-40 text-center">
                <div className="space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-red-500">Erro ao carregar alterações.</p>
                  <p className="text-sm text-muted-foreground">{error.message || "Tente novamente mais tarde."}</p>
                </div>
              </div>
            ) : !changesData ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Nenhuma alteração encontrada.</p>
              </div>
            ) : normalizedChangesData.totalChanges === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-2">
                <p className="text-amber-600 font-medium">Os horários são idênticos!</p>
                <p className="text-muted-foreground text-center max-w-md">
                  Não foram encontradas diferenças entre <strong>{prevScheduleTitle}</strong> e{" "}
                  <strong>{newScheduleTitle}</strong>.
                </p>
                <p className="text-sm text-gray-500">Faça alterações no horário antes de enviar notificações.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {normalizedChangesData.prevSchedule ? (
                      <>Total de alterações: {normalizedChangesData.totalChanges}</>
                    ) : (
                      <>Total de aulas: {normalizedChangesData.totalChanges}</>
                    )}
                  </h3>
                  <Button onClick={() => setActiveTab("email")} size="sm">
                    Continuar para Envio
                  </Button>
                </div>

                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(normalizedChangesData.changesByDay || {}).map(
                    ([dayNumber, dayData]: [string, DayData]) => {
                      if (!dayData?.hasChanges) return null;

                      const dayName = getDayName(parseInt(dayNumber));

                      return (
                        <AccordionItem value={dayNumber} key={dayNumber} className="border rounded-md">
                          <AccordionTrigger className="px-4">
                            <div className="flex items-center">
                              <span className="font-medium">{dayName}</span>
                              <div className="flex space-x-2 ml-4">
                                {dayData.added && dayData.added.length > 0 && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    <Plus className="h-3 w-3 mr-1" /> {dayData.added.length}
                                  </Badge>
                                )}
                                {dayData.removed && dayData.removed.length > 0 && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800">
                                    <Minus className="h-3 w-3 mr-1" /> {dayData.removed.length}
                                  </Badge>
                                )}
                                {dayData.modified && dayData.modified.length > 0 && (
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                    <Pencil className="h-3 w-3 mr-1" /> {dayData.modified.length}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pt-2">
                            {/* Aulas Adicionadas */}
                            {dayData.added && dayData.added.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-green-700 mb-2">Aulas Adicionadas</h4>
                                <div className="space-y-2">
                                  {dayData.added.map((aula: ClassData, idx: number) => {
                                    const normalizedAula = normalizeClassData(aula);
                                    const horaInicio = normalizedAula.horaInicio || normalizedAula.hora_inicio;

                                    return (
                                      <Card key={idx} className="border-l-4 border-l-green-500">
                                        <CardContent className="p-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{normalizedAula.nome}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {horaInicio} • {normalizedAula.duracao} min • {normalizedAula.sala}
                                              </p>
                                              <p className="text-sm">Professor: {normalizedAula.professor}</p>
                                            </div>
                                            <Badge className={getCategoryColor(normalizedAula.categoria)}>
                                              {normalizedAula.categoria}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Aulas Removidas */}
                            {dayData.removed && dayData.removed.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-red-700 mb-2">Aulas Removidas</h4>
                                <div className="space-y-2">
                                  {dayData.removed.map((aula: ClassData, idx: number) => {
                                    const normalizedAula = normalizeClassData(aula);
                                    const horaInicio = normalizedAula.horaInicio || normalizedAula.hora_inicio;

                                    return (
                                      <Card key={idx} className="border-l-4 border-l-red-500">
                                        <CardContent className="p-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{normalizedAula.nome}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {horaInicio} • {normalizedAula.duracao} min • {normalizedAula.sala}
                                              </p>
                                              <p className="text-sm">Professor: {normalizedAula.professor}</p>
                                            </div>
                                            <Badge className={getCategoryColor(normalizedAula.categoria)}>
                                              {normalizedAula.categoria}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Aulas Modificadas */}
                            {dayData.modified && dayData.modified.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-amber-700 mb-2">Aulas Modificadas</h4>
                                <div className="space-y-2">
                                  {dayData.modified.map((change: ClassChange, idx: number) => {
                                    const newAula = normalizeClassData(change.new);
                                    const oldAula = normalizeClassData(change.old);
                                    const changes = [];
                                    const horaInicio = newAula.horaInicio || newAula.hora_inicio;

                                    if (oldAula.categoria !== newAula.categoria) {
                                      changes.push(`Categoria: ${oldAula.categoria} → ${newAula.categoria}`);
                                    }
                                    if (oldAula.duracao !== newAula.duracao) {
                                      changes.push(`Duração: ${oldAula.duracao} min → ${newAula.duracao} min`);
                                    }
                                    if (oldAula.sala !== newAula.sala) {
                                      changes.push(`Sala: ${oldAula.sala} → ${newAula.sala}`);
                                    }
                                    if (oldAula.professor !== newAula.professor) {
                                      changes.push(`Professor: ${oldAula.professor} → ${newAula.professor}`);
                                    }
                                    if (oldAula.intensidade !== newAula.intensidade) {
                                      changes.push(`Intensidade: ${oldAula.intensidade} → ${newAula.intensidade}`);
                                    }

                                    return (
                                      <Card key={idx} className="border-l-4 border-l-amber-500">
                                        <CardContent className="p-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{newAula.nome}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {horaInicio} • {newAula.duracao} min • {newAula.sala}
                                              </p>
                                              <div className="mt-2 space-y-1">
                                                {changes.length > 0 ? (
                                                  changes.map((change, i) => (
                                                    <p key={i} className="text-xs text-amber-700">
                                                      • {change}
                                                    </p>
                                                  ))
                                                ) : (
                                                  <p className="text-xs text-amber-700">• Horário modificado</p>
                                                )}
                                              </div>
                                            </div>
                                            <Badge className={getCategoryColor(newAula.categoria)}>
                                              {newAula.categoria}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email para envio
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>

            <div className="pt-4">
              {normalizedChangesData.totalChanges === 0 ? (
                <p className="text-amber-600 text-sm">
                  Não é possível enviar notificações pois os horários são idênticos. Faça alterações no horário
                  primeiro.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {normalizedChangesData.prevSchedule ? (
                    <>
                      Um email será enviado com as alterações entre <strong>{prevScheduleTitle}</strong> e{" "}
                      <strong>{newScheduleTitle}</strong>.
                    </>
                  ) : (
                    <>
                      Um email será enviado com as aulas do horário <strong>{newScheduleTitle}</strong>.
                    </>
                  )}
                </p>
              )}
              {changesData ? (
                <p className="text-sm mt-1">
                  {normalizedChangesData.prevSchedule ? (
                    <>
                      <span className="font-medium">{normalizedChangesData.totalChanges}</span> alterações serão
                      incluídas no email.
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{normalizedChangesData.totalChanges}</span> aulas serão incluídas no
                      email.
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
            Cancelar
          </Button>
          {activeTab === "email" ? (
            <Button
              onClick={handleSendNotification}
              disabled={isSending || normalizedChangesData.totalChanges === 0 || !email || email.trim() === ""}
              title={
                !email || email.trim() === ""
                  ? "Digite um email para enviar"
                  : normalizedChangesData.totalChanges === 0
                    ? "Não há alterações para enviar"
                    : ""
              }
            >
              {isSending ? "Enviando..." : "Enviar Email"}
            </Button>
          ) : (
            <Button onClick={() => setActiveTab("email")} disabled={isLoadingChanges}>
              Continuar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
