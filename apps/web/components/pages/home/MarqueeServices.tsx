"use client";

import { BicepsFlexed } from "lucide-react";
import {
  IconSwimming,
  IconStretching,
  IconStethoscope,
  IconApple,
  IconTreadmill,
  IconPlant2,
} from "@tabler/icons-react";

const services = [
  { icon: IconSwimming, label: "Piscina Interior 250m²" },
  { icon: IconStretching, label: "+50 Aulas de Grupo" },
  { icon: IconStethoscope, label: "Avaliação Física" },
  { icon: IconApple, label: "Avaliação Nutricional" },
  { icon: IconTreadmill, label: "Ginásio Super Equipado" },
  { icon: IconPlant2, label: "Jacuzzi, Sauna e Banho Turco" },
  { icon: BicepsFlexed, label: "Treinos Personalizados" },
];

const allServices = [...services, ...services];

export default function MarqueeServices() {
  return (
    <>
      <div className="animate-marquee flex py-16 [animation-play-state:var(--play-state,running)]">
        {allServices.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center mx-12 w-44 text-neutral-800 hover:text-primary transition-colors h-32"
          >
            <div className="h-16 flex items-center justify-center mb-2">
              <service.icon color="#293c59" stroke="#293c59" strokeWidth={2} className="h-12 w-12" />
            </div>
            <div className="h-14 flex items-start justify-center">
              <span className="text-lg font-medium text-center">{service.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-marquee flex py-16 [animation-play-state:var(--play-state,running)]">
        {allServices.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center mx-12 w-44 text-neutral-800 hover:text-primary transition-colors h-32"
          >
            <div className="h-16 flex items-center justify-center mb-2">
              <service.icon color="#293c59" stroke="#293c59" strokeWidth={2} className="h-12 w-12" />
            </div>
            <div className="h-14 flex items-start justify-center">
              <span className="text-lg font-medium text-center">{service.label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
