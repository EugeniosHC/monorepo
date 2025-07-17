"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { Trash2, Plus, X } from "lucide-react";
import { CheckCircle, Edit, Copy } from "lucide-react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
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

  // Estados para o diálogo de aprovação
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [scheduleToApprove, setScheduleToApprove] = useState<string | null>(null);
  const [activationType, setActivationType] = useState<"now" | "later">("now");
  const [activationDate, setActivationDate] = useState<string>("");

  // Extrair dados dos resultados da query
  const activeSchedule = activeScheduleData as import("@/hooks/useSchedules").Schedule | undefined;
  const pendingSchedules =
    (pendingSchedulesData as { schedules?: import("@/hooks/useSchedules").Schedule[] })?.schedules || [];
  const approvedSchedules =
    (approvedSchedulesData as { schedules?: import("@/hooks/useSchedules").Schedule[] })?.schedules || [];
  const rascunhos = (rascunhosData as { schedules?: import("@/hooks/useSchedules").Schedule[] })?.schedules || [];
  const substituidos = (substituidosData as { schedules?: import("@/hooks/useSchedules").Schedule[] })?.schedules || [];
  const rejeitados = (rejeitadosData as { schedules?: import("@/hooks/useSchedules").Schedule[] })?.schedules || [];

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
    return format(new Date(dateString), "dd/MM/yyyy' às 'HH:mm", { locale: ptBR });
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
  };

  // Função para aprovar uma programação pendente
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
      ...(activeSchedule ? [activeSchedule] : []),
    ].find((s) => (s as import("@/hooks/useSchedules").Schedule)?.id === scheduleId) as
      | import("@/hooks/useSchedules").Schedule
      | undefined;

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
    } catch (error: unknown) {
      // Exibir a mensagem de erro específica que vem do backend
      let errorMessage = "Erro ao excluir programação";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
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

        {/* Programação ativa */}
        {activeSchedule && (
          <ScheduleCard
            title="Programação ativa"
            schedules={activeSchedule ? [activeSchedule] : []}
            status={ScheduleStatus.ATIVO}
            emptyMessage="Nenhuma programação ativa."
            actions={[
              {
                label: "Editar",
                icon: <Edit className="mr-2 h-4 w-4" />,
                onClick: (id: string) => handleEditSchedule(id),
              },
              {
                label: "Duplicar",
                icon: <Copy className="mr-2 h-4 w-4" />,
                onClick: (id: string, title?: string) => handleDuplicateSchedule(id, title || ""),
                disabled: true,
              },
            ]}
            isProcessing={actionInProgress}
            showCreateButton={!activeSchedule}
            onCreateClick={() => router.push("/dashboard/classes/create")}
            formatDate={formatDate}
          />
        )}

        {!activeSchedule && (
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
              <div className="py-4 text-center text-muted-foreground">
                <p>Nenhuma programação ativa.</p>
                <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard/classes/create")}>
                  Criar uma programação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Programações aprovadas */}
        <ScheduleCard
          title="Programações aprovadas"
          schedules={approvedSchedules}
          status={ScheduleStatus.APROVADO}
          emptyMessage="Nenhuma programação aprovada aguardando ativação."
          actions={[
            {
              label: "Ativar agora",
              icon: <CheckCircle className="mr-2 h-4 w-4" />,
              onClick: (id) => handleActivateSchedule(id),
              disabled: true,
              adminOnly: true,
            },
            {
              label: "Rejeitar",
              icon: <X className="mr-2 h-4 w-4" />,
              onClick: (id) => handleRejectSchedule(id),
              disabled: true,
              adminOnly: true,
            },
            {
              label: "Editar",
              icon: <Edit className="mr-2 h-4 w-4" />,
              onClick: (id) => handleEditSchedule(id),
            },
            {
              label: "Excluir",
              icon: <Trash2 className="mr-2 h-4 w-4" />,
              onClick: (id) => handleDeleteSchedule(id),
              disabled: true,
              destructive: true,
            },
          ]}
          isProcessing={actionInProgress}
          formatDate={formatDate}
        />

        {/* Programações pendentes */}
        <ScheduleCard
          title="Programações pendentes"
          schedules={pendingSchedules}
          status={ScheduleStatus.PENDENTE}
          emptyMessage="Nenhuma programação pendente."
          actions={[
            {
              label: "Aprovar",
              icon: <CheckCircle className="mr-2 h-4 w-4" />,
              onClick: (id) => handleInitiateApprove(id),
              disabled: true,
              adminOnly: true,
            },
            {
              label: "Rejeitar",
              icon: <X className="mr-2 h-4 w-4" />,
              onClick: (id) => handleRejectSchedule(id),
              disabled: true,
              adminOnly: true,
            },
            {
              label: "Editar",
              icon: <Edit className="mr-2 h-4 w-4" />,
              onClick: (id) => handleEditSchedule(id),
            },
            {
              label: "Excluir",
              icon: <Trash2 className="mr-2 h-4 w-4" />,
              onClick: (id) => handleDeleteSchedule(id),
              disabled: true,
              destructive: true,
            },
          ]}
          isProcessing={actionInProgress}
          formatDate={formatDate}
        />

        {/* Rascunhos */}
        <ScheduleCard
          title="Rascunhos"
          schedules={rascunhos}
          status={ScheduleStatus.RASCUNHO}
          emptyMessage="Nenhum rascunho salvo."
          actions={[
            {
              label: "Editar",
              icon: <Edit className="mr-2 h-4 w-4" />,
              onClick: (id) => handleEditSchedule(id),
            },
            {
              label: "Submeter",
              icon: <CheckCircle className="mr-2 h-4 w-4" />,
              onClick: (id) => handleSubmitSchedule(id),
              disabled: true,
            },
            {
              label: "Excluir",
              icon: <Trash2 className="mr-2 h-4 w-4" />,
              onClick: (id) => handleDeleteSchedule(id),
              disabled: true,
              destructive: true,
            },
          ]}
          isProcessing={actionInProgress}
          formatDate={formatDate}
        />

        {/* Programações rejeitadas */}
        <ScheduleCard
          title="Programações rejeitadas"
          schedules={rejeitados}
          status={ScheduleStatus.REJEITADO}
          emptyMessage="Nenhuma programação rejeitada."
          actions={[
            {
              label: "Editar",
              icon: <Edit className="mr-2 h-4 w-4" />,
              onClick: (id) => handleEditSchedule(id),
            },
            {
              label: "Submeter novamente",
              icon: <CheckCircle className="mr-2 h-4 w-4" />,
              onClick: (id) => handleSubmitSchedule(id),
              disabled: true,
            },
            {
              label: "Excluir",
              icon: <Trash2 className="mr-2 h-4 w-4" />,
              onClick: (id) => handleDeleteSchedule(id),
              disabled: true,
              destructive: true,
            },
          ]}
          isProcessing={actionInProgress}
          formatDate={formatDate}
        />

        {/* Substituídos */}
        <ScheduleCard
          title="Programações substituídas"
          schedules={substituidos}
          status={ScheduleStatus.SUBSTITUIDO}
          emptyMessage="Nenhuma programação substituída no histórico."
          actions={[
            {
              label: "Duplicar",
              icon: <Copy className="mr-2 h-4 w-4" />,
              onClick: (id, title) => handleDuplicateSchedule(id, title || ""),
              disabled: true,
            },
          ]}
          isProcessing={actionInProgress}
          formatDate={formatDate}
        />
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
