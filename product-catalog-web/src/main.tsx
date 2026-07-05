import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Provider } from "./components/ui/provider";
import { CartProvider } from "./features/cart/context/CartContext";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider>
      <CartProvider>
        <App />
      </CartProvider>
    </Provider>
  </BrowserRouter>
)