import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ShoppingCart, Package, Loader } from 'lucide-react';

const DemandTrendGraph = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flexible API URL - falls back to localhost if env var not set
  const API = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api';

  // Colors and gradients for products
  const colorPalette = [
    { color: "#F59E0B", gradient: "from-amber-400 to-orange-500" },
    { color: "#3B82F6", gradient: "from-blue-400 to-blue-600" },
    { color: "#10B981", gradient: "from-emerald-400 to-green-600" },
    { color: "#EF4444", gradient: "from-red-400 to-rose-600" },
    { color: "#8B5CF6", gradient: "from-purple-400 to-purple-600" },
    { color: "#EC4899", gradient: "from-pink-400 to-pink-600" },
  ];

  // Step 1: Fetch products and orders on component mount
  useEffect(() => {
    fetchProductsAndOrders();
  }, []);

  // Step 2: When both data are fetched, process high demand products
  useEffect(() => {
    if (allProducts.length > 0 && orders.length > 0) {
      processHighDemandProducts();
    }
  }, [allProducts, orders]);

  const fetchProductsAndOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching data from API:', API);

      // Fetch products
      const productsResponse = await fetch(`${API}/products`);
      if (!productsResponse.ok) {
        throw new Error(`Products API failed: ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();
      console.log('✅ Products fetched:', productsData.length);
      setAllProducts(productsData);

      // Fetch orders
      const ordersResponse = await fetch(`${API}/order/all`);
      if (!ordersResponse.ok) {
        throw new Error(`Orders API failed: ${ordersResponse.status}`);
      }
      const ordersData = await ordersResponse.json();
      console.log('✅ Orders fetched:', ordersData.length);
      console.log('📦 Sample order:', ordersData[0]);
      setOrders(ordersData);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const processHighDemandProducts = () => {
    console.log('🔍 Processing high demand products...');
    console.log('📦 Total orders to process:', orders.length);
    console.log('🛍️ Total products available:', allProducts.length);
    
    // Step 1: Count quantities for each product across all orders
    const productQuantities = {};
    let processedItems = 0;
    let skippedItems = 0;
    
    orders.forEach((order, orderIndex) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, itemIndex) => {
          // Try to get product ID from different possible fields
          let productId = null;
          
          // Check all possible product ID locations
          if (item.product) {
            if (typeof item.product === 'object' && item.product !== null) {
              // Product is populated object
              productId = item.product._id || item.product.id;
            } else if (typeof item.product === 'string') {
              // Product is just an ID string
              productId = item.product;
            }
          } else if (item.productId) {
            productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
          } else if (item.product_id) {
            productId = item.product_id;
          }
          
          const quantity = parseInt(item.quantity || item.qty || 1);
          
          if (productId && typeof productId === 'string') {
            productQuantities[productId] = (productQuantities[productId] || 0) + quantity;
            processedItems++;
            
            // Debug first 3 orders
            if (orderIndex < 3) {
              console.log(`✅ Order ${orderIndex + 1}, Item ${itemIndex + 1}:`, {
                productId,
                quantity,
                itemStructure: Object.keys(item)
              });
            }
          } else {
            skippedItems++;
            // Debug first 3 problematic items
            if (orderIndex < 3) {
              console.error(`❌ Order ${orderIndex + 1}, Item ${itemIndex + 1} - Invalid product ID:`, {
                productId,
                productType: typeof productId,
                item: item,
                itemKeys: Object.keys(item)
              });
            }
          }
        });
      }
    });

    console.log(`📊 Processing summary:
      ✅ Items processed successfully: ${processedItems}
      ❌ Items skipped: ${skippedItems}
      🔢 Unique products found: ${Object.keys(productQuantities).length}
    `);
    console.log('📊 Product quantities:', productQuantities);

    // Step 2: Sort products by demand (highest first)
    const productIds = Object.keys(productQuantities);
    
    if (productIds.length === 0) {
      console.error('❌ No valid product IDs found in orders');
      setError('No products found in orders. Check console for details.');
      return;
    }
    
    const sortedProductIds = productIds.sort(
      (a, b) => productQuantities[b] - productQuantities[a]
    );

    console.log('🏆 Top 6 products by demand:');
    sortedProductIds.slice(0, 6).forEach((id, index) => {
      const product = allProducts.find(p => p._id === id);
      console.log(`  ${index + 1}. ${product?.name || 'Unknown'} (ID: ${id}) - ${productQuantities[id]} units`);
    });

    // Step 3: Get top 6 high demand products
    const topProductIds = sortedProductIds.slice(0, 6);

    if (topProductIds.length === 0) {
      console.warn('⚠️ No products found in orders');
      setError('No order data available');
      return;
    }

    console.log(`📦 Processing ${topProductIds.length} high demand products...`);

    // Step 4: Generate weekly trend data for last 6 weeks
    const now = new Date();
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weeks.push({ 
        start: weekStart, 
        end: weekEnd, 
        label: `Week ${6 - i}` 
      });
    }

    // Step 5: Build product data with weekly trends
    const highDemandProducts = topProductIds.map((productId, index) => {
      const product = allProducts.find(p => p._id === productId);
      
      if (!product) {
        console.warn(`⚠️ Product not found for ID: ${productId}`);
        return null;
      }

      // Calculate weekly data
      const weeklyData = weeks.map(week => {
        let addToCartCount = 0;
        let purchaseCount = 0;

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= week.start && orderDate <= week.end) {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                let itemProductId = null;
                
                // Same logic as above for extracting product ID
                if (item.product) {
                  if (typeof item.product === 'object' && item.product !== null) {
                    itemProductId = item.product._id || item.product.id;
                  } else if (typeof item.product === 'string') {
                    itemProductId = item.product;
                  }
                } else if (item.productId) {
                  itemProductId = typeof item.productId === 'string' ? item.productId : item.productId._id;
                } else if (item.product_id) {
                  itemProductId = item.product_id;
                }

                // Ensure we have a valid string ID before comparing
                if (itemProductId && typeof itemProductId === 'string' && itemProductId === productId) {
                  const quantity = parseInt(item.quantity || item.qty || 1);
                  purchaseCount += quantity;
                  // Estimate add-to-cart as slightly higher (people add but don't always buy)
                  addToCartCount += Math.ceil(quantity * 1.3);
                }
              });
            }
          }
        });

        return {
          time: week.label,
          addToCart: addToCartCount,
          purchases: purchaseCount,
          total: addToCartCount + purchaseCount
        };
      });

      console.log(`📈 ${product.name} weekly trend:`, weeklyData);

      return {
        id: productId,
        name: product.name || 'Unknown Product',
        color: colorPalette[index % colorPalette.length].color,
        gradient: colorPalette[index % colorPalette.length].gradient,
        image: product.images && product.images.length > 0 
          ? product.images[0] 
          : "https://via.placeholder.com/100?text=No+Image",
        data: weeklyData,
        totalDemand: productQuantities[productId]
      };
    }).filter(Boolean);

    console.log('🎉 High demand products ready:', highDemandProducts.map(p => ({
      name: p.name,
      totalDemand: p.totalDemand
    })));

    setProducts(highDemandProducts);
  };

  // Graph dimensions
  const width = 1000;
  const height = 500;
  const padding = { top: 40, right: 60, bottom: 60, left: 80 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(...products.flatMap(p => p.data.map(d => d.total)), 1);
  const minValue = 0;
  const xStep = graphWidth / 5;

  const getX = (index) => padding.left + index * xStep;
  const getY = (value) => {
    if (maxValue === minValue) return padding.top + graphHeight / 2;
    return padding.top + graphHeight - ((value - minValue) / (maxValue - minValue)) * graphHeight;
  };

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

  const getMarkerSize = (value) => {
    const minSize = 32;
    const maxSize = 56;
    if (maxValue === 0) return minSize;
    return minSize + (value / maxValue) * (maxSize - minSize);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base sm:text-lg">Loading analytics data...</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Fetching products and orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl w-full">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-red-500 text-2xl sm:text-3xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">API Connection Error</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">Troubleshooting:</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3">
              <li>• Check if your backend API is running</li>
              <li>• Verify the API URL: <code className="bg-gray-200 px-2 py-1 rounded text-xs break-all">{API}</code></li>
              <li>• Make sure CORS is enabled on your backend</li>
              <li>• Check the browser console (F12) for detailed error messages</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <a 
                href={`${API}/order/all`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-center"
              >
                Test Orders API →
              </a>
              <a 
                href={`${API}/products`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-center"
              >
                Test Products API →
              </a>
            </div>
          </div>
          
          <button 
            onClick={fetchProductsAndOrders}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-gray-400 text-4xl sm:text-5xl mb-4">📊</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Order Data Available</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">No products found in orders to display trends.</p>
          <button 
            onClick={fetchProductsAndOrders}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            High Demand Products Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Real-time tracking of top-performing products • Based on actual order data</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {products.slice(0, 4).map((product) => {
            const latestDemand = product.data[product.data.length - 1]?.total || 0;
            const previousDemand = product.data[product.data.length - 2]?.total || 0;
            const growth = previousDemand > 0 
              ? ((latestDemand - previousDemand) / previousDemand * 100).toFixed(1)
              : '0.0';
            
            return (
              <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border-2" style={{ borderColor: product.color }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{product.name}</p>
                    <p className="text-lg font-bold text-gray-900">{product.totalDemand} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">
                    {growth >= 0 ? '+' : ''}{growth}%
                  </span>
                  <span className="text-gray-400">vs last week</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Graph Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">📈 Product Demand Trends</h2>
              <p className="text-xs sm:text-sm text-gray-500">Showing top {products.length} products by order volume</p>
            </div>
            
            <button 
              onClick={fetchProductsAndOrders}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all w-full sm:w-auto"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Last 6 Weeks</span>
            </button>
          </div>

          {/* Graph Container - Desktop */}
          <div className="hidden lg:block relative bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-2xl p-8" style={{ height: '600px' }}>
            <svg width={width} height={height} className="overflow-visible">
              <defs>
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding.top + graphHeight - ratio * graphHeight;
                const value = Math.round(minValue + ratio * (maxValue - minValue));
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="url(#gridGradient)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 15}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-400 font-medium"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Vertical grid lines */}
              {products[0]?.data.map((point, i) => {
                const x = getX(i);
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + graphHeight}
                      stroke="url(#gridGradient)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 25}
                      textAnchor="middle"
                      className="text-xs fill-gray-500 font-medium"
                    >
                      {point.time}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis label */}
              <text
                x={padding.left - 60}
                y={padding.top + graphHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90 ${padding.left - 60} ${padding.top + graphHeight / 2})`}
                className="text-sm fill-gray-600 font-semibold"
              >
                Total Demand (Units)
              </text>

              {/* Product lines */}
              {products.map((product) => (
                <g key={product.id}>
                  <defs>
                    <linearGradient id={`gradient-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={product.color} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={product.color} stopOpacity="1" />
                    </linearGradient>
                    
                    <filter id={`glow-${product.id}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path
                    d={generatePath(product.data)}
                    fill="none"
                    stroke={`url(#gradient-${product.id})`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#glow-${product.id})`}
                  />
                </g>
              ))}
            </svg>

            {/* Product markers */}
            {products.map((product) =>
              product.data.map((point, index) => {
                const x = getX(index);
                const y = getY(point.total);
                const size = getMarkerSize(point.total);
                const isHovered = hoveredPoint?.productId === product.id && hoveredPoint?.index === index;

                return (
                  <div
                    key={`${product.id}-${index}`}
                    className="absolute cursor-pointer transition-all duration-300"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.3)' : 'scale(1)'}`,
                      zIndex: isHovered ? 100 : 10,
                    }}
                    onMouseEnter={() => setHoveredPoint({ productId: product.id, index, product, point })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {isHovered && (
                      <div
                        className="absolute inset-0 rounded-full blur-xl opacity-60"
                        style={{
                          backgroundColor: product.color,
                          transform: 'scale(1.5)',
                        }}
                      />
                    )}

                    <div
                      className="relative rounded-full overflow-hidden shadow-lg border-4 transition-all duration-300"
                      style={{
                        width: size,
                        height: size,
                        borderColor: product.color,
                        boxShadow: isHovered ? `0 8px 30px ${product.color}60` : `0 4px 15px ${product.color}40`,
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${product.color}15, transparent)`,
                        }}
                      />
                    </div>

                    <div
                      className="absolute -top-1 -right-1 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg"
                      style={{ backgroundColor: product.color }}
                    >
                      {point.total}
                    </div>

                    {isHovered && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 w-56 border border-gray-200/50 z-[200]">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                          <div
                            className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2"
                            style={{ borderColor: product.color }}
                          >
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{point.time}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1">
                              <ShoppingCart className="w-3 h-3" />
                              Add to Cart
                            </span>
                            <span className="font-semibold text-gray-900">{point.addToCart}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              Purchases
                            </span>
                            <span className="font-semibold text-gray-900">{point.purchases}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-gray-600 font-medium">Total Demand</span>
                            <span
                              className="font-bold text-sm"
                              style={{ color: product.color }}
                            >
                              {point.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile/Tablet Simplified View */}
          <div className="lg:hidden bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-2xl p-4 sm:p-6">
            <div className="space-y-6">
              {products.map((product, idx) => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md border-2" style={{ borderColor: product.color }}>
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Total: {product.totalDemand} orders</p>
                    </div>
                  </div>
                  
                  {/* Mini line chart representation */}
                  <div className="space-y-2">
                    {product.data.map((point, pointIdx) => {
                      const maxInProduct = Math.max(...product.data.map(d => d.total));
                      const percentage = maxInProduct > 0 ? (point.total / maxInProduct) * 100 : 0;
                      
                      return (
                        <div key={pointIdx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16 sm:w-20">{point.time}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 sm:h-8 overflow-hidden">
                            <div 
                              className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: product.color
                              }}
                            >
                              {point.total > 0 && (
                                <span className="text-white text-xs font-bold">{point.total}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div
                    className="w-8 sm:w-12 h-0.5 sm:h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: product.color }}
                  />
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden shadow-md border-2"
                    style={{ borderColor: product.color }}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{product.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandTrendGraph;