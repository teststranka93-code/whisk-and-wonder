(async function () {
  const slug = window.location.pathname.split("/products/")[1]?.replace(/\/$/, "");
  const root = document.getElementById("product-root");
  if (!slug || !root) return;

  try {
    const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/products/${slug}`);
    if (!res.ok) throw new Error("not found");
    const product = await res.json();

    document.title = `${product.name} — Whisk & Wonder`;
    document.getElementById("meta-description").setAttribute("content", product.shortDescription);
    document.getElementById("crumb-name").textContent = product.name;

    document.getElementById("product-jsonld").textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      offers: {
        "@type": "Offer",
        priceCurrency: product.currency,
        price: product.price,
        availability: "https://schema.org/InStock",
        url: window.location.href,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    });

    root.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-media" style="background:${product.gradient}">
          <img src="${wwUI.productImageUrl(product, 900)}" alt="${product.name}" />
        </div>
        <div>
          <span class="tag">${wwUI.categoryLabel(product.category)}</span>
          <h1>${product.name}</h1>
          <span class="rating"><span class="stars">${wwUI.starString(product.rating)}</span> ${product.rating} (${product.reviewCount} recenzií)</span>
          <p class="product-detail-price">${wwUI.formatPrice(product.price, product.currency)}</p>
          <p>${product.description}</p>
          <div class="qty-stepper">
            <div class="qty-control">
              <button type="button" data-qty-down aria-label="Znížiť množstvo">−</button>
              <span data-qty-value>1</span>
              <button type="button" data-qty-up aria-label="Zvýšiť množstvo">+</button>
            </div>
          </div>
          <button class="btn btn-primary" id="add-to-cart-btn">Pridať do košíka — <span data-line-total>${wwUI.formatPrice(product.price, product.currency)}</span></button>
        </div>
      </div>`;

    let qty = 1;
    const qtyValue = root.querySelector("[data-qty-value]");
    const lineTotal = root.querySelector("[data-line-total]");
    const refreshQty = () => {
      qtyValue.textContent = qty;
      lineTotal.textContent = wwUI.formatPrice(product.price * qty, product.currency);
    };
    root.querySelector("[data-qty-up]").addEventListener("click", () => { qty++; refreshQty(); });
    root.querySelector("[data-qty-down]").addEventListener("click", () => { if (qty > 1) qty--; refreshQty(); });
    document.getElementById("add-to-cart-btn").addEventListener("click", () => {
      window.wwCart.addToCart(product, qty);
      window.wwToast(`${qty} × ${product.name} pridané do košíka`, "success");
    });

    fetchScopedReviews(product.slug);

    // related products: same category, excluding this one
    const relRes = await fetch(`${window.WW_CONFIG.API_BASE}/api/products?category=${product.category}`);
    const related = (await relRes.json()).filter((p) => p.slug !== product.slug).slice(0, 3);
    document.querySelector('[data-grid="related"]').innerHTML = related.map(wwUI.productCardHTML).join("");
  } catch (err) {
    root.innerHTML = '<div class="empty-state"><h2>Tento produkt sme nenašli</h2><p>Možno je vypredaný alebo sa presunul.</p><a href="/menu.html" class="btn btn-primary">Späť na menu</a></div>';
  }

  async function fetchScopedReviews(productSlug) {
    const grid = document.querySelector("[data-review-grid]");
    const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/reviews?productSlug=${productSlug}`);
    const reviews = await res.json();
    if (!reviews.length) {
      grid.innerHTML = '<p>Zatiaľ žiadne recenzie — buďte prvý, kto si to objedná.</p>';
      return;
    }
    grid.innerHTML = reviews.map((r) => `
      <div class="review-card">
        <span class="stars">${wwUI.starString(r.rating)}</span>
        <p>"${r.text}"</p>
        <span class="review-author">${r.author}</span>
      </div>`).join("");
  }
})();
