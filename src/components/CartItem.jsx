import { Minus, Plus, X } from "lucide-react";

import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.emoji}
      </div>

      <div className="cart-item-info">
        <h4>{item.name}</h4>

        <p>
          {item.size} • ₹{item.price} each
        </p>

        <div className="cart-quantity">
          <button
            onClick={() =>
              decreaseQuantity(item.id)
            }
          >
            <Minus size={13} />
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() =>
              increaseQuantity(item.id)
            }
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="cart-item-right">
        <strong>
          ₹{item.price * item.quantity}
        </strong>

        <button
          className="remove-item"
          onClick={() =>
            removeFromCart(item.id)
          }
          aria-label="Remove item"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

export default CartItem;