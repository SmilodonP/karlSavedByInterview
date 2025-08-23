window.addEventListener("DOMContentLoaded", setup);

const API = {
  PRODUCTS: "/products", // same-origin; no CORS headaches
};

async function setup() {
  const grid = document.getElementById("productGrid");
  setStatus("Loading products…");

  // 1) fetch
  const products = await fetchProducts();

  // 2) default sort: low → high
  const view = sortProducts(products, "asc");

  // 3) render
  renderProducts(view, grid);
  setStatus(`Loaded ${view.length} product${view.length === 1 ? "" : "s"}.`);
}

/**
 * Fetch products from the API with basic error handling.
 * Endpoint: GET /products
 * Expected: [{ id, title, price (cents), images: [url,...] }, ...]
 */
async function fetchProducts() {
  try {
    const result = await fetch(API.PRODUCTS, { headers: { Accept: "application/json" } });
    if (!result.ok) throw new Error(`HTTP ${result.status}`);
    const data = await result.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching products:", err);
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>We couldn't load products right now. Please try again.</p>
        </div>
      `;
    }
    setStatus("Failed to load products.");
    return [];
  }
}

/**
 * Sort products by price (cents).
 * @param {Array<{price:number}>} products
 * @param {"asc"|"desc"} sortOrder
 * @returns {Array}
 */
function sortProducts(products, sortOrder = "asc") {
  const dir = sortOrder === "desc" ? -1 : 1;
  return products.slice().sort((a, b) => (a.price - b.price) * dir);
}

/**
 * Render a simple product grid.
 * @param {Array<{id:string|number,title:string,price:number,images:string[]}>} products
 * @param {HTMLElement} container
 */
function renderProducts(products, container) {
  container.setAttribute("aria-busy", "true");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `<div class="empty-state">No products found.</div>`;
    container.setAttribute("aria-busy", "false");
    return;
  }

  const frag = document.createDocumentFragment();

  for (const p of products) {
    const imgUrl = (Array.isArray(p.images) && p.images[0]) || "https://via.placeholder.com/600x600?text=No+Image";
    const price = formatPrice(p.price);

    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-media">
        <img src="${imgUrl}" alt="${escapeHtml(p.title)}" loading="lazy" />
      </div>
      <div class="product-info">
        <h2 class="product-title">${escapeHtml(p.title)}</h2>
        <div class="product-meta">
          <span class="product-price">${price}</span>
        </div>
      </div>
    `;
    frag.appendChild(card);
  }

  container.appendChild(frag);
  container.setAttribute("aria-busy", "false");
}

/** Helpers */
function formatPrice(cents) {
  const dollars = (Number(cents) || 0) / 100;
  return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}
