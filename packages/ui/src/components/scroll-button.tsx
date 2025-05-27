"use client";

export function ScrollButton() {
  const handleScroll = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };
  return (
    <div
      className="flex flex-col items-center gap-2 mb-4 opacity-0 animate-fadeIn cursor-pointer hover:opacity-80 transition-opacity"
      style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}
      onClick={handleScroll}
    >
      <div className="w-5 h-8 border-2 border-white rounded-full p-1">
        <div className="w-1 h-1.5 bg-white rounded-full animate-scroll-wheel mx-auto"></div>
      </div>
      <span className="text-white text-xs tracking-wider">Deslizar</span>
    </div>
  );
}
