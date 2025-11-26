import { Form } from "react-router";
import type { CartItem, MonetaryAmount, Product } from "@reactionary/core";
import { BiTrash } from "react-icons/bi";

interface CartItemComponentProps {
  item: CartItem;
  product: Product | undefined;
}

export function CartItemComponent({ item, product }: CartItemComponentProps) {
  const formatCartPrice = (money: MonetaryAmount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.value);
  };

  return (
    <div
      key={item.identifier.key}
      className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
    >
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        {product?.mainVariant?.images ? (
          <img
            src={product.mainVariant.images[0].sourceUrl}
            alt={product.mainVariant.images[0].altText || "Product"}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{product?.mainVariant?.name}</h3>
        {item.variant?.sku && (
          <p className="text-sm text-gray-500">SKU: {item.variant.sku}</p>
        )}
        <p className="text-emerald-600 font-semibold mt-2">
          {item.price.unitPrice.value
            ? formatCartPrice(item.price.unitPrice)
            : "Price not available"}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-4">
          <Form method="post" className="flex items-center gap-2">
            <input type="hidden" name="actionType" value="updateQuantity" />
            <input
              type="hidden"
              name="lineItemId"
              value={item.identifier.key}
            />
            <label className="text-sm font-medium">Qty:</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max="999"
              defaultValue={item.quantity}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              onChange={(e) => {
                if (e.target.value && parseInt(e.target.value) > 0) {
                  e.target.form?.requestSubmit();
                }
              }}
            />
          </Form>

          {/* Remove Button */}
          <Form method="post">
            <input type="hidden" name="actionType" value="remove" />
            <input
              type="hidden"
              name="lineItemId"
              value={item.identifier.key}
            />
            <button
              type="submit"
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
            >
              <BiTrash /> Remove
            </button>
          </Form>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right">
        <p className="font-semibold">
          {item.price.totalPrice ? formatCartPrice(item.price.totalPrice) : "N/A"}
        </p>
      </div>
    </div>
  );
}
