"use client";

import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive";
import { ReusableDataTable, DataTableConfig } from "@/components/ui/reusable-data-table";
import { SectionCards } from "@/components/ui/section-cards";
import { ComponentLoading, CardLoading } from "@/components/ui/loading";
import { useState, useEffect } from "react";

// Tipo dos dados do dashboard
interface DashboardData {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}

export default function Page() {
  // Simular carregamento de dados
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento da tabela
    const tableTimer = setTimeout(() => setIsLoading(false), 1500);
    // Simular carregamento dos gráficos
    const chartsTimer = setTimeout(() => setChartsLoading(false), 2000);

    return () => {
      clearTimeout(tableTimer);
      clearTimeout(chartsTimer);
    };
  }, []);

  // Configuração da tabela para o dashboard
  const tableConfig: DataTableConfig<DashboardData> = {
    columns: [
      {
        key: "header",
        header: "Header",
        hideable: false,
      },
      {
        key: "type",
        header: "Section Type",
        type: "badge",
      },
      {
        key: "status",
        header: "Status",
        type: "badge",
      },
      {
        key: "target",
        header: "Target",
        type: "editable",
        align: "right",
      },
      {
        key: "limit",
        header: "Limit",
        type: "editable",
        align: "right",
      },
      {
        key: "reviewer",
        header: "Reviewer",
        type: "select",
        options: [
          { label: "Eddie Lake", value: "Eddie Lake" },
          { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
          { label: "Emily Whalen", value: "Emily Whalen" },
        ],
      },
    ],
    actions: [
      {
        label: "Edit",
        onClick: (row) => console.log("Edit", row),
      },
      {
        label: "Make a copy",
        onClick: (row) => console.log("Copy", row),
      },
      {
        label: "Favorite",
        onClick: (row) => console.log("Favorite", row),
      },
      {
        separator: true,
        label: "Delete",
        onClick: (row) => console.log("Delete", row),
        variant: "destructive",
      },
    ],
    enableDragAndDrop: true,
    enableSelection: true,
    enablePagination: true,
    enableColumnVisibility: true,
    pageSize: 10,
    addButtonLabel: "Add Section",
    onAddClick: () => console.log("Add new section"),
    onDataChange: (newData) => console.log("Data changed:", newData),
    onSelectionChange: (selection) => console.log("Selection changed:", selection),
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}
