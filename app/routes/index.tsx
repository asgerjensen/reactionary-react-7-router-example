import { Link } from "react-router";

export default function Index() {
  return (
    <div
      className="container mx-auto flex min-h-dvh flex-col items-center
        justify-center gap-8 overflow-x-hidden px-4 pt-16 pb-8"
    >
      <div className="relative">
        <div
          className="absolute -inset-16 -z-20 rounded-full bg-white opacity-5
            blur-3xl"
        ></div>
        <h1
          className="bg-linear-to-br from-neutral-200 to-neutral-400
            bg-clip-text text-center text-4xl leading-tight font-bold
            tracking-tight text-transparent sm:text-5xl"
        >
          @reactionary Demo Store
        </h1>
      </div>
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-emerald-300">Welcome to the Reactionary Demo</h2>
          <p className="text-neutral-300 leading-relaxed">
            This is a demonstration e-commerce store showcasing the capabilities of{" "}
            <a 
              href="https://github.com/reactionary" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              @reactionary/core
            </a>
            , a comprehensive e-commerce framework built for modern web applications.
          </p>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-emerald-300">Currently Showcasing:</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Product Catalog:</strong> Browse products with search functionality and product listing pages (PLP)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Product Details:</strong> View detailed product information with image galleries, variant selection, and stock indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Shopping Cart:</strong> Add products to cart, manage quantities, and view cart summary</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Checkout Flow:</strong> Complete checkout process including address entry, shipping method selection, and payment options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Stripe Integration:</strong> Process payments through Stripe with proper protocol handling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Authentication:</strong> User sign-in, sign-up, and password recovery flows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Pricing & Inventory:</strong> Real-time pricing and stock availability management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span><strong>Pagination:</strong> Navigate through product listings with page controls</span>
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-neutral-400 pt-2">
            Explore the store using the navigation above to see these features in action!
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-center">
        Built with{" "}
        <Link
          to="https://reactrouter.com/"
          className="border-b-2 border-neutral-400 text-neutral-300
            hover:border-neutral-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Router 7
        </Link>
        ,{" "}
        <Link
          to="https://www.typescriptlang.org/"
          className="border-b-2 border-neutral-400 text-neutral-300
            hover:border-neutral-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          TypeScript
        </Link>{" "}
        and{" "}
        <Link
          to="https://tailwindcss.com"
          className="border-b-2 border-neutral-400 text-neutral-300
            hover:border-neutral-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tailwind CSS
        </Link>
      </p>
      <div className="my-4 flex flex-wrap justify-center sm:my-8">
        <Link
          to="/products"
          className="relative flex items-center gap-1.5 overflow-clip
            rounded-full border-2 bg-emerald-600 px-6 py-3 text-base font-semibold
            text-white inset-shadow-2xs inset-shadow-emerald-400 transition-colors
            before:absolute before:inset-0 before:bg-gradient-to-b
            before:from-white/10 before:to-transparent hover:bg-emerald-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z"></path>
          </svg>
          Browse Products
        </Link>
      </div>
      <div
        className="max-w-5xl columns-1 rounded-2xl border border-neutral-800
          bg-neutral-900 p-4 text-balance max-sm:rounded-b-none sm:columns-2
          lg:columns-3"
      >
        {FEATURES.map(({ title, description }) => (
          <div
            key={title}
            className="mt-4 break-inside-avoid rounded-xl first:mt-0"
          >
            <div
              className="space-y-1 rounded-xl border border-neutral-800
                bg-neutral-950 p-4"
            >
              <h2 className="text leading-snug font-bold text-neutral-200">
                {title}
              </h2>
              <p
                dangerouslySetInnerHTML={{ __html: description }}
                className="text-sm leading-normal [&>a]:text-neutral-300
                  [&>a]:underline [&>a]:hover:text-neutral-200
                  [&>code]:rounded-md [&>code]:bg-neutral-800 [&>code]:px-1
                  [&>code]:py-0.5 [&>code]:text-xs"
              ></p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-400">
        Boilerplate project created by {" "}
        <a
          href="https://www.nikolailehbr.ink/"
          className="border-b-2 border-neutral-400 text-neutral-300
            hover:border-neutral-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nikolai Lehbrink
        </a>
      </p>
    </div>
  );
}

const FEATURES = [
  {
    title: "React Router 7",
    description: "A full-stack web framework focused on modern web standards.",
  },
  {
    title: "TypeScript",
    description: "Ensures type safety throughout, even in configuration files.",
  },
  {
    title: "Tailwind CSS 4",
    description: "The latest version of the utility-first CSS framework.",
  },
  {
    title: "ESLint 9 with Rule Inspector",
    description:
      "Ensure consistent code with ESLint 9 and the <a target='_blank' href='https://eslint.org/blog/2024/04/eslint-config-inspector/'>ESLint Config Inspector</a> with <code>npm run lint:inspect</code>.",
  },
  {
    title: "Automatic class name wrapping",
    description:
      "Wraps long Tailwind class names based on Prettier's <code>printWidth</code> setting.",
  },
  {
    title: "Automatic class sorting",
    description:
      "Automatically sorts Tailwind classes and removes extra spaces.",
  },
  {
    title: "Format script",
    description:
      "Automatically formats files with a single <code>npm run format</code> command.",
  },
  {
    title: "Optimized Fonts",
    description:
      "Efficient font loading with <code>Fontsource</code> and optimized preloading.",
  },
  {
    title: "Check for unused code",
    description:
      "Run <code>npm run check:unused</code> to find unused code with <code>Knip</code>.",
  },
];
