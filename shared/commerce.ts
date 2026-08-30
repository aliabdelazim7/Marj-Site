import { getHoodieById } from "./products";

export type CommerceLine = { productId: string; size: string; quantity: number };
export function calculateTotals(lines: CommerceLine[]) {
  const subtotal = lines.reduce((sum, line) => {
    const product = getHoodieById(line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 60;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function isValidCustomerEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}

export type CatalogVariantLike = { size: string; stock: number; priceOverride: number | null; stockStatus: string; status: string };
export type CatalogProductLike = { price: number; stockStatus?: string; manageStock?: boolean; variants?: CatalogVariantLike[] };

export function resolveCatalogUnitPrice(product: CatalogProductLike, size: string) {
  const variant = product.variants?.find((candidate) => candidate.size === size && candidate.status === "active");
  return { unitPrice: variant?.priceOverride ?? product.price, variant };
}

export function validateCatalogStock(product: CatalogProductLike, size: string, quantity: number) {
  if (product.stockStatus === "outofstock") return { ok: false as const, message: "هذا المنتج نفدت كميته حاليًا." };
  const { variant } = resolveCatalogUnitPrice(product, size);
  if (variant?.stockStatus === "outofstock") return { ok: false as const, message: `المقاس ${size} نفد حاليًا.` };
  if (variant && product.manageStock && quantity > variant.stock) return { ok: false as const, message: `الكمية المتاحة من مقاس ${size} هي ${variant.stock} فقط.` };
  return { ok: true as const, variant };
}

export function validateCommerceLine(line: CommerceLine) {
  const product = getHoodieById(line.productId);
  if (!product) return { ok: false as const, message: "أحد المنتجات لم يعد متاحًا." };
  if (!product.sizes.includes(line.size)) return { ok: false as const, message: `المقاس ${line.size} غير متاح لهذا المنتج.` };
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 5) return { ok: false as const, message: "الكمية يجب أن تكون بين 1 و5." };
  return { ok: true as const, product };
}
