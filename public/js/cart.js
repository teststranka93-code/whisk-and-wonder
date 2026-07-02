/**
 * Cart persisted in localStorage so it survives across pages
 * without a backend session. Structure: [{ slug, name, price, image, category, qty }]
 */
(function () {
  const STORAGE_KEY = "ww_cart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    document.dispatchEvent(new CustomEvent("ww:cart-updated", { detail: cart }));
  }

  function addToCart(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.slug === product.slug);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        gradient: product.gradient,
        category: product.category,
        qty,
      });
    }
    saveCart(cart);
    window.wwTrack && window.wwTrack("add_to_cart", {
      currency: "EUR",
      value: product.price * qty,
      items: [{ item_id: product.slug, item_name: product.name, quantity: qty, price: product.price }],
    });
  }

  function updateQty(slug, qty) {
    let cart = getCart();
    if (qty <= 0) {
      cart = cart.filter((i) => i.slug !== slug);
    } else {
      const item = cart.find((i) => i.slug === slug);
      if (item) item.qty = qty;
    }
    saveCart(cart);
  }

  function removeFromCart(slug) {
    const cart = getCart().filter((i) => i.slug !== slug);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function cartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal() {
    return getCart().reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function updateCartBadge() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const count = cartCount();
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }

  window.wwCart = { getCart, saveCart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal, updateCartBadge };

  document.addEventListener("DOMContentLoaded", updateCartBadge);
})();
