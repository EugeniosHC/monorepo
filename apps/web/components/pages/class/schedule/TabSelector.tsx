"use client";

import { ActiveTab } from "./types";

interface TabSelectorProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobile?: boolean;
}

export function TabSelector({ activeTab, setActiveTab, isMobile = false }: TabSelectorProps) {
  return (
    <div
      className={`bg-white rounded-full p-1 shadow-sm border border-gray-200 h-12 flex items-center relative ${isMobile ? "w-full" : ""}`}
    >
      {/* Indicador animado de fundo */}
      <div
        className={`absolute inset-1 w-[calc(50%-8px)] rounded-full shadow-sm transition-all duration-300 ease-in-out ${
          activeTab === "terra" ? "left-1 bg-terrestre" : "left-[calc(50%+4px)] bg-aqua"
        }`}
      />

      <div className="flex w-full relative z-10">
        <button
          onClick={() => setActiveTab("terra")}
          className={`flex-1 ${isMobile ? "py-2 px-2 text-xs" : "py-2 px-3 text-sm"} rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "terra" ? "text-white" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Terra
        </button>
        <button
          onClick={() => setActiveTab("agua")}
          className={`flex-1 ${isMobile ? "py-2 px-2 text-xs" : "py-2 px-3 text-sm"} rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "agua" ? "text-white" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Água
        </button>
      </div>
    </div>
  );
}
