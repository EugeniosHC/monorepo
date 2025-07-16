"use client";

import { Button } from "@eugenios/ui/components/button";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { ClassCard } from "./ClassCard";
import { SkeletonMobileCard } from "./SkeletonComponents";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { TabSelector } from "./TabSelector";
import { FilterState, ActiveTab, intensityLabels } from "./types";

interface MobileViewProps {
  selectedDay: Date;
  onNavigateDay: (direction: "prev" | "next") => void;
  onSetSelectedDay: (date: Date) => void;
  filteredData: any;
  loading: boolean;
  // Filtros
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  uniqueNames: string[];
  uniqueCategories: string[];
  uniqueIntensities: number[];
  uniqueInstructors: string[];
  uniqueRooms: string[];
}

export function MobileView({
  selectedDay,
  onNavigateDay,
  onSetSelectedDay,
  filteredData,
  loading,
  // Filtros
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  uniqueNames,
  uniqueCategories,
  uniqueIntensities,
  uniqueInstructors,
  uniqueRooms,
}: MobileViewProps) {
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = getWeekStart(selectedDay);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getCurrentDayData = () => {
    const dayName = selectedDay.toLocaleDateString("pt-PT", { weekday: "long" });
    const dayData = filteredData.aulas_da_semana.find((day: any) => day.dia.toLowerCase() === dayName.toLowerCase());
    return dayData || { dia: dayName, data: selectedDay.getDate().toString(), aulas: [] };
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

  const currentDayData = loading ? { dia: "Carregando...", data: "", aulas: [] } : getCurrentDayData();
  const { morning, afternoon, evening } = loading
    ? { morning: [], afternoon: [], evening: [] }
    : getClassesByPeriod(currentDayData.aulas);
  const weekDays = getWeekDays();

  return (
    <div className="lg:hidden">
      {/* Mobile Day Picker */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateDay("prev")}
            className="h-10 w-10 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center min-w-[140px]">
            <div className="text-sm font-medium text-gray-900">
              {(() => {
                const weekStart = getWeekStart(selectedDay);
                const mondayStart = new Date(weekStart);
                const sundayEnd = new Date(mondayStart);
                sundayEnd.setDate(mondayStart.getDate() + 6);

                const mondayDay = mondayStart.getDate().toString().padStart(2, "0");
                const mondayMonth = (mondayStart.getMonth() + 1).toString().padStart(2, "0");
                const sundayDay = sundayEnd.getDate().toString().padStart(2, "0");
                const sundayMonth = (sundayEnd.getMonth() + 1).toString().padStart(2, "0");

                return `Segunda ${mondayDay}/${mondayMonth} - Domingo ${sundayDay}/${sundayMonth}`;
              })()}
            </div>
            <div className="text-lg font-light text-gray-600">
              {selectedDay.toLocaleDateString("pt-PT", { weekday: "long" })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigateDay("next")}
            className="h-10 w-10 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {weekDays.map((day, index) => {
          const isSelected = day.toDateString() === selectedDay.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => onSetSelectedDay(day)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : isToday
                    ? "bg-gray-100 text-gray-900 ring-2 ring-gray-300"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="text-xs opacity-75">
                {day.toLocaleDateString("pt-PT", { weekday: "short" }).toUpperCase()}
              </div>
              <div className="font-semibold">{day.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Filtros Mobile */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex-1 flex gap-3 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex-shrink-0 w-48">
              <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile />
            </div>

            <div className="flex-shrink-0 w-48">
              <MultiSelectFilter
                label="Aulas"
                options={uniqueNames}
                selected={filters.nomes}
                onSelectionChange={(selected) => setFilters({ ...filters, nomes: selected })}
                placeholder="Selecionar aulas"
              />
            </div>

            <div className="flex-shrink-0 w-48">
              <MultiSelectFilter
                label="Categorias"
                options={uniqueCategories}
                selected={filters.categorias}
                onSelectionChange={(selected) => setFilters({ ...filters, categorias: selected })}
                placeholder="Selecionar categorias"
              />
            </div>

            <div className="flex-shrink-0 w-48">
              <MultiSelectFilter
                label="Intensidades"
                options={uniqueIntensities.map((i) => intensityLabels[i as keyof typeof intensityLabels])}
                selected={filters.intensidades.map(
                  (i) => intensityLabels[Number.parseInt(i) as keyof typeof intensityLabels]
                )}
                onSelectionChange={(selected) => {
                  const intensityNumbers = selected
                    .map((label) => Object.entries(intensityLabels).find(([_, l]) => l === label)?.[0] || "")
                    .filter(Boolean);
                  setFilters({ ...filters, intensidades: intensityNumbers });
                }}
                placeholder="Selecionar intensidades"
              />
            </div>

            <div className="flex-shrink-0 w-48">
              <MultiSelectFilter
                label="Professores"
                options={uniqueInstructors}
                selected={filters.professores}
                onSelectionChange={(selected) => setFilters({ ...filters, professores: selected })}
                placeholder="Selecionar professores"
              />
            </div>

            <div className="flex-shrink-0 w-48">
              <MultiSelectFilter
                label="Salas"
                options={uniqueRooms}
                selected={filters.salas}
                onSelectionChange={(selected) => setFilters({ ...filters, salas: selected })}
                placeholder="Selecionar salas"
              />
            </div>
          </div>

          {/* Botão de impressora para mobile */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.print()}
            className="h-12 w-12 rounded-full border-gray-300 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
            title="Imprimir horário"
          >
            <Printer className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Mobile Class List */}
      <div className="space-y-6">
        {/* Manhã */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
            Manhã (6h - 12h)
          </h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 2 }, (_, index) => <SkeletonMobileCard key={index} />)
            ) : morning.length > 0 ? (
              morning.map((aula: any, index: number) => <ClassCard key={index} aula={aula} isMobile />)
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Sem aulas de manhã</div>
            )}
          </div>
        </div>

        {/* Tarde */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
            Tarde (12h - 18h)
          </h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }, (_, index) => <SkeletonMobileCard key={index} />)
            ) : afternoon.length > 0 ? (
              afternoon.map((aula: any, index: number) => <ClassCard key={index} aula={aula} isMobile />)
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Sem aulas de tarde</div>
            )}
          </div>
        </div>

        {/* Noite */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
            Noite (18h+)
          </h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 2 }, (_, index) => <SkeletonMobileCard key={index} />)
            ) : evening.length > 0 ? (
              evening.map((aula: any, index: number) => <ClassCard key={index} aula={aula} isMobile />)
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Sem aulas de noite</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
