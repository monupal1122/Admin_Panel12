import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "../src/component/dashboard";
import Categories from "../src/component/Categories";
import Subcategories from "../src/component/Subcategories";
import Products from "../src/component/Products";
import Banners from "../src/component/Banners";
import Users from "../src/component/Users";
import Order from "../src/component/OrdersPage";
import Cart from "../src/component/Cart";
import Login from "../src/component/Login";
import Layout from "../src/component/Layout";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <Routes>
      {isLoginPage ? (
        <Route path="/login" element={<Login />} />
      ) : (
        <>
        <Route path="/" element={<Login />} />
          <Route path="/admin-dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/subcategories" element={<Layout><Subcategories /></Layout>} />
          <Route path="/users" element={<Layout><Users /></Layout>} />
          <Route path="/orderpage" element={<Layout><Order /></Layout>} />
          <Route path="/banners" element={<Layout><Banners /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/Login" element={<Login />} />
        </>
      )}
    </Routes>
  );
}

export default App;
