(function () {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const cart = window.wwCart.getCart();
  const summaryLines = document.getElementById("checkout-summary-lines");
  const totalEl = document.getElementById("checkout-total");
  const total = window.wwCart.cartTotal();
  const deliveryFee = total >= 30 ? 0 : 4.5;

  if (!cart.length) {
    form.closest(".cart-layout").innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h2>Váš košík je prázdny</h2>
        <p>Pred pokladňou si vyberte niečo dobré.</p>
        <a href="/menu.html" class="btn btn-primary">Prezrieť menu</a>
      </div>`;
    return;
  }

  summaryLines.innerHTML = cart.map((i) => `
    <div class="summary-line"><span>${i.qty} × ${i.name}</span><span>${wwUI.formatPrice(i.price * i.qty)}</span></div>
  `).join("") + `<div class="summary-line"><span>Doprava</span><span>${deliveryFee === 0 ? "Zadarmo" : wwUI.formatPrice(deliveryFee)}</span></div>`;
  totalEl.textContent = wwUI.formatPrice(total + deliveryFee);

  const paymentMethod = document.getElementById("payment-method");
  const cardFields = document.getElementById("card-fields");
  paymentMethod.addEventListener("change", () => {
    cardFields.style.display = paymentMethod.value === "card" ? "block" : "none";
  });

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
    form.querySelectorAll("input.invalid").forEach((e) => e.classList.remove("invalid"));
  }

  function setError(field, message) {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = message;
    const input = form.querySelector(`[name="${field}"]`);
    if (input) input.classList.add("invalid");
  }

  function validate(data) {
    let valid = true;
    if (!data.name.trim()) { setError("name", "Zadajte prosím svoje meno."); valid = false; }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) { setError("email", "Zadajte platnú e-mailovú adresu."); valid = false; }
    if (!data.address.trim()) { setError("address", "Zadajte prosím doručovaciu adresu."); valid = false; }
    if (paymentMethod.value === "card") {
      const digits = data.cardNumber.replace(/\s/g, "");
      if (digits.length < 13) { setError("cardNumber", "Zadajte platné číslo karty."); valid = false; }
    }
    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (!validate(data)) return;

    const payBtn = document.getElementById("pay-btn");
    payBtn.disabled = true;
    payBtn.textContent = "Spracúvam platbu…";

    try {
      const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          customer: { name: data.name, email: data.email, address: data.address },
          paymentMethod: { type: paymentMethod.value, cardNumber: data.cardNumber },
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        window.wwTrack && window.wwTrack("purchase_failed", { reason: result.error });
        sessionStorage.setItem("ww_last_error", result.message || "Platba zlyhala.");
        window.location.href = "/payment-fail.html";
        return;
      }

      window.wwTrack && window.wwTrack("purchase", {
        transaction_id: result.orderId,
        value: result.total,
        currency: result.currency,
        items: result.items.map((i) => ({ item_id: i.slug, item_name: i.name, quantity: i.qty, price: i.price })),
      });

      sessionStorage.setItem("ww_last_order", JSON.stringify(result));
      window.wwCart.clearCart();
      window.location.href = "/order-confirmation.html";
    } catch (err) {
      sessionStorage.setItem("ww_last_error", "Nepodarilo sa spojiť s platobným serverom. Skúste to prosím znova.");
      window.location.href = "/payment-fail.html";
    }
  });
})();
