(function () {
  function formatPrice(price, currency = "EUR") {
    return new Intl.NumberFormat("sk-SK", { style: "currency", currency }).format(price);
  }

  function starString(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function productImageUrl(p, width) {
    if (!p.image) return "";
    const sep = p.image.includes("?") ? "&" : "?";
    return `${p.image}${sep}auto=format&fit=crop&w=${width}&q=80`;
  }

  function productCardHTML(p) {
    return `
      <article class="product-card">
        <a href="/products/${p.slug}" aria-label="Zobraziť ${p.name}">
          <div class="product-card-media" style="background:${p.gradient}">
            <img src="${productImageUrl(p, 600)}" alt="${p.name}" loading="lazy" />
            ${p.featured ? '<span class="product-card-badge">Bestseller</span>' : ""}
          </div>
        </a>
        <div class="product-card-body">
          <span class="product-card-cat">${categoryLabel(p.category)}</span>
          <h3 class="product-card-name"><a href="/products/${p.slug}">${p.name}</a></h3>
          <p class="product-card-desc">${p.shortDescription}</p>
          <span class="rating"><span class="stars">${starString(p.rating)}</span> ${p.rating} (${p.reviewCount})</span>
          <div class="product-card-foot">
            <span class="product-card-price">${formatPrice(p.price)}</span>
            <button class="btn btn-primary btn-sm" data-quick-add="${p.slug}">Pridať do košíka</button>
          </div>
        </div>
      </article>`;
  }

  function categoryLabel(cat) {
    return { cakes: "Torta", cupcakes: "Cupcake", pastries: "Pečivo" }[cat] || cat;
  }

  function whiskDividerSVG(extraClass = "") {
    return `<svg class="whisk-divider ${extraClass}" viewBox="0 0 120 28" aria-hidden="true">
      <path d="M2 20 C 20 4, 34 4, 44 16 S 68 30, 80 12 S 104 2, 118 14" />
    </svg>`;
  }

  window.wwUI = { formatPrice, starString, productCardHTML, categoryLabel, whiskDividerSVG, productImageUrl };
})();
