import { useDrag, DragSourceMonitor } from "react-dnd";
import { CategorySection, ItemTypes, DragItem } from "@eugenios/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@eugenios/ui/components/dialog";
import React from "react";
import { Button } from "@eugenios/ui/components/button";
import { Eye, Grid3X3 } from "lucide-react";
import { useState } from "react";

interface DraggableSectionProps {
  section: CategorySection;
}

export const DraggableSection = ({ section }: DraggableSectionProps) => {
  const [showSectionModal, setShowSectionModal] = useState(false);

  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: ItemTypes.SECTION,
    item: { id: section.id, type: ItemTypes.SECTION },
    collect: (monitor: DragSourceMonitor<DragItem, unknown>) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSectionModal(true);
  };

  return (
    <>
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`group p-3 mb-2 border rounded-lg cursor-move transition-all duration-200 ${
          isDragging
            ? "opacity-50 bg-purple-50 border-purple-200 shadow-lg scale-105"
            : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Grid3X3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate">
              {section.title}
            </p>
            <p className="text-xs text-gray-500">Seção de conteúdo</p>
          </div>

          {/* Botão para visualizar seção */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSectionClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Modal para visualizar conteúdo da seção */}
      <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-600" />
              {section.title}
            </DialogTitle>
            <DialogDescription>Visualize o conteúdo completo desta seção</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-2">Título da Seção</h4>
              <p className="text-gray-900 font-medium">{section.title}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-2">Conteúdo</h4>
              <div className="bg-gray-50 border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {section.content || "Nenhum conteúdo definido para esta seção."}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-2">ID da Seção</h4>
              <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{section.id}</code>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowSectionModal(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DraggableSection;
