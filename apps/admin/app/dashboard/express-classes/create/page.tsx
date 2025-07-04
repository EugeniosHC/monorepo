"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Badge } from "@eugenios/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { Plus, Trash2, Save, ArrowLeft, Loader2, X } from "lucide-react";
import {
  useCreateExpressSchedule,
  type ExpressClass,
  type CreateExpressScheduleDto,
} from "../../../../hooks/useExpressClasses";

export default function CreateExpressSchedule() {
  const router = useRouter();
  const createScheduleMutation = useCreateExpressSchedule();

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleClasses, setScheduleClasses] = useState<ExpressClass[]>([]);
  const [editingClass, setEditingClass] = useState<ExpressClass | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: number; hora: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Funções auxiliares
  const getClassForSlot = (dia: number, hora: string): ExpressClass | undefined => {
    return scheduleClasses.find((cls) => cls.diaSemana === dia && cls.horaInicio === hora);
  };

  const isSlotOccupied = (dia: number, hora: string): boolean => {
    return !!getClassForSlot(dia, hora);
  };

  const getIntensityColorFromString = (intensity: string) => {
    const colors = {
      Baixa: "bg-emerald-500 text-white",
      Moderada: "bg-yellow-500 text-white",
      "Moderada/Alta": "bg-orange-500 text-white",
      Alta: "bg-red-500 text-white",
    };
    return colors[intensity as keyof typeof colors] || "bg-gray-500 text-white";
  };

  // Handlers
  const handleSlotClick = (dia: number, hora: string) => {
    const existingClass = getClassForSlot(dia, hora);
    if (existingClass) {
      setEditingClass(existingClass);
    } else {
      setEditingClass({
        nome: EXPRESS_CLASS_TYPES[0] || "ABS",
        diaSemana: dia,
        horaInicio: hora,
        duracao: EXPRESS_CONSTANTS.duracao,
        sala: EXPRESS_CONSTANTS.sala,
        professor: EXPRESS_CONSTANTS.professor,
        intensidade: "Moderada",
      });
      setSelectedSlot({ dia, hora });
    }
    setIsDialogOpen(true);
  };

  const handleSaveClass = () => {
    if (!editingClass) return;

    const existingIndex = scheduleClasses.findIndex(
      (cls) => cls.diaSemana === editingClass.diaSemana && cls.horaInicio === editingClass.horaInicio
    );

    if (existingIndex >= 0) {
      // Atualizar aula existente
      setScheduleClasses(scheduleClasses.map((cls, index) => (index === existingIndex ? editingClass : cls)));
    } else {
      // Adicionar nova aula
      setScheduleClasses([...scheduleClasses, editingClass]);
    }

    setIsDialogOpen(false);
    setEditingClass(null);
    setSelectedSlot(null);
  };

  const handleDeleteClass = () => {
    if (!editingClass) return;

    setScheduleClasses(
      scheduleClasses.filter(
        (cls) => !(cls.diaSemana === editingClass.diaSemana && cls.horaInicio === editingClass.horaInicio)
      )
    );

    setIsDialogOpen(false);
    setEditingClass(null);
    setSelectedSlot(null);
  };

  const handleSaveSchedule = async () => {
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

  // Drag and Drop handlers (implementação básica)
  const handleDragStart = (e: React.DragEvent, aula: ExpressClass) => {
    e.dataTransfer.setData("application/json", JSON.stringify(aula));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dia: number, hora: string) => {
    e.preventDefault();
    const aulaData = JSON.parse(e.dataTransfer.getData("application/json"));

    // Remove aula da posição original
    setScheduleClasses((prev) =>
      prev.filter((cls) => !(cls.diaSemana === aulaData.diaSemana && cls.horaInicio === aulaData.horaInicio))
    );

    // Adiciona na nova posição se slot estiver livre
    if (!isSlotOccupied(dia, hora)) {
      const updatedAula = { ...aulaData, diaSemana: dia, horaInicio: hora };
      setScheduleClasses((prev) => [...prev, updatedAula]);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Criar Novo Horário Express</h1>
            <p className="text-gray-600 mt-1">Clique nos slots para adicionar aulas ou arraste para mover</p>
          </div>
        </div>

        <Button onClick={handleSaveSchedule} disabled={saving || scheduleClasses.length === 0}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Criar Proposta
        </Button>
      </div>

      {/* Configuração do Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Proposta</Label>
            <Input
              id="titulo"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="Ex: Horário de Verão 2024, Mapa Semana Especial, etc."
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Aulas adicionadas:</strong> {scheduleClasses.length}
            </p>
            <p>
              <strong>Configuração:</strong> {EXPRESS_CONSTANTS.duracao} min • {EXPRESS_CONSTANTS.sala} •{" "}
              {EXPRESS_CONSTANTS.professor}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grade Horária Interativa */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Aulas Express</CardTitle>
          <p className="text-sm text-gray-600">
            Clique numa célula para adicionar/editar uma aula • Arraste aulas para mover entre horários
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-3 text-left font-medium text-sm w-24">Horário</th>
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia, index) => (
                    <th key={index} className="p-3 text-center font-medium text-sm">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosDisponiveis.map((hora, horaIndex) => (
                  <tr key={horaIndex} className="border-b border-gray-200">
                    <td className="p-3 font-medium text-gray-700 bg-gray-50">{hora}</td>
                    {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
                      const existingClass = getClassForSlot(dia, hora);
                      return (
                        <td
                          key={dia}
                          className="p-2 border-l border-gray-200 h-20 align-top cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleSlotClick(dia, hora)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dia, hora)}
                        >
                          {existingClass ? (
                            <div
                              className="p-2 rounded-lg border-l-4 border-l-gray-400 bg-gray-400 bg-opacity-10 hover:shadow-sm transition-shadow text-xs cursor-move"
                              draggable
                              onDragStart={(e) => handleDragStart(e, existingClass)}
                            >
                              <div className="font-medium text-gray-900 mb-1">{existingClass.nome}</div>
                              <div className="text-gray-600 mb-1 text-xs">{EXPRESS_CONSTANTS.sala}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-xs truncate">{EXPRESS_CONSTANTS.professor}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getIntensityColorFromString(existingClass.intensidade)}`}
                                >
                                  {existingClass.intensidade}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
                              <Plus className="h-4 w-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Editar/Criar Aula */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSlot ? "Nova Aula Express" : "Editar Aula Express"}</DialogTitle>
          </DialogHeader>

          {editingClass && (
            <div className="space-y-4">
              {/* Informações do slot */}
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p>
                  <strong>Slot:</strong> {diasSemana[editingClass.diaSemana]} às {editingClass.horaInicio}
                </p>
              </div>

              {/* Tipo de aula */}
              <div>
                <Label htmlFor="nome">Tipo de Aula Express</Label>
                <Select
                  value={editingClass.nome}
                  onValueChange={(value) => setEditingClass({ ...editingClass, nome: value })}
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

              {/* Intensidade */}
              <div>
                <Label htmlFor="intensidade">Intensidade da Aula</Label>
                <Select
                  value={editingClass.intensidade}
                  onValueChange={(value) => setEditingClass({ ...editingClass, intensidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Moderada">Moderada</SelectItem>
                    <SelectItem value="Moderada/Alta">Moderada/Alta</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informações fixas */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="font-medium text-gray-900 mb-1">Configuração Express (Fixa)</div>
                <div className="space-y-1 text-gray-600">
                  <div>Duração: {EXPRESS_CONSTANTS.duracao} min</div>
                  <div>Sala: {EXPRESS_CONSTANTS.sala}</div>
                  <div>Professor: {EXPRESS_CONSTANTS.professor}</div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveClass} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {selectedSlot ? "Adicionar" : "Atualizar"}
                </Button>
                {!selectedSlot && (
                  <Button variant="destructive" onClick={handleDeleteClass}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
