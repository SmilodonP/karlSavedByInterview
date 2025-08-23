window.addEventListener("DOMContentLoaded", setup);

const API = {
  PRODUCTS: "/products", // same-origin; no CORS headaches
};

async function setup() {
	// START HERE
	// API Endpoint: GET /products
	// Returns: Array of product objects with id, title, price (in cents), and array of images
	// TODO: Sort the products by price (low to high by default)
	// TODO: Implement search functionality
	// BONUS: Use the refactored sorting function for dynamic sort order
	// BONUS: Add error handling for the fetch request
	 
	setStatus("Loading products…");
	// TODO: Fetch products from the API
	try {
    const raw = await fetchJSON(API.PRODUCTS, { timeout: 8000 });
    const products = normalizeProducts(raw);

    console.log("[products]", products);

    setStatus(`Loaded ${products.length} product${products.length === 1 ? "" : "s"}.`);

  // TODO: Render the products to the page in a responsive grid

  } catch (err) {
    console.error("Failed to load products:", err);
    setStatus("We couldn’t load products right now. Please try again.");
  }
}

async function fetchJSON(url, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function normalizeProducts(data) {
  if (!Array.isArray(data)) return [];
  return data.map(p => ({
    id: p?.id ?? "",
    title: String(p?.title ?? ""),
    price: Number(p?.price ?? 0),         // still in cents per the README
    images: Array.isArray(p?.images) ? p.images : [],
  }));
}

function setStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}


/**
 * Sorts an array of products by price in ascending or descending order.
 *
 * Your task is to refactor and improve this function:
 * - Make it clean, modern, and readable.
 * - Allow sorting in either "asc" or "desc" order using the `sortOrder` parameter.
 * - Ensure the output remains the same.
 * - A plus, but you do not need to use the messyFunction() function.
 *
 * Requirements:
 * - Refactor the code to use modern JavaScript syntax and best practices.
 * - Rename variables and functions to be more descriptive.
 * - Fill in the missing parts of the JSDoc comments.
 *
 * Feel free to leave comments explaining your thought process.
 *
 * @param {Array} products - Array of product objects, each with a `price` property.
 * @param {string} sortOrder - Either "asc" for ascending or "desc" for descending sort order.
 * @returns {Array} - A new array of products sorted by price in the specified order.
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

// function messyFunction(data1, data2) {
// 	let t = [];
// 	for (let i = 0; i < data1.length; i++) {
// 		t.push(data1[i]);
// 	}
// 	for (let i = 0; i < t.length; i++) {
// 		for (let j = i + 1; j < t.length; j++) {
// 			if ((data2 === "asc" && t[i].price > t[j].price) || (data2 === "desc" && t[i].price < t[j].price)) {
// 				let tmp = t[i];
// 				t[i] = t[j];
// 				t[j] = tmp;
// 			}
// 		}
// 	}
// 	return t;
// }
