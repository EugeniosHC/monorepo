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
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<{ found: boolean; items?: any[] }>({ found: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Verifica se está na página inicial ou loja
  const isHomePage = pathname === "/" || pathname === "/home";

  // Determina se o header deve ter fundo
  const hasHeaderBackground = isScrolled || !isHomePage;
  // Detecta scroll da página e direção do scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determina se scrolled (para mudar o estilo)
      setIsScrolled(currentScrollY > 50);

      // Lógica para mostrar/esconder o header baseado na direção do scroll
      if (currentScrollY > lastScrollY) {
        // Scroll para baixo - esconde o header (exceto no topo da página)
        if (currentScrollY > 200) {
          setIsScrollingDown(true);
        }
      } else {
        // Scroll para cima - mostra o header
        setIsScrollingDown(false);
      }

      // Atualiza a última posição de scroll
      lastScrollY = currentScrollY;
    };

    // Check scroll position on initial render
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Determina visibilidade do overlay de resultados mobile
  const isOverlayVisible = isMobileSearchActive && (searchQuery || searchResults.found === false);
  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        hasHeaderBackground ? "bg-white/90 backdrop-blur-lg shadow-md" : ""
      } ${isScrollingDown ? "-translate-y-full" : "translate-y-0"} ${isMobileSearchActive ? "!translate-y-0" : ""}`}
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
