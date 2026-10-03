import { Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const cartItem = cart.find(
    (item) => item.id === product.id
  );

  return (
    <article className="product-card">
      <div className="product-image">
        <span>{product.emoji}</span>
      </div>

      <div className="product-card-content">
        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <p className="product-brand">
          {product.brand} • {product.size}
        </p>

        <p className="product-barcode">
          Barcode: {product.barcode}
        </p>

        <div className="product-card-footer">
          <strong className="product-price">
            ₹{product.price}
          </strong>

          {!cartItem ? (
            <button
              className="add-product-button"
              onClick={() => addToCart(product)}
            >
              <Plus size={17} />
              Add
            </button>
          ) : (
            <div className="quantity-control">
              <button
                onClick={() =>
                  decreaseQuantity(product.id)
                }
              >
                <Minus size={14} />
              </button>

              <span>{cartItem.quantity}</span>

              <button
                onClick={() =>
                  increaseQuantity(product.id)
                }
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
