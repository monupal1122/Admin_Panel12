import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";

const API = `${import.meta.env.VITE_API_URL}/api`; // backend base URL

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log(orders);

  // Modal state
  const [openOrder, setOpenOrder] = useState(null); // order object opened in modal
  const [showModal, setShowModal] = useState(false);

  // Track which order is currently being updated (by id)
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Search (optional, small search by order ID)
  const [search, setSearch] = useState("");

  // Status filter
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API}/order/all`);
      setOrders(res.data);
      console.log("Fetched orders:", res.data);
      
    } catch (err) {
      console.error("Error fetching my orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o._id
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "All" || o.deliveryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
  // console.log(orders);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Out for delivery":
        return "bg-orange-100 text-orange-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "Out for delivery":
        return <FaTruck className="text-orange-500" />;
      case "Delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaShoppingCart className="text-gray-500" />;
    }
  };

  // Optimistic update: update UI first, then call API; revert on failure
  const updateStatus = async (orderId, newStatus) => {
    console.log(orderId, newStatus);

    if (!orderId) return;
    const prev = orders.find((o) => o._id === orderId);
    if (!prev) return;

    try {
      setUpdatingOrderId(orderId);

      // optimistic UI update
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId ? { ...o, deliveryStatus: newStatus } : o
        )
      );

      // also update openOrder in modal if showing
      if (openOrder?._id === orderId) {
        setOpenOrder((o) => ({ ...o, deliveryStatus: newStatus }));
      }

      // call API
      await axios.put(`${API}/order/${orderId}/status`, {
        deliveryStatus: newStatus,
      });

      // success: keep UI as is, optionally close modal
      // setShowModal(false); // optional: close automatically
    } catch (err) {
      console.error("Failed to update status:", err);
      // revert UI on failure
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === orderId ? prev : o))
      );
      if (openOrder?._id === orderId) {
        setOpenOrder(prev);
      }
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchMyOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-1">Orders</h1>
        <p className="text-gray-600">
          Click any order to view details and update status
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-3">
        <div className="flex items-center bg-white shadow px-3 py-2 rounded-lg w-full md:w-1/3">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id..."
            className="outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-4 py-2 shadow text-gray-700">
            Total: <span className="font-semibold">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            statusFilter === "All"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setStatusFilter("Confirmed")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            statusFilter === "Confirmed"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
          }`}
        >
          <FaClock /> Processing
        </button>
        <button
          onClick={() => setStatusFilter("Out for delivery")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            statusFilter === "Out for delivery"
              ? "bg-orange-600 text-white"
              : "bg-white text-orange-700 border border-orange-300 hover:bg-orange-50"
          }`}
        >
          <FaTruck /> Out of Delivery
        </button>
        <button
          onClick={() => setStatusFilter("Delivered")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            statusFilter === "Delivered"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border border-green-300 hover:bg-green-50"
          }`}
        >
          <FaCheckCircle /> Delivered
        </button>
        <button
          onClick={() => setStatusFilter("Cancelled")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            statusFilter === "Cancelled"
              ? "bg-red-600 text-white"
              : "bg-white text-red-700 border border-red-300 hover:bg-red-50"
          }`}
        >
          <FaTimesCircle /> Cancelled
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <FaShoppingCart className="text-gray-400 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            No Orders Found
          </h2>
          <p className="text-gray-500">
            Try a different search or refresh the page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Orders list */}
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setOpenOrder(order);
                setShowModal(true);
              }}
            >
              {/* Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order._id}
                  </h3>
                    <h3 className="text-lg font-semibold text-gray-800">
                      UserId #{order.userId._id}
                    </h3>
                    <h3 className="text-lg font-semibold text-black-800">
                       E-mail #{order.userId.email}
                    </h3>

                    <p className="text-gray-600 text-sm">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹{order.totalAmount}
                      </div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.deliveryStatus
                      )}`}
                    >
                      {getStatusIcon(order.deliveryStatus)}
                      {order.deliveryStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items preview (first 2 items) */}
              <div className="p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  Items
                </h4>
                <div className="space-y-3">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                    >
                       {item.productId?.imageUrl || item.productId?.images ? (
                        <img
                          src={
                            item.productId.imageUrl || item.productId.images
                          }
                          alt={item.productId?.name || "product"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          IMG
                        </div>
                      )}

                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">
                          {item.productId?.name || "Unknown Product"}
                        </h5>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Price: ₹{item.price}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-700">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  {order.items && order.items.length > 3 && (
                    <div className="text-sm text-gray-500">
                      + {order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm text-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div>
                      <strong>Payment:</strong> {order.paymentMethod || "N/A"}
                    </div>
                    <div className="mt-1">
                      <strong>Payment Status:</strong>{" "}
                      {order.paymentStatus || "N/A"}
                    </div>
                  </div>

                  {order.addressId && (
                    <div className="text-sm text-gray-600">
                      <strong>Delivery:</strong> {order.addressId.label} -{" "}
                      {order.addressId.fullAddress}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---------- Modal: shows when showModal && openOrder ---------- */}
      {showModal && openOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 relative"
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Order #{openOrder._id?.slice(-8)}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Placed on{" "}
                  {new Date(openOrder.createdAt).toLocaleString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Products list */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {openOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {item.productId?.imageUrl || item.productId?.images ? (
                        <img
                          src={
                            item.productId.imageUrl || item.productId.images
                          }
                          alt={item.productId?.name || "product"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          IMG
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800">
                            {item.productId?.name || "Unknown Product"}
                          </p>
                          <p className="font-semibold text-green-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!openOrder.items || openOrder.items.length === 0) && (
                    <div className="text-gray-500 text-sm">
                      No items found for this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: status and summary */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{openOrder.totalAmount}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <label className="text-sm font-medium text-gray-700">
                    Delivery Status
                  </label>
                  <select
                    value={openOrder.deliveryStatus}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      // Optimistic local change (modal and list)
                      setOpenOrder((o) => ({
                        ...o,
                        deliveryStatus: newStatus,
                      }));
                      // update list in background (optimistic handled by updateStatus)
                      await updateStatus(openOrder._id, newStatus);
                    }}
                    className={`mt-2 w-full px-3 py-2 rounded-lg border ${getStatusColor(
                      openOrder.deliveryStatus
                    )}`}
                    disabled={updatingOrderId === openOrder._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {updatingOrderId === openOrder._id && (
                    <p className="text-sm text-blue-600 mt-2">
                      Updating status...
                    </p>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Payment:</strong> {openOrder.paymentMethod || "N/A"}
                  </p>
                  <p className="mt-2">
                    <strong>Payment Status:</strong>{" "}
                    {openOrder.paymentStatus || "N/A"}
                  </p>
                  {openOrder.addressId && (
                    <p className="mt-2">
                      <strong>Address:</strong>{" "}
                      {openOrder.addressId.fullAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
