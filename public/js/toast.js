(function () {
  function ensureRegion() {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  window.wwToast = function (message, type = "success", duration = 3200) {
    const region = ensureRegion();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity 200ms ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 220);
    }, duration);
  };
})();
