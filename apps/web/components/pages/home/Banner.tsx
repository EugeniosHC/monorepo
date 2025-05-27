import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import Image from "next/image";

export default function Banner() {
  return (
    <>
      <div className="w-full md:w-2/3 flex justify-center md:justify-end py-6 md:pr-8">
        <div className="flex flex-col align-center items-center md:items-center text-center md:text-center text-white ">
          <Typography as="h1" variant="hero" className="font-barlow uppercase font-extralight tracking-tighter mb-6 ">
            7 DIAS GRÁTIS
          </Typography>
          <Typography as="p" variant="body" className="mb-8 max-w-lg">
            Convidamo-lo a experimentar a excelência do Eugénios Health Club durante uma semana.
          </Typography>
          <CustomButton variant="white" className="w-fit mb-16">
            Saiba Mais
          </CustomButton>
        </div>
      </div>

      {/* Lado do logo */}
      <div className="w-full md:w-1/3 relative flex justify-center md:justify-start">
        {/* A div abaixo posiciona a imagem */}
        <div className="absolute bottom-[-144px] md:bottom-[-32px] left-1/2 md:left-12 transform -translate-x-1/2 md:translate-x-0 sm:w-[230px] md:w-[400px] lg:w-[350px] xl:w-[450px]">
          <Image
            src="/images/home/personal-trainers.png"
            width={450}
            height={300}
            alt="Personal Trainers Eugénios Health Club"
          />
        </div>
      </div>
    </>
  );
}
