"use client";

import { useState, useMemo, useEffect } from "react";
import { Typography } from "@eugenios/ui/src/components/ui/Typography";
import { AulasDaSemanaResponse } from "@eugenios/types/src";

// Importar componentes
import { WeekPicker } from "./schedule/WeekPicker";
import { FilterSection } from "./schedule/FilterSection";
import { MobileView } from "./schedule/MobileView";
import { DesktopTable } from "./schedule/DesktopTable";
import { LegendSection } from "./schedule/LegendSection";

// Importar tipos e constantes
import { ScheduleProps, FilterState, ActiveTab, intensityLabels } from "./schedule/types";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("terra"); // Tab ativa
  const [filters, setFilters] = useState<FilterState>({
    nomes: [],
    categorias: [],
    intensidades: [],
    professores: [],
    salas: [],
  });

  // Calcular dados filtrados usando useMemo
  const filteredData = useMemo(() => {
    if (!aulas || !aulas.aulas_da_semana) {
      return { aulas_da_semana: [] };
    }

    return {
      aulas_da_semana: aulas.aulas_da_semana.map((day: any) => ({
        ...day,
        aulas: day.aulas.filter((aula: any) => {
          // Filtro por tab (Terra ou Água)
          const tabFilter =
            activeTab === "terra"
              ? aula.categoria === "Terra" || aula.categoria === "Express"
              : aula.categoria === "Água";

          return (
            tabFilter &&
            (filters.nomes.length === 0 || filters.nomes.includes(aula.nome)) &&
            (filters.categorias.length === 0 || filters.categorias.includes(aula.categoria)) &&
            (filters.intensidades.length === 0 || filters.intensidades.includes(aula.intensidade.toString())) &&
            (filters.professores.length === 0 || filters.professores.includes(aula.professor)) &&
            (filters.salas.length === 0 || filters.salas.includes(aula.sala))
          );
        }),
      })),
    };
  }, [filters, aulas, activeTab]);

  // Extrair valores únicos para os dropdowns usando useMemo - filtrados pela tab ativa
  const { uniqueNames, uniqueCategories, uniqueIntensities, uniqueInstructors, uniqueRooms } = useMemo(() => {
    if (!aulas || !aulas.aulas_da_semana) {
      return {
        uniqueNames: [] as string[],
        uniqueCategories: [] as string[],
        uniqueIntensities: [] as number[],
        uniqueInstructors: [] as string[],
        uniqueRooms: [] as string[],
      };
    }

    // Filtrar aulas baseado na tab ativa
    const allClasses = aulas.aulas_da_semana
      .flatMap((day: any) => day.aulas)
      .filter((aula: any) => {
        const tabFilter =
          activeTab === "terra"
            ? aula.categoria === "Terra" || aula.categoria === "Express"
            : aula.categoria === "Água";
        return tabFilter;
      });

    // Filtrar valores únicos e remover valores vazios/null/undefined
    const result = {
      uniqueNames: [...new Set(allClasses.map((c: any) => c.nome as string).filter(Boolean))].sort(),
      uniqueCategories: [...new Set(allClasses.map((c: any) => c.categoria as string).filter(Boolean))].sort(),
      uniqueIntensities: [
        ...new Set(allClasses.map((c: any) => c.intensidade as number).filter((i) => i !== null && i !== undefined)),
      ].sort((a: number, b: number) => a - b),
      uniqueInstructors: [...new Set(allClasses.map((c: any) => c.professor as string).filter(Boolean))].sort(),
      uniqueRooms: [...new Set(allClasses.map((c: any) => c.sala as string).filter(Boolean))].sort(),
    };

    return result;
  }, [aulas, activeTab]); // Adicionado activeTab como dependência

  // Limpar filtros inválidos quando a tab muda
  useEffect(() => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      let hasChanges = false;

      // Filtrar nomes que não existem na tab atual
      const validNames = newFilters.nomes.filter((nome) => uniqueNames.includes(nome));
      if (validNames.length !== newFilters.nomes.length) {
        newFilters.nomes = validNames;
        hasChanges = true;
      }

      // Filtrar categorias que não existem na tab atual
      const validCategories = newFilters.categorias.filter((categoria) => uniqueCategories.includes(categoria));
      if (validCategories.length !== newFilters.categorias.length) {
        newFilters.categorias = validCategories;
        hasChanges = true;
      }

      // Filtrar intensidades que não existem na tab atual
      const validIntensities = newFilters.intensidades.filter((intensidade) =>
        uniqueIntensities.includes(Number.parseInt(intensidade))
      );
      if (validIntensities.length !== newFilters.intensidades.length) {
        newFilters.intensidades = validIntensities;
        hasChanges = true;
      }

      // Filtrar professores que não existem na tab atual
      const validInstructors = newFilters.professores.filter((professor) => uniqueInstructors.includes(professor));
      if (validInstructors.length !== newFilters.professores.length) {
        newFilters.professores = validInstructors;
        hasChanges = true;
      }

      // Filtrar salas que não existem na tab atual
      const validRooms = newFilters.salas.filter((sala) => uniqueRooms.includes(sala));
      if (validRooms.length !== newFilters.salas.length) {
        newFilters.salas = validRooms;
        hasChanges = true;
      }

      // Retornar novos filtros apenas se houver mudanças
      return hasChanges ? newFilters : prevFilters;
    });
  }, [activeTab, uniqueNames, uniqueCategories, uniqueIntensities, uniqueInstructors, uniqueRooms]);

  // Skeleton data para loading
  const skeletonData = {
    aulas_da_semana: Array.from({ length: 7 }, (_, index) => ({
      dia: ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"][index],
      data: (index + 1).toString(),
      aulas: [],
    })),
  };

  const displayData = loading ? skeletonData : filteredData || { aulas_da_semana: [] };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-light text-gray-900">Erro ao carregar mapa de aulas</div>
        </div>
      </div>
    );
  }

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

  const clearAllFilters = () => {
    setFilters({
      nomes: [],
      categorias: [],
      intensidades: [],
      professores: [],
      salas: [],
    });
    setActiveTab("terra");
  };

  const hasActiveFilters = Object.values(filters).some((filter) => filter.length > 0);

  return (
    <div className="w-full bg-neutral-100">
      <div className="container mx-auto min-h-screen bg-neutral-100 pt-40">
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
          {/* Week Picker - apenas desktop */}
          <WeekPicker selectedWeek={selectedWeek} onNavigateWeek={navigateWeek} />

          {/* Filtros */}
          <FilterSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filters={filters}
            setFilters={setFilters}
            uniqueNames={uniqueNames}
            uniqueCategories={uniqueCategories}
            uniqueIntensities={uniqueIntensities}
            uniqueInstructors={uniqueInstructors}
            uniqueRooms={uniqueRooms}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
            loading={loading}
          />

          {/* Vista Mobile */}
          <MobileView
            selectedDay={selectedDay}
            onNavigateDay={navigateDay}
            onSetSelectedDay={setSelectedDay}
            filteredData={filteredData}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filters={filters}
            setFilters={setFilters}
            uniqueNames={uniqueNames}
            uniqueCategories={uniqueCategories}
            uniqueIntensities={uniqueIntensities}
            uniqueInstructors={uniqueInstructors}
            uniqueRooms={uniqueRooms}
          />

          {/* Tabela desktop */}
          <DesktopTable displayData={displayData} selectedWeek={selectedWeek} loading={loading} />

          {/* Legenda */}
          <LegendSection />
        </div>
      </div>
    </div>
  );
}
