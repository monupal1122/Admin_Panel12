import { Routes, Route } from "react-router-dom";
import Dashboard from "../src/component/dashboard";
import Categories from "../src/component/Categories";
import Subcategories from "../src/component/Subcategories";
import Products from "../src/component/Products";
import Banners from "../src/component/Banners";
import Users from "../src/component/Users";
import Order from "../src/component/OrdersPage";

import Login from "../src/component/Login";
import Layout from "../src/component/Layout";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Pages with Layout */}
      <Route path="/admin-dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/categories" element={<Layout><Categories /></Layout>} />
      <Route path="/subcategories" element={<Layout><Subcategories /></Layout>} />
      <Route path="/users" element={<Layout><Users /></Layout>} />
      <Route path="/orderpage" element={<Layout><Order /></Layout>} />
      <Route path="/banners" element={<Layout><Banners /></Layout>} />

      {/* Catch-all: redirect unknown URLs to login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
