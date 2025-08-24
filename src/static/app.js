// src/static/app.js
window.addEventListener("DOMContentLoaded", setup);

const API = { PRODUCTS: "/products" };

// ---- app state -------------------------------------------------------------
let allProducts = [];
let sortOrder = "asc";

// ---- setup -----------------------------------------------------------------
async function setup() {
  const grid   = document.getElementById("productGrid");
  const search = document.getElementById("search");
  const sort   = document.getElementById("sort");

  setStatus("Loading products…");
  allProducts = await fetchProducts();

  // initialize sort from UI if present
  if (sort && (sort.value === "asc" || sort.value === "desc")) {
    sortOrder = sort.value;
  }

  recomputeAndRender();

  // live search (debounced)
  if (search) {
    const onSearch = debounce(recomputeAndRender, 120);
    search.addEventListener("input", onSearch);
  }

  // sort change
  if (sort) {
    sort.addEventListener("change", (e) => {
      sortOrder = e.target.value === "desc" ? "desc" : "asc";
      recomputeAndRender();
    });
  }
}

// ---- compute → render ------------------------------------------------------
function recomputeAndRender() {
  const grid   = document.getElementById("productGrid");
  const search = document.getElementById("search");
  const query  = (search?.value || "").trim();

  const filtered = filterProducts(allProducts, query);
  const sorted   = sortProducts(filtered, sortOrder);

  renderProducts(sorted, grid);

  setStatus(
    `${filtered.length} product${filtered.length === 1 ? "" : "s"}`
    + (query ? ` matching “${query}”` : "")
    + ` • sorted ${sortOrder === "asc" ? "low → high" : "high → low"}`
  );
}

// ---- API call -----------------------------------------------------------
async function fetchProducts() {
  try {
    const res = await fetch(API.PRODUCTS, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
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

// ---- transforms ------------------------------------------------------------
function filterProducts(products, query) {
  if (!query) return products;
  const q = normalize(query);
  return products.filter((p) => normalize(p.title).includes(q));
}

/**
 * Sort products by price.
 * @param {Array<{price:number}>} products
 * @param {"asc"|"desc"} order
 * @returns {Array}
 */
function sortProducts(products, order = "asc") {
  const dir = order === "desc" ? -1 : 1;
  return products.slice().sort((a, b) => (a.price - b.price) * dir);
}

function normalize(str = "") {
  return String(str)
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ---- rendering -------------------------------------------------------------
function renderProducts(products, container) {
  if (!container) return;
  container.setAttribute("aria-busy", "true");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `<div class="empty-state">No products found.</div>`;
    container.setAttribute("aria-busy", "false");
    return;
  }

  const frag = document.createDocumentFragment();

  for (const p of products) {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgUrl = getFirstImageUrl(p) || "https://via.placeholder.com/600x600?text=No+Image";

    card.innerHTML = `
      <div class="product-media">
        <img src="${imgUrl}" alt="${escapeHtml(p.title)}" loading="lazy" />
      </div>
      <div class="product-info">
        <h2 class="product-title">${escapeHtml(p.title)}</h2>
        <div class="product-meta">
          <span class="product-price">${formatPrice(p.price)}</span>
        </div>
      </div>
    `;

    // runtime fallback if image 404s
    const img = card.querySelector("img");
    img.addEventListener("error", () => {
      img.src = "https://via.placeholder.com/600x600?text=No+Image";
    });

    frag.appendChild(card);
  }

  container.appendChild(frag);
  container.setAttribute("aria-busy", "false");
}

function getFirstImageUrl(p) {
  if (!p || !Array.isArray(p.images) || p.images.length === 0) return null;
  const first = p.images[0];
  return typeof first === "string" ? first : first?.src || null;
}

// ---- small utilities -------------------------------------------------------
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

function debounce(fn, ms = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), ms);
  };
}
c