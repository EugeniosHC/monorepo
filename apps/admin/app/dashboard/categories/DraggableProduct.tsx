// @ts-ignore
import { useDrag } from "react-dnd";
import { ItemTypes, DragItem } from "@eugenios/types";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string | null;
  imageUrl: string;
}

interface DraggableProductProps {
  product: Product;
}

export const DraggableProduct = ({ product }: DraggableProductProps) => {
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.id, type: ItemTypes.PRODUCT },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`group p-3 mb-2 border rounded-lg cursor-move transition-all duration-200 ${
        isDragging
          ? "opacity-50 bg-blue-50 border-blue-200 shadow-lg scale-105"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-blue-600 text-xs font-semibold">IMG</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {product.name}
          </p>
          <p className="text-sm text-green-600 font-semibold">
            {new Intl.NumberFormat("pt-PT", {
              style: "currency",
              currency: "EUR",
            }).format(product.price)}
          </p>
          {product.duration && <p className="text-xs text-gray-500">⏱️ {product.duration}</p>}
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
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
  );
};

export default DraggableProduct;
