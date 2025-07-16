"use client";

import Link from "next/link";
import { useState } from "react";
import { IconPhone } from "@tabler/icons-react";
import { AlertCircle, MessageCircleWarning } from "lucide-react";

export function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="https://lp.closum.co/lp/eugenios/7-dias-gratis" target="_blank" rel="noopener noreferrer">
        <div
          className={`
            flex items-center justify-center rounded-full bg-secondary text-white shadow-lg 
            transition-all duration-300 ease-in-out overflow-hidden cursor-pointer
            ${isHovered ? "pr-6 pl-4 py-3" : "p-3.5"}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`flex items-center justify-center ${isHovered ? "gap-3" : ""}`}>
            <div className="flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
              </svg>
            </div>
            <div
              className={`
                font-semibold uppercase text-md whitespace-nowrap flex items-center
                transition-all duration-300 ease-in-out
                ${isHovered ? "opacity-100 max-w-80 translate-x-0" : "opacity-0 max-w-0 -translate-x-2"}
              `}
            >
              Experimente Grátis
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
