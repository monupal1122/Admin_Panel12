import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaTags, FaBox, FaUsers, FaShoppingCart, FaImage, FaSignOutAlt } from "react-icons/fa";

const Sidebar = ({ onLinkClick }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin-dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt className="w-5 h-5" />,
    },
    {
      path: "/categories",
      label: "Categories",
      icon: <FaTags className="w-5 h-5" />,
    },
    {
      path: "/subcategories",
      label: "Subcategories",
      icon: <FaTags className="w-5 h-5" />,
    },
    {
      path: "/products",
      label: "Products",
      icon: <FaBox className="w-5 h-5" />,
    },
    {
      path: "/users",
      label: "Users",
      icon: <FaUsers className="w-5 h-5" />,
    },
    {
      path: "/orderpage",
      label: "Orders",
      icon: <FaShoppingCart className="w-5 h-5" />,
    },
    {
      path: "/banners",
      label: "Banners",
      icon: <FaImage className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white h-full w-64 shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-600">Admin Panel</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 768 && onLinkClick) {
                    onLinkClick();
                  }
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-green-100 text-green-700 border-r-4 border-green-500"
                    : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
