# ReadyKutVeggies

kut veggies

A dependency-free, responsive storefront prototype for fresh, ready-cut vegetables. It can be opened directly in a browser; no build step or package installation is required.

## Run locally

1. Open `index.html` in a current browser.
2. For a local web server, run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

Product photos and the DM Sans/Manrope typefaces are loaded from external services, so those assets need an internet connection. The page and cart logic otherwise run locally in the browser.

## Deploy to Render

This is a static HTML, CSS and JavaScript site. The included `render.yaml` configures a Render Static Site to publish the repository root without a build step.

1. Push the website files, including `render.yaml`, to the GitHub repository's `main` branch.
2. In Render, choose **New > Blueprint** and connect `Vikki250/ReadyKutVeggies`.
3. Review the `readykutveggies` static site and deploy it. Render will provide an `onrender.com` URL and can redeploy on later pushes.

The current GitHub repository must contain the website files before Render can deploy this storefront; a local workspace change alone is not enough.

## Edit the catalog

Edit `products.js` to change product names, descriptions, pack weights, prices, images and cooking/storage guidance. All listed prices and weights are sample placeholders, not ReadyKutVeggies prices. Replace them only with confirmed business information. Each pack's `price` is a number in South African rand; the storefront formats it as `R0.00`.

Update the editable contact placeholders in `index.html`. Confirm the actual delivery areas, fees, order policies and payment arrangements with the business before publishing.

## Cart behavior

The cart supports pack-size selection, quantity changes from 1 to 99, removal, browser-local persistence, and calculated product subtotal/estimated total in ZAR. Delivery is not calculated because the fee is not configured. The checkout form validates contact details and an optional delivery address, then displays a local-only summary. It does not transmit personal information, place an order, or simulate a payment. A real order flow requires a trusted backend and a legitimate payment or order channel; never put payment secrets in client-side code.

## Tests

The focused cart test uses Node.js's built-in test assertion library and has no package dependencies:

```sh
node tests/cart.test.js
```

Node.js is not required to run the storefront itself. If a JavaScript runtime is unavailable, test adding two pack sizes, changing/removing quantities, and checking the subtotal in the browser.

## Before launch

- Replace all sample product prices and confirm available weights and product contents.
- Add real business contact details and confirm storage instructions for each product.
- Confirm delivery areas, fees, order policies, and accepted payment/order methods.
- Replace external sample photos with approved product photography where available.
- Connect checkout to a secure backend or a confirmed ordering channel before accepting orders.
