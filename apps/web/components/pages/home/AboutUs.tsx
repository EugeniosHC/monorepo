"use client";

import { Typography } from "@eugenios/ui/components/ui/Typography";
import Image from "next/image";
import { useState } from "react";

export default function AboutUs() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-block pb-2 mb-2">
            <Typography
              as="h1"
              variant="hero"
              className="text-primary font-barlow font-extralight uppercase text-[2.8rem] leading-[2.5rem] tracking-tighter [transform:scaleY(1.4)]"
            >
              OS MELHORES <br /> TREINAM <span className="font-normal"> JUNTOS</span>
            </Typography>
          </div>
          <Typography as="p" variant="body" className="text-neutral-800 leading-relaxed">
            Há mais de vinte cinco anos que o Eugénios Health Club é sinónimo de excelência em Famalicão. Oferecemos um
            espaço exclusivo e sofisticado, equipado com tecnologia de ponta e acompanhado por profissionais altamente
            qualificados.
          </Typography>
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-normal  text-neutral-800">
                <span className="text-md font-normal align-top mr-1">+</span>25
              </p>
              <p className="text-sm text-neutral-800 font-semibold mt-1 uppercase tracking-wider">Anos de excelência</p>
            </div>
            <div>
              <p className="text-4xl font-normal text-neutral-800">
                <span className="text-md font-normal align-top mr-1">+</span>200
              </p>
              <p className="text-sm text-neutral-800 font-semibold mt-1 uppercase tracking-wider">Aulas semanais</p>
            </div>
            <div>
              <p className="text-4xl font-normal text-neutral-800">
                <span className="text-md font-normal align-top mr-1">+</span>1000
              </p>
              <p className="text-sm text-neutral-800 font-semibold mt-1 uppercase tracking-wider">Membros exclusivos</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-video w-full h-full">
          {showVideo ? (
            <iframe
              className="w-full h-full rounded-md"
              src="https://www.youtube-nocookie.com/embed/CwkMej8edJM?si=kQpnSs2IIqzabwTk&autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full cursor-pointer group" onClick={() => setShowVideo(true)}>
              <Image src="/images/home/about-us.jpg" alt="Video thumbnail" fill className="object-cover rounded-md" />
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/10 group-hover:bg-black/20 transition-colors ">
                <button
                  className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300"
                  aria-label="Play video"
                >
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
