import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { Button } from "@eugenios/ui/components/button";
import { Plus } from "lucide-react";
import { ScheduleClass } from "@/hooks/useScheduleOperations";
import { ClassDetails } from "@/hooks/useCreateClasses";

// Tipos para as props do componente
interface ClassMapProps {
  // Dados da programação
  aulas: ScheduleClass[] | ClassDetails[];
  // Modo de visualização (view, edit, create)
  mode: "view" | "edit" | "create";
  // Função chamada ao clicar para adicionar uma aula
  onAddClass?: (dayOfWeek: number) => void;
  // Função chamada ao clicar em uma aula existente
  onClassClick?: (aula: ScheduleClass | ClassDetails) => void;
}

// Função para obter a classe Tailwind da cor da categoria
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

export const ClassMap: React.FC<ClassMapProps> = ({ aulas, mode, onAddClass, onClassClick }) => {
  // Ordenar as aulas por hora de início para cada dia
  const getAulasByDay = (dia: number) => {
    return aulas?.filter((aula) => aula.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  // Verificar se o modo é de edição ou criação
  const isEditable = mode === "edit" || mode === "create";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mapa de Aulas</CardTitle>
          <p className="text-sm text-gray-600">
            {mode === "view"
              ? "Visualização completa das aulas programadas"
              : "Clique em um dia para adicionar uma aula ou em uma aula existente para editar"}
          </p>
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
                      {/* Aulas para este dia, ordenadas por hora de início */}
                      {getAulasByDay(dia).map((aula) => {
                        // Obter a classe de cor para a categoria atual
                        const bgColorClass = getCategoryBgColor(aula.categoria);

                        return (
                          <div
                            key={aula.id}
                            className={`p-3 hover:bg-opacity-80 rounded-md m-1 ${bgColorClass} bg-opacity-60 ${
                              isEditable ? "cursor-pointer" : ""
                            }`}
                            onClick={() => {
                              if (isEditable && onClassClick) {
                                // Certifique-se de que todos os campos necessários existam no objeto aula
                                const aulaCompleta = {
                                  ...aula,
                                  sala: aula.sala || "",
                                  professor: aula.professor || "",
                                  intensidade: aula.intensidade || "",
                                  categoria: aula.categoria || "", // Garantir que categoria esteja presente
                                  duracao: aula.duracao || (aula.categoria === "Express" ? 15 : 30), // Garantir que duracao esteja presente
                                };
                                console.log("Aula selecionada para edição:", aulaCompleta);
                                onClassClick(aulaCompleta);
                              }
                            }}
                            style={{
                              borderLeft: "3px solid",
                            }}
                          >
                            <div className="font-medium text-sm mb-1">{aula.nome}</div>
                            <div className="text-xs text-gray-700 flex flex-col">
                              <span className="font-semibold">{aula.categoria}</span>
                              <span>
                                {aula.horaInicio} ({aula.duracao} min)
                              </span>
                              {aula.custo !== undefined && aula.custo !== null && aula.custo > 0 && (
                                <span className="mt-1 font-medium">Custo: {aula.custo.toFixed(2)}€</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Botão para adicionar aula quando estiver em modo edição/criação */}
                      {isEditable && (
                        <div className="p-2 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-gray-500 hover:text-gray-800 justify-center"
                            onClick={() => onAddClass && onAddClass(dia)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Adicionar Aula
                          </Button>
                        </div>
                      )}

                      {/* Mensagem se não houver aulas para este dia */}
                      {!isEditable && !getAulasByDay(dia).length && (
                        <div className="p-4 text-center text-gray-500">
                          <span className="text-xs">Sem aulas</span>
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {(!aulas || aulas.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma aula nesta programação</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {isEditable
                ? "Clique em um dia da semana acima para adicionar a primeira aula."
                : "Esta programação não possui aulas cadastradas."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
