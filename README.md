# Smart Retail Scanner

A beginner-friendly React demo for scanning product barcodes, adding products to a shopping cart, and showing the cart total.

## What it does

- Scans common retail barcodes and QR codes with the device camera.
- Adds products from the demo catalog to the cart.
- Looks up product details with Open Food Facts, and optionally OpenMRP for Indian product names and MRP.
- Looks for a recent Open Prices report in INR from an Indian location; when a matching price or MRP is available, it adds the product automatically.
- Remembers a product entered manually in the same browser so the next scan of that barcode can add it directly.
- Shows a confirmation after a product is added.

## Run the app

Requirements: Node.js 20.19 or newer and npm.

1. Clone or open this repository in GitHub Codespaces.
2. In the project terminal, install dependencies:

   ```bash
   npm ci --legacy-peer-deps
   ```

3. Start the development server:

   ```bash
   npm run dev -- --host 0.0.0.0
   ```

4. Open the forwarded app port in a browser and allow camera access. Camera scanning needs a secure page (HTTPS in Codespaces, or localhost).

## Product and price data

The catalog in `src/data/products.js` is sample data for demonstrating the cart. Replace it with your own product catalog before using the app for real shopping.

The scanner can use these online sources:

- [Open Food Facts](https://world.openfoodfacts.org/) for community-maintained product details.
- [Open Prices](https://prices.openfoodfacts.org/) for community-reported prices. This app only accepts prices reported in INR at an Indian location within the last 180 days.
- [OpenMRP](https://github.com/openmrp-in/openmrp) for Indian product details and listed MRP, when its API is available and an API key is configured.

These sources do not cover every barcode. Community prices can be from another shop, and MRP can differ from the selling price. When the app cannot find a suitable price, it asks for the price instead of guessing. Products entered manually are saved only in that browser and device.

### Optional OpenMRP API key

OpenMRP lookup is optional. Keep its API key private and never add it to React code or commit it to GitHub.

For local development, add `OPENMRP_API_KEY=your_key_here` to an untracked `.env.local` file in the project root, then restart Vite. In Codespaces, configure the same name as a Codespaces secret and restart the Codespace. The Vite development server forwards the key on the server side. A production deployment needs its own server-side API endpoint; this development proxy is not a production backend.

## Checks

- `npm run lint` checks code style and common issues.
- `npm run build` creates a production build.

There is no automated camera test. Test camera scanning in a browser with camera permission and a real barcode.

## Share this project

The repository is public. The current scanner work is on the `codex/scanner-success-popup` branch and in pull request #1. Until that pull request is merged, share the pull request link to show the scanner changes; the repository's default `main` branch does not yet contain them.
