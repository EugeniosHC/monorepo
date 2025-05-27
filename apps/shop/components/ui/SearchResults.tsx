"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";
import type { SearchData } from "@eugenios/types";

interface SearchResultsProps {
  searchResults: SearchData;
  onResultClick: () => void;
  isDesktop?: boolean;
  hasHeaderBackground?: boolean;
  searchQuery?: string;
}

export function SearchResults({
  searchResults,
  onResultClick,
  isDesktop = false,
  hasHeaderBackground = false,
  searchQuery = "",
}: SearchResultsProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const containerClasses = hasHeaderBackground
    ? "bg-white border border-neutral-200 shadow-lg"
    : "bg-black/90 backdrop-blur-sm border border-neutral-800 shadow-xl";

  const itemHoverClasses = hasHeaderBackground ? "hover:bg-neutral-50" : "hover:bg-neutral-800/50";

  const textColorClasses = hasHeaderBackground ? "text-neutral-800" : "text-white";

  const secondaryTextClasses = hasHeaderBackground ? "text-neutral-500" : "text-neutral-400";

  const imageContainerClasses = hasHeaderBackground ? "bg-neutral-100" : "bg-neutral-800";

  const emptyStateClasses = hasHeaderBackground ? "text-neutral-600" : "text-neutral-400";

  // Verifica se a consulta tem menos de 3 caracteres
  const isQueryTooShort = searchQuery.length > 0 && searchQuery.length < 3;

  return (
    <div
      className={`absolute top-full left-0 mt-2 w-full rounded-md z-50 overflow-hidden ${containerClasses}`}
      style={{ maxHeight: "min(70vh, 450px)" }}
    >
      {/* Header do resultado */}
      <div
        className="sticky top-0 flex items-center justify-between p-3 border-b border-opacity-20 backdrop-blur-sm z-10"
        style={{
          borderColor: hasHeaderBackground ? "#e5e5e5" : "#333333",
          background: hasHeaderBackground ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${textColorClasses}`}>
            {isQueryTooShort
              ? "Digite pelo menos 3 caracteres"
              : searchResults && searchResults.found && searchResults.products
                ? `${searchResults.products.length} resultados encontrados`
                : "Pesquisa"}
          </span>
        </div>
        <button
          onClick={onResultClick}
          className={`p-1 rounded-full hover:bg-opacity-10 ${
            hasHeaderBackground ? "hover:bg-neutral-200" : "hover:bg-white"
          }`}
        ></button>
      </div>

      {/* Conteúdo dos resultados */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(min(70vh, 450px) - 48px)" }}>
        {isQueryTooShort ? (
          <div className="p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
              style={{ background: hasHeaderBackground ? "#f5f5f5" : "#222" }}
            >
              <Search className={`w-6 h-6 ${emptyStateClasses}`} />
            </div>
            <p className={`font-medium ${textColorClasses}`}>Pesquisa muito curta</p>
            <p className={`text-sm mt-1 ${secondaryTextClasses}`}>Digite pelo menos 3 caracteres para pesquisar</p>
          </div>
        ) : searchResults && searchResults.found && searchResults.products && searchResults.products.length > 0 ? (
          <div className="grid gap-1 p-2">
            {searchResults.products.map((product) => (
              <Link
                key={product.id}
                href={`/produtos/${product.slug}`}
                className={`cursor-pointer block rounded-md transition-all duration-200 ${itemHoverClasses}`}
                onClick={onResultClick}
                onMouseEnter={() => setHoveredItem(product.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-3 p-2">
                  <div
                    className={`h-16 w-16 flex-shrink-0 rounded-md flex items-center justify-center overflow-hidden transition-transform duration-200 ${imageContainerClasses}`}
                    style={{
                      transform: hoveredItem === product.id ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <Image
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <p
                      className={`font-medium ${textColorClasses} transition-all duration-200`}
                      style={{
                        transform: hoveredItem === product.id ? "translateX(3px)" : "translateX(0)",
                      }}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`${hasHeaderBackground ? ` text-primary` : `text-secondary`}  font-medium`}>
                        {product.price.toFixed(2)}€
                      </p>
                      {product.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            hasHeaderBackground ? "bg-neutral-100" : "bg-neutral-800"
                          } ${secondaryTextClasses}`}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
              style={{ background: hasHeaderBackground ? "#f5f5f5" : "#222" }}
            >
              <Search className={`w-6 h-6 ${emptyStateClasses}`} />
            </div>
            <p className={`font-medium ${textColorClasses}`}>Nenhum resultado encontrado</p>
            <p className={`text-sm mt-1 ${secondaryTextClasses}`}>Tente outra palavra-chave</p>
          </div>
        )}
      </div>

      {/* Rodapé opcional para muitos resultados */}
      {!isQueryTooShort && searchResults.found && searchResults.products && searchResults.products.length >= 4 && (
        <div
          className="p-2 text-center border-t border-opacity-20"
          style={{
            borderColor: hasHeaderBackground ? "#e5e5e5" : "#333333",
            background: hasHeaderBackground ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.8)",
          }}
        >
          <Link
            href="/pesquisa"
            className={`text-xs font-medium ${
              hasHeaderBackground ? "text-primary" : "text-primary-light"
            } hover:underline`}
            onClick={onResultClick}
          >
            Ver todos os resultados
          </Link>
        </div>
      )}
    </div>
  );
}
