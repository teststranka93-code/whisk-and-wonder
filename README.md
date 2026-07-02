# Whisk & Wonder — Artisan Bakery Demo

A full-stack, fictional e-commerce site for a bakery, built as a portfolio piece to demonstrate web design, SEO, e-commerce flow, mock payments, marketing capture and analytics event tracking. No real backend, database or payment processor — everything is intentionally mocked so the project runs with zero external accounts.

## Stack

- **Frontend:** vanilla HTML / CSS / JavaScript, no build step, no framework. Chosen so the project is inspectable and runnable with nothing but Node — the point of a portfolio piece is showing the work, not hiding it behind a bundler.
- **Backend:** a small Express server that serves the static frontend, exposes a JSON API (`/api/products`, `/api/reviews`, `/api/checkout`, `/api/contact`, `/api/newsletter`), and rewrites `/products/:slug` to the product detail page for clean URLs.
- **"Database":** two JSON files (`server/data/products.json`, `server/data/reviews.json`) read on each request. No ORM, no persistence — orders are generated and returned, not stored.
- **Payments:** mock Stripe test-mode flow. Card number `4242 4242 4242 4242` simulates success; `4000 0000 0000 0002` simulates a decline, so both the success and failure flows are demoable without a real Stripe account.

## Running it

```bash
cd server
npm install
npm start
```

Then open **http://localhost:4000**. The server serves both the API and the static site — there's nothing else to start.

## Folder structure

```
whisk-and-wonder/
├── server/
│   ├── server.js           # Express app: static files + API routes
│   ├── package.json
│   └── data/
│       ├── products.json   # 12 fake products across cakes/cupcakes/pastries
│       └── reviews.json
└── public/
    ├── index.html           # Home — hero, featured products, reviews, brand story
    ├── about.html            # Story, values, team
    ├── menu.html              # Full catalog with category filtering
    ├── product.html          # Product detail template, driven by /products/:slug
    ├── cart.html              # Cart with quantity editing
    ├── checkout.html          # Delivery + mock payment form
    ├── order-confirmation.html
    ├── payment-fail.html
    ├── contact.html            # Form + Google Maps embed + hours
    ├── blog.html                # Journal index (SEO content hub)
    ├── blog/
    │   ├── best-wedding-cakes-2026.html
    │   └── how-to-choose-a-birthday-cake.html
    ├── sitemap.xml
    ├── robots.txt
    ├── css/style.css          # Full design system (tokens, components, dark mode)
    └── js/
        ├── config.js           # API base + GA4 measurement ID placeholder
        ├── analytics.js        # GA4 loader + wwTrack() event helper
        ├── cart.js              # localStorage cart engine
        ├── components.js       # Shared render helpers (product card, stars, price)
        ├── products.js          # Product grid fetch/render + category filter
        ├── reviews.js
        ├── toast.js              # Toast notification system
        ├── main.js                # Nav, theme toggle, quick-add, newsletter popup
        ├── product-detail.js
        ├── cart-page.js
        ├── checkout.js
        └── contact.js
```

## Architecture notes

- **Cart state** lives in `localStorage`, not a server session — this keeps the backend stateless and the cart persists across page loads without cookies or auth.
- **Clean product URLs** (`/products/cupcake-vanilla`) are handled by an Express route that always returns `product.html`; the page then reads the slug from `location.pathname` and fetches the product client-side. This is a pragmatic tradeoff for a no-build-step demo — a production version would server-render product pages (Next.js/Astro/etc.) so title tags and JSON-LD are present before JavaScript runs, rather than injected after fetch.
- **SEO:** every static page ships a hand-written `<title>`/meta description, a single `<h1>`, and JSON-LD (`LocalBusiness`/`Bakery` on the home page, `Product` on product pages, `Article` on blog posts). `sitemap.xml` and `robots.txt` are static files at the public root.
- **Analytics:** `js/analytics.js` loads the GA4 tag only if a real measurement ID is set in `config.js`; otherwise it logs events to the console so the tracking plan (`add_to_cart`, `purchase`, `contact_form_submit`, `newsletter_signup`) is visible and demoable without a GA account.
- **Performance:** no build tooling means no bundle to optimize, but images are simulated with CSS gradients (no real photography assets were available) which keeps the demo at zero image payload. In a production build these would be replaced with `loading="lazy"` `<img>` tags in modern formats (AVIF/WebP).
- **Dark mode / motion:** theme preference persists via `localStorage` and toggles a `data-theme` attribute consumed entirely by CSS custom properties. All animation respects `prefers-reduced-motion`.

## What's mocked vs. real

| Feature | Status |
|---|---|
| Product catalog, cart, checkout form | Fully functional |
| Stripe payment | Simulated — no real Stripe SDK/account wired up |
| Contact / newsletter forms | Submit to Express, logged server-side, not actually emailed |
| Order storage | Not persisted — returned once, then gone on server restart |
| GA4 | Loads only with a real measurement ID; otherwise console-logged |
