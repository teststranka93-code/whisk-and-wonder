document.addEventListener("DOMContentLoaded", () => {
  // ---------- mobile nav ----------
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // ---------- active nav link ----------
  const path = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".main-nav a[href]").forEach((a) => {
    const href = a.getAttribute("href").replace(/\/$/, "") || "/";
    if (href === path || (href !== "/" && path.startsWith(href))) {
      a.setAttribute("aria-current", "page");
    }
  });

  // ---------- theme toggle ----------
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("ww_theme");
  if (savedTheme === "dark") root.setAttribute("data-theme", "dark");
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        localStorage.setItem("ww_theme", "light");
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("ww_theme", "dark");
      }
      updateThemeIcon();
    });
  }
  function updateThemeIcon() {
    if (!themeToggle) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Prepnúť na svetlý režim" : "Prepnúť na tmavý režim");
  }

  // ---------- quick add to cart (event delegation) ----------
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-quick-add]");
    if (!btn) return;
    e.preventDefault();
    const slug = btn.dataset.quickAdd;
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Pridávam…";
    try {
      const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/products/${slug}`);
      const product = await res.json();
      window.wwCart.addToCart(product, 1);
      window.wwToast(`${product.name} pridané do košíka`, "success");
    } catch (err) {
      window.wwToast("Nepodarilo sa pridať do košíka. Skúste to znova.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // ---------- newsletter popup ----------
  const overlay = document.getElementById("newsletter-overlay");
  if (overlay && !sessionStorage.getItem("ww_newsletter_dismissed")) {
    setTimeout(() => overlay.classList.add("open"), 6000);
  }
  document.querySelectorAll("[data-close-newsletter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      overlay.classList.remove("open");
      sessionStorage.setItem("ww_newsletter_dismissed", "1");
    })
  );
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector("input[type=email]").value;
      try {
        await fetch(`${window.WW_CONFIG.API_BASE}/api/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        window.wwTrack && window.wwTrack("newsletter_signup", { email_domain: email.split("@")[1] });
        newsletterForm.innerHTML = '<p style="margin:0;color:var(--accent);font-weight:600;">Ďakujeme — pozrite si e-mail, čaká vás zľava 10 %!</p>';
        setTimeout(() => {
          overlay?.classList.remove("open");
          sessionStorage.setItem("ww_newsletter_dismissed", "1");
        }, 1800);
      } catch {
        window.wwToast("Niečo sa pokazilo. Skúste to prosím znova.", "error");
      }
    });
  }
});
