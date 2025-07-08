"use client";
import { Montserrat, Barlow } from "next/font/google";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { ReactNode } from "react";

const barlow = Barlow({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className={`h-screen w-screen overflow-hidden ${montserrat.variable} ${barlow.variable}`}>{children}</div>
    </ReactQueryProvider>
  );
}
