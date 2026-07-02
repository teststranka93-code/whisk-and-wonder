(function () {
  const contentEl = document.getElementById("cart-content");
  if (!contentEl) return;

  function render() {
    const cart = window.wwCart.getCart();
    if (!cart.length) {
      contentEl.innerHTML = `
        <div class="empty-state">
          ${wwUI.whiskDividerSVG("whisk-divider--center")}
          <h2>Váš košík je prázdny</h2>
          <p>Zdá sa, že ste si zatiaľ nič nevybrali.</p>
          <a href="/menu.html" class="btn btn-primary">Prezrieť menu</a>
        </div>`;
      return;
    }

    const rows = cart.map((item) => `
      <div class="cart-row" data-row="${item.slug}">
        <div class="cart-row-media" style="background:${item.gradient}"></div>
        <div>
          <p class="cart-row-name">${item.name}</p>
          <span class="cart-row-cat">${wwUI.categoryLabel(item.category)}</span>
        </div>
        <div class="qty-control">
          <button type="button" data-decrease="${item.slug}" aria-label="Znížiť množstvo — ${item.name}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-increase="${item.slug}" aria-label="Zvýšiť množstvo — ${item.name}">+</button>
        </div>
        <div style="text-align:right">
          <p class="cart-row-name">${wwUI.formatPrice(item.price * item.qty)}</p>
          <button class="cart-row-remove" data-remove="${item.slug}">Odstrániť</button>
        </div>
      </div>`).join("");

    const total = window.wwCart.cartTotal();
    const deliveryFee = total >= 30 ? 0 : 4.5;

    contentEl.innerHTML = `
      <div class="cart-layout">
        <div>${rows}</div>
        <aside class="summary-card">
          <h3>Zhrnutie objednávky</h3>
          <div class="summary-line"><span>Medzisúčet</span><span>${wwUI.formatPrice(total)}</span></div>
          <div class="summary-line"><span>Doprava</span><span>${deliveryFee === 0 ? "Zadarmo" : wwUI.formatPrice(deliveryFee)}</span></div>
          <div class="summary-total"><span>Spolu</span><span>${wwUI.formatPrice(total + deliveryFee)}</span></div>
          <p style="font-size:0.78rem;margin-top:0.6rem">Doprava zadarmo pri objednávke nad 30 €.</p>
          <a href="/checkout.html" class="btn btn-primary btn-block" style="margin-top:1rem">Prejsť k pokladni</a>
        </aside>
      </div>`;
  }

  contentEl.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-increase]");
    const dec = e.target.closest("[data-decrease]");
    const rem = e.target.closest("[data-remove]");
    const cart = window.wwCart.getCart();

    if (inc) {
      const item = cart.find((i) => i.slug === inc.dataset.increase);
      window.wwCart.updateQty(item.slug, item.qty + 1);
    } else if (dec) {
      const item = cart.find((i) => i.slug === dec.dataset.decrease);
      window.wwCart.updateQty(item.slug, item.qty - 1);
    } else if (rem) {
      window.wwCart.removeFromCart(rem.dataset.remove);
      window.wwToast("Položka odstránená z košíka", "success");
    } else {
      return;
    }
    render();
  });

  render();
})();
