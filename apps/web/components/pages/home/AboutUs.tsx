"use client";

import { Typography } from "@eugenios/ui/components/ui/Typography";
import Image from "next/image";
import { useState } from "react";

interface StatItem {
  value: string;
  label: string;
}

interface AboutUsProps {
  data?: any;
}

export default function AboutUs({ data }: AboutUsProps) {
  const [showVideo, setShowVideo] = useState(false); // Use data from API if available, otherwise use default data
  const title = data?.title || "OS MELHORES \\n TREINAM #JUNTOS#";
  const description =
    data?.description ||
    "Há mais de vinte cinco anos que o Eugénios Health Club é sinónimo de excelência em Famalicão. Oferecemos um espaço exclusivo e sofisticado, equipado com tecnologia de ponta e acompanhado por profissionais altamente qualificados.";
  const stats: StatItem[] = data?.stats || [
    { value: "+1500m\u00B2", label: "Área de treino" },
    { value: "+140", label: "Aulas de Grupo" },
    { value: "+2000", label: "Membros exclusivos" },
  ];
  const videoUrl =
    data?.videoUrl || "https://www.youtube-nocookie.com/embed/CwkMej8edJM?si=kQpnSs2IIqzabwTk&autoplay=1";
  const thumbnailImage = data?.thumbnailImage || "/images/home/about-us.jpg";

  return (
    <>
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-6 text-center md:text-left">
          {" "}
          <div className="inline-block pb-2 mb-2">
            <Typography
              as="h1"
              variant="hero"
              formatText={true}
              strongClassName="font-normal"
              className="text-primary font-barlow font-extralight uppercase text-[2.8rem] leading-[2.5rem] tracking-tighter [transform:scaleY(1.4)]"
            >
              {title}
            </Typography>
          </div>
          <Typography as="p" variant="body" className="text-neutral-800 leading-relaxed">
            {description}
          </Typography>{" "}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat: StatItem, index: number) => (
              <div key={`stat-${index}`}>
                <p className="text-4xl font-normal text-neutral-800">
                  {stat.value.startsWith("+") ? (
                    <>
                      <span className="text-md font-normal align-top mr-1">+</span>
                      {stat.value.substring(1)}
                    </>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-neutral-800 font-semibold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-video w-full h-full">
          {showVideo ? (
            <iframe
              className="w-full h-full rounded-md"
              src={videoUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full cursor-pointer group" onClick={() => setShowVideo(true)}>
              {" "}
              <Image
                src={thumbnailImage}
                alt="Video thumbnail"
                fill
                className="object-cover rounded-md"
                onError={(e) => {
                  // If the image fails to load, use the default image
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/home/about-us.jpg";
                }}
              />
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
