"use client";

export function LegendSection() {
  return (
    <div className="mt-8 mb-8 space-y-4">
      {/* Legenda das categorias */}
      <div className="rounded-2xl">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-terrestre"></div>
            <span className="text-sm font-medium text-gray-700">Terra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-aqua"></div>
            <span className="text-sm font-medium text-gray-700">Água</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-xpress"></div>
            <span className="text-sm font-medium text-gray-700">Express</span>
          </div>
        </div>
      </div>

      {/* Legenda detalhada */}
      <div className="text-sm text-gray-600 leading-relaxed text-center space-y-2 pb-4">
        <p>
          <strong>AMA</strong> (Adaptação Meio Aquático) • <strong>N1</strong> (Iniciação) • <strong>N2</strong>{" "}
          (Aquisição) • <strong>N3</strong> (Aperfeiçoamento) • <strong>Out</strong> (Outdoor) • <strong>P</strong>{" "}
          (Piscina) • <strong>FZ</strong> (Functional Zone)
        </p>
      </div>

      {/* Informações do clube */}
      <div className="text-center space-y-3 pb-8">
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
          O Eugénios HC reserva-se ao direito de livremente modificar as atividades e horários. Mais informações na
          receção do clube.
        </p>
        <p className="text-sm font-medium text-gray-700">Nos feriados não há aulas de grupo.</p>
      </div>
    </div>
  );
}
