"use client";

import { useState, useMemo } from "react";
import { Button } from "@eugenios/ui/components/button";
import { ChevronLeft, ChevronRight, ChevronDown, X, Sun, Sunset, Moon } from "lucide-react";
import { Badge } from "@eugenios/ui/components/badge";
import { Checkbox } from "@eugenios/ui/components/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@eugenios/ui/components/popover";
import { AulasDaSemanaResponse } from "@eugenios/types/src";
import { Typography } from "@eugenios/ui/src/components/ui/Typography";

// Paleta elegante e minimalista
const categoryStyles = {
  Terra: "border-l-stone-400 bg-stone-50",
  Express: "border-l-slate-400 bg-slate-50",
  Água: "border-l-gray-400 bg-gray-50",
};

const intensityLabels = {
  0: "Relaxamento",
  1: "Suave",
  2: "Moderada",
  3: "Intensa",
  4: "Máxima",
} as const;

// Função para obter ícone do período do dia (sem cor, mais sutil)
const getPeriodIcon = (hora: string) => {
  const hour = Number.parseInt(hora.split(":")[0] || "0");
  if (hour >= 6 && hour < 12) {
    return <Sun className="h-4 w-4 text-gray-400" />;
  } else if (hour >= 12 && hour < 18) {
    return <Sunset className="h-4 w-4 text-gray-400" />;
  } else {
    return <Moon className="h-4 w-4 text-gray-400" />;
  }
};

// Função para obter ícone de intensidade com barras laterais
const getIntensityIcon = (intensity: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`w-1 rounded-sm ${index < intensity ? "bg-gray-600 h-3" : "bg-gray-300 h-2"}`} />
      ))}
    </div>
  );
};

