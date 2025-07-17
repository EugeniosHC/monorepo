"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Label } from "@eugenios/ui/components/label";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClassDetails, CLASS_CONSTANTS } from "@/hooks/useCreateClasses";
import { useCreateSchedule } from "@/hooks/useScheduleOperations";
import { ClassMap } from "@/components/schedule/ClassMap";
import { ClassDialog } from "@/components/schedule/ClassDialog";

export default function CreateClassesPage() {
  const router = useRouter();
  const createScheduleMutation = useCreateSchedule();

  // Estado para a criação do horário
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [classesList, setClassesList] = useState<ClassDetails[]>([]);
  const [orcamentoTotal, setOrcamentoTotal] = useState(0);

  // Cores para cada categoria de aula - usando as cores definidas nas constantes
  const categoryColors = CLASS_CONSTANTS.CORES_CATEGORIA;

  // Estado para o diálogo de edição/criação de aula
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassDetails | null>(null);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");

  // Estado para controle de UI
  const [saving, setSaving] = useState(false);

  // Estado para calcular o orçamento total com base nas aulas adicionadas
  const calcularOrcamentoTotal = (classes: ClassDetails[]) => {
    return classes.reduce((total, aula) => total + (aula.custo || 0), 0);
  };

  const handleOpenCreateDialog = (dia: number) => {
    setCurrentClass({
      nome: "",
      categoria: "",
      diaSemana: dia,
      horaInicio: "",
      duracao: 30, // Duração padrão de 30 minutos
      custo: 0, // Custo inicial zero
    });
    setEditMode("create");
    setIsDialogOpen(true);
  };

  // Função para abrir o diálogo de edição de aula
  const handleOpenEditDialog = (aula: ClassDetails) => {
    // Garantir que a duração esteja correta para aulas Express
    const aulaAjustada = { ...aula };
    if (aula.categoria === "Express" && aula.duracao !== CLASS_CONSTANTS.DURACAO_EXPRESS) {
      aulaAjustada.duracao = CLASS_CONSTANTS.DURACAO_EXPRESS;
    }

    setCurrentClass(aulaAjustada);
    setEditMode("edit");
    setIsDialogOpen(true);
  };

  // Função para salvar a aula atual
  const handleSaveClass = (updatedClass: ClassDetails) => {
    if (editMode === "edit") {
      // Atualizar aula existente
      const updatedList = classesList.map((cls) => (cls.id === updatedClass.id ? updatedClass : cls));
      setClassesList(updatedList);
      // Recalcular orçamento
      setOrcamentoTotal(calcularOrcamentoTotal(updatedList));
    } else {
      // Adicionar nova aula com ID único
      const newClass = {
        ...updatedClass,
        id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updatedList = [...classesList, newClass];
      setClassesList(updatedList);
      // Recalcular orçamento
      setOrcamentoTotal(calcularOrcamentoTotal(updatedList));
    }

    setIsDialogOpen(false);
    setCurrentClass(null);
  };

  // Função para excluir uma aula
  const handleDeleteClass = (id: string) => {
    const updatedList = classesList.filter((cls) => cls.id !== id);
    setClassesList(updatedList);
    // Recalcular orçamento
    setOrcamentoTotal(calcularOrcamentoTotal(updatedList));
    setIsDialogOpen(false);
    setCurrentClass(null);
  };

  // Função para salvar a programação completa
  const handleSaveSchedule = async () => {
    if (!scheduleTitle.trim()) {
      toast.error("Por favor, insira um título para o horário");
      return;
    }

    if (classesList.length === 0) {
      toast.error("Adicione pelo menos uma aula ao horário");
      return;
    }

    setSaving(true);
    try {
      // Recalcular o orçamento total para garantir que esteja atualizado
      const totalOrcamento = calcularOrcamentoTotal(classesList);

      const scheduleData = {
        titulo: scheduleTitle,
        descricao: scheduleDescription,
        orcamento: totalOrcamento,
        aulas: classesList.map((aula) => ({
          id: aula.id?.startsWith("class-") ? undefined : aula.id, // Remover IDs temporários
          nome: aula.nome,
          categoria: aula.categoria.toUpperCase(), // Convertendo para maiúsculo para corresponder ao enum ClassCategory
          diaSemana: aula.diaSemana,
          horaInicio: aula.horaInicio,
          duracao: aula.duracao,
          sala: aula.sala || (aula.categoria === "Express" ? "Estúdio X" : "Sala Principal"),
          professor: aula.professor || (aula.categoria === "Express" ? "Monitor de Sala" : "Professor"),
          intensidade: aula.intensidade || "Moderada",
          custo: aula.categoria === "Express" ? undefined : aula.custo,
        })),
      };

      await createScheduleMutation.mutateAsync(scheduleData);

      toast.success("Programação criada com sucesso!");
      router.push("/dashboard/classes");
    } catch (err) {
      console.error("Erro ao criar programação:", err);
      toast.error("Erro ao criar programação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Programação</h1>
            <p className="text-gray-600 mt-1">
              Crie uma nova programação de aulas • Adicione aulas para diferentes dias da semana
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSaveSchedule} disabled={saving || classesList.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Programação
          </Button>
        </div>
      </div>

      {/* Configuração do Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Programação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título da Programação</Label>
              <Input
                id="titulo"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="Ex: Horário de Verão 2025, Mapa Semana Especial, etc."
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição (Opcional)</Label>
              <Textarea
                id="descricao"
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="Informações adicionais sobre esta programação de aulas..."
                rows={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Aulas adicionadas:</strong> {classesList.length}
              </p>

              {/* Distribuição de aulas por categoria */}
              {classesList.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Distribuição por categoria:</p>
                  <div className="flex gap-2 flex-wrap">
                    {CLASS_CONSTANTS.CATEGORIAS.map((categoria) => {
                      const count = classesList.filter((aula) => aula.categoria === categoria).length;
                      if (count === 0) return null;
                      return (
                        <div
                          key={categoria}
                          className="flex items-center px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `${categoryColors[categoria as keyof typeof categoryColors]}20`,
                            borderLeft: `2px solid ${categoryColors[categoria as keyof typeof categoryColors]}`,
                          }}
                        >
                          <span>
                            {categoria}: {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm">
              <p>
                <strong>Orçamento Total:</strong> <span className="text-blue-600 font-semibold">{orcamentoTotal}€</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Soma dos custos de todas as aulas (Express são gratuitas)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Horária Interativa */}
      <ClassMap
        aulas={classesList}
        mode="create"
        onAddClass={handleOpenCreateDialog}
        onClassClick={handleOpenEditDialog}
      />

      {/* Dialog para Editar/Criar Aula */}
      <ClassDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentClass={currentClass}
        mode={editMode}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
      />
    </div>
  );
}
