import { createBrowserRouter } from "react-router-dom";

import { Layout } from "../components/Layout";
import { CartPage } from "../pages/CartPage";
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
    ],
  },
]);
