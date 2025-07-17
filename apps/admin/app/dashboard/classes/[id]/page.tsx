"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@eugenios/ui/components/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { Input } from "@eugenios/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@eugenios/ui/components/radio-group";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Edit,
  Copy,
  Printer,
  CheckCircle,
  Clock,
  X,
  Map,
  Users,
  CalendarDays,
  DollarSign,
  Building,
  Trash2,
  Mail,
} from "lucide-react";
import {
  useScheduleById,
  useUpdateScheduleStatus,
  ScheduleStatus,
  useDeleteSchedule,
} from "@/hooks/useScheduleOperations";
import { useDuplicateSchedule } from "@/hooks/useSchedules";
import { toast } from "sonner";
import { SendNotificationDialog } from "@/components/schedule/SendNotificationDialog";

// Componente para badge de status
const StatusBadge = ({ status }: { status: ScheduleStatus }) => {
  switch (status) {
    case ScheduleStatus.ATIVO:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Ativo
        </Badge>
      );
    case ScheduleStatus.PENDENTE:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" />
          Pendente
        </Badge>
      );
    case ScheduleStatus.APROVADO:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Aprovado
        </Badge>
      );
    case ScheduleStatus.RASCUNHO:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <Edit className="mr-1 h-3 w-3" />
          Rascunho
        </Badge>
      );
    case ScheduleStatus.SUBSTITUIDO:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Map className="mr-1 h-3 w-3" />
          Substituído
        </Badge>
      );
    case ScheduleStatus.REJEITADO:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="mr-1 h-3 w-3" />
          Rejeitado
        </Badge>
      );
    default:
      return null;
  }
};

// Função auxiliar para obter a cor de fundo com base na categoria
const getCategoryBgColor = (category: string) => {
  switch (category.toUpperCase()) {
    case "TERRA":
      return "bg-terrestre-100 text-terrestre-400";
    case "AGUA":
      return "bg-aqua-100 text-aqua-400";
    case "EXPRESS":
      return "bg-xpress-100 text-xpress-400";
    default:
      return "bg-gray-100 text-gray-400";
  }
};

// Função para traduzir o status
const translateStatus = (status: ScheduleStatus) => {
  switch (status) {
    case ScheduleStatus.ATIVO:
      return "Ativo";
    case ScheduleStatus.PENDENTE:
      return "Pendente";
    case ScheduleStatus.APROVADO:
      return "Aprovado";
    case ScheduleStatus.RASCUNHO:
      return "Rascunho";
    case ScheduleStatus.SUBSTITUIDO:
      return "Substituído";
    case ScheduleStatus.REJEITADO:
      return "Rejeitado";
    default:
      return status;
  }
};

// Função para traduzir o dia da semana
const translateDayOfWeek = (dayOfWeek: number) => {
  const days: Record<number, string> = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };
  return days[dayOfWeek] || `Dia ${dayOfWeek}`;
};

// Função para formatar data
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "dd/MM/yyyy' às 'HH:mm", { locale: ptBR });
};

