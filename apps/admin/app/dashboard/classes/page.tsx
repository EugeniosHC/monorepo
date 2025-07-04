"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@eugenios/ui/components/dropdown-menu";
import { Separator } from "@eugenios/ui/components/separator";
import { Badge } from "@eugenios/ui/components/badge";
import { Map, Calendar, Eye, Printer, MoreHorizontal, Trash2, Plus, X } from "lucide-react";
import { CheckCircle, Edit, Copy, Clock } from "lucide-react";
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
import {
  useActiveSchedule,
  useListSchedules,
  ScheduleStatus,
  useDuplicateSchedule,
  Schedule,
} from "@/hooks/useSchedules";
import { useUpdateScheduleStatus, useDeleteSchedule } from "@/hooks/useScheduleOperations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ClassesPage() {
  const router = useRouter();
  const { data: activeScheduleData, isLoading: isLoadingActive } = useActiveSchedule();
  const { data: pendingSchedulesData, isLoading: isLoadingPending } = useListSchedules(ScheduleStatus.PENDENTE);
  const { data: approvedSchedulesData, isLoading: isLoadingApproved } = useListSchedules(ScheduleStatus.APROVADO);
  const { data: rascunhosData, isLoading: isLoadingRascunhos } = useListSchedules(ScheduleStatus.RASCUNHO);
  const { data: substituidosData, isLoading: isLoadingSubstituidos } = useListSchedules(ScheduleStatus.SUBSTITUIDO);
  const { data: rejeitadosData, isLoading: isLoadingRejeitados } = useListSchedules(ScheduleStatus.REJEITADO);

  // Mutations
  const updateStatusMutation = useUpdateScheduleStatus();
  const deleteMutation = useDeleteSchedule();
  const duplicateMutation = useDuplicateSchedule();

  // Estado de loading para operações
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Estado para indicar que precisamos implementar o agendamento futuro
  const [needSchedulingImplementation, setNeedSchedulingImplementation] = useState<boolean>(false);

  // Estados para o diálogo de aprovação
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [scheduleToApprove, setScheduleToApprove] = useState<string | null>(null);
  const [activationType, setActivationType] = useState<"now" | "later">("now");
  const [activationDate, setActivationDate] = useState<string>("");

  // Extrair dados dos resultados da query
  const activeSchedule = activeScheduleData;
  const pendingSchedules = pendingSchedulesData?.schedules || [];
  const approvedSchedules = approvedSchedulesData?.schedules || [];
  const rascunhos = rascunhosData?.schedules || [];
  const substituidos = substituidosData?.schedules || [];
  const rejeitados = rejeitadosData?.schedules || [];

  const isLoading =
    isLoadingActive ||
    isLoadingPending ||
    isLoadingApproved ||
    isLoadingRascunhos ||
    isLoadingSubstituidos ||
    isLoadingRejeitados;

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy às HH:mm", { locale: ptBR });
  };

  // Função para submeter um rascunho (mudar para PENDENTE)
  const handleSubmitSchedule = async (scheduleId: string) => {
    setActionInProgress(scheduleId);
    try {
      await updateStatusMutation.mutateAsync({
        id: scheduleId,
        status: ScheduleStatus.PENDENTE,
      });
      toast.success("Programação submetida para aprovação");
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error) {
      toast.error("Erro ao submeter programação");
      console.error("Erro ao submeter programação:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para iniciar o processo de aprovação de uma programação
  const handleInitiateApprove = (scheduleId: string) => {
    // Verificar se já existe uma programação aprovada
    if (approvedSchedules.length > 0 && !approvedSchedules.some((s: Schedule) => s.id === scheduleId)) {
      const confirmReplace = confirm(
        "Já existe uma programação aprovada. Ao aprovar uma nova, a anterior será substituída. Deseja continuar?"
      );
      if (!confirmReplace) return;
    }

    // Configura a data de ativação padrão para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    setScheduleToApprove(scheduleId);
    setActivationDate(tomorrowStr || "");
    setActivationType("now");
    setApprovalDialogOpen(true);
  }; // Função para aprovar uma programação pendente
  const handleApproveSchedule = async () => {
    if (!scheduleToApprove) return;

    setActionInProgress(scheduleToApprove);
    try {
      if (activationType === "now") {
        // Ativar imediatamente
        await updateStatusMutation.mutateAsync({
          id: scheduleToApprove,
          status: ScheduleStatus.ATIVO,
        });
        toast.success("Programação aprovada e ativada com sucesso");
      } else {
        // Aprovar com data de ativação futura
        await updateStatusMutation.mutateAsync({
          id: scheduleToApprove,
          status: ScheduleStatus.APROVADO,
          dataAtivacao: activationDate, // Enviamos a data de ativação para o backend
          nota: `Aprovado com ativação agendada para ${new Date(activationDate).toLocaleDateString()}`,
        });
        toast.success("Programação aprovada com sucesso");

        // A partir de agora não precisamos mais mostrar a mensagem de implementação pendente
        setNeedSchedulingImplementation(false);

      }
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error) {
      toast.error("Erro ao aprovar programação");
      console.error("Erro ao aprovar programação:", error);
    } finally {
      setActionInProgress(null);
      setApprovalDialogOpen(false);
    }
  };

  // Função para rejeitar uma programação pendente
  const handleRejectSchedule = async (scheduleId: string) => {
    if (!confirm("Tem certeza que deseja rejeitar esta programação?")) return;

    setActionInProgress(scheduleId);
    try {
      await updateStatusMutation.mutateAsync({
        id: scheduleId,
        status: ScheduleStatus.REJEITADO,
        nota: "Programação rejeitada pelo administrador",
      });
      toast.success("Programação rejeitada com sucesso");
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error) {
      toast.error("Erro ao rejeitar programação");
      console.error("Erro ao rejeitar programação:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para excluir uma programação
  const handleDeleteSchedule = async (scheduleId: string) => {
    // Encontrar o schedule pelo ID
    const schedule = [
      ...(pendingSchedules || []),
      ...(rascunhos || []),
      ...(approvedSchedules || []),
      ...(substituidos || []),
      ...(rejeitados || []),
      activeSchedule ? [activeSchedule] : [],
    ].find((s) => s?.id === scheduleId);

    // Verificar se o schedule está em um estado que permite deleção
    if (schedule && schedule.status !== ScheduleStatus.RASCUNHO && schedule.status !== ScheduleStatus.REJEITADO) {
      toast.error("Apenas programações em rascunho ou rejeitadas podem ser excluídas");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta programação?")) return;

    setActionInProgress(scheduleId);
    try {
      await deleteMutation.mutateAsync(scheduleId);
      toast.success("Programação excluída com sucesso");
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error: any) {
      // Exibir a mensagem de erro específica que vem do backend
      const errorMessage = error?.message || "Erro ao excluir programação";
      toast.error(errorMessage);
      console.error("Erro ao excluir programação:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para duplicar uma programação
  const handleDuplicateSchedule = async (scheduleId: string, titulo: string) => {
    setActionInProgress(scheduleId);
    try {
      await duplicateMutation.mutateAsync({
        scheduleId,
        novoTitulo: `Cópia de ${titulo}`,
      });
      toast.success("Programação duplicada com sucesso");
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error) {
      toast.error("Erro ao duplicar programação");
      console.error("Erro ao duplicar programação:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para ativar uma programação aprovada
  const handleActivateSchedule = async (scheduleId: string) => {
    // Verificamos se já existe uma programação ativa
    if (activeSchedule) {
      const confirmReplace = confirm(
        "Já existe uma programação ativa. Ao ativar esta nova programação, a atual será substituída. Deseja continuar?"
      );
      if (!confirmReplace) return;
    }

    setActionInProgress(scheduleId);
    try {
      await updateStatusMutation.mutateAsync({
        id: scheduleId,
        status: ScheduleStatus.ATIVO,
      });
      toast.success("Programação ativada com sucesso");
      // Não precisa mais recarregar a página, o invalidateQueries cuida disso
    } catch (error) {
      toast.error("Erro ao ativar programação");
      console.error("Erro ao ativar programação:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para editar uma programação (redirecionar para a página de edição)
  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/dashboard/classes/${scheduleId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Mapa de aulas</h2>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Mapa de aulas</h2>
            <p className="text-muted-foreground">Gerencie as programações de aulas.</p>
          </div>
          <Button onClick={() => router.push("/dashboard/classes/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova programação
          </Button>
        </div>

        {/* Informações sobre o que pode ser excluído */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          <h3 className="font-semibold mb-1">Gerenciando programações</h3>
          <p className="text-sm">
            <strong>Nota:</strong> Apenas programações em estado de rascunho ou rejeitadas podem ser excluídas. Para
            excluir uma programação pendente ou aprovada, primeiro é necessário rejeitá-la usando a opção "Rejeitar" no
            menu.
          </p>
        </div>

        {/* Programação ativa */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Programação ativa</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeSchedule ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{activeSchedule.titulo}</h3>
                    <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Ativado em {formatDate(activeSchedule.dataAtivacao || activeSchedule.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Criado por:</span>
                        <span>
                          {activeSchedule.criadoPor} ({activeSchedule.emailCriador})
                        </span>
                      </div>
                      {activeSchedule.aprovadoPor && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Aprovado por:</span>
                          <span>
                            {activeSchedule.aprovadoPor} ({activeSchedule.emailAprovador})
                          </span>
                        </div>
                      )}
                      {activeSchedule.dataAprovacao && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Aprovado em:</span>
                          <span>{formatDate(activeSchedule.dataAprovacao)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/classes/${activeSchedule.id}`)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="mr-1 h-4 w-4" />
                      Imprimir
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSchedule(activeSchedule.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateSchedule(activeSchedule.id, activeSchedule.titulo)}
                          disabled={actionInProgress === activeSchedule.id}
                        >
                          {actionInProgress === activeSchedule.id ? (
                            <>Processando...</>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="text-sm">
                  <p>{activeSchedule.descricao || "Sem descrição"}</p>
                  <p className="mt-2">
                    <span className="font-medium">Orçamento:</span>
                    {activeSchedule.orcamento?.toFixed(2) || "0.00"} €
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação ativa.</p>
                <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard/classes/create")}>
                  Criar uma programação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programações pendentes */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Programações pendentes</CardTitle>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                <Clock className="mr-1 h-3 w-3" />
                Pendente
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingSchedules.length > 0 ? (
              <div className="space-y-4">
                {pendingSchedules.map((schedule: Schedule) => (
                  <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Criado em {formatDate(schedule.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Atualizado em:</span>
                            <span>{formatDate(schedule.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleInitiateApprove(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Aprovar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRejectSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Rejeitar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSchedule(schedule.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      <p>{schedule.descricao || "Sem descrição"}</p>
                      <p className="mt-2">
                        <span className="font-medium">Orçamento:</span>
                        {schedule.orcamento?.toFixed(2) || "0.00"} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação pendente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programações aprovadas */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Programações aprovadas</CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Aprovado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {needSchedulingImplementation && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                <p>
                  <strong>Nota:</strong> A funcionalidade de agendamento futuro está em desenvolvimento. Por enquanto,
                  você pode ativar a programação manualmente quando desejar usando o botão "Ativar agora".
                </p>
              </div>
            )}
            {approvedSchedules.length > 0 ? (
              <div className="space-y-4">
                {approvedSchedules.map((schedule: Schedule) => (
                  <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Aprovado em {formatDate(schedule.dataAprovacao)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Aprovado por:</span>
                            <span>
                              {schedule.aprovadoPor} ({schedule.emailAprovador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          {schedule.notaAprovacao && (
                            <div className="flex items-start">
                              <span className="font-medium mr-1">Nota:</span>
                              <span className="italic">{schedule.notaAprovacao}</span>
                            </div>
                          )}
                          {schedule.dataAtivacao && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                              Ativação agendada para: {new Date(schedule.dataAtivacao).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleActivateSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Ativar agora
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRejectSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Rejeitar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSchedule(schedule.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      <p>{schedule.descricao || "Sem descrição"}</p>
                      <p className="mt-2">
                        <span className="font-medium">Orçamento:</span>
                        {schedule.orcamento?.toFixed(2) || "0.00"} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação aprovada aguardando ativação.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rascunhos */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Rascunhos</CardTitle>
              <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                <Edit className="mr-1 h-3 w-3" />
                Rascunho
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {rascunhos.length > 0 ? (
              <div className="space-y-4">
                {rascunhos.map((schedule: Schedule) => (
                  <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Atualizado em {formatDate(schedule.updatedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado em:</span>
                            <span>{formatDate(schedule.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSchedule(schedule.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSubmitSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Submeter
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      <p>{schedule.descricao || "Sem descrição"}</p>
                      <p className="mt-2">
                        <span className="font-medium">Orçamento:</span>
                        {schedule.orcamento?.toFixed(2) || "0.00"} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhum rascunho salvo.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programações rejeitadas */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Programações rejeitadas</CardTitle>
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                <X className="mr-1 h-3 w-3" />
                Rejeitado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {rejeitados.length > 0 ? (
              <div className="space-y-4">
                {rejeitados.map((schedule: Schedule) => (
                  <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Rejeitado em {formatDate(schedule.updatedAt)}</span>
                          </div>
                          {schedule.aprovadoPor && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Rejeitado por:</span>
                              <span>
                                {schedule.aprovadoPor} ({schedule.emailAprovador})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado em:</span>
                            <span>{formatDate(schedule.createdAt)}</span>
                          </div>
                          {schedule.notaAprovacao && (
                            <div className="flex items-start">
                              <span className="font-medium mr-1">Motivo:</span>
                              <span className="italic text-red-600">{schedule.notaAprovacao}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSchedule(schedule.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSubmitSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Submeter novamente
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      <p>{schedule.descricao || "Sem descrição"}</p>
                      <p className="mt-2">
                        <span className="font-medium">Orçamento:</span>
                        {schedule.orcamento?.toFixed(2) || "0.00"} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação rejeitada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Substituídos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Programações substituídas</CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <Map className="mr-1 h-3 w-3" />
                Histórico
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {substituidos.length > 0 ? (
              <div className="space-y-4">
                {substituidos.map((schedule: Schedule) => (
                  <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Substituído em {formatDate(schedule.updatedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          {schedule.aprovadoPor && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado por:</span>
                              <span>
                                {schedule.aprovadoPor} ({schedule.emailAprovador})
                              </span>
                            </div>
                          )}
                          {schedule.dataAprovacao && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado em:</span>
                              <span>{formatDate(schedule.dataAprovacao)}</span>
                            </div>
                          )}
                          {schedule.dataAtivacao && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Foi ativo de:</span>
                              <span>
                                {formatDate(schedule.dataAtivacao)} até {formatDate(schedule.dataDesativacao)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDuplicateSchedule(schedule.id, schedule.titulo)}
                              disabled={actionInProgress === schedule.id}
                            >
                              {actionInProgress === schedule.id ? (
                                <>Processando...</>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      <p>{schedule.descricao || "Sem descrição"}</p>
                      <p className="mt-2">
                        <span className="font-medium">Orçamento:</span>
                        {schedule.orcamento?.toFixed(2) || "0.00"} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação substituída no histórico.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de aprovação */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aprovar programação</DialogTitle>
            <DialogDescription>
              Escolha quando esta programação deve ser ativada. Apenas uma programação pode estar ativa por vez.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={activationType}
              onValueChange={(value: string) => setActivationType(value as "now" | "later")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="activate-now" />
                <Label htmlFor="activate-now">Ativar imediatamente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="later" id="activate-later" />
                <Label htmlFor="activate-later">Agendar para data futura</Label>
              </div>
            </RadioGroup>

            {activationType === "later" && (
              <div className="grid gap-2">
                <Label htmlFor="activation-date">Data de ativação</Label>
                <Input
                  id="activation-date"
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
            <Button onClick={handleApproveSchedule} disabled={actionInProgress !== null}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
