"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  hasHeaderBackground: boolean;
  isMobileSearchActive: boolean;
}

export function Logo({ hasHeaderBackground, isMobileSearchActive }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 py-4 ${isMobileSearchActive ? "hidden" : ""} md:flex`}>
      <Image
        src={hasHeaderBackground ? "/images/logos/blue.svg" : "/images/logos/white.svg"}
        alt="Eugénios HC Logo"
        width={50}
        height={50}
        priority
        className="transition-transform duration-300"
      />
    </Link>
  );
}
