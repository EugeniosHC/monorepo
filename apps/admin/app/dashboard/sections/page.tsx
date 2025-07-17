import Image from "next/image";
import Link from "next/link";

export default function SectionPage() {
  return (
    <main className="container mx-auto h-[calc(100vh-80px)] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100%)] p-8">
        {/* Site Web Column */}
        <Link
          href="/dashboard/sections/web"
          className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
            style={{
              backgroundImage: "url('/globe.svg')",
              backgroundSize: "cover",
              filter: "brightness(0.6)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
          <div className="relative flex flex-col items-center justify-center h-full text-center p-8 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-8 mb-6">
              <Image src="/globe.svg" alt="Web" width={80} height={80} className="opacity-90" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Site Web</h2>
            <p className="text-white/80 max-w-md">Gerencie as seções e conteúdos do site institucional</p>
          </div>
        </Link>

        {/* Site Shop Column */}
        <Link
          href="/dashboard/sections/shop"
          className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110"
            style={{
              backgroundImage: "url('/window.svg')",
              backgroundSize: "cover",
              filter: "brightness(0.6)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
          <div className="relative flex flex-col items-center justify-center h-full text-center p-8 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-8 mb-6">
              <Image src="/window.svg" alt="Shop" width={80} height={80} className="opacity-90" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Site Loja</h2>
            <p className="text-white/80 max-w-md">Gerencie as seções e conteúdos do site de e-commerce</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
