# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Barcode product lookup

The scanner checks the optional OpenMRP India catalog first, then Open Food Facts. A matching OpenMRP record with a listed MRP is added to the cart using that MRP and saved in this browser for later scans. Check the price against your store: listed MRP may not be the actual selling price. If no MRP is available, the scanner asks for the missing price. If neither catalog recognizes the barcode, it asks for the product name and price.

### Enable OpenMRP

OpenMRP requires an API key. Keep it private; do not put it in React code or commit it to GitHub.

1. Get an OpenMRP API key from the OpenMRP project, if its developer signup and API are available.
2. In the Codespace, add `OPENMRP_API_KEY` as a Codespaces secret, then restart the Codespace so the environment variable is available. For local development, put `OPENMRP_API_KEY=your_key_here` in an untracked `.env.local` file at the project root.
3. Restart the Vite development server.

The Vite development server forwards requests to OpenMRP and adds the key server-side. The key is not sent in the browser bundle. This proxy is for development in the Codespace; a production deployment needs a server-side API route of its own. If OpenMRP is unavailable or the key is missing, the scanner continues to Open Food Facts and its manual-entry fallback.

Product catalogs can be incomplete. Barcode recognition only reads the number; catalog records supply the product details. Confirm prices and product matches before relying on them for checkout.
