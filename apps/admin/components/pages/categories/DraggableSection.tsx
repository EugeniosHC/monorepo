// @ts-ignore
import { useDrag } from "react-dnd";
import { Section, ItemTypes, DragItem } from "@eugenios/types";

interface DraggableSectionProps {
  section: Section;
}

export const DraggableSection = ({ section }: DraggableSectionProps) => {
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: ItemTypes.SECTION,
    item: { id: section.id, type: ItemTypes.SECTION },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 mb-2 border rounded cursor-move ${isDragging ? "opacity-50 bg-gray-100" : "bg-white"}`}
    >
      <div className="flex items-center gap-2">
        <span>{section.title}</span>
      </div>
    </div>
  );
};

export default DraggableSection;
