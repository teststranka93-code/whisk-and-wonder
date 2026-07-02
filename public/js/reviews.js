window.wwLoadReviews = async function (gridSelector, limit) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  try {
    const res = await fetch(`${window.WW_CONFIG.API_BASE}/api/reviews`);
    let reviews = await res.json();
    if (limit) reviews = reviews.slice(0, limit);
    grid.innerHTML = reviews
      .map(
        (r) => `
        <div class="review-card">
          <span class="stars">${window.wwUI.starString(r.rating)}</span>
          <p>"${r.text}"</p>
          <span class="review-author">${r.author}</span>
        </div>`
      )
      .join("");
  } catch {
    grid.innerHTML = "";
  }
};
