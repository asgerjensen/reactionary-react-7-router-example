import { useState, useEffect } from "react";

import type { Product } from "@reactionary/core";
import { BiShoppingBag, BiCheckCircle } from "react-icons/bi";
import { data, Form, useActionData } from "react-router";
import { StockIndicator } from "~/components/stock-indicator";
import { createClient, createReqContext } from "~/utils/client";
import { formatPrice } from "~/utils/prices";
import { getCloudinaryUrl } from "~/utils/cloudinary";
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
  
    const inventory = await client.inventory.getBySKU({
      fulfilmentCenter: {key: 'OnlineFfmChannel'},
      variant: product.mainVariant.identifier
    });

    const { price }  = await client.price.getCustomerPrice({
      variant: product.mainVariant.identifier
    });
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || undefined;
    return data({ product, price, inventory, cloudinaryCloudName }, await withDefaultReponseHeaders(session, reqCtx, {}) );
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
  const { product , price, inventory, cloudinaryCloudName }= loaderData;
  const actionData = useActionData<typeof action>();
  const [variant, setVariant] = useState(product.mainVariant);
  const [image, setImage] = useState(product.mainVariant.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

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
          <div className="flex items-center justify-center aspect-square h-[66vh] mx-auto">
            <img
              className="w-full h-full rounded-lg object-contain"
              src={getCloudinaryUrl(image.sourceUrl, {
                width: 800,
                height: 800,
                quality: 'auto',
                format: 'auto',
                crop: 'fill'
              }, cloudinaryCloudName)}
              alt={product.name}
            />
          </div>
          <div className="flex justify-center p-4 space-x-2 ">
            {product.mainVariant.images.map((imageItem) => (
              <button
                key={imageItem.sourceUrl}
                onClick={() => handleImageChange(imageItem.sourceUrl)}
                className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${
                  imageItem.sourceUrl === image.sourceUrl ? "border-teal-400" : "border-gray-300"
                }`}
                type="button"
              >
                <img
                  className="w-full h-full object-contain"
                  src={getCloudinaryUrl(imageItem.sourceUrl, {
                    width: 64,
                    height: 64,
                    quality: 'auto',
                    format: 'auto',
                    crop: 'fill'
                  }, cloudinaryCloudName)}
                  alt={product.name}
                />
              </button>
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
            
            {/* Success Animation */}
            {showSuccess && (
              <div className="mt-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300">
                  <BiCheckCircle className="text-xl" />
                  <span className="font-medium">Added to cart!</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">Product Description</p>
            <hr className="w-2/3 mt-2 border-t-2 border-gray-300" />
            <p className="mt-4 text-gray-700">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Product Attributes - Full Width Multi-Column */}
      {product.sharedAttributes && product.sharedAttributes.length > 0 && (
        <div className="w-full mt-12 px-16 py-8 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-6">Product Specifications</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.sharedAttributes.map((item) => (
            <div key={item.identifier.key} className="flex flex-col">
                <dt className="font-semibold text-gray-700 capitalize mb-1">
                  {item.name.replace(/-/g, ' ')}
                </dt>
                <dd className="text-gray-600">
                  {item.values.map(x => x.value).join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
