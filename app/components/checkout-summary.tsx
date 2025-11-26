import type { MonetaryAmount } from "@reactionary/core";

export interface CheckoutSummaryProps {
  itemCount: number;
  subtotal: MonetaryAmount;
  shipping?: MonetaryAmount;
  tax?: MonetaryAmount;
  discount?: MonetaryAmount;
  total: MonetaryAmount;
}

export function CheckoutSummary({
  itemCount,
  subtotal,
  shipping,
  tax,
  discount,
  total,
}: CheckoutSummaryProps) {
  const formatPrice = (money: MonetaryAmount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.value);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({itemCount})</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        
        {shipping && shipping.value > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">{formatPrice(shipping)}</span>
          </div>
        )}
        
        {tax && tax.value > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold">{formatPrice(tax)}</span>
          </div>
        )}
        
        {discount && discount.value > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span className="font-semibold text-emerald-600">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 pt-3">
        <div className="flex justify-between text-lg">
          <span className="font-bold">Total</span>
          <span className="font-bold text-emerald-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
