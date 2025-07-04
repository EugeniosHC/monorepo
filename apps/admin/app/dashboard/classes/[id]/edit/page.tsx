"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@eugenios/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { X, Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ClassDetails, CLASS_CONSTANTS } from "@/hooks/useCreateClasses";
import { useScheduleById, useUpdateSchedule } from "@/hooks/useScheduleOperations";

export default function EditClassesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params using React.use()
  const { data: schedule, isLoading, error } = useScheduleById(id);
  const updateScheduleMutation = useUpdateSchedule();

  // Estado para a edição do horário
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [classesList, setClassesList] = useState<ClassDetails[]>([]);
  const [orcamentoTotal, setOrcamentoTotal] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Cores para cada categoria de aula - usando as cores definidas nas constantes
  const categoryColors = CLASS_CONSTANTS.CORES_CATEGORIA;

  // Estado para o diálogo de edição/criação de aula
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Segunda-feira por padrão
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableClassNames, setAvailableClassNames] = useState<string[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassDetails | null>(null);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");

  // Estado para calcular o orçamento total com base nas aulas adicionadas
  const calcularOrcamentoTotal = (classes: ClassDetails[]) => {
    return classes.reduce((total, aula) => total + (aula.custo || 0), 0);
  };

  // Estado para controle de UI
  const [saving, setSaving] = useState(false);

  // Carregar os dados da programação quando o componente for montado
  useEffect(() => {
    if (schedule && !isDataLoaded) {
      setScheduleTitle(schedule.titulo);
      setScheduleDescription(schedule.descricao || "");

      // Converter aulas da API para o formato ClassDetails
      const classesFormatted = schedule.aulas.map((aula) => ({
        id: aula.id,
        nome: aula.nome,
        categoria: aula.categoria,
        diaSemana: aula.diaSemana,
        horaInicio: aula.horaInicio,
        duracao: aula.duracao,
        sala: aula.sala,
        professor: aula.professor,
        intensidade: aula.intensidade,
        custo: aula.custo,
      }));

      setClassesList(classesFormatted);
      setOrcamentoTotal(schedule.orcamento || 0);
      setIsDataLoaded(true);
    }
  }, [schedule, isDataLoaded]);

  const handleOpenCreateDialog = (dia: number) => {
    setSelectedDay(dia);
    setSelectedCategory("");
    setAvailableClassNames([]);
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
    setSelectedDay(aula.diaSemana);
    setSelectedCategory(aula.categoria);

    // Obter os nomes de aulas para a categoria selecionada
    const classNames =
      CLASS_CONSTANTS.AULAS_POR_CATEGORIA[aula.categoria as keyof typeof CLASS_CONSTANTS.AULAS_POR_CATEGORIA];
    // Converter o array readonly para um array mutável
    setAvailableClassNames(classNames ? Array.from(classNames) : []);

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
  const handleSaveClass = () => {
    if (!currentClass) return;

    if (!currentClass.nome.trim()) {
      toast.error("Por favor, informe o nome da aula");
      return;
    }

    if (!currentClass.categoria) {
      toast.error("Por favor, selecione a categoria da aula");
      return;
    }

    if (!currentClass.horaInicio) {
      toast.error("Por favor, informe o horário de início da aula");
      return;
    }

    // Validações específicas para Express
    if (currentClass.categoria === "Express") {
      // Verificar se o horário selecionado é válido para Express (deve ser uma meia hora)
      if (!CLASS_CONSTANTS.HORARIOS_EXPRESS.includes(currentClass.horaInicio as any)) {
        toast.error("Aulas Express só podem começar nas meias horas (XX:30)");
        return;
      }

      // Garantir que a duração seja 15 minutos
      currentClass.duracao = CLASS_CONSTANTS.DURACAO_EXPRESS;

      // Garantir que o custo seja zero
      currentClass.custo = 0;
    }

    if (editMode === "edit") {
      // Atualizar aula existente
      const updatedList = classesList.map((cls) => (cls.id === currentClass.id ? currentClass : cls));
      setClassesList(updatedList);
      // Recalcular orçamento
      setOrcamentoTotal(calcularOrcamentoTotal(updatedList));
    } else {
      // Adicionar nova aula com ID único
      const newClass = {
        ...currentClass,
        id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updatedList = [...classesList, newClass];
      setClassesList(updatedList);
      // Recalcular orçamento
      setOrcamentoTotal(calcularOrcamentoTotal(updatedList));
    }

    setIsDialogOpen(false);
    setCurrentClass(null);
    setSelectedCategory("");
    setAvailableClassNames([]);
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

  // Função para salvar as alterações na programação
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
          categoria: aula.categoria.toUpperCase(),
          diaSemana: aula.diaSemana,
          horaInicio: aula.horaInicio,
          duracao: aula.duracao,
          sala: aula.sala || (aula.categoria === "Express" ? "Estúdio X" : "Sala Principal"),
          professor: aula.professor || (aula.categoria === "Express" ? "Monitor de Sala" : "Professor"),
          intensidade: aula.intensidade || "Moderada",
          custo: aula.categoria === "Express" ? undefined : aula.custo,
        })),
      };

      await updateScheduleMutation.mutateAsync({
        id,
        scheduleData,
      });

      toast.success("Programação atualizada com sucesso!");
      router.push("/dashboard/classes");
    } catch (err) {
      console.error("Erro ao atualizar programação:", err);
      toast.error("Erro ao atualizar programação");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Carregando...</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Erro</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground">Não foi possível carregar a programação para edição.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/classes")}>
                Voltar para a lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Programação</h1>
            <p className="text-gray-600 mt-1">
              Edite as informações da programação • Adicione, remova ou modifique aulas
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
            Salvar Alterações
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
                <strong>Orçamento Total:</strong>{" "}
                <span className="text-blue-600 font-semibold">€ {orcamentoTotal.toFixed(2)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Soma dos custos de todas as aulas (Express são gratuitas)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Horária Interativa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mapa de Aulas</CardTitle>
            <p className="text-sm text-gray-600">Visualize e edite todas as aulas da programação</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 table-fixed">
              <thead>
                <tr className="bg-gray-900 text-white">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia, index) => (
                    <th key={index} className="p-3 text-center font-medium text-sm">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Uma célula para cada dia da semana, contendo as aulas daquele dia */}
                  {[1, 2, 3, 4, 5, 6, 0].map((dia) => (
                    <td key={dia} className="border p-0 align-top">
                      <div className="flex flex-col divide-y divide-gray-200">
                        {/* Classes para este dia, ordenadas por hora de início */}
                        {classesList
                          .filter((aula) => aula.diaSemana === dia)
                          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                          .map((aula) => {
                            // Obter a cor para a categoria atual
                            const bgColor = categoryColors[aula.categoria as keyof typeof categoryColors] || "#cccccc";

                            return (
                              <div
                                key={aula.id}
                                className="p-3 hover:bg-opacity-80 cursor-pointer rounded-md m-1"
                                style={{
                                  backgroundColor: `${bgColor}20`, // Cor com 20% de opacidade
                                  borderLeft: `3px solid ${bgColor}`, // Borda sólida à esquerda
                                }}
                                onClick={() => handleOpenEditDialog(aula)}
                              >
                                <div className="font-medium text-sm mb-1">{aula.nome}</div>
                                <div className="text-xs text-gray-700 flex flex-col">
                                  <span className="font-semibold" style={{ color: bgColor }}>
                                    {aula.categoria}
                                  </span>
                                  <span>
                                    {aula.horaInicio} ({aula.duracao} min)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        {/* Botão para adicionar nova aula neste dia */}
                        <div
                          className="p-3 text-center hover:bg-gray-100 cursor-pointer text-gray-500 hover:text-gray-700 m-1 rounded-md transition-colors"
                          onClick={() => handleOpenCreateDialog(dia)}
                        >
                          <Plus className="h-5 w-5 mx-auto" />
                          <span className="text-xs">Adicionar</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {classesList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center mt-4">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Plus className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma aula adicionada</h3>
              <p className="text-gray-500 max-w-md mb-6">
                Clique no botão "+" em qualquer dia para começar a adicionar aulas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Editar/Criar Aula */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode === "create" ? "Nova Aula" : "Editar Aula"}
              {currentClass?.categoria && (
                <div
                  className="inline-block w-3 h-3 rounded-full ml-2"
                  style={{
                    backgroundColor: categoryColors[currentClass.categoria as keyof typeof categoryColors] || "#cccccc",
                  }}
                ></div>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentClass && (
            <div className="space-y-4">
              {/* Informações do slot */}

              {/* Detalhes da aula */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="diaSemana">Dia da Semana</Label>
                  <Select
                    value={currentClass.diaSemana.toString()}
                    onValueChange={(value) => setCurrentClass({ ...currentClass, diaSemana: parseInt(value) })}
                  >
                    <SelectTrigger id="diaSemana">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "1", label: "Segunda" },
                        { value: "2", label: "Terça" },
                        { value: "3", label: "Quarta" },
                        { value: "4", label: "Quinta" },
                        { value: "5", label: "Sexta" },
                        { value: "6", label: "Sábado" },
                        { value: "0", label: "Domingo" },
                      ].map((dia) => (
                        <SelectItem key={dia.value} value={dia.value}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={currentClass.categoria}
                    onValueChange={(value) => {
                      setSelectedCategory(value);

                      // Se a categoria for Express, configurar a duração para 15 minutos
                      const duracaoAjustada =
                        value === "Express" ? CLASS_CONSTANTS.DURACAO_EXPRESS : currentClass.duracao || 30;

                      setCurrentClass({
                        ...currentClass,
                        categoria: value,
                        nome: "",
                        custo: value === "Express" ? 0 : currentClass.custo || 0,
                        duracao: duracaoAjustada,
                        // Resetar horaInicio ao mudar categoria
                        horaInicio: "",
                      });

                      // Obter os nomes de aulas para a categoria selecionada
                      const classNames =
                        CLASS_CONSTANTS.AULAS_POR_CATEGORIA[value as keyof typeof CLASS_CONSTANTS.AULAS_POR_CATEGORIA];
                      // Converter o array readonly para um array mutável
                      setAvailableClassNames(classNames ? Array.from(classNames) : []);
                    }}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_CONSTANTS.CATEGORIAS.map((categoria) => {
                        const color = categoryColors[categoria as keyof typeof categoryColors] || "#cccccc";
                        return (
                          <SelectItem key={categoria} value={categoria}>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                              {categoria}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horaInicio">Hora de Início</Label>
                  <Select
                    value={currentClass.horaInicio}
                    onValueChange={(value) => setCurrentClass({ ...currentClass, horaInicio: value })}
                    disabled={!currentClass.categoria} // Desabilitar até que a categoria seja selecionada
                  >
                    <SelectTrigger id="horaInicio">
                      <SelectValue placeholder="Selecione a categoria primeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentClass.categoria === "Express"
                        ? CLASS_CONSTANTS.HORARIOS_EXPRESS
                        : CLASS_CONSTANTS.HORARIOS_DISPONIVEIS
                      ).map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentClass.categoria === "Express" && (
                    <p className="text-xs text-amber-600 mt-1">Aulas Express só podem ser agendadas nas meias horas</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nome">Nome da Aula</Label>
                  {availableClassNames.length > 0 ? (
                    <Select
                      value={currentClass.nome}
                      onValueChange={(value) => setCurrentClass({ ...currentClass, nome: value })}
                    >
                      <SelectTrigger id="nome">
                        <SelectValue placeholder="Selecione o tipo de aula" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClassNames.map((nome) => (
                          <SelectItem key={nome} value={nome}>
                            {nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="nome"
                      value={currentClass.nome}
                      onChange={(e) => setCurrentClass({ ...currentClass, nome: e.target.value })}
                      placeholder="Selecione uma categoria primeiro"
                      disabled={!currentClass.categoria}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="duracao">Duração (minutos)</Label>
                  {currentClass.categoria === "Express" ? (
                    <Input id="duracao" value="15" disabled className="bg-gray-100" />
                  ) : (
                    <Select
                      value={currentClass.duracao.toString()}
                      onValueChange={(value) => setCurrentClass({ ...currentClass, duracao: parseInt(value) })}
                    >
                      <SelectTrigger id="duracao">
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {[30, 45, 60, 90, 120].map((duracao) => (
                          <SelectItem key={duracao} value={duracao.toString()}>
                            {duracao === 60
                              ? "1 hora"
                              : duracao === 90
                                ? "1h30"
                                : duracao === 120
                                  ? "2 horas"
                                  : `${duracao} min`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {currentClass.categoria === "Express" && (
                    <p className="text-xs text-amber-600 mt-1">Aulas Express têm duração fixa de 15 minutos</p>
                  )}
                </div>

                {currentClass.categoria !== "Express" && (
                  <div>
                    <Label htmlFor="custo">Custo da Aula (€)</Label>
                    <Input
                      id="custo"
                      type="number"
                      min="0"
                      step="5"
                      value={currentClass.custo?.toString() || "0"}
                      onChange={(e) =>
                        setCurrentClass({
                          ...currentClass,
                          custo: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Valor em reais"
                    />
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button onClick={handleSaveClass} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editMode === "create" ? "Criar Aula" : "Atualizar Aula"}
                </Button>

                {editMode === "edit" && (
                  <Button variant="destructive" onClick={() => handleDeleteClass(currentClass.id!)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}

                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
