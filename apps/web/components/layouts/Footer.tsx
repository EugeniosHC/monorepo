"use client";

import Image from "next/image";
import { Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container px-8 mx-auto">
        {/* Top section - Newsletter + Social/Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
          {/* Left column - Newsletter */}
          <div className="flex flex-col h-full">
            <h3 className="font-semibold mb-3">Receba as últimas novidades</h3>
            <p className="text-white/80 mb-6">
              Subscreva hoje a nossa Newsletter e fique sempre a <br /> par das melhores dicas e treinos exclusivos.
            </p>
            <div className="relative max-w-md mb-auto">
              <input
                type="email"
                placeholder="O seu email"
                className="w-full rounded-full px-6 pr-32 py-3 text-black placeholder-gray-500 focus:outline-none"
              />
              <button className="absolute top-1/2 right-1 translate-y-[-50%] bg-primary text-white font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition">
                Subscrever
              </button>
            </div>
          </div>

          {/* Right column - Social + Contacts */}
          <div className="flex flex-col h-full ">
            <div className="flex items-center gap-6 mb-8">
              <h3 className="font-semibold text-white">Siga-nos</h3>
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

            <div className="mb-auto">
              <h4 className="font-semibold mb-4">Contactos</h4>
              <p className="flex items-center gap-2 text-white">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>252 312 585 - 911 182 532</span>
              </p>
              <p className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:apoioaocliente@eugenioshc.com" className="hover:underline">
                  apoioaocliente@eugenioshc.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Middle section - Address + Hours/Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 mb-10">
          {/* Left column - Address */}
          <div className="flex flex-col h-full">
            <div className="mb-auto">
              <h4 className="font-semibold mb-4">Morada</h4>
              <address className="not-italic text-white/80 space-y-2">
                <p>Rua Padre Avis de Brito 189</p>
                <p>4760-234 Calendário</p>
                <p>Vila Nova de Famalicão</p>
              </address>
            </div>
          </div>

          {/* Right column - Hours + Logo */}
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-semibold mb-4">Horário</h4>
              <ul className="text-white/80 space-y-2">
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
              <Image className="pb-1" src="/images/logos/white.svg" alt="Eugénios HC Logo" width={50} height={50} />
            </div>
          </div>
        </div>

        {/* Bottom section - Copyright + Links */}
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
