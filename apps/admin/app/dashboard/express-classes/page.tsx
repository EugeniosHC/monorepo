"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Badge } from "@eugenios/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Plus, Edit, Check, X, Loader2, Eye } from "lucide-react";
import {
  useExpressClassStats,
  useExpressClassProposals,
  useUpdateProposalStatus,
  type ExpressClassScheduleProposal,
} from "../../../hooks/useExpressClasses";
import ExpressClassesNavigation from "../../../components/navigation/ExpressClassesNav";

export default function ExpressClassesHub() {
  const router = useRouter();
  const stats = useExpressClassStats();
  const { data: proposals = [], isLoading } = useExpressClassProposals();
  const updateStatusMutation = useUpdateProposalStatus();

  const [selectedProposal, setSelectedProposal] = useState<ExpressClassScheduleProposal | null>(null);
  const [actionType, setActionType] = useState<"APROVADO" | "REJEITADO" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Configurações
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const handleCreateNew = () => {
    router.push("/dashboard/express-classes/create");
  };

  const handleEdit = (proposal: ExpressClassScheduleProposal) => {
    router.push(`/dashboard/express-classes/${proposal.id}`);
  };

  const handleView = (proposal: ExpressClassScheduleProposal) => {
    router.push(`/dashboard/express-classes/${proposal.id}`);
  };

  const handleApprove = (proposal: ExpressClassScheduleProposal) => {
    setSelectedProposal(proposal);
    setActionType("APROVADO");
    setMotivo("");
    setIsActionDialogOpen(true);
  };

  const handleReject = (proposal: ExpressClassScheduleProposal) => {
    setSelectedProposal(proposal);
    setActionType("REJEITADO");
    setMotivo("");
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedProposal || !actionType) return;

    if (actionType === "REJEITADO" && !motivo.trim()) {
      alert("Por favor, indique o motivo da rejeição");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedProposal.id,
        status: actionType,
        motivo: actionType === "REJEITADO" ? motivo : undefined,
      });

      setIsActionDialogOpen(false);
      setSelectedProposal(null);
      setActionType(null);
      setMotivo("");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "secondary";
      case "APROVADO":
        return "default";
      case "REJEITADO":
        return "destructive";
      case "IMPLEMENTADO":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "border-yellow-200 bg-yellow-50";
      case "APROVADO":
        return "border-green-200 bg-green-50";
      case "REJEITADO":
        return "border-red-200 bg-red-50";
      case "IMPLEMENTADO":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hub de Aulas Express</h1>
            <p className="text-gray-600 mt-1">Gerencie propostas de horários Express</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.totalActive}</div>
              <div className="text-sm text-gray-600">Aulas Ativas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingProposals}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.approvedProposals}</div>
              <div className="text-sm text-gray-600">Aprovadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.totalProposals}</div>
              <div className="text-sm text-gray-600">Total Propostas</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Propostas */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas de Horários</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando propostas...
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma proposta de horário criada ainda.</p>
                <Button onClick={handleCreateNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Proposta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className={`border rounded-lg p-4 transition-all ${getStatusColor(proposal.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{proposal.titulo}</h3>
                          <Badge variant={getStatusVariant(proposal.status)}>{proposal.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            Criado por: <span className="font-medium">{proposal.criadoPor}</span>
                          </p>
                          <p>Data: {new Date(proposal.createdAt).toLocaleDateString("pt-PT")}</p>
                          <p>
                            Aulas: <span className="font-medium">{proposal.aulasProposta.length}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(proposal)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        {proposal.status === "PENDENTE" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(proposal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(proposal)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(proposal)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {proposal.aulasProposta.map((aula, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-400 bg-opacity-10 border border-gray-400 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {aula.nome} - {diasSemana[aula.diaSemana]} {aula.horaInicio}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Ação */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "APROVADO" ? "Aprovar Proposta" : "Rejeitar Proposta"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Proposta: <span className="font-medium">{selectedProposal?.titulo}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {actionType === "APROVADO"
                    ? "Tem certeza de que deseja aprovar esta proposta?"
                    : "Tem certeza de que deseja rejeitar esta proposta?"}
                </p>
              </div>

              {actionType === "REJEITADO" && (
                <div>
                  <Label htmlFor="motivo">Motivo da Rejeição</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Indique o motivo da rejeição..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleConfirmAction}
                  className="flex-1"
                  variant={actionType === "APROVADO" ? "default" : "destructive"}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : actionType === "APROVADO" ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {actionType === "APROVADO" ? "Aprovar" : "Rejeitar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsActionDialogOpen(false)}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
