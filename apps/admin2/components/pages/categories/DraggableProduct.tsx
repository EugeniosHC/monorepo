// @ts-ignore
import { useDrag } from "react-dnd";
import { Product, ItemTypes, DragItem } from "@eugenios/types";

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
      ref={drag}
      className={`p-3 mb-2 border rounded cursor-move ${isDragging ? "opacity-50 bg-gray-100" : "bg-white"}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-gray-500">
            {new Intl.NumberFormat("pt-PT", {
              style: "currency",
              currency: "EUR",
            }).format(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraggableProduct;
