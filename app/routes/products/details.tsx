import { useState } from "react";

import type { Product } from "@reactionary/core";
import { BiShoppingBag } from "react-icons/bi";
import { data, Form } from "react-router";
import { StockIndicator } from "~/components/stock-indicator";
import { createClient, createReqContext } from "~/utils/client";
import { formatPrice } from "~/utils/prices";
import { getSession, withDefaultReponseHeaders } from "~/utils/sessions.server";
import type { Route } from "./+types/details";


export const loader = async ({ params, request }: Route.LoaderArgs) => {

  const session = await getSession(
    request.headers.get("Cookie")
  );
  const reqCtx = await createReqContext(request,session);
  const client = await createClient(reqCtx);
  const product: Product | null = await client.product.getBySlug({ slug: params.slug || '' });

  if (product) {
    console.log('Product found in loader:', product);
    const inventory = await client.inventory.getBySKU({
      fulfilmentCenter: {key: 'OnlineFfmChannel'},
      variant: product.mainVariant.identifier
    });

    const { price }  = await client.price.getCustomerPrice({
      variant: product.mainVariant.identifier
    });
    return data({ product, price, inventory }, await withDefaultReponseHeaders(session, reqCtx, {}) );
  }
  throw new Response("Product Not Found", { status: 404 });
};


// handle cart updates...
export const action = async ({ request }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const reqCtx = await createReqContext(request, session);
  const client = await createClient(reqCtx);
  try {
    const formData = await request.formData();
    const variantId = formData.get("variantId") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10);


    const cartId = await client.cart.getActiveCartId();

    const cart = await client.cart.add({
      cart: cartId,
      variant: { sku: variantId },
      quantity: quantity
    })

    return data({ success: true, cart: cart }, await withDefaultReponseHeaders(session, reqCtx, {}) );

  } catch (error) {
    console.error("Error adding to cart:", error);
    const session = await getSession("Cookie");
    session.flash("error", "There was an error adding the item to your cart. Please try again.");
    return data({ success: false }, await withDefaultReponseHeaders(session, reqCtx, {}) )  ;
  }

};

export default function ProductRoute({loaderData}: Route.ComponentProps) {
  const { product , price, inventory }= loaderData;
  const [variant, setVariant] = useState(product.mainVariant);
  const [image, setImage] = useState(product.mainVariant.images[0]);
  const [quantity, setQuantity] = useState(1);

  const allVariants = [ product.mainVariant] ;
  const handleVariantChange = (index: number) => {
    setVariant(allVariants[index]);
    setQuantity(1);
  };

  const handleQuantityChange = (action) => {
    switch (action) {
      case "inc":
        if (quantity < 999) setQuantity(quantity + 1);
        break;

      case "dec":
        if (quantity > 1) setQuantity(quantity - 1);
        break;

      default:
        break;
    }
  };

  const handleImageChange = (sourceUrl: string) => {
    const foundImage = product.mainVariant.images.find((img) => img.sourceUrl === sourceUrl);
    if (foundImage) {
      setImage(foundImage);
    } else {
      setImage(product.mainVariant.images[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="grid items-center md:grid-cols-2">
        <div>
          <img
            className="w-500 rounded-lg object-scale-down"
            src={image.sourceUrl}
            alt={product.name}
          />
          <div className="flex justify-center p-4 space-x-2 ">
            {product.mainVariant.images.map((imageItem) => (
              <img
                className={`w-16 border-2 rounded-lg ${
                  imageItem.sourceUrl === image.sourceUrl ? "border-teal-400" : null
                }`  }
                key={imageItem.sourceUrl}
                src={imageItem.sourceUrl}
                alt={product.name}
                onClick={() => handleImageChange(imageItem.sourceUrl)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col px-16 py-4 space-y-8">
          <h1>{product.name} </h1>
          <p className="font-semibold text-teal-600">{formatPrice(price)}</p>
          
          {/* Stock Indicator */}
          <StockIndicator 
            inStock={inventory?.status === 'inStock'}
            stockLevel={inventory?.quantity || 0}
            lowStockThreshold={10}
          />
          
          <div>
            <p className="font-semibold">Select Size</p>
            <div className="grid grid-cols-3 gap-2 mt-2 md:grid-cols-2 xl:grid-cols-4">
              { [ product.mainVariant].map((variantItem, index) => (
                <button
                  key={variantItem.identifier.sku}
                  className={`px-2 py-1 mr-2 text-sm hover:brightness-90 ${
                    variantItem.identifier.sku === variant.identifier.sku
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleVariantChange(index)}
                >
                  {variantItem.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold">Select Quantity</p>
            <div className="flex items-center px-4 mt-2 space-x-4">
              <button
                className="px-4 py-2 hover:shadow-sm hover:text-teal-500 hover:font-bold"
                onClick={() => handleQuantityChange("dec")}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                className="px-4 py-2 hover:shadow-sm hover:text-teal-500 hover:font-bold"
                onClick={() => handleQuantityChange("inc")}
              >
                +
              </button>
            </div>
          </div>
          <div>

            <Form method="post">
              <input type="hidden" name="variantId" value={variant.identifier.sku} />
              <input type="hidden" name="quantity" value={quantity} />
              <button className="inline-flex items-center px-4 py-2 font-semibold text-gray-200 bg-gray-700 rounded hover:text-white hover:bg-gray-900">
                <BiShoppingBag className="mr-2 text-lg" />{" "}
                <span>Add to Cart</span>
              </button>
            </Form>
          </div>
          <div>
            <p className="font-semibold">Product Description</p>
            <hr className="w-2/3 mt-2 border-t-2 border-gray-300" />
            <p className="mt-4 text-gray-700">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
