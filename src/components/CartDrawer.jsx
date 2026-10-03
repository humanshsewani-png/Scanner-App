import {
  ArrowLeft,
  Share2,
  ShoppingBag,
  ShieldCheck,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import CartItem from "./CartItem";

function CartDrawer({ isOpen, onClose }) {
  const { cart, cartCount, subtotal } =
    useCart();

  const handlingCharge = cart.length > 0 ? 2 : 0;
  const total = subtotal + handlingCharge;

  if (!isOpen) {
    return null;
  }

  function handlePayment() {
    if (cart.length === 0) {
      return;
    }

    alert(
      `Payment screen coming next.\nTotal: ₹${total}`
    );
  }

  return (
    <>
      <div
        className="cart-overlay"
        onClick={onClose}
      />

      <aside className="cart-drawer">
        <div className="cart-drawer-header">
          <button
            className="icon-button"
            onClick={onClose}
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <h2>My Cart</h2>
            <p>
              {cartCount} item
              {cartCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button className="icon-button">
            <Share2 size={19} />
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={42} />
              </div>

              <h3>Your cart is empty</h3>

              <p>
                Scan a product or add one from
                the store.
              </p>

              <button
                className="secondary-full-button"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-store-card">
                <div className="store-status-icon">
                  ✓
                </div>

                <div>
                  <h3>Shopping in progress</h3>
                  <p>
                    Your items are added to
                    your virtual cart.
                  </p>
                </div>
              </div>

              <div className="cart-items">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>

              <section className="bill-card">
                <h3>Bill details</h3>

                <div className="bill-row">
                  <span>Items total</span>
                  <strong>
                    ₹{subtotal}
                  </strong>
                </div>

                <div className="bill-row">
                  <span>Handling charge</span>

                  <strong>
                    ₹{handlingCharge}
                  </strong>
                </div>

                <div className="bill-row bill-total">
                  <span>Total</span>

                  <strong>
                    ₹{total}
                  </strong>
                </div>
              </section>

              <section className="security-card">
                <ShieldCheck size={18} />

                <div>
                  <h4>Secure Scan & Go</h4>

                  <p>
                    Payment and verification
                    will be connected next.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="footer-total">
              <span>₹{total}</span>
              <small>TOTAL</small>
            </div>

            <button
              className="payment-button"
              onClick={handlePayment}
            >
              Proceed to Pay
            </button>

            <button
              className="close-drawer-button"
              onClick={onClose}
            >
              <X size={15} />
              Close
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;