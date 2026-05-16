import { createBrowserRouter } from "react-router-dom";

import { Layout } from "../components/Layout";
import { AdminPage } from "../pages/AdminPage";
import { CartPage } from "../pages/CartPage";
import { OrdersPage } from "../pages/OrdersPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { ProductListPage } from "../pages/ProductListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProductListPage />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
    ],
  },
]);
