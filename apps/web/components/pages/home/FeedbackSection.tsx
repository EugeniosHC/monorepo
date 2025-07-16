"use client";

import Image from "next/image";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Typography } from "@eugenios/ui/components/ui/Typography";

const testimonials = [
  {
    name: "Ana Rodrigues",
    quote:
      "Frequento o Eugénios HC há 3 anos e os resultados são visíveis. Os personal trainers são extremamente qualificados e acompanham de perto a evolução de cada aluno. As instalações são impecáveis e sempre limpas!",
    rating: 5,
  },
  {
    name: "Miguel Costa",
    quote:
      "A piscina é o meu espaço favorito! As aulas de hidroginástica ajudaram-me a recuperar de uma lesão no joelho que tinha há anos. Recomendo especialmente para quem procura reabilitação física.",
    rating: 5,
  },
  {
    name: "Sofia Martins",
    quote:
      "As aulas de grupo são fantásticas, especialmente o cycling e o HIIT. Os instrutores são motivadores e adaptam os exercícios para todos os níveis. Sinto-me sempre desafiada e motivada.",
    rating: 4,
  },
  {
    name: "Pedro Oliveira",
    quote:
      "Como atleta profissional, precisava de um ginásio com equipamentos de alta qualidade. O Eugénios HC superou todas as expectativas. Especialmente a área de musculação e cardio que tem máquinas de última geração.",
    rating: 5,
  },
  {
    name: "Inês Santos",
    quote:
      "O spa e a sauna são um refúgio depois de um treino intenso. O ambiente é relaxante e o serviço é impecável. Adoro terminar o meu treino com 15 minutos de sauna para relaxar os músculos.",
    rating: 5,
  },
  {
    name: "João Ferreira",
    quote:
      "Aderi ao plano anual e foi o melhor investimento que fiz na minha saúde. A flexibilidade de horários, mesmo em feriados, e o acesso a todas as modalidades faz deste ginásio o melhor da região.",
    rating: 5,
  },
  {
    name: "Mariana Silva",
    quote:
      "A atenção personalizada foi o que me fez ficar. Os programas de nutrição complementam perfeitamente o treino, e já perdi 8kg em apenas 4 meses seguindo as recomendações da equipa de nutricionistas.",
    rating: 5,
  },
  {
    name: "António Ribeiro",
    quote:
      "O único ponto negativo é por vezes a lotação nas horas de maior afluência. Mas mesmo assim, a equipa sempre se esforça para que todos tenham uma boa experiência e acesso aos equipamentos.",
    rating: 4,
  },
  {
    name: "Cláudia Pereira",
    quote:
      "As aulas para crianças são excelentes. Os meus filhos adoram as atividades aquáticas e as aulas de dança. É ótimo ter um ginásio com opções para toda a família no mesmo espaço.",
    rating: 5,
  },
  {
    name: "Rui Fernandes",
    quote:
      "O acompanhamento técnico na sala de musculação é excelente. Os instrutores estão sempre disponíveis para corrigir a postura e recomendar exercícios adaptados aos meus objetivos específicos.",
    rating: 5,
  },
];

// CSS for slide-in animation
const slideAnimationStyle = `
  @keyframes slideIn {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export default function FeedbackSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);

  // Simple function to go to the next or previous testimonial
  const goToNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto rotate testimonials every 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (autoRotate) {
      timer = setInterval(() => {
        goToNext();
      }, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRotate]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe distance threshold (in pixels)
    const minSwipeDistance = 50;

    // Temporarily pause auto-rotation when user interacts
    setAutoRotate(false);

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swiped left, go to next
        goToNext();
      } else {
        // Swiped right, go to previous
        goToPrevious();
      }
    }

    // Resume auto-rotation after 10 seconds
    setTimeout(() => setAutoRotate(true), 10000);
  };

  // Current testimonial data
  const testimonial = testimonials[currentTestimonial];
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: slideAnimationStyle }} />
      <div className="absolute inset-0">
        <Image src="/images/home/hero-3.jpg" alt="Feedback" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="mb-10 relative z-10">
        <div className="mb-12 space-y-4">
          <Typography as="h2" variant="sectionTitle" className="font-semibold text-center text-white">
            Referência no fitness desde 1998
          </Typography>
          <Typography as="p" variant="body" className="text-center text-white">
            O maior health club de Vila Nova de Famalicão 
          </Typography>
        </div>
        {/* Desktop version - Infinite moving cards */}
        <div className="hidden md:block w-full">
          <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
        </div>{" "}
        {/* Mobile version - Single testimonial with swipe navigation */}
        <div className="md:hidden w-full mx-auto">
          <div
            className="relative w-full rounded-2xl border border-zinc-200 backdrop-blur-2xl 
                       bg-white/40 shadow-lg px-6 py-4 flex flex-col h-[250px] overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {" "}
            {/* Animated content container with slide-in effect */}
            <div
              className="flex flex-col justify-start h-full w-full py-2"
              style={{
                animation: "0.5s ease-out 0s 1 slideIn forwards",
              }}
              key={currentTestimonial} // Key changes trigger re-render with animation
            >
              {testimonial && (
                <>
                  {/* Header com nome e estrelas */}
                  <div>
                    {/* Nome no topo */}
                    <span className="relative z-20 text-base leading-[1.6] font-semibold text-white block">
                      {testimonial.name}
                    </span>

                    {/* Estrelas logo abaixo do nome */}
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < testimonial.rating ? "fill-secondary text-secondary" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer com a quote */}
                  <div className="mt-auto min-h-[120px] flex items-start">
                    <span className="relative z-20 text-sm leading-[1.6] font-normal text-white block">
                      "{testimonial.quote}"
                    </span>
                  </div>
                </>
              )}
            </div>
            {/* Swipe indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center ">
              <div className="text-white/50 text-xs flex items-center">
                <span className="animate-pulse">⟵ arraste para navegar ⟶</span>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentTestimonial ? "bg-white" : "bg-white/50"}`}
                onClick={() => {
                  setCurrentTestimonial(index);
                  setAutoRotate(false);
                  setTimeout(() => setAutoRotate(true), 10000);
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>{" "}
      </div>
    </>
  );
}
