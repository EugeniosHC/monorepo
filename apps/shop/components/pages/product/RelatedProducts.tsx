import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { CategoryWithMinPrice } from "@eugenios/types";

interface RelatedProductsProps {
  categories: CategoryWithMinPrice[];
  title?: string;
}

export default function RelatedProducts({ categories, title = "TAMBÉM PODERÁ GOSTAR" }: RelatedProductsProps) {
  const isCarousel = categories.length > 4;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Altura fixa para os cards
  const cardHeight = 380; // pixels

  // Função para rolar o carrossel
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300; // Quantidade de pixels para rolar de cada vez
    const scrollLeft = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  };

  // Verificar visibilidade das setas quando há rolagem
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Mostrar seta esquerda quando não estiver no início
    setShowLeftArrow(container.scrollLeft > 0);

    // Mostrar seta direita quando não estiver no fim
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
    setShowRightArrow(!isAtEnd);
  };

  // Verificar a necessidade das setas ao carregar e redimensionar
  useEffect(() => {
    if (isCarousel) {
      const container = scrollContainerRef.current;
      if (container) {
        // Verificar se o conteúdo é maior que o container
        const needsScrolling = container.scrollWidth > container.clientWidth;
        setShowRightArrow(needsScrolling);
      }

      // Adicionar listener para verificar setas durante rolagem
      scrollContainerRef.current?.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);

      return () => {
        scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [isCarousel]);

  return (
    <>
      <div className="text-center mb-12">
        <h3 className="font-bold tracking-tight">{title}</h3>
        <div className="mt-3 mx-auto w-12 h-1 bg-primary"></div>
      </div>

      <div className="relative">
        {isCarousel && showLeftArrow && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => scroll("left")}
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {isCarousel && showRightArrow && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => scroll("right")}
            aria-label="Rolar para direita"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className={`${isCarousel ? "flex overflow-x-auto gap-6 scrollbar-hide pb-4" : "grid gap-6 justify-center"} ${
            categories.length === 2
              ? "grid-cols-2"
              : categories.length === 3
                ? "grid-cols-3"
                : isCarousel
                  ? "space-x-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          } ${isCarousel ? "" : "auto-rows-fr"}`}
          style={{ minHeight: isCarousel ? `${cardHeight}px` : "auto" }}
        >
          {categories.map((category) => (
            <Link
              href={`/produtos/${category.slug}`}
              key={category.id}
              className={`group min-w-[250px] max-w-sm flex-shrink-0 ${isCarousel ? "" : "w-full"} h-full flex`}
              style={{ height: `${cardHeight}px` }}
            >
              <div className="border rounded-lg overflow-hidden transition-all group-hover:shadow-md h-full flex flex-col w-full">
                <div className="aspect-square relative overflow-hidden w-full">
                  <Image
                    src={category.imageUrl || "/placeholder.svg?height=300&width=300"}
                    alt={category.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <h5 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h5>
                  <p className="text-sm font-bold">A partir de {category.minPrice}€</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
