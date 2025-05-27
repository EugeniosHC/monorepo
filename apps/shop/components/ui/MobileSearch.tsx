"use client";

import { useCallback } from "react";
import { Input } from "@eugenios/ui/components/input";
import { Button } from "@eugenios/ui/components/button";
import { Search, X } from "lucide-react";

interface MobileSearchProps {
  hasHeaderBackground: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: { found: boolean; items?: any[] }) => void;
  onClose: () => void;
}

export function MobileSearch({
  hasHeaderBackground,
  searchQuery,
  setSearchQuery,
  setSearchResults,
  onClose,
}: MobileSearchProps) {
  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          performSearch(query);
        }, 300);
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Perform search logic
  const performSearch = (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults({ found: false });
      return;
    }

    const queryLower = query.toLowerCase();

    if (queryLower.includes("treino") || queryLower.includes("fitness")) {
      setSearchResults({
        found: true,
        items: [
          { id: 1, name: "Programa de Treino Avançado", price: "89.99€", image: "/placeholder.jpg" },
          { id: 2, name: "Aulas de Fitness Online", price: "49.99€", image: "/placeholder.jpg" },
          { id: 3, name: "Personal Trainer (10 sessões)", price: "249.99€", image: "/placeholder.jpg" },
        ],
      });
    } else if (queryLower.includes("nutri") || queryLower.includes("alimenta")) {
      setSearchResults({
        found: true,
        items: [
          { id: 4, name: "Plano Nutricional Personalizado", price: "79.99€", image: "/placeholder.jpg" },
          { id: 5, name: "Suplementos Nutricionais", price: "39.99€", image: "/placeholder.jpg" },
        ],
      });
    } else {
      setSearchResults({ found: false });
    }
  };

  return (
    <div
      className={`flex md:hidden items-center w-full h-full absolute top-0 left-0 z-10 pr-4 ${
        hasHeaderBackground ? "bg-white/90 backdrop-blur-lg" : "bg-blue-900/90 backdrop-blur-lg"
      }`}
    >
      {/* Botão fechar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Fechar pesquisa"
        className={`flex-shrink-0 ml-2 ${hasHeaderBackground ? "text-neutral-700" : "text-white"} hover:opacity-80`}
      >
        <X size={24} />
      </Button>

      {/* Input de busca */}
      <div className="relative flex-grow flex items-center ml-2">
        <Search size={18} className={`absolute left-3 ${hasHeaderBackground ? "text-neutral-500" : "text-gray-300"}`} />
        <Input
          type="text"
          placeholder="Pesquisar produtos..."
          className={`pl-10 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0
            ${
              hasHeaderBackground
                ? "bg-transparent text-neutral-800 placeholder:text-neutral-500"
                : "bg-transparent text-white placeholder:text-gray-300"
            }`}
          autoFocus
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>
    </div>
  );
}
