import { Montserrat, Barlow } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "@eugenios/ui/styles/web/globals.css";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import Header from "@/components/layouts/Header";
import { Image } from "@/components/Image";
import { FloatingCTA } from "@/components/floating-cta";

// Importação dinâmica do componente pesado
const Footer = dynamic(() => import("@/components/layouts/Footer"), {
  loading: () => <div className="h-80 bg-primary/5"></div>,
  ssr: true,
});

// Importação dinâmica do ReactQueryProvider
const ReactQueryProvider = dynamic(() => import("@/providers/ReactQueryProvider"), {
  ssr: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Eugenios HC",
  description: "O MELHOR HEALTH CLUB DE FAMALICÃO",
  metadataBase: new URL("https://eugenios-hc.com"),
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
          <FloatingCTA />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
