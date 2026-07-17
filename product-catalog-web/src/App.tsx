import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AdminPage from "./features/admin/pages/AdminPage";
import CartPage from "./features/cart/pages/CartPage";
import ProductListPage from "./features/products/pages/ProductListPage";
import ProductDetailPage from "./features/products/pages/ProductDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
