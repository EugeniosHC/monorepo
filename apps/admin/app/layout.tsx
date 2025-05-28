import { Montserrat, Barlow } from "next/font/google";
import type { Metadata } from "next";
import "@eugenios/ui/styles/web/globals.css";
import { Toaster } from "sonner";

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
    <html lang="pt" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="EugéniosHC" />
      </head>
      <body className={`${montserrat.variable} ${barlow.variable} font-sans`}>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
