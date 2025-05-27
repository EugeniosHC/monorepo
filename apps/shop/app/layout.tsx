import { Montserrat, Barlow } from "next/font/google";

import type { Metadata } from "next";
import "@eugenios/ui/styles/web/globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import Header from "@/components/layouts/Header";
import Footer from "@eugenios/ui/components/layouts/Footer";
import { Image } from "@/components/Image";

export const metadata: Metadata = {
  title: "Eugenios HC",
  description: "O MELHOR HEALTH CLUB DE FAMALICÃO",
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-title" content="EugéniosHC" />
      </head>
      <body className={`${montserrat.variable} ${barlow.variable} font-sans`}>
        <ReactQueryProvider>
          <Toaster richColors />
          <Header />
          <div className="flex flex-col min-h-screen bg-white">{children}</div>
          <Footer ImageComponent={Image} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
