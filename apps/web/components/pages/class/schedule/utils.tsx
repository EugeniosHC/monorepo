import { Sun, Sunset, Moon } from "lucide-react";

// Função para obter ícone do período do dia (sem cor, mais sutil)
export const getPeriodIcon = (hora: string) => {
  const hour = Number.parseInt(hora.split(":")[0] || "0");
  if (hour >= 6 && hour < 12) {
    return <Sun className="h-4 w-4 text-gray-600" />;
  } else if (hour >= 12 && hour < 18) {
    return <Sunset className="h-4 w-4 text-gray-600" />;
  } else {
    return <Moon className="h-4 w-4 text-gray-600" />;
  }
};

// Função para obter ícone de intensidade com barras laterais
export const getIntensityIcon = (intensity: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`w-1 rounded-sm ${index < intensity ? "bg-primary h-3" : "bg-gray-300 h-2"}`} />
      ))}
    </div>
  );
};
