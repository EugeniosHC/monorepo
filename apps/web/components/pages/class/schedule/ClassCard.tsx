"use client";

import { categoryStyles } from "./types";
import { getPeriodIcon, getIntensityIcon } from "./utils";

interface ClassCardProps {
  aula: {
    nome: string;
    categoria: string;
    hora_inicio: string;
    hora_fim: string;
    duracao: number;
    sala: string;
    professor: string;
    intensidade: number;
  };
  isMobile?: boolean;
}

export function ClassCard({ aula, isMobile = false }: ClassCardProps) {
  if (isMobile) {
    const mobileClasses = `p-3 rounded-lg border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} shadow-sm bg-white hover:shadow-md transition-all duration-200 cursor-pointer`;

    return (
      <div className={mobileClasses}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900">{aula.nome}</h4>
          {getPeriodIcon(aula.hora_inicio)}
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="text-gray-700">
            {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
          </div>
          <div className="text-gray-600">{aula.sala}</div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{aula.professor}</span>
            {getIntensityIcon(aula.intensidade)}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - menos arredondado (rounded vs rounded-lg)
  const desktopClasses = `p-3 border-l-4 ${categoryStyles[aula.categoria as keyof typeof categoryStyles]} border border-gray-200 hover:shadow-md transition-all duration-200 text-xs rounded bg-white cursor-pointer`;

  return (
    <div className={desktopClasses}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900 leading-tight flex-1">{aula.nome}</div>
        {getPeriodIcon(aula.hora_inicio)}
      </div>
      <div className="space-y-2">
        <div className="text-gray-700 font-medium">
          {aula.hora_inicio} - {aula.hora_fim} ({aula.duracao}')
        </div>
        <div className="text-gray-600">{aula.sala}</div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 truncate">{aula.professor}</span>
          <div className="ml-2 flex-shrink-0">{getIntensityIcon(aula.intensidade)}</div>
        </div>
      </div>
    </div>
  );
}
