import { useEffect, useState } from "react";
import axios from "axios";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Fetch cart
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get("https://grocery-backend-3pow.onrender.com/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://grocery-backend-3pow.onrender.com/api/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://grocery-backend-3pow.onrender.com/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("https://grocery-backend-3pow.onrender.com/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: [] });
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total
  const total = cart.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  if (loading) return <div className="p-6">Loading cart...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item.productId._id} className="border p-4 rounded shadow flex items-center gap-4">
                <img
                  src={`https://grocery-backend-3pow.onrender.com${item.productId.image}`}
                  alt={item.productId.name}
                  className="h-16 w-16 object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{item.productId.name}</h3>
                  <p>₹{item.productId.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                    className="bg-gray-300 px-2 py-1 rounded"
                  >
                    +
                  </button>
                </div>
                <p className="font-bold">₹{item.productId.price * item.quantity}</p>
                <button
                  onClick={() => removeItem(item.productId._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Total: ₹{total}</h3>
            <div className="flex gap-2">
              <button onClick={clearCart} className="bg-red-600 text-white px-4 py-2 rounded">
                Clear Cart
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
