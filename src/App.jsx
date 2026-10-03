import { CartProvider } from "./context/CartContext";
import StorePage from "./pages/StorePage";

function App() {
  return (
    <CartProvider>
      <StorePage />
    </CartProvider>
  );
}

export default App;
