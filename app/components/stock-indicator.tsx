import { BiCheckCircle, BiXCircle, BiTime } from "react-icons/bi";

export interface StockIndicatorProps {
  inStock: boolean;
  stockLevel?: number;
  lowStockThreshold?: number;
}

export function StockIndicator({ 
  inStock, 
  stockLevel, 
  lowStockThreshold = 10 
}: StockIndicatorProps) {
  if (!inStock) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <BiXCircle className="text-xl" />
        <span className="font-semibold">Out of Stock</span>
      </div>
    );
  }

  const isLowStock = stockLevel !== undefined && stockLevel <= lowStockThreshold && stockLevel > 0;

  if (isLowStock) {
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <BiTime className="text-xl" />
        <span className="font-semibold">
          Low Stock - Only {stockLevel} left
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-emerald-600">
      <BiCheckCircle className="text-xl" />
      <span className="font-semibold">In Stock</span>
      {stockLevel !== undefined && stockLevel > lowStockThreshold && (
        <span className="text-sm text-gray-600">({stockLevel} available)</span>
      )}
    </div>
  );
}
