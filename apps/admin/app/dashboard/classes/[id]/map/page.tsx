"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import { Badge } from "@eugenios/ui/components/badge";
import { ArrowLeft, Printer } from "lucide-react";
import { useScheduleById } from "@/hooks/useScheduleOperations";
import { ClassMap } from "@/components/schedule/ClassMap";

export default function ScheduleMapPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params using React.use()
  const { data: schedule, isLoading, error } = useScheduleById(id);

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando mapa de aulas...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground">Não foi possível carregar o mapa de aulas.</p>
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
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/classes/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para detalhes
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{schedule.titulo}</h1>
            <p className="text-gray-600 mt-1">{schedule.descricao || "Sem descrição"}</p>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" /> Imprimir mapa
        </Button>
      </div>

      {/* Informações da programação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalhes da Programação</CardTitle>
            <Badge
              className={
                schedule.status === "ATIVO"
                  ? "bg-green-100 text-green-800"
                  : schedule.status === "PENDENTE"
                    ? "bg-yellow-100 text-yellow-800"
                    : schedule.status === "RASCUNHO"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
              }
            >
              {schedule.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Aulas adicionadas:</strong> {schedule.aulas?.length || 0}
              </p>

              {/* Distribuição de aulas por categoria */}
              {schedule.aulas && schedule.aulas.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Distribuição por categoria:</p>
                  <div className="flex gap-2 flex-wrap">
                    {["TERRA", "AGUA", "EXPRESS"].map((categoria) => {
                      const count =
                        schedule.aulas?.filter((aula) => aula.categoria.toUpperCase() === categoria).length || 0;
                      if (count === 0) return null;
                      const bgColorClass = getCategoryBgColor(categoria);
                      return (
                        <div
                          key={categoria}
                          className={`flex items-center px-2 py-1 rounded-full text-xs ${bgColorClass}`}
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
                <span className="text-blue-600 font-semibold">€ {schedule.orcamento?.toFixed(2) || "0.00"}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Soma dos custos de todas as aulas (Express são gratuitas)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Horária */}
      <ClassMap aulas={schedule.aulas || []} mode="view" />
    </div>
  );
}
