import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags, FaImage } from "react-icons/fa";

const API = "https://grocery-backend-3pow.onrender.com/api";

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [form, setForm] = useState({ name: "", desc: "", categoryId: "", image: null });

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
    if (form.image) formData.append("image", form.image);

    try {
      if (editingSubcategory) {
        await axios.put(`${API}/subcategories/${editingSubcategory._id}`, formData);
        alert("Subcategory updated successfully!");
      } else {
        await axios.post(`${API}/subcategories`, formData);
        alert("Subcategory added successfully!");
      }
      fetchSubcategories();
      closeModal();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      alert("Error saving subcategory");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await axios.delete(`${API}/subcategories/${id}`);
        alert("Subcategory deleted successfully!");
        fetchSubcategories();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert("Error deleting subcategory");
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
      });
    } else {
      setEditingSubcategory(null);
      setForm({ name: "", desc: "", categoryId: "", image: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
    setForm({ name: "", desc: "", categoryId: "", image: null });
  };

  return (
    <div className="p-6 bg-green-100 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Subcategories</h1>
            <p className="text-gray-600 mt-1">Manage product subcategories</p>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Subcategory
          </button>
        </div>

        {/* Search */}
        <div className="bg-green-100 rounded-2xl p-6 shadow-sm mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-100 rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* ⭐ ROW-WISE SUBCATEGORY LIST */}
        <div className="space-y-4">
          {filteredSubcategories.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all"
            >
              {/* Small Square Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage className="text-gray-400 text-xl" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{sub.name}</h3>
                <p className="text-gray-600 text-sm">{sub.desc}</p>

                <div className="text-gray-500 text-sm mt-1 flex items-center">
                  <FaTags className="mr-1 text-green-600" />
                  <span>Category: {sub.category?.name || "Unknown"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => openModal(sub)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDelete(sub._id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    {editingSubcategory ? "Update" : "Add"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
