import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Calendar,
  Type,
  FileText,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Settings,
  Power,
  PowerOff,
} from "lucide-react";

import { Section, Highlight, Slide } from "@eugenios/types";
import { useRouter, usePathname } from "next/navigation";
type SortKey = keyof Section;
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

interface SectionsTableProps {
  data?: Section[] | null;
  isLoading?: boolean;
  error?: Error | null;
}

export default function SectionsTable({ data: initialData, isLoading, error }: SectionsTableProps) {
  const [data, setData] = useState<Section[]>(initialData || []);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  // Update data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seções...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar seções</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Update current time only on client side to prevent hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("pt-PT"));

    // Optional: Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("pt-PT"));
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  // Funções de ação
  const handleEdit = (item: Section) => {
    console.log("Editar:", item);
    // Aqui você implementaria a lógica de edição
    alert(`Editar: ${item.title}`);
  };
  const handleDuplicate = (item: Section) => {
    const newItem: Section = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      title: `${item.title} (Cópia)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => [...(prev || []), newItem]);
    console.log("Duplicado:", newItem);
  };
  const handleDelete = (item: Section) => {
    if (confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
      setData((prev) => (prev || []).filter((d) => d.id !== item.id));
      console.log("Excluído:", item);
    }
  };
  const handleToggleStatus = (item: Section) => {
    setData((prev) => {
      const prevData = prev || [];

      // Se estamos ativando uma seção, primeiro desativamos todas do mesmo tipo
      if (!item.isActive) {
        return prevData.map((d) => {
          if (d.type === item.type && d.id !== item.id) {
            // Desativar outras seções do mesmo tipo
            return { ...d, isActive: false, updatedAt: new Date().toISOString() };
          } else if (d.id === item.id) {
            // Ativar a seção atual
            return { ...d, isActive: true, updatedAt: new Date().toISOString() };
          }
          return d;
        });
      } else {
        // Se estamos desativando, apenas desativamos a seção atual
        return prevData.map((d) =>
          d.id === item.id ? { ...d, isActive: false, updatedAt: new Date().toISOString() } : d
        );
      }
    });
  };
  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedRows.size} item(s)?`)) {
      setData((prev) => (prev || []).filter((d) => !selectedRows.has(d.id)));
      setSelectedRows(new Set());
    }
  };
  const handleBulkToggleStatus = (status: boolean) => {
    if (selectedRows.size === 0) return;

    setData((prev) => {
      const prevData = prev || [];

      if (status) {
        // Se estamos ativando seções, precisamos garantir que apenas uma de cada tipo fique ativa
        const selectedSections = prevData.filter((d) => selectedRows.has(d.id));
        const typeGroups = new Map<string, Section[]>();

        // Agrupar seções selecionadas por tipo
        selectedSections.forEach((section) => {
          if (!typeGroups.has(section.type)) {
            typeGroups.set(section.type, []);
          }
          typeGroups.get(section.type)!.push(section);
        });

        return prevData.map((d) => {
          if (selectedRows.has(d.id)) {
            // Verificar se esta seção deve ser ativada
            const sectionsOfSameType = typeGroups.get(d.type) || [];
            // Ativar apenas a primeira seção de cada tipo (pode ajustar para outro critério)
            const shouldActivate = sectionsOfSameType[0]?.id === d.id;
            return { ...d, isActive: shouldActivate, updatedAt: new Date().toISOString() };
          } else if (status) {
            // Desativar outras seções dos mesmos tipos que estão sendo ativados
            const typesToActivate = Array.from(typeGroups.keys());
            if (typesToActivate.includes(d.type)) {
              return { ...d, isActive: false, updatedAt: new Date().toISOString() };
            }
          }
          return d;
        });
      } else {
        // Se estamos desativando, apenas desativamos as selecionadas
        return prevData.map((d) =>
          selectedRows.has(d.id) ? { ...d, isActive: false, updatedAt: new Date().toISOString() } : d
        );
      }
    });

    setSelectedRows(new Set());
  };
  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map((item) => item.id)));
    }
  }; // Função para ordenação
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  // Dados filtrados e ordenados
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filteredData = [...data];

    // Filtrar por busca
    if (searchTerm) {
      filteredData = filteredData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType !== "ALL") {
      filteredData = filteredData.filter((item) => item.type === filterType);
    }

    // Filtrar por status
    if (filterStatus !== "ALL") {
      const isActive = filterStatus === "ACTIVE";
      filteredData = filteredData.filter((item) => item.isActive === isActive);
    } // Ordenar
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const key = sortConfig.key!; // Non-null assertion since we checked above
        let aValue: any = a[key];
        let bValue: any = b[key];

        if (key === "createdAt" || key === "updatedAt") {
          aValue = new Date(aValue as string);
          bValue = new Date(bValue as string);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, sortConfig, filterType, filterStatus, searchTerm]);

  // Toggle expandir linha
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Renderizar dados específicos por tipo
  const renderTypeSpecificData = (item: Section) => {
    switch (item.type) {
      case "HERO":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Slides ({item.data.slides?.length || 0})
            </h4>
            <div className="grid gap-4">
              {item.data.slides?.map((slide: Slide, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Slide {index + 1}
                    </span>
                    {slide.buttonIsVisible && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Com Botão
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong className="text-gray-700">Título:</strong>{" "}
                      <span className="text-gray-900">{slide.title}</span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Subtítulo:</strong>{" "}
                      <span className="text-gray-900">{slide.subtitle}</span>
                    </div>
                    {slide.buttonText && (
                      <>
                        <div>
                          <strong className="text-gray-700">Texto do Botão:</strong>{" "}
                          <span className="text-gray-900">{slide.buttonText}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">URL:</strong>{" "}
                          <span className="text-blue-600 break-all">{slide.buttonUrl}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "MARQUEE":
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Highlights ({item.data.highlights?.length || 0})
            </h4>
            <div className="grid gap-3">
              {item.data.highlights?.map((highlight: Highlight, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong className="text-gray-700">Ícone:</strong>{" "}
                          <span className="text-gray-900">{highlight.icon}</span>
                        </div>
                        <div>
                          <strong className="text-gray-700">Biblioteca:</strong>{" "}
                          <span className="text-gray-900">{highlight.iconLibrary}</span>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-gray-700">Descrição:</strong>{" "}
                          <span className="text-gray-900">{highlight.description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-gray-500 italic bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            Tipo de dados não reconhecido: <strong>{item.type}</strong>
          </div>
        );
    }
  };

  // Formatear data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Obter tipos únicos
  const uniqueTypes = data && Array.isArray(data) ? [...new Set(data.map((item) => item.type))] : [];

  return (
    <div className="w-full mx-auto p-6 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header Melhorado */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Seções</h2>
              <p className="text-gray-600">Gerencie todas as seções do seu website</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`${pathname}/create`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                Nova Seção
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
                  showFilters ? "bg-gray-200 text-gray-700" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                <Filter size={16} />
                Filtros
              </button>
            </div>
          </div>

          {/* Barra de Busca e Ações em Massa */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ações em Massa */}
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">{selectedRows.size} selecionado(s)</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleBulkToggleStatus(true)}
                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                    title="Ativar selecionados"
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => handleBulkToggleStatus(false)}
                    className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-sm transition-colors"
                    title="Desativar selecionados"
                  >
                    <PowerOff size={14} />
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
                    title="Excluir selecionados"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Seção</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Todos os tipos</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Todos os status</option>
                    <option value="ACTIVE">Ativos</option>
                    <option value="INACTIVE">Inativos</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterType("ALL");
                      setFilterStatus("ALL");
                      setSearchTerm("");
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabela Melhorada */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="w-12 px-6 py-4 text-left"></th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center space-x-2">
                    <Type size={14} />
                    <span>Título</span>
                    {sortConfig.key === "title" &&
                      (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FileText size={14} />
                    <span>Descrição</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Tipo</span>
                    {sortConfig.key === "type" &&
                      (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>Criado</span>
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {processedData.map((item, index) => (
                <React.Fragment key={item.id}>
                  <tr className={`hover:bg-gray-50 transition-colors ${selectedRows.has(item.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(item.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 rounded hover:bg-gray-100"
                      >
                        {expandedRows.has(item.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {item.id.split("-")[0]}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          item.type === "HERO"
                            ? "bg-blue-100 text-blue-800"
                            : item.type === "MARQUEE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            item.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {item.isActive ? (
                            <>
                              <Eye size={14} />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} />
                              <span>Inativo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{formatDate(item.createdAt)}</div>
                      {item.updatedAt !== item.createdAt && (
                        <div className="text-xs text-gray-400">Atualizado: {formatDate(item.updatedAt)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Duplicar"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Mais opções"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(item.id) && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100"
                      >
                        <div className="max-w-6xl">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h5 className="font-semibold text-gray-800 mb-3">Informações Gerais</h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>ID:</strong>{" "}
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{item.id}</span>
                                </div>
                                <div>
                                  <strong>Website ID:</strong> {item.websiteId}
                                </div>
                                <div>
                                  <strong>Última Atualização:</strong> {formatDate(item.updatedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="lg:col-span-2">{renderTypeSpecificData(item)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {processedData.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
                ? "Tente ajustar os filtros ou termo de busca."
                : "Comece criando sua primeira seção."}
            </p>
            <button
              onClick={() => router.push(`${pathname}/create`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all duration-200"
            >
              <Plus size={16} />
              Criar Nova Seção
            </button>
          </div>
        )}

        {/* Footer Melhorado */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {" "}
            <div className="text-sm text-gray-600">
              Mostrando <strong>{processedData.length}</strong> de <strong>{data?.length || 0}</strong> registos
              {selectedRows.size > 0 && (
                <span className="ml-2 text-blue-600">
                  • <strong>{selectedRows.size}</strong> selecionado(s)
                </span>
              )}
            </div>{" "}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Settings size={14} />
              <span>Última atualização: {currentTime || "--:--:--"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
