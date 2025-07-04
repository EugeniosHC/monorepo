"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Badge } from "@eugenios/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Label } from "@eugenios/ui/components/label";
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import {
  useExpressClassProposals,
  useCreateExpressSchedule,
  type ExpressClass,
  type CreateExpressScheduleDto,
} from "../../../../hooks/useExpressClasses";

interface Props {
  params: { id: string };
}

export default function ExpressScheduleEdit({ params }: Props) {
  const router = useRouter();
  const { data: proposals = [], isLoading } = useExpressClassProposals();
  const createScheduleMutation = useCreateExpressSchedule();

  const isNew = params.id === "new";
  const currentProposal = proposals.find((p) => p.id === params.id);

  const [scheduleTitle, setScheduleTitle] = useState(currentProposal?.titulo || "");
  const [scheduleClasses, setScheduleClasses] = useState<ExpressClass[]>(currentProposal?.aulasProposta || []);
  const [saving, setSaving] = useState(false);

  // Configurações
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const horariosDisponiveis = [
    "07:30",
    "08:30",
    "09:30",
    "10:30",
    "11:30",
    "12:30",
    "13:30",
    "14:30",
    "15:30",
    "16:30",
    "17:30",
    "18:30",
    "19:30",
    "20:30",
    "21:30",
  ];

  const EXPRESS_CONSTANTS = {
    professor: "Monitor de Sala",
    sala: "Estúdio X",
    duracao: 15,
  };

  const EXPRESS_CLASS_TYPES = ["ABS", "FUNCIONAL"];

  const handleAddClass = () => {
    const newClass: ExpressClass = {
      nome: EXPRESS_CLASS_TYPES[0] || "ABS",
      diaSemana: 1,
      horaInicio: "07:30",
      duracao: EXPRESS_CONSTANTS.duracao,
      sala: EXPRESS_CONSTANTS.sala,
      professor: EXPRESS_CONSTANTS.professor,
      intensidade: "Moderada",
    };
    setScheduleClasses([...scheduleClasses, newClass]);
  };

  const handleRemoveClass = (index: number) => {
    setScheduleClasses(scheduleClasses.filter((_, i) => i !== index));
  };

  const handleUpdateClass = (index: number, updatedClass: ExpressClass) => {
    setScheduleClasses(scheduleClasses.map((cls, i) => (i === index ? updatedClass : cls)));
  };

  const handleSave = async () => {
    if (!scheduleTitle.trim()) {
      alert("Por favor, insira um título para o horário");
      return;
    }

    if (scheduleClasses.length === 0) {
      alert("Adicione pelo menos uma aula ao horário");
      return;
    }

    setSaving(true);
    try {
      const scheduleData: CreateExpressScheduleDto = {
        titulo: scheduleTitle,
        classes: scheduleClasses.map((cls) => ({
          nome: cls.nome,
          diaSemana: cls.diaSemana,
          horaInicio: cls.horaInicio,
          intensidade: cls.intensidade,
        })),
      };

      await createScheduleMutation.mutateAsync(scheduleData);
      router.push("/dashboard/express-classes");
    } catch (err) {
      console.error("Erro ao guardar horário:", err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando proposta...</span>
        </div>
      </div>
    );
  }

  if (!isNew && !currentProposal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposta não encontrada</h2>
          <p className="text-gray-600 mb-4">A proposta solicitada não existe ou foi removida.</p>
          <Button onClick={() => router.push("/dashboard/express-classes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/express-classes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? "Nova Proposta de Horário" : "Editar Proposta"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isNew ? "Crie um novo mapa de aulas Express" : `Editando: ${currentProposal?.titulo}`}
            </p>
          </div>
        </div>

        {!isNew && (
          <Badge
            variant={
              currentProposal?.status === "PENDENTE"
                ? "secondary"
                : currentProposal?.status === "APROVADO"
                  ? "default"
                  : "destructive"
            }
          >
            {currentProposal?.status}
          </Badge>
        )}
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título da Proposta</Label>
            <Input
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="Ex: Horário de Verão 2024, Mapa Semana Especial, etc."
              disabled={currentProposal?.status === "APROVADO"}
            />
          </div>

          {/* Lista de Aulas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Aulas no Horário ({scheduleClasses.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddClass}
                disabled={currentProposal?.status === "APROVADO"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Aula
              </Button>
            </div>

            {scheduleClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>Nenhuma aula adicionada ainda.</p>
                <Button
                  variant="outline"
                  onClick={handleAddClass}
                  className="mt-2"
                  disabled={currentProposal?.status === "APROVADO"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Aula
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleClasses.map((aula, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={aula.nome}
                          onValueChange={(value) => handleUpdateClass(index, { ...aula, nome: value })}
                          disabled={currentProposal?.status === "APROVADO"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPRESS_CLASS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Dia</Label>
                        <Select
                          value={aula.diaSemana.toString()}
                          onValueChange={(value) => handleUpdateClass(index, { ...aula, diaSemana: parseInt(value) })}
                          disabled={currentProposal?.status === "APROVADO"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Segunda</SelectItem>
                            <SelectItem value="2">Terça</SelectItem>
                            <SelectItem value="3">Quarta</SelectItem>
                            <SelectItem value="4">Quinta</SelectItem>
                            <SelectItem value="5">Sexta</SelectItem>
                            <SelectItem value="6">Sábado</SelectItem>
                            <SelectItem value="0">Domingo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Horário</Label>
                        <Select
                          value={aula.horaInicio}
                          onValueChange={(value) => handleUpdateClass(index, { ...aula, horaInicio: value })}
                          disabled={currentProposal?.status === "APROVADO"}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {horariosDisponiveis.map((hora) => (
                              <SelectItem key={hora} value={hora}>
                                {hora}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Intensidade</Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={aula.intensidade}
                            onValueChange={(value) => handleUpdateClass(index, { ...aula, intensidade: value })}
                            disabled={currentProposal?.status === "APROVADO"}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>{" "}
                            <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Moderada">Moderada</SelectItem>
                              <SelectItem value="Moderada/Alta">Moderada/Alta</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveClass(index)}
                            disabled={currentProposal?.status === "APROVADO"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações fixas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-2">Configuração Express (Fixa)</div>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Duração:</span> {EXPRESS_CONSTANTS.duracao} min
              </div>
              <div>
                <span className="font-medium">Sala:</span> {EXPRESS_CONSTANTS.sala}
              </div>
              <div>
                <span className="font-medium">Professor:</span> {EXPRESS_CONSTANTS.professor}
              </div>
            </div>
          </div>

          {/* Botões */}
          {currentProposal?.status !== "APROVADO" && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? "Criar Proposta" : "Atualizar Proposta"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/express-classes")} disabled={saving}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
