import { useMemo, useState } from "react";

import products from "../data/products";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";
import ScannerModal from "../components/ScannerModal";

const categories = [
  "All",
  "Dairy",
  "Fruits",
  "Bakery",
  "Beverages",
  "Snacks",
  "Grocery",
  "Personal Care",
];

function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.name.toLowerCase().includes(searchText) ||
        product.brand.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="store-page">

      <Header
        search={search}
        setSearch={setSearch}
        onOpenCart={() => setCartOpen(true)}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <main className="store-main">

        <section className="store-hero">

          <div>
            <span className="hero-label">
              SMART SHOPPING
            </span>

            <h2>
              Scan it.
              <br />
              Shop it.
              <br />
              Pay and go.
            </h2>

            <p>
              Use your phone to scan products,
              build your cart and skip the
              checkout queue.
            </p>

            <button
              className="hero-scan-button"
              onClick={() => setScannerOpen(true)}
            >
              Scan a Product
            </button>
          </div>

          <div className="hero-visual">

            <div className="hero-phone">
              <span>▥</span>
              <strong>SCAN</strong>
            </div>

            <div className="floating-card card-one">
              <span>✓</span>
              Product added
            </div>

            <div className="floating-card card-two">
              ₹225
              <small>Cart total</small>
            </div>

          </div>

        </section>


        <section className="catalog-section">

          <div className="catalog-heading">

            <div>
              <span className="section-label">
                IN-STORE CATALOG
              </span>

              <h2>Browse products</h2>

              <p>
                {filteredProducts.length} products available
              </p>
            </div>

          </div>


          <div className="category-list">

            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}

          </div>


          <ProductGrid
            products={filteredProducts}
          />

        </section>

      </main>


      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />


      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

    </div>
  );
}

export default StorePage;
