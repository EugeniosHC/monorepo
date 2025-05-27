"use client";

import { Facebook, Instagram, Youtube, Mail, Phone, SendHorizonal, Send, ArrowRight } from "lucide-react";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import CustomButton from "@eugenios/ui/components/ui/CustomButton";
import { useIsMobile } from "@eugenios/ui/hooks/use-is-mobile";

export type FooterProps = {
  ImageComponent: React.ComponentType<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }>;
};

export default function Footer({ ImageComponent }: FooterProps) {
  const { isMobile } = useIsMobile();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container px-8 mx-auto">
        {/* Top section - Newsletter + Social/Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
          <div className="flex flex-col h-full">
            <Typography as="h3" variant="footerTitle" className="font-semibold mb-3">
              Receba as últimas novidades
            </Typography>
            <Typography as="p" variant="footerText" className="text-white/80 mb-6">
              Subscreva hoje a nossa Newsletter e fique sempre a <br /> par das melhores dicas e treinos exclusivos.
            </Typography>

            <div className="relative max-w-md mb-auto mt-4">
              <input
                type="email"
                placeholder="O seu email"
                className={`w-full rounded-full px-6 py-4 text-black placeholder-gray-500 focus:outline-none`}
              />
              <button className="bg-primary p-3 rounded-full absolute top-1/2 right-1 translate-y-[-50%] mr-1 hover:bg-primary/90">
                <ArrowRight className=" text-white w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full ">
            <div className="flex items-center gap-6 mb-8">
              <Typography as="h3" variant="footerTitle" className="font-semibold text-white">
                Siga-nos
              </Typography>
              <div className="flex gap-4">
                <a
                  aria-label="Facebook"
                  href="https://www.facebook.com/eugenioshealthclubspa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white hover:bg-[#1877F2] rounded-full p-2 transition-colors"
                >
                  <Facebook className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </a>
                <a
                  aria-label="Instagram"
                  href="https://www.instagram.com/eugenioshc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white hover:bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-full p-2 transition-colors"
                >
                  <Instagram className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </a>
                <a
                  aria-label="Youtube"
                  href="https://www.youtube.com/@eugenioshealthclubspa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white hover:bg-[#FF0000] rounded-full p-2 transition-colors"
                >
                  <Youtube className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            <div className="flex flex-col h-full justify-end items-start">
              <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                Contactos
              </Typography>
              <Typography as="p" variant="footerText" className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>252 312 585 - 911 182 532</span>
              </Typography>
              <Typography as="p" variant="footerText" className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:apoioaocliente@eugenioshc.com" className="hover:underline">
                  apoioaocliente@eugenioshc.com
                </a>
              </Typography>
            </div>
          </div>
        </div>

        {/* Middle section - Address + Hours/Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
          <div className="flex flex-col h-full">
            <div className="mb-auto">
              <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                Morada
              </Typography>
              <address className="not-italic text-white/80 space-y-2 text-base">
                <p>Rua Padre Avis de Brito 189</p>
                <p>4760-234 Calendário</p>
                <p>Vila Nova de Famalicão</p>
              </address>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <Typography as="h4" variant="footerSubtitle" className="font-semibold mb-4">
                Horário
              </Typography>
              <ul className="text-white/80 space-y-2 text-base">
                <li>
                  <strong>De segunda-feira a sexta-feira:</strong> das 07:00 às 22:00
                </li>
                <li>
                  <strong>Sábado:</strong> das 08:00 às 20:00
                </li>
                <li>
                  <strong>Domingo e feriados:</strong> das 09:00 às 13:00
                </li>
              </ul>
            </div>
            <div className="flex items-end justify-center">
              <ImageComponent
                className="pb-1"
                src="/images/logos/white.svg"
                alt="Eugénios HC Logo"
                width={50}
                height={50}
              />
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/70 text-center md:text-left">
            <p>© {currentYear} Eugénios Health Club. Todos os direitos reservados.</p>
          </div>
          <div className="text-sm text-white/70 text-center space-y-1 md:space-y-0 md:space-x-4">
            <a href="#" className="block md:inline hover:underline">
              Política de Privacidade
            </a>
            <a href="#" className="block md:inline hover:underline">
              Termos e Condições
            </a>
            <a href="#" className="block md:inline hover:underline">
              Ética e Conduta
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
