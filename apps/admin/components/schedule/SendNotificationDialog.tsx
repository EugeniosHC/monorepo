import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@eugenios/ui/components/accordion";
import { toast } from "sonner";
import { useSendScheduleNotification, useScheduleChanges } from "@/hooks/useNotifications";
import { Plus, Minus, Pencil } from "lucide-react";

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

  // Função para obter o dia da semana em português
  const getDayName = (dayNumber: number) => {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[dayNumber] || `Dia ${dayNumber}`;
  };

  // Função para obter cor com base na categoria
  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "TERRA":
        return "bg-terrestre-100 text-terrestre-800";
      case "AGUA":
        return "bg-aqua-100 text-aqua-800";
      case "EXPRESS":
        return "bg-xpress-100 text-xpress-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSendNotification = () => {
    if (!email) {
      toast.error("Email obrigatório", {
        description: "Por favor, forneça um email para enviar a notificação.",
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
        onError: (error: any) => {
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
          <DialogTitle>Notificação de Alterações</DialogTitle>
          <DialogDescription>
            {changesData?.prevSchedule ? (
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
              <div className="flex items-center justify-center h-40">
                <p className="text-red-500">Erro ao carregar alterações.</p>
              </div>
            ) : !changesData ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Nenhuma alteração encontrada.</p>
              </div>
            ) : changesData.totalChanges === 0 ? (
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
                    {changesData?.prevSchedule ? (
                      <>Total de alterações: {changesData?.totalChanges || 0}</>
                    ) : (
                      <>Total de aulas: {changesData?.totalChanges || 0}</>
                    )}
                  </h3>
                  <Button onClick={() => setActiveTab("email")} size="sm">
                    Continuar para Envio
                  </Button>
                </div>

                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(changesData.changesByDay || {}).map(([dayNumber, dayData]: [string, any]) => {
                    if (!dayData?.hasChanges) return null;

                    const dayName = getDayName(parseInt(dayNumber));

                    return (
                      <AccordionItem value={dayNumber} key={dayNumber} className="border rounded-md">
                        <AccordionTrigger className="px-4">
                          <div className="flex items-center">
                            <span className="font-medium">{dayName}</span>
                            <div className="flex space-x-2 ml-4">
                              {dayData.added.length > 0 && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <Plus className="h-3 w-3 mr-1" /> {dayData.added.length}
                                </Badge>
                              )}
                              {dayData.removed.length > 0 && (
                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                  <Minus className="h-3 w-3 mr-1" /> {dayData.removed.length}
                                </Badge>
                              )}
                              {dayData.modified.length > 0 && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                  <Pencil className="h-3 w-3 mr-1" /> {dayData.modified.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2">
                          {/* Aulas Adicionadas */}
                          {dayData.added.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-green-700 mb-2">Aulas Adicionadas</h4>
                              <div className="space-y-2">
                                {dayData.added.map((aula: any, idx: number) => (
                                  <Card key={idx} className="border-l-4 border-l-green-500">
                                    <CardContent className="p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{aula.nome}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {aula.horaInicio} • {aula.duracao} min • {aula.sala}
                                          </p>
                                          <p className="text-sm">Professor: {aula.professor}</p>
                                        </div>
                                        <Badge className={getCategoryColor(aula.categoria)}>{aula.categoria}</Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Aulas Removidas */}
                          {dayData.removed.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-red-700 mb-2">Aulas Removidas</h4>
                              <div className="space-y-2">
                                {dayData.removed.map((aula: any, idx: number) => (
                                  <Card key={idx} className="border-l-4 border-l-red-500">
                                    <CardContent className="p-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{aula.nome}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {aula.horaInicio} • {aula.duracao} min • {aula.sala}
                                          </p>
                                          <p className="text-sm">Professor: {aula.professor}</p>
                                        </div>
                                        <Badge className={getCategoryColor(aula.categoria)}>{aula.categoria}</Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Aulas Modificadas */}
                          {dayData.modified.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-amber-700 mb-2">Aulas Modificadas</h4>
                              <div className="space-y-2">
                                {dayData.modified.map((change: any, idx: number) => {
                                  const newAula = change.new;
                                  const oldAula = change.old;
                                  const changes = [];

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
                                              {newAula.horaInicio} • {newAula.duracao} min • {newAula.sala}
                                            </p>
                                            <div className="mt-2 space-y-1">
                                              {changes.map((change, i) => (
                                                <p key={i} className="text-xs text-amber-700">
                                                  • {change}
                                                </p>
                                              ))}
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
                  })}
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
              {changesData?.totalChanges === 0 ? (
                <p className="text-amber-600 text-sm">
                  Não é possível enviar notificações pois os horários são idênticos. Faça alterações no horário
                  primeiro.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {changesData?.prevSchedule ? (
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
              {changesData && (
                <p className="text-sm mt-1">
                  {changesData?.prevSchedule ? (
                    <>
                      <span className="font-medium">{changesData?.totalChanges || 0}</span> alterações serão incluídas
                      no email.
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{changesData?.totalChanges || 0}</span> aulas serão incluídas no
                      email.
                    </>
                  )}
                </p>
              )}
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
              disabled={isSending || (changesData && changesData.totalChanges === 0)}
              title={changesData && changesData.totalChanges === 0 ? "Não há alterações para enviar" : ""}
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
