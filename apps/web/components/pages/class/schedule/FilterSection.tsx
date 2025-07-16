"use client";

import { Button } from "@eugenios/ui/components/button";
import { Printer } from "lucide-react";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { TabSelector } from "./TabSelector";
import { FilterState, ActiveTab, intensityLabels } from "./types";

interface FilterSectionProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  uniqueNames: string[];
  uniqueCategories: string[];
  uniqueIntensities: number[];
  uniqueInstructors: string[];
  uniqueRooms: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  loading: boolean;
}

export function FilterSection({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  uniqueNames,
  uniqueCategories,
  uniqueIntensities,
  uniqueInstructors,
  uniqueRooms,
  hasActiveFilters,
  onClearFilters,
  loading,
}: FilterSectionProps) {
  return (
    <div className="">
      <div className="flex items-center justify-end mb-6">
        {hasActiveFilters && !loading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700 rounded-xl"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Desktop: Grid com tabs integradas e botão de impressora */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex-1 grid grid-cols-5 gap-4">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

          <MultiSelectFilter
            label="Aulas"
            options={uniqueNames}
            selected={filters.nomes}
            onSelectionChange={(selected) => setFilters({ ...filters, nomes: selected })}
            placeholder="Selecionar aulas"
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

        {/* Botão de impressora */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.print()}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 transition-colors"
          title="Imprimir horário"
        >
          <Printer className="h-4 w-4 text-white" />{" "}
        </Button>
      </div>
    </div>
  );
}
