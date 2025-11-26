import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("layouts/index.tsx", [
    index("routes/index.tsx"),

    route('search/:term', "routes/products/plp.tsx"),
    ...prefix("products", [
        index("./routes/products/index.tsx"),
        route(":slug", "./routes/products/details.tsx"),
    ]),

    ...prefix("checkout", [
        index("routes/checkout/cart.tsx"),

        route("address", "routes/checkout/address.tsx"),

        ...prefix(":checkoutId", [
            route("shipping", "routes/checkout/shipping.tsx"),
            route("payment", "routes/checkout/payment.tsx"),
            route("success", "routes/checkout/success.tsx"),
            route("failure", "routes/checkout/failure.tsx"),
            ...prefix("payment", [
                route("stripe", "routes/checkout/payment/stripe.tsx")
            ])
        ])
    ]),
    
  ])

] satisfies RouteConfig;
