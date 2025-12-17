import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaTags,
  FaSearch,
  FaBell,
  FaEnvelope,
  FaCog,
  FaUser,
  FaAppleAlt,
  FaCarrot,
  FaGlassWhiskey,
  FaDrumstickBite,
  FaCocktail,
  FaFish,
  FaCookieBite,
  FaShoppingBag,
  FaStar,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";


const API = "https://grocery-backend-3pow.onrender.com/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    todaysRevenue: 0,
    usersWithOrders: 0,
  });
  const [Category, setCategory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lastOrders, setLastOrders] = useState([]);
  console.log(lastOrders);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const statsUpdate = {};

      try {
        const profilesRes = await axios.get(`${API}/auth/alluser`, { headers });
        statsUpdate.totalUsers = profilesRes.data.length;
      } catch (error) {
        console.error("Error fetching users:", error);
        statsUpdate.totalUsers = 0;
      }

      try {
        const ordersRes = await axios.get(`${API}/order/all`, { headers });
        statsUpdate.totalOrders = ordersRes.data.length;
        console.log(statsUpdate.totalOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        statsUpdate.totalOrders = 0;
      }
      //products
      try {
        const productsRes = await axios.get(`${API}/products`);
        statsUpdate.totalProducts = productsRes.data.length;
      } catch (error) {
        console.error("Error fetching products:", error);
        statsUpdate.totalProducts = 0;
      }

      try {
        const popularproducts = await axios.get(`${API}/products`);
        setProducts(popularproducts.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        statsUpdate.totalProducts = 0;
      }
      //categories

      try {
        const cat = await axios.get(`${API}/categories`);
        setCategory(cat.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        statsUpdate.totalCategories = 0;
      }
      try {
        const categoriesRes = await axios.get(`${API}/categories`);
        statsUpdate.totalCategories = categoriesRes.data.length;
      } catch (error) {
        console.error("Error fetching categories:", error);
        statsUpdate.totalCategories = 0;
      }
      //orders
      try {
        const lastOrder = await axios.get(`${API}/order/all`);
        setLastOrders(lastOrder.data);
        console.log(lastOrder.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }

      // Calculate today's revenue and users with orders from today's orders
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrdersRes = await axios.get(`${API}/order/all`, {
          headers,
        });
        const todaysOrders = todaysOrdersRes.data.filter((order) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
        statsUpdate.todaysRevenue = todaysOrders.reduce(
          (total, order) => total + order.totalAmount,
          0
        );

        // Count unique users who have orders today
        const uniqueUsersToday = new Set(
          todaysOrders.map((order) => order.userId)
        );
        statsUpdate.usersWithOrders = uniqueUsersToday.size;

        console.log("Today's Revenue:", statsUpdate.todaysRevenue);
        console.log("Users with orders today:", statsUpdate.usersWithOrders);
      } catch (error) {
        console.error("Error calculating today's revenue:", error);
        statsUpdate.todaysRevenue = 0;
        statsUpdate.usersWithOrders = 0;
      }

      setStats((prevStats) => ({ ...prevStats, ...statsUpdate }));
    } catch (error) {
      console.error("Error in fetchStats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: <FaTags className="text-2xl text-green-600" />,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <FaBox className="text-2xl text-green-600" />,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers className="text-2xl text-green-600" />,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaShoppingCart className="text-2xl text-green-600" />,
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todaysRevenue}`,
      icon: <FaShoppingBag className="text-2xl text-green-600" />,
    },
    {
      title: "Users with Orders Today",
      value: stats.usersWithOrders,
      icon: <FaUser className="text-2xl text-green-600" />,
    },
  ];

  const discountProducts = [
    {
      name: "Organic Tomatoes",
      originalPrice: "Rs15.00",
      discountPrice: "Rs12.00",
      image:
        "https://images.pexels.com/photos/7223311/pexels-photo-7223311.jpeg?cs=srgb&dl=pexels-alena-darmel-7223311.jpg&fm=jpg",
    },
    {
      name: "Fresh Milk",
      originalPrice: "Rs8.00",
      discountPrice: "Rs6.40",
      image:
        "https://www.rothesadairy.org/wp-content/uploads/2019/03/fresh-milk-1.jpg",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FaCheckCircle className="mr-1" />;
      case "Pending":
        return <FaClock className="mr-1" />;
      case "Cancelled":
        return <FaTimesCircle className="mr-1" />;
      default:
        return null;
    }
  };
  console.log(Category);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 space-y-6 overflow-y-auto">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Categories
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {Category.map((category, index) => (
              <div key={index} className="flex flex-col items-center min-w-max">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-sm overflow-hidden bg-gray-200`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Products Section */}
        <div className="bg-green-100 rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {" "}
            Popular Products{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={product.images[0]}

                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-3"
                />
                <h3 className="font-medium text-gray-900 mb-1">
                  {" "}
                  {product.name}{" "}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {" "}
                    {product.price}{" "}
                  </span>
                  <div className="flex items-center">
                    {" "}
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {" "}
                      {product.rating}{" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>
        {/* Discount Shop Section */}
        <div className="bg-gradient-to-r from-white-400 to-white-600 rounded-xl p-6 text-black">
          <h2 className="text-xl font-semibold mb-4">Discount Shop</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discountProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    20% OFF
                  </span>
                  <button className="bg-white text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <FaPlus />
                  </button>
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-60 object-cover rounded-lg mb-3"
                />
                <h3 className="font-medium mb-1">{product.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm line-through opacity-75">
                    {product.originalPrice}
                  </span>
                  <span className="font-bold">{product.discountPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Orders Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Last Orders
          </h2>
          <div className="space-y-3">
            {lastOrders.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.userId.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-green-500">
                    {order.totalAmount}
                  </span>
                  <span
                    className={`flex items-center bg-yellow-700 text-amber-50 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.deliveryStatus
                    )}`}
                  >
                    {getStatusIcon(order.deliveryStatus)}
                    {order.deliveryStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
