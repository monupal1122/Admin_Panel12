import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaTags,
  FaUser,
  FaShoppingBag,
  FaStar,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChartLine,
  FaCaretUp,
} from "react-icons/fa";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
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
      } catch (error) {
        console.error("Error fetching orders:", error);
        statsUpdate.totalOrders = 0;
      }

      try {
        const productsRes = await axios.get(`${API}/products`);
        statsUpdate.totalProducts = productsRes.data.length;
      } catch (error) {
        console.error("Error fetching products:", error);
        statsUpdate.totalProducts = 0;
      }

      try {
        const popularproducts = await axios.get(`${API}/products`);
        setProducts(popularproducts.data.filter(product => product));
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      try {
        const cat = await axios.get(`${API}/categories`);
        setCategory(cat.data.filter(category => category));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }

      try {
        const categoriesRes = await axios.get(`${API}/categories`);
        statsUpdate.totalCategories = categoriesRes.data.length;
      } catch (error) {
        console.error("Error fetching categories:", error);
        statsUpdate.totalCategories = 0;
      }

      try {
        const lastOrder = await axios.get(`${API}/order/all`);
        setLastOrders(lastOrder.data.filter(order => order && order.userId));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysOrdersRes = await axios.get(`${API}/order/all`, { headers });
        const todaysOrders = todaysOrdersRes.data.filter((order) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
        statsUpdate.todaysRevenue = todaysOrders.reduce(
          (total, order) => total + order.totalAmount,
          0
        );

        const uniqueUsersToday = new Set(
          todaysOrders.map((order) => order.userId)
        );
        statsUpdate.usersWithOrders = uniqueUsersToday.size;
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
      icon: <FaTags className="text-3xl" />,
      gradient: "from-purple-500 to-purple-700",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+12%",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <FaBox className="text-3xl" />,
      gradient: "from-blue-500 to-blue-700",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+8%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers className="text-3xl" />,
      gradient: "from-green-500 to-green-700",
      bgGradient: "from-green-50 to-green-100",
      change: "+23%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaShoppingCart className="text-3xl" />,
      gradient: "from-orange-500 to-orange-700",
      bgGradient: "from-orange-50 to-orange-100",
      change: "+15%",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todaysRevenue}`,
      icon: <FaShoppingBag className="text-3xl" />,
      gradient: "from-pink-500 to-pink-700",
      bgGradient: "from-pink-50 to-pink-100",
      change: "+31%",
    },
    {
      title: "Active Customers",
      value: stats.usersWithOrders,
      icon: <FaUser className="text-3xl" />,
      gradient: "from-indigo-500 to-indigo-700",
      bgGradient: "from-indigo-50 to-indigo-100",
      change: "+18%",
    },
  ];

  const discountProducts = [
    {
      name: "Organic Tomatoes",
      originalPrice: "Rs15.00",
      discountPrice: "Rs12.00",
      image: "https://images.pexels.com/photos/7223311/pexels-photo-7223311.jpeg?cs=srgb&dl=pexels-alena-darmel-7223311.jpg&fm=jpg",
    },
    {
      name: "Fresh Milk",
      originalPrice: "Rs8.00",
      discountPrice: "Rs6.40",
      image: "https://www.rothesadairy.org/wp-content/uploads/2019/03/fresh-milk-1.jpg",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "Pending":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "Cancelled":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
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

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      <div className="p-8 space-y-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg">
            <FaChartLine className="text-green-500" />
            <span className="text-sm font-semibold text-gray-700">All systems operational</span>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
                    <FaCaretUp className="text-xs" />
                    <span>{card.change}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl backdrop-blur-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors">
              View All →
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {Category.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-max group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 shadow-lg overflow-hidden transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Products Section */}
        <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm hover:shadow-lg transition-all">
              See More
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaPlus className="text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{product.price}
                  </span>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                    <FaStar className="text-yellow-500 text-xs mr-1" />
                    <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Shop Section */}
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <span className="mr-3">🔥</span> Hot Deals Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discountProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                    20% OFF
                  </span>
                  <button className="bg-white text-purple-600 p-3 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                    <FaPlus />
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl mb-4 shadow-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-lg line-through opacity-75">{product.originalPrice}</span>
                  <span className="text-2xl font-bold">{product.discountPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Orders Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {lastOrders.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{order.username}</p>
                    <p className="text-sm text-gray-600">{order.userId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ₹{order.totalAmount}
                  </span>
                  <span
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(
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