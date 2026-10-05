import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, X, AlertCircle } from "lucide-react";

import products from "../data/products";
import { useCart } from "../context/CartContext";

function getStoreCategory(categories = "", productType = "food") {
  const text = categories.toLowerCase();

  if (text.includes("dairy") || text.includes("milk") || text.includes("cheese")) {
    return "Dairy";
  }
  if (text.includes("fruit") || text.includes("apple") || text.includes("banana")) {
    return "Fruits";
  }
  if (text.includes("bread") || text.includes("bakery")) {
    return "Bakery";
  }
  if (text.includes("beverage") || text.includes("drink") || text.includes("water")) {
    return "Beverages";
  }
  if (text.includes("snack") || text.includes("chips")) {
    return "Snacks";
  }
  if (text.includes("beauty") || text.includes("cosmetic") || productType === "beauty") {
    return "Personal Care";
  }
  return "Grocery";
}

function ScannerModal({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const lastScanRef = useRef({ code: "", time: 0 });
  const lookupInProgressRef = useRef(false);
  const productEntryOpenRef = useRef(false);

  const { addToCart } = useCart();
  const addToCartRef = useRef(addToCart);

  const [status, setStatus] = useState("starting");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [retryKey, setRetryKey] = useState(0);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingName, setPendingName] = useState("");
  const [pendingPrice, setPendingPrice] = useState("");

  useEffect(() => {
    addToCartRef.current = addToCart;
  }, [addToCart]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = window.setTimeout(() => setMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    setStatus("starting");
    setError("");
    setMessage("");
    setPendingProduct(null);
    setPendingName("");
    setPendingPrice("");
    productEntryOpenRef.current = false;
    lookupInProgressRef.current = false;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.ITF,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.ALSO_INVERTED, true);

    const reader = new BrowserMultiFormatReader(hints);

    function openProductEntry(barcode, product = null) {
      const productType = product?.product_type || "food";
      setPendingProduct({
        id: barcode,
        barcode,
        brand: product?.brands?.split(",")[0]?.trim() || "",
        category: getStoreCategory(product?.categories || "", productType),
        size: product?.quantity || "",
        emoji: "📦",
      });
      setPendingName(product?.product_name || "");
      setPendingPrice("");
      productEntryOpenRef.current = true;
    }

    async function findOnlineProduct(barcode) {
      if (!/^\\d{8,14}$/.test(barcode)) {
        return null;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);

      try {
        const fields = "code,product_name,brands,quantity,categories,product_type";
        const url =
          "https://world.openfoodfacts.org/api/v3/product/" +
          encodeURIComponent(barcode) +
          ".json?product_type=all&fields=" +
          fields;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.product || null;
      } finally {
        window.clearTimeout(timeout);
      }
    }

    async function handleBarcode(barcode) {
      if (
        cancelled ||
        lookupInProgressRef.current ||
        productEntryOpenRef.current
      ) {
        return;
      }

      const now = Date.now();
      if (
        barcode === lastScanRef.current.code &&
        now - lastScanRef.current.time < 2000
      ) {
        return;
      }
      lastScanRef.current = { code: barcode, time: now };

      const localProduct = products.find(
        (item) => String(item.barcode) === barcode
      );

      if (localProduct) {
        addToCartRef.current(localProduct);
        setMessageType("success");
        setMessage(localProduct.name + " added to cart");
        return;
      }

      lookupInProgressRef.current = true;
      setMessageType("info");
      setMessage("Looking up this barcode online...");

      try {
        const onlineProduct = await findOnlineProduct(barcode);
        if (cancelled) return;

        openProductEntry(barcode, onlineProduct);
        setMessageType(onlineProduct ? "info" : "error");
        setMessage(
          onlineProduct
            ? "Product details found. Enter your store price below."
            : "No catalog match. Enter the product name and store price below."
        );
      } catch (lookupError) {
        if (cancelled) return;
        console.error(lookupError);
        openProductEntry(barcode);
        setMessageType("error");
        setMessage(
          "Online lookup failed. Enter the product name and store price below."
        );
      } finally {
        lookupInProgressRef.current = false;
      }
    }

    async function startCamera() {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result || cancelled) return;
            void handleBarcode(result.getText());
          }
        );

        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
          setStatus("ready");
        }
      } catch (err) {
        console.error(err);
        setError(
          "Unable to start the scanner. Allow camera access, then try again."
        );
        setStatus("error");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen, retryKey]);

  function handleAddPendingProduct(event) {
    event.preventDefault();

    const price = Number(pendingPrice);
    if (!pendingName.trim() || pendingPrice === "" || !Number.isFinite(price) || price < 0) {
      setMessageType("error");
      setMessage("Enter a product name and a valid store price first.");
      return;
    }

    const productToAdd = {
      ...pendingProduct,
      name: pendingName.trim(),
      price,
    };
    addToCartRef.current(productToAdd);
    productEntryOpenRef.current = false;
    setPendingProduct(null);
    setPendingName("");
    setPendingPrice("");
    setMessageType("success");
    setMessage(productToAdd.name + " added to cart");
  }

  function handleCancelProductEntry() {
    productEntryOpenRef.current = false;
    setPendingProduct(null);
    setPendingName("");
    setPendingPrice("");
    setMessage("");
  }

  function handleClose() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    productEntryOpenRef.current = false;
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <div>
            <h2>Scan Product</h2>
            <p>Point your camera at a barcode</p>
          </div>

          <button
            className="scanner-close"
            onClick={handleClose}
            aria-label="Close scanner"
          >
            <X size={22} />
          </button>
        </div>

        <div className="scanner-camera">
          {status === "error" ? (
            <div className="scanner-error">
              <AlertCircle size={42} />
              <h3>Camera unavailable</h3>
              <p>{error}</p>
              <button
                className="scanner-retry"
                onClick={() => setRetryKey((current) => current + 1)}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="scanner-video"
              />

              <div className="scanner-frame">
                <span className="corner top-left" />
                <span className="corner top-right" />
                <span className="corner bottom-left" />
                <span className="corner bottom-right" />
              </div>

              <div className={"scanner-status" + (status === "ready" ? " ready" : "")}>
                <Camera size={18} />
                {status === "starting" ? "Starting camera..." : "Camera ready"}
              </div>
            </>
          )}
        </div>

        {pendingProduct && (
          <form
            onSubmit={handleAddPendingProduct}
            style={{
              display: "grid",
              gap: "10px",
              padding: "16px",
              borderTop: "1px solid #e5e7eb",
              maxHeight: "32vh",
              overflowY: "auto",
            }}
          >
            <strong>
              {pendingProduct.brand
                ? pendingProduct.brand + " · " + (pendingName || "Product found")
                : pendingName || "Add scanned product"}
            </strong>
            <small>
              Barcode: {pendingProduct.barcode}
              {pendingProduct.size ? " · " + pendingProduct.size : ""}
            </small>
            <label style={{ display: "grid", gap: "4px" }}>
              Product name
              <input
                value={pendingName}
                onChange={(event) => setPendingName(event.target.value)}
                placeholder="Type the product name"
                required
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </label>
            <label style={{ display: "grid", gap: "4px" }}>
              Store price (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={pendingPrice}
                onChange={(event) => setPendingPrice(event.target.value)}
                placeholder="Enter the price shown in your store"
                required
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </label>
            <small>
              Product details may come from Open Food Facts. Its catalog may not
              include every item, and it does not provide your store's checkout price.
            </small>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="scanner-cancel"
                onClick={handleCancelProductEntry}
              >
                Cancel
              </button>
              <button type="submit" className="scanner-retry">
                Add to cart
              </button>
            </div>
          </form>
        )}

        {message && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              left: "50%",
              bottom: "32px",
              transform: "translateX(-50%)",
              zIndex: 9999,
              padding: "14px 20px",
              borderRadius: "12px",
              backgroundColor:
                messageType === "success"
                  ? "#15803d"
                  : messageType === "info"
                    ? "#1d4ed8"
                    : "#b91c1c",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            {messageType === "success" ? "✓ " : messageType === "info" ? "ℹ " : "⚠ "}
            {message}
          </div>
        )}

        <div className="scanner-footer">
          <p>Hold the barcode inside the frame.</p>
          <button className="scanner-cancel" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScannerModal;
