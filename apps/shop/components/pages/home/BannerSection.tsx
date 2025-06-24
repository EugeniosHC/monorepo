"use client";

import { Typography } from "@eugenios/ui/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";

export default function BannerSection() {
  return (
    <section className="relative h-[90svh]">
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100">
          <Image
            width={1920}
            height={1080}
            src="/images/banner.jpeg"
            alt="Hero Image"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/100 to-black/40" />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center">
        <div className="container">
          <div className="flex flex-col gap-6 sm:gap-8 mx-auto text-center md:text-left md:mx-0  text-white">
            <div className="opacity-0 animate-fadeIn" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
              <div className="text-center">
                <Typography as="h2" variant="title" className="font-bold leading-relaxed mb-6">
                  Descubra mais sobre o melhor <br /> Health Club de Famalicão
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
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
