import React, { useEffect, useState } from "react";
import { Button } from "@eugenios/ui/components/button";
import { Input } from "@eugenios/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import { Label } from "@eugenios/ui/components/label";
import { X, Plus, Trash2, Save } from "lucide-react";
import { ClassDetails, CLASS_CONSTANTS } from "@/hooks/useCreateClasses";

interface ClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentClass: ClassDetails | null;
  mode: "create" | "edit";
  onSave: (classData: ClassDetails) => void;
  onDelete?: (classId: string) => void;
}

export const ClassDialog: React.FC<ClassDialogProps> = ({
  isOpen,
  onOpenChange,
  currentClass,
  mode,
  onSave,
  onDelete,
}) => {
  // Estado local para edição - garantimos valores padrão para evitar erros
  const [classData, setClassData] = useState<ClassDetails | null>({
    id: currentClass?.id || `temp-${Date.now()}`,
    categoria: currentClass?.categoria || "",
    nome: currentClass?.nome || "",
    diaSemana: currentClass?.diaSemana || 1,
    horaInicio: currentClass?.horaInicio || "",
    duracao: currentClass?.duracao || 30,
    sala: currentClass?.sala || "",
    professor: currentClass?.professor || "",
    intensidade: currentClass?.intensidade || "",
    custo: currentClass?.custo || 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(currentClass?.categoria || "");
  const [availableClassNames, setAvailableClassNames] = useState<string[]>([]);

  // Cores para cada categoria de aula - usando as cores definidas nas constantes
  const categoryColors = CLASS_CONSTANTS.CORES_CATEGORIA;

  // Função para normalizar a categoria para o formato usado nas constantes
  const normalizeCategory = (categoria: string): string => {
    // Normaliza para o formato Pascal Case (primeira maiúscula, resto minúsculo)
    if (!categoria) return "";
    return categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
  };

  // Atualizar estado local quando currentClass mudar
  useEffect(() => {
    if (currentClass) {
      console.log("Current class recebida:", currentClass);

      // Garantir que a categoria esteja presente e não seja undefined/null
      const categoria = currentClass.categoria || "";

      // Normalizar a categoria para o formato correto
      const normalizedCategory = normalizeCategory(categoria);
      console.log(`Categoria normalizada: ${normalizedCategory}`);

      // Garantir que a duração esteja correta, especialmente para Express
      let duracao = currentClass.duracao;
      if (!duracao) {
        duracao = normalizedCategory === "Express" ? CLASS_CONSTANTS.DURACAO_EXPRESS : 30;
      } else if (normalizedCategory === "Express" && duracao !== CLASS_CONSTANTS.DURACAO_EXPRESS) {
        duracao = CLASS_CONSTANTS.DURACAO_EXPRESS;
      }

      // Garantir que temos todos os campos necessários, mesmo que sejam undefined no objeto original
      const completeClassData = {
        ...currentClass,
        categoria: normalizedCategory,
        duracao: duracao,
        sala: currentClass.sala || "",
        professor: currentClass.professor || "",
        intensidade: currentClass.intensidade || "",
        custo: normalizedCategory === "Express" ? 0 : currentClass.custo !== undefined ? currentClass.custo : 0,
      };

      console.log("Dados completos após processamento:", completeClassData);

      setClassData(completeClassData);
      setSelectedCategory(normalizedCategory);

      // Obter os nomes de aulas para a categoria normalizada
      if (normalizedCategory) {
        try {
          console.log(`Buscando nomes de aulas para categoria: ${normalizedCategory}`);

          const classNames =
            CLASS_CONSTANTS.AULAS_POR_CATEGORIA[normalizedCategory as keyof typeof CLASS_CONSTANTS.AULAS_POR_CATEGORIA];

          // Converter o array readonly para um array mutável
          setAvailableClassNames(classNames ? Array.from(classNames) : []);
          console.log(`Nomes de aulas disponíveis para categoria ${normalizedCategory}:`, classNames);
        } catch (error) {
          console.error(`Erro ao obter nomes para categoria ${normalizedCategory}:`, error);
          setAvailableClassNames([]);
        }
      }
    }
  }, [currentClass]);

  const handleSaveClass = () => {
    if (!classData) return;

    // Validações
    if (!classData.nome.trim()) {
      alert("Por favor, informe o nome da aula");
      return;
    }

    if (!classData.categoria) {
      alert("Por favor, selecione a categoria da aula");
      return;
    }

    if (!classData.horaInicio) {
      alert("Por favor, informe o horário de início da aula");
      return;
    }

    // Normalizar categoria antes de fazer validações
    const normalizedCategory = normalizeCategory(classData.categoria);

    // Validações específicas para Express
    if (normalizedCategory === "Express") {
      // Verificar se o horário selecionado é válido para Express (deve ser uma meia hora)
      if (!CLASS_CONSTANTS.HORARIOS_EXPRESS.includes(classData.horaInicio as any)) {
        alert("Aulas Express só podem começar nas meias horas (XX:30)");
        return;
      }

      // Garantir que a duração seja 15 minutos
      classData.duracao = CLASS_CONSTANTS.DURACAO_EXPRESS;

      // Garantir que o custo seja zero
      classData.custo = 0;
    }

    // Atualizar o objeto com a categoria normalizada
    const updatedClassData = {
      ...classData,
      categoria: normalizedCategory,
    };

    console.log("Salvando aula:", updatedClassData);

    // Chamar função de callback
    onSave(updatedClassData);
  };

  // Não renderizar se não houver dados de classe
  if (!classData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova Aula" : "Editar Aula"}
            {classData.categoria && (
              <div
                className="inline-block w-3 h-3 rounded-full ml-2"
                style={{
                  backgroundColor: categoryColors[classData.categoria as keyof typeof categoryColors] || "#cccccc",
                }}
              ></div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes da aula */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="diaSemana">Dia da Semana</Label>
              <Select
                value={classData.diaSemana.toString()}
                onValueChange={(value) => setClassData({ ...classData, diaSemana: parseInt(value) })}
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
                value={classData.categoria || ""}
                onValueChange={(value) => {
                  console.log(`Categoria selecionada: ${value}`);
                  const normalizedValue = normalizeCategory(value);
                  setSelectedCategory(normalizedValue);

                  // Se a categoria for Express, configurar a duração para 15 minutos
                  const duracaoAjustada =
                    normalizedValue === "Express" ? CLASS_CONSTANTS.DURACAO_EXPRESS : classData.duracao || 30;

                  console.log(`Nova duração: ${duracaoAjustada}`);

                  // Quando estamos em modo de edição, devemos manter o nome da aula
                  // mesmo quando a categoria muda, a menos que a classe atual não tenha um nome
                  const shouldKeepName = mode === "edit" && classData.nome;
                  const newName = shouldKeepName ? classData.nome : "";

                  setClassData({
                    ...classData,
                    categoria: normalizedValue, // Usar a categoria normalizada
                    nome: newName,
                    custo: normalizedValue === "Express" ? 0 : classData.custo || 0,
                    duracao: duracaoAjustada,
                    // Resetar horaInicio ao mudar categoria se estivermos criando uma nova aula
                    horaInicio: mode === "create" ? "" : classData.horaInicio,
                  });

                  // Obter os nomes de aulas para a categoria selecionada
                  try {
                    console.log(`Buscando nomes de aulas para categoria: ${normalizedValue}`);
                    const classNames =
                      CLASS_CONSTANTS.AULAS_POR_CATEGORIA[
                        normalizedValue as keyof typeof CLASS_CONSTANTS.AULAS_POR_CATEGORIA
                      ];
                    // Converter o array readonly para um array mutável
                    setAvailableClassNames(classNames ? Array.from(classNames) : []);
                    console.log(`Nomes de aulas disponíveis para categoria ${normalizedValue}:`, classNames);
                  } catch (error) {
                    console.error(`Erro ao obter nomes para categoria ${normalizedValue}:`, error);
                    setAvailableClassNames([]);
                  }
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
                value={classData.horaInicio || ""}
                onValueChange={(value) => {
                  console.log(`Hora selecionada: ${value}`);
                  setClassData({ ...classData, horaInicio: value });
                }}
                disabled={!classData.categoria} // Desabilitar até que a categoria seja selecionada
              >
                <SelectTrigger id="horaInicio">
                  <SelectValue placeholder="Selecione a categoria primeiro" />
                </SelectTrigger>
                <SelectContent>
                  {(normalizeCategory(classData.categoria || "") === "Express"
                    ? CLASS_CONSTANTS.HORARIOS_EXPRESS
                    : CLASS_CONSTANTS.HORARIOS_DISPONIVEIS
                  ).map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {normalizeCategory(classData.categoria || "") === "Express" && (
                <p className="text-xs text-amber-600 mt-1">Aulas Express só podem ser agendadas nas meias horas</p>
              )}
            </div>

            <div>
              <Label htmlFor="nome">Nome da Aula</Label>
              {availableClassNames.length > 0 ? (
                <Select
                  value={classData.nome || ""}
                  onValueChange={(value) => {
                    console.log(`Nome de aula selecionado: ${value}`);
                    setClassData({ ...classData, nome: value });
                  }}
                  defaultOpen={mode === "edit" && !classData.nome} // Abrir automaticamente se estivermos editando e não houver nome
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
                  value={classData.nome || ""}
                  onChange={(e) => {
                    console.log(`Nome digitado: ${e.target.value}`);
                    setClassData({ ...classData, nome: e.target.value });
                  }}
                  placeholder="Selecione uma categoria primeiro"
                  disabled={!classData.categoria}
                />
              )}
            </div>

            <div>
              <Label htmlFor="duracao">Duração (minutos)</Label>
              {normalizeCategory(classData.categoria || "") === "Express" ? (
                <Input
                  id="duracao"
                  value={CLASS_CONSTANTS.DURACAO_EXPRESS.toString()}
                  disabled
                  className="bg-gray-100"
                />
              ) : (
                <Select
                  value={(classData.duracao || 30).toString()}
                  onValueChange={(value) => {
                    console.log(`Duração selecionada: ${value}`);
                    setClassData({ ...classData, duracao: parseInt(value) });
                  }}
                >
                  <SelectTrigger id="duracao">
                    <SelectValue placeholder="Duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_CONSTANTS.DURACOES_PADRAO.map((duracao) => (
                      <SelectItem key={duracao} value={duracao.toString()}>
                        {duracao === 60 ? "1 hora" : `${duracao} min`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {normalizeCategory(classData.categoria || "") === "Express" && (
                <p className="text-xs text-amber-600 mt-1">Aulas Express têm duração fixa de 15 minutos</p>
              )}
            </div>

            {normalizeCategory(classData.categoria || "") !== "Express" && (
              <div>
                <Label htmlFor="custo">Custo da Aula (€)</Label>
                <Input
                  id="custo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={classData.custo?.toString() || "0"}
                  onChange={(e) =>
                    setClassData({
                      ...classData,
                      custo: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Valor em euros"
                />
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={handleSaveClass} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {mode === "create" ? "Criar Aula" : "Atualizar Aula"}
            </Button>

            {mode === "edit" && onDelete && classData.id && (
              <Button variant="destructive" onClick={() => onDelete(classData.id!)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}

            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
