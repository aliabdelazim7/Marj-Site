import { describe, expect, it } from "vitest";
import { filterAndSortCatalog, type CatalogFilterProduct } from "./catalogFilters";

const products: CatalogFilterProduct[] = [
  { id: "red", name: "Signal Red", nameArabic: "إشارة حمراء", description: "قطعة حمراء", price: 899, color: "أحمر إشارة", category: "هوديز", sizes: ["S", "M"], stockStatus: "instock", variants: [{ size: "M", color: "أحمر إشارة", stock: 3, stockStatus: "instock" }] },
  { id: "black", name: "Night Grid", nameArabic: "شبكة ليلية", description: "قطعة سوداء", price: 949, color: "أسود ليلي", category: "هوديز", sizes: ["L", "XL"], stockStatus: "outofstock", variants: [{ size: "L", color: "أسود ليلي", stock: 0, stockStatus: "outofstock" }] },
];

const defaults = { search: "", sizes: [], colors: [], categories: [], availability: "all" as const, priceRange: "all" as const, sort: "featured" as const };

describe("catalog filters", () => {
  it("filters by color, size, price, and availability together", () => {
    expect(filterAndSortCatalog(products, { ...defaults, colors: ["أحمر إشارة"], sizes: ["M"], priceRange: "under-900", availability: "available" }).map((item) => item.id)).toEqual(["red"]);
  });

  it("finds Arabic text and can explicitly show out-of-stock products", () => {
    expect(filterAndSortCatalog(products, { ...defaults, search: "ليلية", availability: "out" }).map((item) => item.id)).toEqual(["black"]);
  });

  it("sorts matching products by price", () => {
    expect(filterAndSortCatalog(products, { ...defaults, sort: "price-desc" }).map((item) => item.id)).toEqual(["black", "red"]);
  });
});
