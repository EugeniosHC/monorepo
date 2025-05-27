"use client";

import Link from "next/link";
import { useState } from "react";
import { IconPhone } from "@tabler/icons-react";

export function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/adesao">
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
              <IconPhone stroke={2} fill="white" className="h-6 w-6 text-white" />
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
