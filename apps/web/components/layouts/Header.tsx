"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@eugenios/ui/components/button";
import { AdesaoModal } from "@/components/adesao-modal";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@eugenios/ui/components/sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Verifica se está na página inicial
  const isHomePage = pathname === "/" || pathname === "/home";
  const isLojaPage = pathname === "/loja";

  const isHomeOrLojaPage = isHomePage || isLojaPage;
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
          setIsVisible(false);
        }
      } else {
        // Scroll para cima - mostra o header
        setIsVisible(true);
      }

      // Atualiza a última posição de scroll
      lastScrollY = currentScrollY;
    };

    // Check scroll position on initial render
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to handle smooth scrolling
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only apply for anchor links (that start with #)
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        setIsMenuOpen(false);

        window.scrollTo({
          top: targetElement.offsetTop, // Offset to account for header height
          behavior: "smooth",
        });
      }
    }
  };
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`relative text-sm font-medium tracking-wider ${
        isScrolled || !isHomeOrLojaPage ? "text-neutral-700 hover:text-neutral-900" : "text-white/90 hover:text-white"
      } transition-colors group`}
      onClick={(e) => handleSmoothScroll(e, href)}
    >
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );

  const navLinks = [
    { href: "/#sobre-nos", label: "SOBRE NÓS" },
    { href: "/#servicos", label: "SERVIÇOS" },
    { href: "/aulas", label: "AULAS DE GRUPO" },
    { href: "/#recrutamento", label: "RECRUTAMENTO" },
    { href: "/#contactos", label: "CONTACTOS" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
          isScrolled || !isHomeOrLojaPage ? "bg-white/90 backdrop-blur-lg shadow-md" : ""
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="container flex min-h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 py-4">
            <Image
              src={isScrolled || !isHomeOrLojaPage ? "/images/logos/blue.svg" : "/images/logos/white.svg"}
              alt="Eugénios HC Logo"
              width={50}
              height={50}
              priority
              className="transition-transform duration-300"
            />
            {/* 
              <span
        className={`font-medium text-xl tracking-wider ${
          isScrolled ? "text-neutral-800" : "text-white"
        } hidden sm:inline-block`}
        >
        EUGÉNIOS<span className="font-semibold"> HC</span>
        </span>
        */}
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Botão de adesão visível em todos os dispositivos */}
          <div className="flex items-center gap-4">
            <CustomButton
              variant="primary"
              className={`hidden sm:flex ${isScrolled || !isHomeOrLojaPage ? "bg-primary text-white" : "bg-primary text-white hover:text-white hover:border-white"}`}
              onClick={() => setIsModalOpen(true)}
            >
              Adesão
            </CustomButton>

            {/* Menu Mobile - Ícone maior */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={`md:hidden p-3 h-14 w-14 flex items-center justify-center ${
                    isScrolled || !isHomeOrLojaPage ? "text-neutral-800" : "text-white"
                  }`}
                >
                  <Menu size={44} strokeWidth={2.5} />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                <div className="flex flex-col h-full bg-white">
                  <div className="flex justify-between items-center p-4 border-b">
                    <span className="font-medium text-xl tracking-wider text-neutral-800 text-center w-full">
                      EUGÉNIOS HC
                    </span>
                  </div>

                  <nav className="flex flex-col p-6 space-y-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-base font-medium tracking-wider text-neutral-800"
                        onClick={(e) =>
                          link.href.startsWith("#") ? handleSmoothScroll(e, link.href) : setIsMenuOpen(false)
                        }
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto p-6 border-t">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-semibold"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsModalOpen(true);
                      }}
                    >
                      ADESÃO
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <AdesaoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
