/**
 * Fetches products and renders them into a grid container.
 * Used by index.html (featured) and menu.html (full grid + filters).
 */
window.wwLoadProducts = async function ({ gridSelector, category = "all", featuredOnly = false, limit } = {}) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return [];
  grid.innerHTML = Array.from({ length: limit || 6 })
    .map(() => '<div class="skeleton skeleton-card"></div>')
    .join("");

  try {
    const url = new URL(`${window.WW_CONFIG.API_BASE}/api/products`);
    if (category !== "all") url.searchParams.set("category", category);
    const res = await fetch(url);
    let products = await res.json();
    if (featuredOnly) products = products.filter((p) => p.featured);
    if (limit) products = products.slice(0, limit);

    grid.innerHTML = products.length
      ? products.map(window.wwUI.productCardHTML).join("")
      : '<p style="grid-column:1/-1" class="center">V tejto kategórii zatiaľ nič nemáme — skúste to čoskoro znova.</p>';

    return products;
  } catch (err) {
    grid.innerHTML = '<p style="grid-column:1/-1" class="center">Produkty sa nepodarilo načítať. Skúste obnoviť stránku.</p>';
    return [];
  }
};

window.wwInitFilterBar = function (barSelector, onFilter) {
  const bar = document.querySelector(barSelector);
  if (!bar) return;
  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    bar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    onFilter(chip.dataset.category);
  });
};
