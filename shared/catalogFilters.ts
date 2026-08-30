export type CatalogFilterVariant = {
  size: string;
  color?: string | null;
  stock?: number;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  status?: "active" | "inactive";
};

export type CatalogFilterProduct = {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  price: number;
  color: string;
  category?: string;
  sizes: string[];
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  variants?: CatalogFilterVariant[];
};

export type CatalogFilters = {
  search: string;
  sizes: string[];
  colors: string[];
  categories: string[];
  availability: "all" | "available" | "out";
  priceRange: "all" | "under-900" | "900-plus";
  sort: "featured" | "newest" | "price-asc" | "price-desc" | "name";
};

export function isCatalogProductAvailable(product: CatalogFilterProduct) {
  return product.stockStatus !== "outofstock" && !(product.variants?.length && product.variants.every((variant) => variant.stockStatus === "outofstock" || (typeof variant.stock === "number" && variant.stock <= 0)));
}

export function filterAndSortCatalog<T extends CatalogFilterProduct>(products: T[], filters: CatalogFilters) {
  const query = filters.search.trim().toLocaleLowerCase("ar-EG");
  const filtered = products.filter((product) => {
    const productColors = product.variants?.map((variant) => variant.color || product.color) ?? [product.color];
    const textMatch = !query || [product.nameArabic, product.name, product.description, product.category || ""].join(" ").toLocaleLowerCase("ar-EG").includes(query);
    const sizeMatch = !filters.sizes.length || filters.sizes.some((size) => product.sizes.includes(size));
    const colorMatch = !filters.colors.length || filters.colors.some((color) => productColors.includes(color));
    const categoryMatch = !filters.categories.length || filters.categories.includes(product.category || "هوديز");
    const available = isCatalogProductAvailable(product);
    const availabilityMatch = filters.availability === "all" || (filters.availability === "available" ? available : !available);
    const priceMatch = filters.priceRange === "all" || (filters.priceRange === "under-900" ? product.price < 900 : product.price >= 900);
    return textMatch && sizeMatch && colorMatch && categoryMatch && availabilityMatch && priceMatch;
  });
  return [...filtered].sort((a, b) => filters.sort === "price-asc" ? a.price - b.price : filters.sort === "price-desc" ? b.price - a.price : filters.sort === "name" ? a.nameArabic.localeCompare(b.nameArabic, "ar") : 0);
}
