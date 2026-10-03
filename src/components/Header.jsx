import {
  Search,
  ShoppingCart,
  ScanLine,
  MapPin,
  ChevronDown,
} from "lucide-react";

import { useCart } from "../context/CartContext";

function Header({
  search,
  setSearch,
  onOpenCart,
  onOpenScanner,
}) {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo">
          🛒
        </div>

        <div>
          <h1>Smart Retail</h1>
          <span>Scan • Shop • Pay</span>
        </div>
      </div>

      <button className="location-button">
        <MapPin size={17} />
        <span>In-Store Shopping</span>
        <ChevronDown size={16} />
      </button>

      <div className="search-bar">
        <Search size={20} />

        <input
          type="text"
          placeholder='Search "milk", "bread"...'
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="header-actions">
        <button
          className="scan-button"
          onClick={onOpenScanner}
        >
          <ScanLine size={19} />
          <span>Scan Product</span>
        </button>

        <button
          className="cart-button"
          onClick={onOpenCart}
        >
          <ShoppingCart size={20} />

          <span>Cart</span>

          <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}

export default Header;
