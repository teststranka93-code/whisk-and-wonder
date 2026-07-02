(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
    form.querySelectorAll("input.invalid, textarea.invalid").forEach((e) => e.classList.remove("invalid"));
  }
  function setError(field, message) {
    form.querySelector(`[data-error-for="${field}"]`).textContent = message;
    form.querySelector(`[name="${field}"]`).classList.add("invalid");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const data = Object.fromEntries(new FormData(form).entries());
    let valid = true;
    if (!data.name.trim()) { setError("name", "Zadajte prosím svoje meno."); valid = false; }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) { setError("email", "Zadajte platnú e-mailovú adresu."); valid = false; }
    if (!data.message.trim()) { setError("message", "Zadajte prosím správu."); valid = false; }
    if (!valid) return;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Odosielam…";
    try {
      const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      window.wwTrack && window.wwTrack("contact_form_submit", { has_message: true });
      form.innerHTML = '<h3>Správa odoslaná</h3><p>Ďakujeme, ' + data.name.split(" ")[0] + ' — ozveme sa do jedného pracovného dňa.</p>';
    } catch {
      window.wwToast("Správu sa nepodarilo odoslať. Skúste to prosím znova.", "error");
      btn.disabled = false;
      btn.textContent = "Odoslať správu";
    }
  });
})();
