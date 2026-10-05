import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, X, AlertCircle } from "lucide-react";

import products from "../data/products";
import { useCart } from "../context/CartContext";

function ScannerModal({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const lastScanRef = useRef({ code: "", time: 0 });

  const { addToCart } = useCart();
  const addToCartRef = useRef(addToCart);

  const [status, setStatus] = useState("starting");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Keep the latest cart action without restarting the camera after cart updates.
  useEffect(() => {
    addToCartRef.current = addToCart;
  }, [addToCart]);

  // Clear the toast after it has been visible briefly.
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

    async function startCamera() {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result || cancelled) return;

            const barcode = result.getText();
            const now = Date.now();

            // Ignore rapid repeat readings while a barcode is held in view.
            if (
              barcode === lastScanRef.current.code &&
              now - lastScanRef.current.time < 2000
            ) {
              return;
            }

            lastScanRef.current = { code: barcode, time: now };

            const product = products.find(
              (item) => String(item.barcode) === barcode
            );

            if (product) {
              addToCartRef.current(product);
              setMessageType("success");
              setMessage(product.name + " added to cart");
            } else {
              setMessageType("error");
              setMessage("No product found for barcode " + barcode);
            }
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
          "Unable to start the scanner. Allow camera access, then close and reopen the scanner."
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
  }, [isOpen]);

  function handleClose() {
    controlsRef.current?.stop();
    controlsRef.current = null;
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
                onClick={() => {
                  setError("");
                  setStatus("starting");
                  handleClose();
                }}
              >
                Close and try again
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
              backgroundColor: messageType === "success" ? "#15803d" : "#b91c1c",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            }}
          >
            {messageType === "success" ? "✓ " : "⚠ "}
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
