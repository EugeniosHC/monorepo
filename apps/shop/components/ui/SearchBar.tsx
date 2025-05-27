"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@eugenios/ui/components/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@eugenios/ui/hooks/use-debounce";
import { useProductsBySearch } from "@eugenios/react-query/src/queries/useProducts";

import { SearchResults } from "./SearchResults";

interface SearchBarProps {
  hasHeaderBackground: boolean;
}

export function SearchBar({ hasHeaderBackground }: SearchBarProps) {
  // Local state for search query
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // **1. Referência para o container da pesquisa**
  const searchRef = useRef<HTMLDivElement>(null);
  // **2. Referência para o input (para focar imperativamente)**
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query first
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Then use the debounced query for the API call
  // Adicionado condição para só buscar se houver query e a pesquisa estiver aberta
  const { data: searchResults, error } = useProductsBySearch(
    isSearchOpen ? debouncedSearchQuery : "" // Só busca se estiver aberto
  );

  // **3. Effect para focar o input quando a pesquisa abre**
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Usa um pequeno timeout para garantir que o elemento está visível
      // antes de tentar focar, especialmente com transições.
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Ajusta o tempo se necessário

      return () => clearTimeout(timer); // Limpa o timeout se isSearchOpen mudar
    }
  }, [isSearchOpen]); // Roda este effect quando isSearchOpen muda

  // **4. Effect para fechar a pesquisa ao clicar fora**
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Verifica se o clique foi fora do container da pesquisa
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        // Opcionalmente, limpa a query ao fechar por clique externo
        // setSearchQuery("");
      }
    };

    // Adiciona o event listener no documento quando a pesquisa está aberta
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    // Limpa o event listener quando a pesquisa fecha ou o componente é desmontado
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isSearchOpen]); // Roda este effect quando isSearchOpen muda

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Opcionalmente, abre a pesquisa automaticamente quando o utilizador começa a digitar
    if (!isSearchOpen && query.length > 0) {
      setIsSearchOpen(true);
    }
  };

  // Handle search submit (prevent default form submission)
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // A query correrá automaticamente graças ao valor debounced e React Query
    // Aqui poderias adicionar lógica para navegar para uma página de resultados completa se necessário
  };

  // Clear search input and close results
  const clearSearch = () => {
    setSearchQuery("");
    // Não precisamos explicitamente limpar searchResults aqui,
    // pois o useProductsBySearch com debouncedQuery vazio cuidará disso.
  };

  return (
    // **Liga a referência ao container principal da pesquisa**
    <div className="flex relative items-center" ref={searchRef}>
      <div className="flex items-center">
        <button
          className={`relative p-2 rounded-full overflow-hidden group focus:outline-none`}
          aria-label="Abrir pesquisa"
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            // Se estiver a abrir, limpa a query anterior para um novo início
            if (!isSearchOpen) {
              setSearchQuery("");
            }
          }}
        >
          {/* Animated background circle */}
          <span
            className="absolute inset-0 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"
            aria-hidden="true"
          />
          {/* Icon */}
          <Search
            size={20}
            className={`relative z-10 transition-colors duration-300 group-hover:text-white ${
              hasHeaderBackground ? "text-neutral-700" : "text-white"
            }`}
          />
        </button>

        {/* Expandable search input */}
        <div
          className={`overflow-hidden transition-all duration-300 flex items-center ${
            isSearchOpen ? "w-96 opacity-100 ml-2" : "w-0 opacity-0 ml-0" // Adicionado margem para espaçamento
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative flex items-center">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  className={`w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pb-1 ${
                    hasHeaderBackground
                      ? "bg-transparent text-neutral-800"
                      : "bg-transparent text-white placeholder:text-gray-300"
                  }`}
                  // Remove autoFocus, vamos usar o ref para focar imperativamente
                  // autoFocus={isSearchOpen}
                  // **Liga a referência ao input**
                  ref={inputRef}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  // Adiciona tabindex="-1" para prevenir que o input receba foco por default
                  // antes do nosso effect de foco
                  tabIndex={isSearchOpen ? 0 : -1}
                />
                {/* Animated line below input */}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-primary transform transition-transform duration-300 ${
                    isSearchOpen ? "scale-x-100" : "scale-x-0"
                  } origin-left w-full`}
                  aria-hidden="true"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  className={`absolute right-2 ${
                    hasHeaderBackground ? "text-neutral-500" : "text-gray-300"
                  } hover:text-primary`}
                  onClick={clearSearch}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>{" "}
      {/* Search results dropdown */}
      {/* Renderiza SearchResults APENAS se a pesquisa estiver aberta E houver uma query */}
      {isSearchOpen && searchQuery && (
        <SearchResults
          searchResults={searchResults || { found: false }}
          onResultClick={() => {
            setIsSearchOpen(false);
            clearSearch(); // Limpa a query e fecha os resultados quando um resultado é clicado
          }}
          isDesktop={true}
          hasHeaderBackground={hasHeaderBackground}
          searchQuery={searchQuery} // Passa a query para o componente de resultados
        />
      )}
    </div>
  );
}
