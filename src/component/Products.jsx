import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaFilter, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [alert, setAlert] = useState(null);
  const LOW_STOCK_THRESHOLD = 10;

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    price: "",
    discount: "",
    stock: "",
    categoryId: "",
    subcategoryIds: [],
    images: [],
    status: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedStatus, showLowStockOnly]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
      console.log("products iddar hai", res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Ensure products is an array on error
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get(`${API}/subcategories`);
      setSubcategories(res.data);

    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Get filtered subcategories based on selected category (for filters)
  const getFilteredSubcategories = () => {
    if (!selectedCategory) {
      return subcategories;
    }
    return subcategories.filter(sub => {
      const subCatId = sub.category?._id || sub.category;
      return String(subCatId) === String(selectedCategory);
    });
  };

  // Get filtered subcategories for form based on selected category in form
  const getFormFilteredSubcategories = () => {
    if (!formData.categoryId) {
      return [];
    }
    return subcategories.filter(sub => {
      const subCatId = sub.category?._id || sub.category;
      return String(subCatId) === String(formData.categoryId);
    });
  };

  const toggleSubcategory = (subId) => {
    setFormData(prev => {
      const isSelected = prev.subcategoryIds.includes(subId);
      if (isSelected) {
        return { ...prev, subcategoryIds: prev.subcategoryIds.filter(id => id !== subId) };
      } else {
        return { ...prev, subcategoryIds: [...prev.subcategoryIds, subId] };
      }
    });
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => String(product.category?._id) === String(selectedCategory));
    }

    if (selectedSubcategory) {
      filtered = filtered.filter((product) => {
        const sub = product.subcategory;
        if (!sub) return false;
        if (Array.isArray(sub)) {
          return sub.some(s => String(s._id || s) === String(selectedSubcategory));
        }
        if (sub._id && String(sub._id) === String(selectedSubcategory)) return true;
        if (String(sub) === String(selectedSubcategory)) return true;
        return false;
      });
    }

    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(product => product.status !== false === isActive);
    }

    if (showLowStockOnly) {
      filtered = filtered.filter(product => (product.stock || 0) < LOW_STOCK_THRESHOLD);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("desc", formData.desc);
    data.append("price", formData.price);
    data.append("discount", formData.discount || 0);
    data.append("stock", formData.stock || 0);
    data.append("categoryId", formData.categoryId);
    // Fix: Backend currently only supports a single subcategory ObjectId.
    // If multiple are selected, we send only the first one to avoid BSON/Cast errors.
    if (formData.subcategoryIds.length > 0) {
      data.append("subcategoryId", formData.subcategoryIds[0]);
    }
    data.append("status", formData.status);

    formData.images.forEach((image, index) => {
      data.append("images", image);
    });

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct._id}`, data);
        showAlert("Product updated successfully!");
      } else {
        await axios.post(`${API}/products`, data);
        showAlert("Product created successfully!");
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert(error.response?.data?.message || "Error saving product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API}/products/${id}`);
        fetchProducts();
        showAlert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        showAlert("Error deleting product", "error");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      desc: product.desc,
      price: product.price,
      discount: product.discount || "",
      stock: product.stock || "",
      categoryId: product.category?._id || "",
      subcategoryIds: Array.isArray(product.subcategory)
        ? product.subcategory.map(s => s._id || s)
        : (product.subcategory?._id ? [product.subcategory._id] : (product.subcategory ? [product.subcategory] : [])),
      images: [],
      status: product.status !== false
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      desc: "",
      price: "",
      discount: "",
      stock: "",
      categoryId: "",
      subcategoryIds: [],
      images: [],
      status: true
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      desc: "",
      price: "",
      discount: "",
      stock: "",
      categoryId: "",
      subcategoryIds: [],
      images: [],
      status: true
    });
  };

  const toggleStatus = async (product) => {
    try {
      const data = new FormData();
      data.append("status", !product.status);
      await axios.put(`${API}/products/${product._id}`, data);
      fetchProducts();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Success Alert */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${alert.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
                }`}
            >
              {alert.type === 'error' ? <FaExclamationCircle className="text-xl" /> : <FaCheckCircle className="text-xl" />}
              <span className="font-semibold">{alert.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <div className="flex gap-4 items-center">
            {products.some(p => (p.stock || 0) < LOW_STOCK_THRESHOLD) && (
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl border border-amber-200 flex items-center animate-pulse">
                <span className="mr-2">⚠️</span>
                <span className="text-sm font-semibold">
                  {products.filter(p => (p.stock || 0) < LOW_STOCK_THRESHOLD).length} products low on stock!
                </span>
              </div>
            )}
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedCategory}
            >
              <option value="">{selectedCategory ? 'All Subcategories' : 'Select Category First'}</option>
              {getFilteredSubcategories().map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border ${showLowStockOnly
                ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-sm'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className={showLowStockOnly ? 'text-amber-600' : 'text-gray-400'}>⚠️</span>
              Low Stock
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'table' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'card' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Products Table */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.desc}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(product.subcategory) ? (
                            product.subcategory.map(sub => (
                              <span key={sub._id || sub} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] whitespace-nowrap">
                                {sub.name || 'Sub'}
                              </span>
                            ))
                          ) : (
                            product.subcategory?.name || 'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.discount ? `${product.discount}%` : '0%'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className={`${(product.stock || 0) < LOW_STOCK_THRESHOLD ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                            {product.stock || 0}
                          </span>
                          {(product.stock || 0) < LOW_STOCK_THRESHOLD && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] uppercase font-heavy rounded">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(product)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.status !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {product.status !== false ? <FaToggleOn className="mr-1" /> : <FaToggleOff className="mr-1" />}
                          {product.status !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleStatus(product)}
                      className={`p-2 rounded-full ${product.status !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                      {product.status !== false ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.desc}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                    {product.discount > 0 && (
                      <span className="text-sm text-red-600 font-medium">{product.discount}% off</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      Stock:
                      <span className={`ml-1 font-semibold ${(product.stock || 0) < LOW_STOCK_THRESHOLD ? 'text-red-500' : 'text-gray-900'}`}>
                        {product.stock || 0}
                      </span>
                      {(product.stock || 0) < LOW_STOCK_THRESHOLD && (
                        <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      )}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${product.status !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {product.status !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {editingProduct ? 'Edit Product' : 'New Product'}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Product Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all font-medium text-sm"
                          placeholder="e.g. Wireless Buds"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Description</label>
                        <textarea
                          value={formData.desc}
                          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all font-medium text-sm resize-none"
                          rows={2}
                          placeholder="Brief description..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Price</label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-500 transition-all font-medium text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Disc %</label>
                          <input
                            type="number"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-500 transition-all font-medium text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Stock</label>
                          <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-500 transition-all font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1 text-center">Category</label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryIds: [] })}
                          className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all font-medium text-sm appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4 pt-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center">Subcategories</label>
                        {!formData.categoryId ? (
                          <p className="text-[10px] text-center text-slate-300 font-bold italic py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"> Select a category first </p>
                        ) : (
                          <div className="flex flex-wrap justify-center gap-3">
                            {getFormFilteredSubcategories().map((sub) => {
                              const isSelected = formData.subcategoryIds.includes(sub._id);
                              return (
                                <motion.div
                                  key={sub._id}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleSubcategory(sub._id)}
                                  className={`
                                    cursor-pointer flex flex-col items-center gap-1 group
                                  `}
                                >
                                  <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                                    ${isSelected ? 'bg-blue-500 text-white ring-4 ring-blue-500/10' : 'bg-white border-2 border-slate-100 text-slate-400'}
                                  `}>
                                    {sub.image ? (
                                      <img src={sub.image} className={`w-8 h-8 rounded-full object-cover ${isSelected ? '' : 'grayscale-[0.5]'}`} />
                                    ) : (
                                      <span className="text-[10px] font-black">{sub.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {sub.name}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest px-1">Images</label>
                        <input
                          type="file"
                          multiple
                          onChange={handleImageChange}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] cursor-pointer hover:border-green-500 transition-colors"
                          accept="image/*"
                        />
                      </div>

                      <div className="flex items-center justify-between p-1 bg-slate-50 rounded-2xl px-5 py-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Product</label>
                        <div className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                            className="sr-only peer"
                            id="prod-status-modal"
                          />
                          <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-200 active:scale-95"
                      >
                        {editingProduct ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div >
  );
}