// Componente para filtro multi-select
function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectionChange,
  placeholder,
}: {
  label: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((item) => item !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const removeSelection = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value));
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 justify-between text-left font-normal border-gray-300 bg-white hover:bg-gray-50 rounded-full px-4"
          >
            <span className={selected.length === 0 ? "text-gray-500" : "text-gray-900"}>
              {selected.length === 0
                ? label
                : `${selected.length} ${label.toLowerCase()} selecionada${selected.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 rounded-2xl border-gray-200 shadow-lg" align="start">
          <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-xl transition-colors"
              >
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleSelection(option)}
                  className="rounded-md"
                />
                <label htmlFor={option} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags dos selecionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {item}
              <button
                onClick={() => removeSelection(item)}
                className="ml-2 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface ScheduleProps {
  aulas: AulasDaSemanaResponse;
  loading: boolean;
  error: boolean;
  selectedWeek?: Date;
  setSelectedWeek?: (date: Date) => void;
}

export default function ElegantClassSchedule({
  aulas,
  loading,
  error,
  selectedWeek: externalSelectedWeek,
  setSelectedWeek: externalSetSelectedWeek,
}: ScheduleProps) {
  const [internalSelectedWeek, setInternalSelectedWeek] = useState(new Date());
  const selectedWeek = externalSelectedWeek || internalSelectedWeek;
  const setSelectedWeek = externalSetSelectedWeek || setInternalSelectedWeek;

  const [selectedDay, setSelectedDay] = useState(new Date()); // Para mobile
  const [filters, setFilters] = useState({
    nomes: [] as string[],
    categorias: [] as string[],
    intensidades: [] as string[],
    professores: [] as string[],
    salas: [] as string[],
  });

  // Calcular dados filtrados usando useMemo (também é um hook)
  const filteredData = useMemo(() => {
    if (!aulas || !aulas.aulas_da_semana) {
      return { aulas_da_semana: [] };
    }

    return {
      aulas_da_semana: aulas.aulas_da_semana.map((day) => ({
        ...day,
        aulas: day.aulas.filter((aula) => {
          return (
            (filters.nomes.length === 0 || filters.nomes.includes(aula.nome)) &&
            (filters.categorias.length === 0 || filters.categorias.includes(aula.categoria)) &&
            (filters.intensidades.length === 0 || filters.intensidades.includes(aula.intensidade.toString())) &&
            (filters.professores.length === 0 || filters.professores.includes(aula.professor)) &&
            (filters.salas.length === 0 || filters.salas.includes(aula.sala))
          );
        }),
      })),
    };
  }, [filters, aulas]);

  // Extrair valores únicos para os dropdowns usando useMemo
  const { uniqueNames, uniqueCategories, uniqueIntensities, uniqueInstructors, uniqueRooms } = useMemo(() => {
    if (!aulas || !aulas.aulas_da_semana) {
      return {
        uniqueNames: [],
        uniqueCategories: [],
        uniqueIntensities: [],
        uniqueInstructors: [],
        uniqueRooms: [],
      };
    }

    const allClasses = aulas.aulas_da_semana.flatMap((day) => day.aulas);
    return {
      uniqueNames: [...new Set(allClasses.map((c) => c.nome))].sort(),
      uniqueCategories: [...new Set(allClasses.map((c) => c.categoria))].sort(),
      uniqueIntensities: [...new Set(allClasses.map((c) => c.intensidade))].sort((a, b) => a - b),
      uniqueInstructors: [...new Set(allClasses.map((c) => c.professor))].sort(),
      uniqueRooms: [...new Set(allClasses.map((c) => c.sala))].sort(),
    };
  }, [aulas]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-light text-gray-900">Carregando agenda...</div>
        </div>
      </div>
    );
  }

  if (error || !aulas || !aulas.aulas_da_semana) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-light text-gray-900">Erro ao carregar agenda</div>
        </div>
      </div>
    );
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newDate);
  };

  // Navegar dias (mobile) - agora navega semanas
  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDay);
    newDate.setDate(selectedDay.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDay(newDate);
  };

  // Obter dias da semana para mobile
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = getWeekStart(selectedDay);

    for (let i = 0; i < 5; i++) {
      // Segunda a sexta
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Encontrar o dia atual nos dados
  const getCurrentDayData = () => {
    const dayName = selectedDay.toLocaleDateString("pt-PT", { weekday: "long" });
    const dayData = filteredData.aulas_da_semana.find((day) => day.dia.toLowerCase() === dayName.toLowerCase());
    return dayData || { dia: dayName, data: selectedDay.getDate().toString(), aulas: [] };
  };

  // Organizar aulas por período do dia
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

  const formatWeekRange = () => {
    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const mondayDay = weekStart.getDate().toString().padStart(2, "0");
    const mondayMonth = (weekStart.getMonth() + 1).toString().padStart(2, "0");
    const sundayDay = weekEnd.getDate().toString().padStart(2, "0");
    const sundayMonth = (weekEnd.getMonth() + 1).toString().padStart(2, "0");

    return `Segunda ${mondayDay}/${mondayMonth} - Domingo ${sundayDay}/${sundayMonth}`;
  };

  const clearAllFilters = () => {
    setFilters({
      nomes: [],
      categorias: [],
      intensidades: [],
      professores: [],
      salas: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((filter) => filter.length > 0);

  // Componente para vista mobile
  const MobileView = () => {
    const currentDayData = getCurrentDayData();
    const { morning, afternoon, evening } = getClassesByPeriod(currentDayData.aulas);
    const weekDays = getWeekDays();

    return (
      <div className="lg:hidden">
        {/* Mobile Day Picker */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay("prev")}
              className="h-10 w-10 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center min-w-[140px]">
              <div className="text-sm font-medium text-gray-900">
                {(() => {
                  const weekStart = getWeekStart(selectedDay);
                  // A função getWeekStart já retorna a segunda-feira correta
                  const mondayStart = new Date(weekStart);

                  // Terminar no domingo (6 dias depois da segunda)
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
              onClick={() => navigateDay("next")}
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
                onClick={() => setSelectedDay(day)}
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

        {/* Mobile Class List */}
        <div className="space-y-6">
          {/* Manhã */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
              Manhã (6h - 12h)
            </h3>
            <div className="space-y-3">
              {morning.length > 0 ? (
                morning.map((aula, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} shadow-sm bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{aula.nome}</h4>
                      {getPeriodIcon(aula.hora_inicio)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="text-gray-700">
                        {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                      </div>
                      <div className="text-gray-600">{aula.sala}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{aula.professor}</span>
                        {getIntensityIcon(aula.intensidade)}
                      </div>
                    </div>
                  </div>
                ))
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
              {afternoon.length > 0 ? (
                afternoon.map((aula, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} shadow-sm bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{aula.nome}</h4>
                      {getPeriodIcon(aula.hora_inicio)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="text-gray-700">
                        {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                      </div>
                      <div className="text-gray-600">{aula.sala}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{aula.professor}</span>
                        {getIntensityIcon(aula.intensidade)}
                      </div>
                    </div>
                  </div>
                ))
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
              {evening.length > 0 ? (
                evening.map((aula, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} shadow-sm bg-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{aula.nome}</h4>
                      {getPeriodIcon(aula.hora_inicio)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="text-gray-700">
                        {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                      </div>
                      <div className="text-gray-600">{aula.sala}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{aula.professor}</span>
                        {getIntensityIcon(aula.intensidade)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">Sem aulas de noite</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto min-h-screen bg-white pt-40">
      {/* Header minimalista */}
      <div className="mb-6 space-y-4">
        <Typography as="h2" variant="sectionTitle" className="font-semibold text-center text-neutral-800">
          Mapa de Aulas Eugénios HC
        </Typography>
        <Typography as="p" variant="body" className="text-center">
          Mais de 50 modalidades diferentes esperam por si.
        </Typography>
      </div>

      <div>
        {/* Week Picker minimalista - apenas desktop */}
        <div className="hidden lg:flex items-center justify-center mb-4">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("prev")}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">{formatWeekRange()}</div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("next")}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros elegantes */}
        <div className="mb-8">
          <div className="flex items-center justify-end mb-6">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 rounded-xl"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Desktop: Grid normal */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            <MultiSelectFilter
              label="Aulas"
              options={uniqueNames}
              selected={filters.nomes}
              onSelectionChange={(selected) => setFilters({ ...filters, nomes: selected })}
              placeholder="Selecionar aulas"
            />

            <MultiSelectFilter
              label="Categorias"
              options={uniqueCategories}
              selected={filters.categorias}
              onSelectionChange={(selected) => setFilters({ ...filters, categorias: selected })}
              placeholder="Selecionar categorias"
            />

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

            <MultiSelectFilter
              label="Professores"
              options={uniqueInstructors}
              selected={filters.professores}
              onSelectionChange={(selected) => setFilters({ ...filters, professores: selected })}
              placeholder="Selecionar professores"
            />

            <MultiSelectFilter
              label="Salas"
              options={uniqueRooms}
              selected={filters.salas}
              onSelectionChange={(selected) => setFilters({ ...filters, salas: selected })}
              placeholder="Selecionar salas"
            />
          </div>

          {/* Mobile/Tablet: Scroll horizontal */}
          <div
            className="lg:hidden flex gap-3 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
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
        </div>

        {/* Vista Mobile */}
        <MobileView />

        {/* Tabela desktop */}
        <div className="hidden lg:block overflow-hidden py-10">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-900 text-white">
                {filteredData.aulas_da_semana.map((day, index) => {
                  const dayAbbr = day.dia.substring(0, 3).toUpperCase();
                  return (
                    <th key={index} className="p-4 text-center font-medium text-sm">
                      <div className="flex flex-col">
                        <span className="text-lg opacity-75">{dayAbbr}</span>
                        <span className="text-xs opacity-50">
                          {(() => {
                            // Criar uma data válida baseada na semana selecionada
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
                {filteredData.aulas_da_semana.map((day, dayIndex) => {
                  const { morning } = getClassesByPeriod(day.aulas);
                  return (
                    <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                      <div className="space-y-3">
                        {morning.map((aula, aulaIndex) => (
                          <div
                            key={aulaIndex}
                            className={`p-3 border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} border border-gray-200 hover:shadow-sm transition-shadow text-xs rounded bg-white`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-gray-900 leading-tight flex-1">{aula.nome}</div>
                              {getPeriodIcon(aula.hora_inicio)}
                            </div>
                            <div className="space-y-2">
                              <div className="text-gray-700 font-medium">
                                {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                              </div>
                              <div className="text-gray-600">{aula.sala}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 truncate">{aula.professor}</span>
                                <div className="ml-2 flex-shrink-0">{getIntensityIcon(aula.intensidade)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Tarde */}
              <tr>
                {filteredData.aulas_da_semana.map((day, dayIndex) => {
                  const { afternoon } = getClassesByPeriod(day.aulas);
                  return (
                    <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                      <div className="space-y-3">
                        {afternoon.map((aula, aulaIndex) => (
                          <div
                            key={aulaIndex}
                            className={`p-3 border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} hover:shadow-sm transition-shadow text-xs rounded bg-white`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-gray-900 leading-tight flex-1">{aula.nome}</div>
                              {getPeriodIcon(aula.hora_inicio)}
                            </div>
                            <div className="space-y-2">
                              <div className="text-gray-700 font-medium">
                                {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                              </div>
                              <div className="text-gray-600">{aula.sala}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 truncate">{aula.professor}</span>
                                <div className="ml-2 flex-shrink-0">{getIntensityIcon(aula.intensidade)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Noite */}
              <tr>
                {filteredData.aulas_da_semana.map((day, dayIndex) => {
                  const { evening } = getClassesByPeriod(day.aulas);
                  return (
                    <td key={dayIndex} className="p-3 align-top border border-gray-200 min-h-[160px]">
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-4">Noite</h4>
                        {evening.map((aula, aulaIndex) => (
                          <div
                            key={aulaIndex}
                            className={`p-3 border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} hover:shadow-sm transition-shadow text-xs rounded bg-white`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-gray-900 leading-tight flex-1">{aula.nome}</div>
                              {getPeriodIcon(aula.hora_inicio)}
                            </div>
                            <div className="space-y-2">
                              <div className="text-gray-700 font-medium">
                                {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
                              </div>
                              <div className="text-gray-600">{aula.sala}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 truncate">{aula.professor}</span>
                                <div className="ml-2 flex-shrink-0">{getIntensityIcon(aula.intensidade)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
