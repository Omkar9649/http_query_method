/**
 * Small in-memory product database for the QUERY demo.
 * No vector search — plain filter matching only.
 */
const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    category: "electronics",
    price: 25,
    inStock: true,
    tags: ["wireless", "office"],
  },
  {
    id: 2,
    name: "USB Keyboard",
    category: "electronics",
    price: 40,
    inStock: true,
    tags: ["wired", "office"],
  },
  {
    id: 3,
    name: "Office Chair",
    category: "furniture",
    price: 120,
    inStock: false,
    tags: ["office", "ergonomic"],
  },
  {
    id: 4,
    name: "Desk Lamp",
    category: "furniture",
    price: 35,
    inStock: true,
    tags: ["office", "lighting"],
  },
  {
    id: 5,
    name: "Bluetooth Headphones",
    category: "electronics",
    price: 80,
    inStock: true,
    tags: ["wireless", "audio"],
  },
  {
    id: 6,
    name: "Notebook Pack",
    category: "stationery",
    price: 12,
    inStock: true,
    tags: ["paper", "office"],
  },
];

export function listProducts() {
  return products;
}

/**
 * Filter products with a JSON query body.
 * Supported fields: category, inStock, minPrice, maxPrice, tags (any match)
 */
export function queryProducts({
  category,
  inStock,
  minPrice,
  maxPrice,
  tags,
} = {}) {
  return products.filter((p) => {
    if (category != null && p.category !== category) return false;
    if (inStock != null && p.inStock !== inStock) return false;
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (Array.isArray(tags) && tags.length > 0) {
      const hit = tags.some((t) => p.tags.includes(t));
      if (!hit) return false;
    }
    return true;
  });
}
