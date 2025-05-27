"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";

export default function RecruitmentSection() {
  return (
    <div className="bg-white rounded-xl shadow-lg px-10 py-12 md:px-16 md:py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch md:gap-8">
        {/* Text content */}
        <div className="flex flex-col items-center text-center justify-center md:items-start md:text-start md:justify-between space-y-6 max-w-xl">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-4">
            <Typography as="h2" variant="sectionTitle" className="font-semibold text-gray-800 leading-tight">
              Quer fazer parte da equipa?
            </Typography>
            <Typography as="p" variant="body">
              Estamos sempre à procura de talento. Se é apaixonado por fitness e saúde, junte-se à nossa equipa.
            </Typography>
          </div>

          <div>
            <CustomButton variant="primary">Recrutamento</CustomButton>
          </div>
        </div>

        <div className="relative w-[500px]">
          <Image
            src="/images/home/about-us.jpg"
            alt="recrutamento eugénios health club"
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
        {/* Image with same height as content */}
      </div>
    </div>
  );
}
