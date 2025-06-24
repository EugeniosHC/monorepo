"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ScrollButton } from "@eugenios/ui/components/scroll-button";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import { motion, AnimatePresence } from "framer-motion";

interface SlideType {
  id: number;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonIsVisible?: boolean;
}

const defaultSlides: SlideType[] = [
  {
    id: 1,
    image: "/images/home/hero-1.jpg",
    alt: "Eugénios Health Club - Área de treino premium",
    title: "Os melhores\nTreinam Juntos",
    subtitle: "7 dias grátis",
    buttonText: "SABER MAIS",
    buttonIsVisible: true,
  },
  {
    id: 2,
    image: "/images/home/hero-2.jpg",
    alt: "Eugénios Health Club - Piscina exclusiva",
    title: "Exclusividade\nPara #Ti#",
    subtitle: "Espaço único",
    buttonText: "CONHECER",
    buttonIsVisible: true,
  },
  {
    id: 3,
    image: "/images/home/hero-3.jpg",
    alt: "Eugénios Health Club - Aulas exclusivas",
    title: "Aulas\n#Exclusivas#",
    subtitle: "Várias modalidades",
    buttonText: "VER AULAS",
    buttonIsVisible: true,
  },
];

interface HeroSectionProps {
  data?: any;
}
export default function HeroSection({ data }: HeroSectionProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  // Use data from API if available, otherwise use default data
  // Ensure slides is always a valid array of SlideType objects with all required properties
  const slidesFromData =
    data?.slides && Array.isArray(data.slides)
      ? data.slides.map((slide: any, index: number) => {
          const defaultIndex = index % defaultSlides.length;
          return {
            id: slide.id || index + 1,
            image: slide.imageUrl || defaultSlides[defaultIndex]?.image || "/images/home/hero-1.jpg",
            alt: slide.imageAlt || defaultSlides[defaultIndex]?.alt || "Eugénios Health Club",
            title: slide.title || defaultSlides[defaultIndex]?.title || "Os melhores\nTreinam Juntos",
            subtitle: slide.subtitle || defaultSlides[defaultIndex]?.subtitle || "7 dias grátis",
            buttonText: slide.buttonText || defaultSlides[defaultIndex]?.buttonText || "SABER MAIS",
            buttonUrl: slide.buttonUrl || defaultSlides[defaultIndex]?.buttonUrl || "/",
            buttonIsVisible: slide.buttonIsVisible !== undefined ? slide.buttonIsVisible : true,
          };
        })
      : defaultSlides;

  const slides: SlideType[] = slidesFromData;

  // Get the current slide's data
  const currentSlide = slides[current];
  const subtitle: string = currentSlide?.subtitle || "7 dias grátis";
  const title: string = currentSlide?.title || "Os melhores \n Treinam Juntos";
  const buttonText: string = currentSlide?.buttonText || "SABER MAIS";
  const buttonUrl: string = currentSlide?.buttonUrl || "/";
  const showButton: boolean = currentSlide?.buttonIsVisible !== false; // Default to true

  const changeSlide = useCallback((newIndex: number, dir: "next" | "prev") => {
    setDirection(dir);
    setCurrent(newIndex);
  }, []);

  const nextSlide = useCallback(() => {
    const newIndex = current === slides.length - 1 ? 0 : current + 1;
    changeSlide(newIndex, "next");
  }, [current, slides.length, changeSlide]);

  const prevSlide = useCallback(() => {
    const newIndex = current === 0 ? slides.length - 1 : current - 1;
    changeSlide(newIndex, "prev");
  }, [current, slides.length, changeSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === current) return;
      changeSlide(index, index > current ? "next" : "prev");
    },
    [current, changeSlide]
  );

  const pauseAutoplay = useCallback(() => {
    setAutoplayPaused(true);
  }, []);

  const resumeAutoplay = useCallback(() => {
    setAutoplayPaused(false);
  }, []);

  useEffect(() => {
    if (autoplayPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [current, nextSlide, autoplayPaused]);

  // Animation variants for Framer Motion
  const slideVariants = {
    enter: (direction: string) => ({
      opacity: 0,
    }),
    center: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
    exit: (direction: string) => ({
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: "easeIn",
      },
    }),
  };

  const subtitleVariants = {
    hidden: (direction: string) => ({
      opacity: 0,
      y: direction === "next" ? -30 : 30,
    }),
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      },
    },
    exit: (direction: string) => ({
      opacity: 0,
      y: direction === "next" ? 30 : -30,
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    }),
  };

  const titleVariants = {
    hidden: (direction: string) => ({
      opacity: 0,
      x: direction === "next" ? -30 : 30,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.6,
      },
    },
    exit: (direction: string) => ({
      opacity: 0,
      x: direction === "next" ? 30 : -30,
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    }),
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.9,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    },
  };

  return (
    <section className="relative h-[100svh] " onMouseEnter={pauseAutoplay} onMouseLeave={resumeAutoplay}>
      {" "}
      {/* Slides background images */}
      <div className="relative h-full w-full overflow-hidden">
        {slides.map((slide: SlideType, index: number) => (
          <div
            key={slide.id}
            className={`absolute inset-0 ${
              index === current ? "opacity-100" : "opacity-0"
            } transition-opacity duration-1000 ease-in-out`}
          >
            {slide.image && (
              <Image
                src={slide.image}
                alt={slide.alt || "Eugénios Health Club"}
                fill
                className="object-cover"
                priority={index === 0 || index === current}
                sizes="100vw"
                onError={(e) => {
                  // If the image fails to load, use the default image
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/home/hero-1.jpg";
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}{" "}
        {/* Additional overlay for elegance */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40" />
      </div>
      {/* Slide Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className="flex flex-col gap-2 sm:gap-8 max-w-4xl text-white text-center md:text-left mx-auto md:mx-0 items-center md:items-start">
            {/* Subtitle */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`subtitle-${current}`}
                custom={direction}
                variants={subtitleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-fit mx-auto md:mx-0 rounded-lg"
              >
                <Typography
                  as="h3"
                  variant="heroSubtitle"
                  className="font-barlow font-extralight uppercase tracking-widest[transform:scaleY(1.2)] m-1"
                >
                  {subtitle}
                </Typography>
              </motion.div>
            </AnimatePresence>
            {/* Title */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`title-${current}`}
                custom={direction}
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="[transform:scaleY(1.4)] mt-4 mb-6">
                  {" "}
                  <Typography
                    as="h1"
                    variant="hero"
                    formatText={true}
                    strongClassName="font-normal"
                    className="font-barlow uppercase font-extralight tracking-tighter"
                  >
                    {title}
                  </Typography>
                </div>
              </motion.div>
            </AnimatePresence>{" "}
            {/* Button */}
            {showButton && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`button-${current}`}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={() => {
                      // Se for uma âncora (#), usar apenas buttonUrl, senão usar URL completa
                      const url = buttonUrl.startsWith("#")
                        ? buttonUrl
                        : `${process.env.NEXT_PUBLIC_WEB_URL || ""}${buttonUrl || "/"}`;
                      router.push(url);
                    }}
                  >
                    <CustomButton
                      variant="white"
                      className="ml-2 flex items-center justify-center w-fit mb-16 md:mb-0 group shadow-lg hover:shadow-xl transition-all duration-300 leading-none"
                      style={{ lineHeight: "1" }}
                    >
                      <span className="text-sm sm:text-base font-semibold inline-flex items-center leading-none">
                        {buttonText}
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      />
                    </CustomButton>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>{" "}
      {/* Slide Indicators */}
      <div className="absolute bottom-20 inset-x-0 z-10">
        <div className="container">
          <div className="flex justify-start md:justify-start gap-3 max-w-4xl mx-auto md:ml-5">
            {slides.map((_, index) => (
              <motion.button
                key={`indicator-${index}`}
                onClick={() => goToSlide(index)}
                initial={false}
                animate={{
                  scale: index === current ? 1.25 : 1,
                  backgroundColor: index === current ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.5)",
                }}
                whileHover={{
                  backgroundColor: index === current ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.8)",
                  scale: index === current ? 1.25 : 1.1,
                }}
                className="w-2 h-2 rounded-full transform-gpu"
                style={{
                  transformOrigin: "center",
                  transition: "all 0.3s ease",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>{" "}
      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.button
          onClick={prevSlide}
          className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 opacity-70 hover:opacity-100 transform-gpu"
          aria-label="Previous slide"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ transformOrigin: "center", transition: "all 0.2s ease" }}
        >
          <ChevronRight className="h-6 w-6 rotate-180" />
        </motion.button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.button
          onClick={nextSlide}
          className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 opacity-70 hover:opacity-100 transform-gpu"
          aria-label="Next slide"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ transformOrigin: "center", transition: "all 0.2s ease" }}
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>
      </div>
      {/* Scroll Button */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center items-center pointer-events-none">
        <motion.div className="pointer-events-auto" whileHover={{ scale: 1.1 }}>
          <ScrollButton />
        </motion.div>
      </div>
    </section>
  );
}
