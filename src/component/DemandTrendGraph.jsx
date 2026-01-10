import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ShoppingCart, Package, Loader, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity } from 'lucide-react';
import axios from 'axios';

const DemandTrendGraph = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('demand'); // 'demand' or 'stock'

  const API = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api';

  const colorPalette = [
    { color: "#3B82F6", gradient: "from-blue-400 to-blue-600", light: "#EFF6FF" },
    { color: "#10B981", gradient: "from-emerald-400 to-green-600", light: "#ECFDF5" },
    { color: "#F59E0B", gradient: "from-amber-400 to-orange-500", light: "#FFFBEB" },
    { color: "#EF4444", gradient: "from-red-400 to-rose-600", light: "#FEF2F2" },
    { color: "#8B5CF6", gradient: "from-purple-400 to-purple-600", light: "#F5F3FF" },
    { color: "#EC4899", gradient: "from-pink-400 to-pink-600", light: "#FDF2F8" },
  ];

  useEffect(() => {
    fetchProductsAndOrders();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0 && orders.length > 0) {
      processHighDemandProducts();
    }
  }, [allProducts, orders]);

  const fetchProductsAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/order/all`)
      ]);

      if (!productsRes.ok || !ordersRes.ok) throw new Error('Failed to fetch data');

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setAllProducts(productsData);
      setOrders(ordersData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const processHighDemandProducts = () => {
    const productQuantities = {};

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          let productId = item.product?._id || item.product || item.productId || item.product_id;
          if (productId && typeof productId === 'object') productId = productId._id;

          const quantity = parseInt(item.quantity || item.qty || 1);
          if (productId) {
            productQuantities[productId] = (productQuantities[productId] || 0) + quantity;
          }
        });
      }
    });

    const sortedProductIds = Object.keys(productQuantities).sort(
      (a, b) => productQuantities[b] - productQuantities[a]
    );

    const topProductIds = sortedProductIds.slice(0, 6);
    const now = new Date();
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weeks.push({ start: weekStart, end: weekEnd, label: `Week ${6 - i}` });
    }

    const highDemandProducts = topProductIds.map((productId, index) => {
      const product = allProducts.find(p => p._id === productId);
      if (!product) return null;

      const weeklyData = weeks.map(week => {
        let purchaseCount = 0;
        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= week.start && orderDate <= week.end) {
            order.items?.forEach(item => {
              let itemPid = item.product?._id || item.product || item.productId || item.product_id;
              if (itemPid && typeof itemPid === 'object') itemPid = itemPid._id;
              if (itemPid === productId) {
                purchaseCount += parseInt(item.quantity || item.qty || 1);
              }
            });
          }
        });

        return {
          time: week.label,
          purchases: purchaseCount,
          addToCart: Math.ceil(purchaseCount * 1.4),
          total: purchaseCount + Math.ceil(purchaseCount * 1.4)
        };
      });

      return {
        id: productId,
        name: product.name,
        color: colorPalette[index % colorPalette.length].color,
        gradient: colorPalette[index % colorPalette.length].gradient,
        image: product.images?.[0] || "https://via.placeholder.com/100",
        data: weeklyData,
        totalDemand: productQuantities[productId],
        stock: product.stock || 0,
        price: product.price || 0
      };
    }).filter(Boolean);

    setProducts(highDemandProducts);
  };

  // Graph Logic
  const width = 1000;
  const height = 400;
  const padding = { top: 40, right: 60, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...products.flatMap(p => p.data.map(d => d.total)), 10);
  const xStep = graphWidth / 5;

  const getX = (index) => padding.left + index * xStep;
  const getY = (value) => padding.top + graphHeight - (value / maxValue) * graphHeight;

  const generatePath = (data) => {
    if (data.length === 0) return '';
    let path = `M ${getX(0)} ${getY(data[0].total)}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(data[i].total);
      const x2 = getX(i + 1);
      const y2 = getY(data[i + 1].total);
      const cx = (x1 + x2) / 2;
      path += ` Q ${cx} ${y1}, ${x2} ${y2}`;
    }
    return path;
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const lowStockProducts = allProducts.filter(p => (p.stock || 0) < 10);
  const outOfStockProducts = allProducts.filter(p => (p.stock || 0) <= 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium text-slate-600">Generating Analysis...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Intelligence</h1>
            <p className="text-slate-500 font-medium">Insights and inventory analysis at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('demand')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'demand' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Demand Analysis
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Stock Management
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<Activity className="text-blue-500" />}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingCart className="text-emerald-500" />}
            trend="+8.2%"
            trendUp={true}
          />
          <StatCard
            title="Low Stock Warning"
            value={lowStockProducts.length}
            icon={<AlertTriangle className="text-amber-500" />}
            trend={outOfStockProducts.length > 0 ? `${outOfStockProducts.length} out of stock` : "Needs attention"}
            trendUp={false}
            status="warning"
          />
          <StatCard
            title="Products Live"
            value={allProducts.length}
            icon={<Package className="text-purple-500" />}
            trend="Active catalog"
          />
        </div>

        {activeTab === 'demand' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Demand Graph */}
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 size={120} className="text-blue-600" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-3/4">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Demand Trend</h2>
                      <p className="text-sm text-slate-500">Top performaning products over last 6 weeks</p>
                    </div>
                  </div>

                  <div className="relative h-[400px] w-full overflow-x-auto lg:overflow-visible">
                    <svg width={width} height={height} className="min-w-[800px]">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                        <line key={i} x1={padding.left} y1={getY(ratio * maxValue)} x2={width - padding.right} y2={getY(ratio * maxValue)} stroke="#F1F5F9" strokeWidth="1" />
                      ))}

                      {/* Lines */}
                      {products.map(p => (
                        <path key={p.id} d={generatePath(p.data)} fill="none" stroke={p.color} strokeWidth="4" strokeLinecap="round" className="transition-all duration-300 opacity-80 hover:opacity-100" />
                      ))}

                      {/* Labels */}
                      {products[0]?.data.map((d, i) => (
                        <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider">{d.time}</text>
                      ))}
                    </svg>

                    {/* Floating Marker Hovers */}
                    {products.map(p => p.data.map((d, i) => (
                      <div
                        key={`${p.id}-${i}`}
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                        style={{ left: getX(i), top: getY(d.total) }}
                        onMouseEnter={() => setHoveredPoint({ p, d })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm mx-auto mt-2.5 transition-transform group-hover:scale-150`} style={{ backgroundColor: p.color }}></div>

                        {hoveredPoint?.p.id === p.id && hoveredPoint?.d.time === d.time && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-30 min-w-[140px]">
                            <p className="text-xs font-bold opacity-70 mb-1">{p.name}</p>
                            <p className="text-lg font-bold">{d.purchases} Orders</p>
                            <div className="h-1 w-full bg-white/20 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-white" style={{ width: `${(d.purchases / maxValue) * 100}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )))}
                  </div>
                </div>

                <div className="lg:w-1/4 space-y-4">
                  <h3 className="font-bold text-slate-800 mb-4 px-2">Top Performers</h3>
                  {products.map((p, i) => (
                    <div key={p.id} className="group p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                          <img src={p.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.totalDemand} units sold</p>
                        </div>
                        <div className="text-right">
                          <TrendingUp size={16} className="text-emerald-500 ml-auto" />
                          <span className="text-[10px] font-bold text-emerald-600">Leader</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stock Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 md:col-span-2">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" /> Critical Stock Levels
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="text-left pb-4">Product</th>
                        <th className="text-left pb-4">Current Stock</th>
                        <th className="text-left pb-4">Status</th>
                        <th className="text-right pb-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockProducts.map(p => (
                        <tr key={p._id} className="group hover:bg-slate-50/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={p.images?.[0]} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-slate-600">{p.stock} units</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              {p.stock <= 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="text-blue-600 font-bold text-sm hover:underline">Restock</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lowStockProducts.length === 0 && (
                    <div className="text-center py-12 text-slate-400 italic">No low stock items found! All healthy.</div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200">
                <PieChart size={40} className="mb-6 opacity-80" />
                <h2 className="text-2xl font-bold mb-2">Inventory Value</h2>
                <p className="text-blue-100 mb-8 opacity-80">Total estimated value of current stock across all categories.</p>
                <p className="text-4xl font-black mb-2">₹{(allProducts.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0)).toLocaleString()}</p>
                <div className="flex items-center gap-2 text-blue-200 font-bold text-sm">
                  <ArrowUpRight size={16} />
                  8.4% increase from last month
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendUp, status }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:scale-[1.02] cursor-default ${status === 'warning' ? 'ring-2 ring-amber-500/20' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${status === 'warning' ? 'text-amber-600' : trendUp ? 'text-emerald-500' : 'text-slate-500'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : trendUp === false ? <ArrowDownRight size={14} /> : null}
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default DemandTrendGraph;
