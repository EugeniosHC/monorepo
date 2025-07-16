"use client";

import { ClassCard } from "./ClassCard";
import { SkeletonCard } from "./SkeletonComponents";

interface DesktopTableProps {
  displayData: any;
  selectedWeek: Date;
  loading: boolean;
}

export function DesktopTable({ displayData, selectedWeek, loading }: DesktopTableProps) {
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getClassesByPeriod = (aulas: any[]) => {
    const morning = aulas.filter((aula) => {
      const hour = Number.parseInt(aula.hora_inicio.split(":")[0]);
      return hour >= 6 && hour < 12;
    });

    const afternoon = aulas.filter((aula) => {
      const hour = Number.parseInt(aula.hora_inicio.split(":")[0]);
      return hour >= 12 && hour < 18;
    });

    const evening = aulas.filter((aula) => {
      const hour = Number.parseInt(aula.hora_inicio.split(":")[0]);
      return hour >= 18 || hour < 6;
    });

    return { morning, afternoon, evening };
  };

  return (
    <div className="hidden lg:block overflow-hidden py-10">
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-primary text-white">
            {displayData.aulas_da_semana.map((day: any, index: number) => {
              const dayAbbr =
                day.dia?.substring(0, 3).toUpperCase() || ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"][index];
              return (
                <th key={index} className="p-4 text-center font-medium text-sm">
                  <div className="flex flex-col">
                    <span className="text-lg opacity-75">{dayAbbr}</span>
                    <span className="text-xs opacity-50">
                      {(() => {
                        const weekStart = getWeekStart(selectedWeek);
                        const currentDate = new Date(weekStart);
                        currentDate.setDate(weekStart.getDate() + index);

                        return currentDate.toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "2-digit",
                        });
                      })()}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Manhã */}
          <tr>
            {displayData.aulas_da_semana.map((day: any, dayIndex: number) => {
              if (loading) {
                return (
                  <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                    <div className="space-y-3">
                      {Array.from({ length: 2 }, (_, index) => (
                        <SkeletonCard key={index} />
                      ))}
                    </div>
                  </td>
                );
              }

              const { morning } = getClassesByPeriod(day.aulas || []);
              return (
                <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                  <div className="space-y-3">
                    {morning.map((aula: any, aulaIndex: number) => (
                      <ClassCard key={aulaIndex} aula={aula} />
                    ))}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Tarde */}
          <tr>
            {displayData.aulas_da_semana.map((day: any, dayIndex: number) => {
              if (loading) {
                return (
                  <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                    <div className="space-y-3">
                      {Array.from({ length: 3 }, (_, index) => (
                        <SkeletonCard key={index} />
                      ))}
                    </div>
                  </td>
                );
              }

              const { afternoon } = getClassesByPeriod(day.aulas || []);
              return (
                <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                  <div className="space-y-3">
                    {afternoon.map((aula: any, aulaIndex: number) => (
                      <ClassCard key={aulaIndex} aula={aula} />
                    ))}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Noite */}
          <tr>
            {displayData.aulas_da_semana.map((day: any, dayIndex: number) => {
              if (loading) {
                return (
                  <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                    <div className="space-y-3">
                      {Array.from({ length: 2 }, (_, index) => (
                        <SkeletonCard key={index} />
                      ))}
                    </div>
                  </td>
                );
              }

              const { evening } = getClassesByPeriod(day.aulas || []);
              return (
                <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                  <div className="space-y-3">
                    {evening.map((aula: any, aulaIndex: number) => (
                      <ClassCard key={aulaIndex} aula={aula} />
                    ))}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
