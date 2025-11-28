# Reactionary React-Router demo store

This demo store shows some of the capabilites of @reactionary.

## Features Showcased

This project demonstrates the following @reactionary/core capabilities:

- **Product Catalog & Search** – Browse products with search functionality and product listing pages (PLP) with pagination
- **Product Details Page (PDP)** – View detailed product information including:
  - Image galleries with thumbnail navigation
  - Variant selection
  - Real-time stock indicators
  - Product attributes and specifications
  - Dynamic pricing
- **Shopping Cart Management** – Add products to cart, update quantities, and remove items
- **Complete Checkout Flow** – Multi-step checkout process including:
  - Address entry and validation
  - Shipping method selection
  - Payment method selection
  - Order confirmation
- **Stripe Payment Integration** – Process payments through Stripe with proper protocol handling and client secret management
- **User Authentication** – Sign-in, sign-up, password recovery, and sign-out flows with session management
- **Pricing & Inventory Management** – Real-time pricing retrieval and stock availability tracking
- **Session Management** – Secure session handling with cookie-based authentication
- **OpenTelemetry Integration** – Distributed tracing and observability for monitoring application performance
- **Type-Safe API Integration** – Fully typed @reactionary/core client with TypeScript support

## Tech Stack

- **React Router 7** – Full-stack web framework with server-side rendering
- **@reactionary/core** – Comprehensive e-commerce framework
- **TypeScript** – Type safety throughout the application
- **Tailwind CSS** – Utility-first CSS framework
- **Stripe** – Payment processing integration
- **OpenTelemetry** – Application monitoring and tracing




## To configure

Copy the `.env.template`  to `.env` and fill out the various keys and whatnots.

For Cloudinary, you can just create a new empty account. If you dont set a cloudinary account name, it will just default to use the images as they are from your feed.


## To configure @reactionary

Open `client.ts` and find the `createClient` function. Here you defined what providers you want to have for the various capabilities. Currently, it is set to Algolia for search and Commercetools for ecom related stuff.

You can try changing the product search to be run by Commercetools, or you can change to use Medusa instead of Commercetools for the ecom capabiltiies.




















# About the boilerplate


<a href="https://retail.nikolailehbr.ink/">
  <img alt="ReTail website screenshot" src="./public/assets/screenshot.png">
  <h1 align="center">ReTail</h1>
</a>

<p align="center">
A refined React Router starter template with improved defaults for building full-stack web applications.
</p>

<p align="center">
  <a href="#why"><strong>Why</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#development"><strong>Development</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Why

When I first started using `Remix`, the predecessor to `React Router 7`, I worked with the [official `Remix` template with `Vite`](https://github.com/remix-run/remix/tree/main/templates/remix). However, it lacked built-in support for `Tailwind CSS`, requiring me to manually install and configure it for every new project. To simplify this setup, I created my own starter template: **ReTail** (`Remix`/`React Router` + `Tailwind CSS`).

Since then, the official `Remix` template has added `Tailwind CSS` support, and `React Router 7` has been released. Despite these updates, I continue to maintain ReTail because I think it provides better defaults than the default template, includes `ESLint 9`, and integrates useful utilities that improve the development experience.

## Features

- **Automatic class name wrapping** – Keeps long class names readable using [`prettier-plugin-classnames`](https://www.npmjs.com/package/prettier-plugin-classnames).
- **Automatic class sorting** – Ensures consistent class order with [`prettier-plugin-tailwindcss`](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier).
- **ESLint 9** – Maintains code quality with ESLint and the [ESLint Config Inspector](https://eslint.org/blog/2024/04/eslint-config-inspector/).
- **Font optimization** – Preloads local fonts efficiently with [Fontsource](https://fontsource.org/).
- **React Router 7** – The latest version of React Router, paired with Vite for instant server start, fast HMR, and optimized full-stack builds.
- **Remove unused code** – Detect and remove unused code with [Knip](https://www.npmjs.com/package/knip).
- **Tailwind CSS 4** – Build UIs faster with the utility-first CSS framework and its new CSS-first configuration.
- **TypeScript** – Provides type safety and autocompletion for a better developer experience.
- **Vite 6** – A pretty fast frontend build tool that delivers instant code serving and optimized bundling.

## Helpful Scripts

> [!TIP]
> Use any package manager you prefer, such as `npm` or `yarn`, instead of `pnpm`.

- **`pnpm check:unused`**: Find unused code in your project with [Knip](https://www.npmjs.com/package/knip).
- **`pnpm clean`**: Remove the `node_modules` directory.
- **`pnpm format`**: Format all your files with Prettier.
- **`pnpm lint`**: Lint your code with ESLint.
- **`pnpm lint:inspect`**: Inspect your ESLint configuration with the ESLint Config Inspector.
- **`pnpm start`**: Run the app locally in production mode.
- **`pnpm typecheck`**: Generate TypeScript types for your app.

## Development

Run the Vite dev server:

```shellscript
pnpm dev
```

This will automatically open the app in your default browser and expose the host IP to your network, enabling better testing on devices like smartphones.

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
pnpm start
```

Now you'll need to pick a host to deploy it to.

### Acknowledgements
The core boilerplate came form https://retail.nikolailehbr.ink/, and the rest of the boiler plate came from Medusas remix starter example.
