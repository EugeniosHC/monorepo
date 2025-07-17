"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { X, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClassDetails, CLASS_CONSTANTS } from "@/hooks/useCreateClasses";
import { useScheduleById, useUpdateSchedule } from "@/hooks/useScheduleOperations";
import { ScheduleStatus } from "@/hooks/useSchedules";
import { ClassMap } from "@/components/schedule/ClassMap";
import { ClassDialog } from "@/components/schedule/ClassDialog";

interface EditSchedulePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditSchedulePage({ params }: EditSchedulePageProps) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params using React.use()
  const { data: schedule, isLoading: loadingSchedule } = useScheduleById(id);
  const updateScheduleMutation = useUpdateSchedule();

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [classesList, setClassesList] = useState<ClassDetails[]>([]);
  const [orcamentoTotal, setOrcamentoTotal] = useState(0);

  // Estado para o diálogo de edição/criação de aula
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassDetails | null>(null);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");

  // Cores para cada categoria de aula
  const categoryColors = CLASS_CONSTANTS.CORES_CATEGORIA;

  // Estado para controle de UI
  const [saving, setSaving] = useState(false);

  // Carregar dados do horário quando disponíveis
  useEffect(() => {
    if (schedule) {
      setScheduleTitle(schedule.titulo);
      setScheduleDescription(schedule.descricao || "");

      // Converter aulas para o formato ClassDetails
      const classes = schedule.aulas.map((aula) => ({
        id: aula.id,
        nome: aula.nome,
        categoria: aula.categoria,
        diaSemana: aula.diaSemana,
        horaInicio: aula.horaInicio,
        duracao: aula.duracao,
        sala: aula.sala,
        professor: aula.professor,
        intensidade: aula.intensidade,
        custo: aula.custo || 0,
      }));

      setClassesList(classes);
      setOrcamentoTotal(calcularOrcamentoTotal(classes));
    }
  }, [schedule]);

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
    // Log para debug do objeto recebido

    // Garantir que a categoria esteja definida e normalizada para o formato usado no frontend
    if (!aula.categoria) {
      console.warn("Aula sem categoria definida!", aula);
      // Se não tiver categoria, tentar inferir dos outros dados
      let categoria = "";
      if (aula.nome?.toLowerCase().includes("terra") || aula.nome?.toLowerCase().includes("pilates")) {
        categoria = "Terra";
      } else if (aula.nome?.toLowerCase().includes("agua") || aula.nome?.toLowerCase().includes("natação")) {
        categoria = "Agua";
      } else if (aula.duracao === 15) {
        categoria = "Express";
      } else {
        // Default para Terra se não conseguir inferir
        categoria = "Terra";
      }
      aula.categoria = categoria;
    } else {
      // Normalizar a categoria (primeira letra maiúscula, resto minúsculo)
      const normalizedCategory = aula.categoria.charAt(0).toUpperCase() + aula.categoria.slice(1).toLowerCase();
      if (aula.categoria !== normalizedCategory) {
        aula.categoria = normalizedCategory;
      }
    }

    // Corrigir durações, especialmente para Express
    if (aula.categoria === "Express" && (!aula.duracao || aula.duracao !== CLASS_CONSTANTS.DURACAO_EXPRESS)) {
      aula.duracao = CLASS_CONSTANTS.DURACAO_EXPRESS;
    } else if (!aula.duracao) {
      aula.duracao = 30; // Duração padrão
    }

    // Garantir que todos os campos obrigatórios estejam presentes
    const aulaAjustada: ClassDetails = {
      ...aula,
      id: aula.id || `temp-${Date.now()}`,
      categoria: aula.categoria || "Terra",
      nome: aula.nome || "",
      diaSemana: typeof aula.diaSemana === "number" ? aula.diaSemana : 1,
      horaInicio: aula.horaInicio || "08:00",
      duracao: aula.duracao || 30,
      sala: aula.sala || (aula.categoria === "Express" ? "Estúdio X" : "Sala Principal"),
      professor: aula.professor || (aula.categoria === "Express" ? "Monitor de Sala" : "Professor"),
      intensidade: aula.intensidade || "Moderada",
      custo: aula.categoria === "Express" ? 0 : (aula.custo ?? 0),
    };

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

  // Função para salvar a programação editada
  const handleSaveSchedule = async () => {
    if (!scheduleTitle.trim()) {
      toast.error("Por favor, insira um título para o horário");
      return;
    }

    if (classesList.length === 0) {
      toast.error("Adicione pelo menos uma aula ao horário");
      return;
    }

    if (!schedule) {
      toast.error("Dados do horário não encontrados");
      return;
    }

    setSaving(true);
    try {
      // Recalcular o orçamento total para garantir que esteja atualizado
      const totalOrcamento = calcularOrcamentoTotal(classesList);

      const scheduleData = {
        id: schedule.id,
        titulo: scheduleTitle,
        descricao: scheduleDescription,
        orcamento: totalOrcamento,
        status: schedule.status, // Manter o status atual
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

      await updateScheduleMutation.mutateAsync(scheduleData);

      toast.success("Programação atualizada com sucesso!");
      router.push("/dashboard/classes");
    } catch (err) {
      console.error("Erro ao atualizar programação:", err);
      toast.error("Erro ao atualizar programação");
    } finally {
      setSaving(false);
    }
  };

  // Exibir mensagem de carregamento enquanto os dados estão sendo buscados
  if (loadingSchedule) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Carregando dados da programação...</p>
        </div>
      </div>
    );
  }

  // Exibir mensagem se o horário não for encontrado
  if (!schedule) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-gray-600 text-lg mb-4">Programação não encontrada</p>
            <Button onClick={() => router.push("/dashboard/classes")}>Voltar para a lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se o horário está ativo ou substituído
  const isScheduleEditable = schedule.status !== ScheduleStatus.ATIVO && schedule.status !== ScheduleStatus.SUBSTITUIDO;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Programação</h1>
            <p className="text-gray-600 mt-1">
              {isScheduleEditable
                ? "Edite a programação de aulas e adicione ou remova aulas conforme necessário"
                : "Esta programação está ativa ou substituída e não pode ser editada"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSaveSchedule} disabled={saving || classesList.length === 0 || !isScheduleEditable}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Aviso de horário não editável */}
      {!isScheduleEditable && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Programação não editável</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Esta programação está {schedule.status === ScheduleStatus.ATIVO ? "ativa" : "substituída"} e não pode
                  ser editada. Para editar, altere o status da programação para Rascunho nas configurações.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuração do Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Programação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título da Programação
              </label>
              <Input
                id="titulo"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="Ex: Horário de Verão 2025, Mapa Semana Especial, etc."
                disabled={!isScheduleEditable}
              />
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (Opcional)
              </label>
              <Textarea
                id="descricao"
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="Informações adicionais sobre esta programação de aulas..."
                rows={1}
                disabled={!isScheduleEditable}
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
        mode={isScheduleEditable ? "edit" : "view"}
        onAddClass={isScheduleEditable ? handleOpenCreateDialog : undefined}
        onClassClick={isScheduleEditable ? handleOpenEditDialog : undefined}
      />

      {/* Dialog para Editar/Criar Aula */}
      {isScheduleEditable && (
        <ClassDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          currentClass={currentClass}
          mode={editMode}
          onSave={handleSaveClass}
          onDelete={handleDeleteClass}
        />
      )}
    </div>
  );
}
