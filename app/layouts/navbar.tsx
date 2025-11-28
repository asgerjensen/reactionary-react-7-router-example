import { Link, NavLink, Form, useNavigate } from "react-router";
import { BiShoppingBag, BiUser } from "react-icons/bi";

export default function Navbar({ cartCount, isLoggedIn }) {

  const navigate = useNavigate();
  
  // TODO: Get actual user state from session/context
  const userName = ""; // Replace with actual user name

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const term = formData.get("search") as string;
    if (term.trim()) {
      navigate(`/search/${encodeURIComponent(term.trim())}`);
    }
  };
  const links = [
    {
      label: "Home",
      url: "/",
    },
    {
      label: "Products",
      url: "/products",
    },
    {
      label: "About",
      url: "/about",
    },
  ];

  return (
    <nav className="flex items-center justify-between px-8 pt-2">
      {/* Site Logo */}
      <div className="font-mono text-3xl font-extrabold uppercase">
        <Link to="/">
          <img className="w-20" src="/logo.svg" alt="Medusa" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="space-x-4">
        {links.map((link, index) => (
          <NavLink key={index} to={link.url} className="navlink">
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="search"
          placeholder="search"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </form>

      {/* User Account */}
      <div className="font-semibold text-gray-600 hover:text-emerald-500">
        {isLoggedIn ? (
          <Form method="post" action="/sign-out" className="inline">
            <button
              type="submit"
              className="inline-flex items-center space-x-1 transition-colors duration-300 hover:text-emerald-500"
            >
              <BiUser className="text-xl" />Logged in - <span>Sign Out</span>
            </button>
          </Form>
        ) : (
          <NavLink
            to="/sign-in"
            className="inline-flex items-center space-x-1 transition-colors duration-300"
          >
            <BiUser className="text-xl" /> <span>Sign In</span>
          </NavLink>
        )}
      </div>

      {/* Shopping Cart Indicator/Checkout Link */}
      <div className="font-semibold text-gray-600 hover:text-emerald-500">
        <NavLink
          to="/checkout"
          className="inline-flex items-center space-x-1 transition-colors duration-300"
        >
          <BiShoppingBag className="text-xl" /> <span>{cartCount}</span>
        </NavLink>
      </div>
    </nav>
  );
}
