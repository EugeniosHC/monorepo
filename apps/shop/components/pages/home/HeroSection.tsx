"use client";

import Link from "next/link";
import { ScrollButton } from "@eugenios/ui/components/scroll-button";
import { Typography } from "@eugenios/ui/components/ui/Typography";

export default function HeroSection() {
  return (
    <section className="relative h-[100svh]">
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            preload="none"
            poster="/images/hero.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100" />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center">
        <div className="container">
          <div className="flex flex-col gap-6 sm:gap-8 mx-auto text-center md:text-left md:mx-0  text-white">
            <div className="opacity-0 animate-fadeIn" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
              <div className="text-center">
                <Typography
                  as="h1"
                  variant="hero"
                  className="font-barlow uppercase font-extralight tracking-tighter [transform:scaleY(1.4)] mb-6"
                >
                  HEALTH & SPA CLUB
                </Typography>
                <Link
                  href={`${process.env.NEXT_PUBLIC_WEB_URL}`}
                  className="text-white text-xl relative group inline-flex items-center"
                >
                  <span>Voltar para o Health Club</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 opacity-0 transform translate-x-[-10px] transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>{" "}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>{" "}
                </Link>
              </div>
            </div>
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
