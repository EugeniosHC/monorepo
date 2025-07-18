"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@eugenios/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@eugenios/ui/components/carousel";
import { Typography } from "@eugenios/ui/components/ui/Typography";

export default function ServicesSection() {
  // Estado para controlar responsividade
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  // Determina quantos itens devem ser visíveis por vez
  const getItemsPerView = useCallback(() => {
    if (isMobile) return 1; // Mobile: 1 item por vez
    if (isTablet) return 2; // Tablet: 2 itens por vez
    return 3; // Desktop: 3 itens por vez
  }, [isMobile, isTablet]);

  // Calcula o número de passos (páginas) com base no tamanho da tela
  const getPageCount = useCallback(() => {
    const itemsPerView = getItemsPerView();
    return Math.ceil(data.length / itemsPerView);
  }, [getItemsPerView]);

  // Gera um array com o número correto de páginas
  const getPages = useCallback(() => {
    return Array.from({ length: getPageCount() }, (_, i) => i);
  }, [getPageCount]);

  // Função customizada para avançar o carrossel pelo número correto de itens
  const handleNext = useCallback(() => {
    if (!api) return;
    const itemsPerView = getItemsPerView();
    const currentIndex = api.selectedScrollSnap();
    const nextIndex = Math.min(currentIndex + itemsPerView, data.length - itemsPerView);
    api.scrollTo(nextIndex);
  }, [api, getItemsPerView]);

  // Função customizada para retroceder o carrossel pelo número correto de itens
  const handlePrev = useCallback(() => {
    if (!api) return;
    const itemsPerView = getItemsPerView();
    const currentIndex = api.selectedScrollSnap();
    const prevIndex = Math.max(currentIndex - itemsPerView, 0);
    api.scrollTo(prevIndex);
  }, [api, getItemsPerView]);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    // Verificar tamanho inicial
    checkScreenSize();

    // Adicionar event listener para redimensionamento
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Acompanha o slide atual
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrent(Math.floor(api.selectedScrollSnap() / getItemsPerView()));
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, getItemsPerView]);

  // Função para ir para um grupo específico
  const scrollTo = useCallback(
    (pageIndex: number) => {
      if (!api) return;
      const itemsPerView = getItemsPerView();
      api.scrollTo(pageIndex * itemsPerView);
    },
    [api, getItemsPerView]
  );

  // Override da função de onNext e onPrevious
  const customCarouselSettings = {
    onNext: handleNext,
    onPrevious: handlePrev,
  };

  const data = [
    {
      category: "Serviços",
      title: "Piscina Interior",
      src: "/images/home/services/swimming-pool.jpg",
    },

    {
      category: "Serviços",
      title: "Estúdio Cycling",
      src: "/images/home/services/jacuzzi.jpg",
    },
    {
      category: "Serviços",
      title: "Banho Turco",
      src: "/images/home/services/turkish-bath.jpg",
    },
    {
      category: "Serviços",
      title: "Sala de Musculação",
      src: "/images/home/services/bodybuilding-hall.jpg",
    },
    {
      category: "Serviços",
      title: "Jacuzzi",
      src: "/images/home/services/jacuzzi.jpg",
    },
    {
      category: "Serviços",
      title: "Massagens",
      src: "/images/home/services/massage.png",
    },
    {
      category: "Serviços",
      title: "Aulas de Grupo",
      src: "/images/home/services/dance-studio.jpg",
    },
    {
      category: "Serviços",
      title: "Nutrição",
      src: "/images/home/services/nutrition.jpg",
    },
    {
      category: "Serviços",
      title: "Sauna",
      src: "/images/home/services/sauna.jpg",
    },
    {
      category: "Serviços",
      title: "Parque Privado",
      src: "/images/home/services/parking-lot.jpg",
    },
    {
      category: "Serviços",
      title: "Zona de Combate",
      src: "/images/home/services/pilates-studio.jpg",
    },
  ];

  return (
    <>
      <div className="mb-12 space-y-4">
        <Typography as="h2" variant="sectionTitle" className="font-semibold text-center text-neutral-800">
          Conheça os nossos serviços
        </Typography>
        <Typography as="p" variant="body" className="text-center">
          No Eugénios HC, oferecemos uma variedade de serviços para atender às suas necessidades.
        </Typography>
      </div>

      <div className="w-full relative">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="ml-1">
            {data.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-0">
                <div className="p-1">
                  <Card className="rounded-xl border-0 overflow-hidden">
                    <CardContent className="relative w-full aspect-square overflow-hidden p-0 group cursor-pointer">
                      {/* Imagem de fundo */}
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={600}
                        height={600}
                        className="object-cover rounded-xl w-full h-full transition-transform duration-300 group-hover:scale-110"
                        priority
                      />

                      {/* Overlay com gradiente para melhor legibilidade do texto */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-xl"></div>

                      {/* Conteúdo de texto */}
                      <div className="absolute bottom-0 left-0 p-6 text-left z-10">
                        <p className="text-white/80 text-md font-medium tracking-wider mb-1">{item.category}</p>
                        <h3 className="text-white text-xl md:text-2xl font-bold">{item.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navegação responsiva */}
          {isMobile ? (
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="flex justify-center gap-2">
                <CarouselPrevious onClick={handlePrev} className="static transform-none mx-1" />
                <CarouselNext onClick={handleNext} className="static transform-none mx-1" />
              </div>{" "}
              {/* Indicadores (bolinhas) - versão mobile */}
              <div className="flex gap-2 mt-2 justify-center">
                {getPages().map((index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      current === index ? "bg-primary" : "bg-gray-300"
                    }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Ir para grupo ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                <CarouselPrevious onClick={handlePrev} />
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                <CarouselNext onClick={handleNext} />
              </div>
              {/* Indicadores (bolinhas) para desktop */}
              <div className="flex gap-2 mt-6 justify-center">
                {getPages().map((index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      current === index ? "bg-primary" : "bg-gray-300"
                    }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Ir para grupo ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
      </div>
    </>
  );
}
