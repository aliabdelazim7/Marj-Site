import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getHoodieById, hoodieProducts, type HoodieProduct } from "@shared/products";
import { trpc } from "@/lib/trpc";

export type CartLine = { productId: string; size: string; quantity: number; variantId?: number; unitPrice?: number };
type CartProduct = HoodieProduct & { variants?: Array<{ id: number; size: string; stock: number; priceOverride: number | null; stockStatus: string; status: string }>; stockStatus?: string; manageStock?: boolean };
type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (product: HoodieProduct, size: string, quantity?: number) => void;
  update: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  getProduct: (productId: string) => CartProduct | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hoodiefit-cart-v1";

function loadCart(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((line) => line && typeof line.productId === "string" && typeof line.size === "string" && Number.isInteger(line.quantity) && line.quantity > 0 && (line.variantId === undefined || Number.isInteger(line.variantId)) && (line.unitPrice === undefined || Number.isFinite(line.unitPrice))) : [];
  } catch { return []; }
}
function persistCart(lines: CartLine[]) { if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); }
function getCommerceSessionKey() { const key = "marj-commerce-session"; const existing = typeof window === "undefined" ? null : localStorage.getItem(key); if (existing) return existing; const next = `marj-${crypto.randomUUID()}`; if (typeof window !== "undefined") localStorage.setItem(key, next); return next; }

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => typeof window === "undefined" ? [] : loadCart());
  const productsQuery = trpc.products.list.useQuery();
  const settingsQuery = trpc.store.settings.useQuery();
  const commerceEvent = trpc.growth.event.useMutation();
  const productMap = useMemo(() => new Map(((productsQuery.data ?? hoodieProducts) as CartProduct[]).map((product) => [product.id, product])), [productsQuery.data]);
  const getProduct = (productId: string): CartProduct | undefined => productMap.get(productId) ?? getHoodieById(productId);
  useEffect(() => persistCart(lines), [lines]);
  const commit = (updater: (current: CartLine[]) => CartLine[]) => setLines((current) => { const next = updater(current); persistCart(next); return next; });
  const value = useMemo(() => {
    const priced = lines.map((line) => ({ ...line, product: getProduct(line.productId) })).filter((line): line is CartLine & { product: CartProduct } => Boolean(line.product));
    const subtotal = priced.reduce((sum, line) => {
      const variant = line.product.variants?.find((candidate) => candidate.size === line.size && candidate.status === "active");
      return sum + (line.unitPrice ?? variant?.priceOverride ?? line.product.price) * line.quantity;
    }, 0);
    const shippingFee = settingsQuery.data?.shippingFee ?? 0;
    const freeShippingThreshold = settingsQuery.data?.freeShippingThreshold ?? null;
    const shipping = subtotal === 0 || (freeShippingThreshold !== null && subtotal >= freeShippingThreshold) ? 0 : shippingFee;
    return {
      lines, itemCount: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal,
      shipping, total: subtotal + shipping,
      add: (product: HoodieProduct, size: string, quantity = 1) => { if (product.databaseId) commerceEvent.mutate({ sessionKey: getCommerceSessionKey(), eventName: "add_to_cart", productId: product.databaseId }); commit((current) => { const currentProduct = getProduct(product.id); const variant = currentProduct?.variants?.find((candidate) => candidate.size === size && candidate.status === "active"); const max = currentProduct?.manageStock && variant ? Math.min(5, variant.stock) : 5; const existing = current.find((line) => line.productId === product.id && line.size === size); if (max <= 0) return current; if (existing) return current.map((line) => line === existing ? { ...line, quantity: Math.min(max, line.quantity + quantity) } : line); return [...current, { productId: product.id, size, quantity: Math.min(max, quantity), variantId: variant?.id, unitPrice: variant?.priceOverride ?? currentProduct?.price ?? product.price }]; }); },
      update: (productId: string, size: string, quantity: number) => commit((current) => { const currentProduct = getProduct(productId); const variant = currentProduct?.variants?.find((candidate) => candidate.size === size && candidate.status === "active"); const max = currentProduct?.manageStock && variant ? Math.min(5, variant.stock) : 5; return quantity <= 0 ? current.filter((line) => !(line.productId === productId && line.size === size)) : current.map((line) => line.productId === productId && line.size === size ? { ...line, quantity: Math.min(max, quantity) } : line); }),
      remove: (productId: string, size: string) => commit((current) => current.filter((line) => !(line.productId === productId && line.size === size))),
      clear: () => commit(() => []),
      getProduct,
    };
  }, [commerceEvent, lines, productMap, settingsQuery.data]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
