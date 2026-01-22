import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags, FaImage, FaCheckCircle, FaExclamationCircle, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [form, setForm] = useState({ name: "", desc: "", categoryId: "", image: null, status: true });
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterSubcategories();
  }, [subcategories, searchTerm]);

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get(`${API}/subcategories`);
      setSubcategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
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

  const filterSubcategories = () => {
    let filtered = subcategories;

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubcategories(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("desc", form.desc);
    formData.append("categoryId", form.categoryId);
    formData.append("status", form.status);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingSubcategory) {
        await axios.put(`${API}/subcategories/${editingSubcategory._id}`, formData);
        showAlert("Subcategory updated successfully!");
      } else {
        await axios.post(`${API}/subcategories`, formData);
        showAlert("Subcategory added successfully!");
      }
      fetchSubcategories();
      closeModal();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      showAlert(error.response?.data?.message || "Error saving subcategory", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`${API}/subcategories/${id}`);
        showAlert("Subcategory deleted successfully!");
        fetchSubcategories();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        showAlert("Error deleting subcategory", "error");
      }
    }
  };

  const openModal = (subcategory = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setForm({
        name: subcategory.name || "",
        desc: subcategory.desc || "",
        categoryId: subcategory.category?._id || "",
        image: null,
        status: subcategory.status !== false
      });
    } else {
      setEditingSubcategory(null);
      setForm({ name: "", desc: "", categoryId: "", image: null, status: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
    setForm({ name: "", desc: "", categoryId: "", image: null, status: true });
  };

  const toggleActiveSubcategory = async (subcategory) => {
    try {
      await axios.put(`${API}/subcategories/${subcategory._id}/toggle-active`);
      fetchSubcategories();
    } catch (error) {
      console.error("Error toggling subcategory status:", error);
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Subcategories</h1>
            <p className="text-gray-500 font-medium mt-1">Secondary level categorization</p>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center transition-all shadow-lg hover:shadow-green-200 active:scale-95"
          >
            <FaPlus className="mr-2" />
            New Subcategory
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm mb-8 border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subcategories by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-none rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* ⭐ ROW-WISE SUBCATEGORY LIST */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSubcategories.map((sub, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                key={sub._id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex items-center gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all"
              >
                {/* Image Container */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border-2 border-slate-50 shrink-0 group-hover:border-green-100 transition-colors">
                  {sub.image ? (
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <FaImage className="text-slate-300 text-2xl" />
                  )}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-xl text-slate-800 truncate">{sub.name}</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                      {sub.category?.name || "No Category"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1 font-medium">{sub.desc || "No description provided."}</p>
                </div>

                {/* Actions Container */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActiveSubcategory(sub)}
                    className={`p-3 rounded-2xl transition-all ${sub.status !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                    title={sub.status !== false ? 'Deactivate' : 'Activate'}
                  >
                    {sub.status !== false ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                  </button>
                  <button
                    onClick={() => openModal(sub)}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                    title="Edit Subcategory"
                  >
                    <FaEdit className="text-lg" />
                  </button>

                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
                    title="Delete Subcategory"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal */}
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/20"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingSubcategory ? "Edit Subcategory" : "Create Subcategory"}
                  </h2>
                  <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="e.g. Smartphones"
                      className="w-full px-5 py-4 border-2 border-slate-100 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Description</label>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setForm({ ...form, desc: e.target.value })}
                      rows="3"
                      placeholder="Tell us more about this subcategory"
                      className="w-full px-5 py-4 border-2 border-slate-100 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Parent Category *</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      required
                      className="w-full px-5 py-4 border-2 border-slate-100 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium appearance-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Thumbnail</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                      className="w-full border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-2xl px-5 py-3.5 text-sm cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-1">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.checked })}
                        className="sr-only peer"
                        id="status-toggle"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </div>
                    <label htmlFor="status-toggle" className="text-sm font-bold text-gray-600 uppercase tracking-tight">Active Status</label>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 px-6 rounded-2xl font-bold transition-all">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-green-200">
                      {editingSubcategory ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
