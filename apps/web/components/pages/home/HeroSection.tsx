"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ScrollButton } from "@eugenios/ui/components/scroll-button";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";

const slides = [
  {
    id: 1,
    image: "/images/home/hero-1.jpg",
    alt: "Eugénios Health Club - Área de treino premium",
  },
  {
    id: 2,
    image: "/images/home/hero-2.jpg",
    alt: "Eugénios Health Club - Piscina exclusiva",
  },
  {
    id: 3,
    image: "/images/home/hero-3.jpg",
    alt: "Eugénios Health Club - Aulas exclusivas",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [current]);

  return (
    <section className="relative h-[100svh]">
      <div className="relative h-full w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out  ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/100 to-black/40" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center">
        <div className="container">
          <div className="flex flex-col gap-2 sm:gap-8 max-w-4xl text-white text-center md:text-left mx-auto md:mx-0 items-center md:items-start">
            <div
              className="w-fit mx-auto md:mx-0 rounded-lg animate-fadeIn md:px-2"
              style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
            >
              <Typography
                as="h3"
                variant="heroSubtitle"
                className="font-barlow font-extralight uppercase racking-widest[transform:scaleY(1.2)] m-0"
              >
                7 dias grátis
              </Typography>
            </div>
            <div className="opacity-0 animate-fadeIn" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
              <div className="[transform:scaleY(1.4)] mt-4 mb-6">
                <Typography as="h1" variant="hero" className="font-barlow uppercase font-extralight tracking-tighter">
                  Os melhores
                  <br />
                  Treinam Juntos{" "}
                </Typography>
              </div>
            </div>{" "}
            <CustomButton
              variant="white"
              className="ml-2 flex items-center justify-center w-fit mb-16 md:mb-0 group opacity-0 animate-fadeIn shadow-lg hover:shadow-xl transition-all duration-300 leading-none"
              style={{ animationDelay: "1.1s", animationFillMode: "forwards", lineHeight: "1" }}
            >
              <span className="text-sm sm:text-base font-semibold inline-flex items-center leading-none">
                SABER MAIS
              </span>
              <ChevronRight
                aria-hidden="true"
                className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
              />
            </CustomButton>
          </div>
        </div>
      </div>
      {/* Tentativa de correção: usando flex para centralizar perfeitamente */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center items-center pointer-events-none">
        <div className="pointer-events-auto">
          <ScrollButton />
        </div>
      </div>
    </section>
  );
}
