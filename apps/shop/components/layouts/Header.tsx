"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { MobileSearch } from "@/components/ui/MobileSearch";
import { DesktopSearch } from "@/components/ui/DesktopSearch";
import { CartButton } from "@/components/ui/CartButton";
import { SearchResults } from "@/components/ui/SearchResults";
import { MobileSearchOverlay } from "@/components/ui/MobileSearchOverlay";
import { Search } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<{ found: boolean; items?: any[] }>({ found: false });
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Verifica se está na página inicial ou loja
  const isHomePage = pathname === "/" || pathname === "/home";

  // Determina se o header deve ter fundo
  const hasHeaderBackground = isScrolled || !isHomePage;

  // Detecta scroll da página
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll(); // Verifica posição inicial
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determina visibilidade do overlay de resultados mobile
  const isOverlayVisible = isMobileSearchActive && (searchQuery || searchResults.found === false);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        hasHeaderBackground ? "bg-white/90 backdrop-blur-lg shadow-md" : ""
      } `}
    >
      {/* Container principal */}
      <div className="container flex min-h-20 items-center justify-between relative">
        {/* Logo */}
        <Logo hasHeaderBackground={hasHeaderBackground} isMobileSearchActive={isMobileSearchActive} />

        {/* Busca mobile (quando ativa) */}
        {isMobileSearchActive && (
          <MobileSearch
            hasHeaderBackground={hasHeaderBackground}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSearchResults={setSearchResults}
            onClose={() => {
              setIsMobileSearchActive(false);
              setSearchQuery("");
              setSearchResults({ found: false });
            }}
          />
        )}

        {/* Container de busca e carrinho */}
        <div className="flex items-center gap-4">
          {/* Botão de busca mobile (quando inativa) */}
          {!isMobileSearchActive && (
            <button
              className={`flex md:hidden p-2 ${
                hasHeaderBackground ? "text-neutral-700" : "text-white"
              } hover:text-primary transition-colors focus:outline-none`}
              aria-label="Abrir pesquisa"
              onClick={() => setIsMobileSearchActive(true)}
            >
              <Search size={20} />
            </button>
          )}

          {/* Busca desktop */}
          <DesktopSearch hasHeaderBackground={hasHeaderBackground} />

          {/* Botão do carrinho */}
          <CartButton hasHeaderBackground={hasHeaderBackground} />
        </div>
      </div>

      {/* Overlay de resultados da busca mobile */}
      {isOverlayVisible && (
        <MobileSearchOverlay
          hasHeaderBackground={hasHeaderBackground}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onResultClick={() => {
            setIsMobileSearchActive(false);
            setSearchQuery("");
            setSearchResults({ found: false });
          }}
        />
      )}
    </header>
  );
}
