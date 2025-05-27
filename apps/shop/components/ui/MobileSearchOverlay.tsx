"use client";

import Image from "next/image";
import { Button } from "@eugenios/ui/components/button";

interface MobileSearchOverlayProps {
  hasHeaderBackground: boolean;
  searchResults: { found: boolean; items?: any[] };
  searchQuery: string;
  onResultClick: () => void;
}

export function MobileSearchOverlay({
  hasHeaderBackground,
  searchResults,
  searchQuery,
  onResultClick,
}: MobileSearchOverlayProps) {
  return (
    <div
      className="fixed top-[5rem] left-0 w-full h-[calc(100vh-5rem)] z-40 overflow-y-auto shadow-lg"
      style={{
        backgroundColor: hasHeaderBackground ? "rgba(255, 255, 255, 0.9)" : "rgba(26, 32, 44, 0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container py-4">
        {searchResults.found ? (
          // Exibe resultados da busca
          searchResults.items?.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer hover:bg-neutral-100 p-3 rounded-md transition-colors"
              onClick={() => {
                onResultClick();
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-neutral-200 h-12 w-12 flex-shrink-0 rounded flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.image || "/api/placeholder/48/48"}
                    alt={item.name}
                    width={48}
                    height={48}
                    objectFit="cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                  <p className="text-sm text-primary font-medium">{item.price}</p>
                </div>
              </div>
            </div>
          ))
        ) : searchQuery ? (
          // Mensagem "sem resultados" quando tem query mas não encontrou nada
          <div className="p-6 text-center text-neutral-600">
            <p className="font-medium">Nenhum resultado encontrado</p>
            <p className="text-sm mt-1">Tente outra palavra-chave</p>
          </div>
        ) : (
          // Mensagem "digite para pesquisar" quando a busca está ativa mas sem query
          <div className="p-6 text-center text-neutral-600">
            <p className="font-medium">Digite para pesquisar</p>
            <p className="text-sm mt-1">Experimente: "treino" ou "nutrição"</p>
          </div>
        )}
      </div>

      {/* Botão "Ver todos os resultados" */}
      {searchResults.found && (
        <div className="p-3 border-t text-center bg-white/70 backdrop-blur-sm">
          <Button variant="link" className="text-primary font-medium">
            Ver todos os resultados
          </Button>
        </div>
      )}
    </div>
  );
}