export default function ScheduleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params using React.use()
  const { data: schedule, isLoading, error } = useScheduleById(id);
  const [activeTab, setActiveTab] = useState("geral");

  // Mutations
  const updateStatusMutation = useUpdateScheduleStatus();
  const deleteMutation = useDeleteSchedule();
  const duplicateMutation = useDuplicateSchedule();

  // Estados para o diálogo de aprovação
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [activationType, setActivationType] = useState<"immediate" | "scheduled">("immediate");
  const [activationDate, setActivationDate] = useState<string>("");
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando detalhes da programação...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground">Não foi possível carregar os detalhes da programação.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/classes")}>
                Voltar para a lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Função para iniciar o processo de aprovação
  const handleInitiateApprove = () => {
    // Configura a data de ativação padrão para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    setActivationDate(tomorrowStr || "");
    setActivationType("immediate");
    setApprovalDialogOpen(true);
  };

  // Função para aprovar a programação
  const handleConfirmApprove = async () => {
    setActionInProgress(true);
    try {
      if (activationType === "immediate") {
        // Ativar imediatamente
        await updateStatusMutation.mutateAsync({
          id: schedule.id,
          status: ScheduleStatus.ATIVO,
        });
        toast.success("Programação aprovada e ativada com sucesso");
      } else {
        // Aprovar com data de ativação futura
        await updateStatusMutation.mutateAsync({
          id: schedule.id,
          status: ScheduleStatus.APROVADO,
          dataAtivacao: activationDate,
          nota: `Aprovado com ativação agendada para ${new Date(activationDate).toLocaleDateString()}`,
        });
        toast.success("Programação aprovada com sucesso");
      }
      router.push("/dashboard/classes");
    } catch (error) {
      toast.error("Erro ao aprovar programação");
      console.error("Erro ao aprovar programação:", error);
    } finally {
      setActionInProgress(false);
      setApprovalDialogOpen(false);
    }
  };

  // Função para rejeitar a programação
  const handleReject = async () => {
    if (!confirm("Tem certeza que deseja rejeitar esta programação?")) return;

    setActionInProgress(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: schedule.id,
        status: ScheduleStatus.REJEITADO,
        nota: "Programação rejeitada pelo administrador",
      });
      toast.success("Programação rejeitada com sucesso");
      router.push("/dashboard/classes");
    } catch (error) {
      toast.error("Erro ao rejeitar programação");
      console.error("Erro ao rejeitar programação:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Função para submeter um rascunho
  const handleSubmit = async () => {
    setActionInProgress(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: schedule.id,
        status: ScheduleStatus.PENDENTE,
      });
      toast.success("Programação submetida para aprovação");
      router.push("/dashboard/classes");
    } catch (error) {
      toast.error("Erro ao submeter programação");
      console.error("Erro ao submeter programação:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Função para ativar uma programação aprovada
  const handleActivateSchedule = async () => {
    setActionInProgress(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: schedule.id,
        status: ScheduleStatus.ATIVO,
      });
      toast.success("Programação ativada com sucesso");
      router.push("/dashboard/classes");
    } catch (error) {
      toast.error("Erro ao ativar programação");
      console.error("Erro ao ativar programação:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Função para duplicar uma programação
  const handleDuplicateSchedule = async () => {
    setActionInProgress(true);
    try {
      await duplicateMutation.mutateAsync({
        scheduleId: schedule.id,
        novoTitulo: `Cópia de ${schedule.titulo}`,
      });
      toast.success("Programação duplicada com sucesso");
      router.push("/dashboard/classes");
    } catch (error) {
      toast.error("Erro ao duplicar programação");
      console.error("Erro ao duplicar programação:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Função para excluir uma programação
  const handleDeleteSchedule = async () => {
    // Verificar se o schedule está em um estado que permite deleção
    if (schedule.status !== ScheduleStatus.RASCUNHO && schedule.status !== ScheduleStatus.REJEITADO) {
      toast.error("Apenas programações em rascunho ou rejeitadas podem ser excluídas");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta programação?")) return;

    setActionInProgress(true);
    try {
      await deleteMutation.mutateAsync(schedule.id);
      toast.success("Programação excluída com sucesso");
      router.push("/dashboard/classes");
    } catch (error: unknown) {
      let errorMessage = "Erro ao excluir programação";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
      toast.error(errorMessage);
      console.error("Erro ao excluir programação:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/classes")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold">{schedule.titulo}</h2>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={schedule.status as ScheduleStatus} />
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>
                Criado em {formatDate(schedule.createdAt)} por {schedule.criadoPor}
              </span>
              {schedule.updatedAt !== schedule.createdAt && (
                <span>
                  Atualizado em {formatDate(schedule.updatedAt)} - por {schedule.atualizadoPor}
                </span>
              )}
              {schedule.dataAprovacao && (
                <span>
                  Aprovado em {formatDate(schedule.dataAprovacao)} por {schedule.aprovadoPor}
                </span>
              )}
              {schedule.dataAtivacao && schedule.status === ScheduleStatus.APROVADO && (
                <span className="text-blue-600 font-medium">
                  Ativação agendada para: {new Date(schedule.dataAtivacao).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botões de ação com base no status */}
          {schedule.status === ScheduleStatus.PENDENTE && (
            <>
              <Button
                variant="default"
                onClick={handleInitiateApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  "Processando..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionInProgress}>
                {actionInProgress ? (
                  "Processando..."
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" /> Rejeitar
                  </>
                )}
              </Button>
            </>
          )}
          {schedule.status === ScheduleStatus.APROVADO && (
            <>
              <Button variant="default" onClick={handleActivateSchedule} disabled={actionInProgress}>
                {actionInProgress ? (
                  "Processando..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Ativar agora
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionInProgress}>
                {actionInProgress ? (
                  "Processando..."
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" /> Rejeitar
                  </>
                )}
              </Button>
            </>
          )}
          {schedule.status === ScheduleStatus.RASCUNHO && (
            <Button variant="default" onClick={handleSubmit} disabled={actionInProgress}>
              {actionInProgress ? (
                "Processando..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Submeter
                </>
              )}
            </Button>
          )}
          {schedule.status === ScheduleStatus.REJEITADO && (
            <Button variant="default" onClick={handleSubmit} disabled={actionInProgress}>
              {actionInProgress ? (
                "Processando..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Submeter novamente
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/classes/${schedule.id}/map`)}>
            <Map className="mr-2 h-4 w-4" /> Ver Mapa Visual
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/classes/${schedule.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          {schedule.substituidoId && (
            <SendNotificationDialog
              prevScheduleId={schedule.substituidoId}
              newScheduleId={schedule.id}
              prevScheduleTitle={schedule.substituido?.titulo || "Schedule Anterior"}
              newScheduleTitle={schedule.titulo}
            >
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Enviar Alterações
              </Button>
            </SendNotificationDialog>
          )}
          <Button variant="outline" onClick={handleDuplicateSchedule} disabled={actionInProgress}>
            {actionInProgress ? (
              "Processando..."
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Duplicar
              </>
            )}
          </Button>
          {(schedule.status === ScheduleStatus.RASCUNHO || schedule.status === ScheduleStatus.REJEITADO) && (
            <Button variant="destructive" onClick={handleDeleteSchedule} disabled={actionInProgress}>
              {actionInProgress ? (
                "Processando..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </>
              )}
            </Button>
          )}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
          <TabsTrigger value="aulas">Aulas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Programação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                  <p>{schedule.descricao || "Sem descrição fornecida."}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <h3 className="text-sm font-medium">Orçamento</h3>
                      <p>{schedule.orcamento?.toFixed(2) || "0.00"} €</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <h3 className="text-sm font-medium">Total de Aulas</h3>
                      <p>{schedule.aulas?.length || 0} aulas</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["TERRA", "AGUA", "EXPRESS"].map((categoria) => {
                  const aulasDaCategoria =
                    schedule.aulas?.filter((aula) => aula.categoria.toUpperCase() === categoria) || [];
                  const custoTotal = aulasDaCategoria.reduce((total, aula) => total + (aula.custo || 0), 0);

                  return (
                    <Card key={categoria} className={`border-0 ${getCategoryBgColor(categoria)} bg-opacity-20`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{categoria}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Aulas:</span>
                            <span className="font-medium">{aulasDaCategoria.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custo:</span>
                            <span className="font-medium">{custoTotal.toFixed(2)} €</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aulas" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {schedule.aulas && schedule.aulas.length > 0 ? (
              schedule.aulas.map((aula) => (
                <Card key={aula.id} className="overflow-hidden">
                  <div className={`h-2 ${getCategoryBgColor(aula.categoria)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{aula.nome}</CardTitle>
                      <Badge variant="outline" className={getCategoryBgColor(aula.categoria)}>
                        {aula.categoria}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{translateDayOfWeek(aula.diaSemana)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {aula.horaInicio} ({aula.duracao} min)
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{aula.sala}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{aula.professor}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">Intensidade:</span>
                          <span>{aula.intensidade}</span>
                        </div>{" "}
                        {aula.custo !== undefined && aula.custo !== null && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{aula.custo.toFixed(2)} €</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma aula encontrada nesta programação.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de alterações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-2 border-muted pl-4 space-y-4">
                <div className="relative pb-4">
                  <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Criação da programação</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(schedule.createdAt)} - {schedule.criadoPor}
                    </p>
                  </div>
                </div>

                {/* Histórico de mudanças de status */}
                {schedule.statusHistory && schedule.statusHistory.length > 0 && (
                  <>
                    {[...schedule.statusHistory].reverse().map((historyItem) => (
                      <div key={historyItem.id} className="relative pb-4">
                        <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">
                            Alteração de status: {translateStatus(historyItem.statusAntigo)} →{" "}
                            {translateStatus(historyItem.statusNovo)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(historyItem.createdAt)} - {historyItem.alteradoPor}
                          </p>
                          {historyItem.nota && (
                            <p className="text-sm italic text-muted-foreground mt-1">&quot;{historyItem.nota}&quot;</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Versões anteriores, se existirem */}
                {schedule.previousVersion && (
                  <div className="relative">
                    <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-muted"></div>
                    <div>
                      <p className="font-medium">Versão anterior</p>
                      <p className="text-sm text-muted-foreground">ID: {schedule.previousVersion}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-1 text-sm"
                        onClick={() => router.push(`/dashboard/classes/${schedule.previousVersion}`)}
                      >
                        Ver versão anterior
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de aprovação com opção de ativação futura */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Programação</DialogTitle>
            <DialogDescription>Escolha quando esta programação deve ser ativada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ativação</Label>
              <RadioGroup
                value={activationType}
                onValueChange={(value) => setActivationType(value as "immediate" | "scheduled")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate">Ativar imediatamente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled">Agendar ativação para uma data futura</Label>
                </div>
              </RadioGroup>
            </div>

            {activationType === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="activationDate">Data de ativação</Label>
                <Input
                  id="activationDate"
                  type="date"
                  value={activationDate}
                  onChange={(e) => setActivationDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={actionInProgress || (activationType === "scheduled" && !activationDate)}
            >
              {actionInProgress ? "Aprovando..." : "Aprovar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
