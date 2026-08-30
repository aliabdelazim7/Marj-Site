import { describe, expect, it } from "vitest";
import { canManageCatalog, categoryAdminInputSchema, isDirectProductImageUrl, mediaAdminInputSchema, model3dUploadInputSchema, normalizePublishedCatalogLine, productAdminInputSchema, variantAdminInputSchema } from "./routers";

const validProduct = {
  slug: "winter-grid",
  name: "Winter Grid",
  nameArabic: "شبكة شتوية",
  description: "هودي قطني للاستخدام اليومي في الشتاء.",
  shortDescription: "هودي دافئ بقصة مريحة.",
  price: 1200,
  salePrice: 999,
  compareAtPrice: 1400,
  sku: "HF-WG-001",
  imageUrl: "https://cdn.example.com/winter-grid.jpg",
  category: "هوديز شتوية",
  categoryId: 1,
  featured: true,
  manageStock: true,
  stockStatus: "instock" as const,
  status: "draft" as const,
};

describe("admin catalog validation", () => {
  it("allows only admin roles to manage catalog", () => {
    expect(canManageCatalog("admin")).toBe(true);
    expect(canManageCatalog("user")).toBe(false);
    expect(canManageCatalog("guest")).toBe(false);
  });
  it("normalizes only published catalog lines and applies variant pricing/stock", () => {
    const published = [{ id: "db-active", nameArabic: "نشط", price: 1000, sizes: ["M"], stockStatus: "instock", manageStock: true, variants: [{ size: "M", stock: 2, priceOverride: 850, stockStatus: "instock", status: "active" }] }];
    expect(normalizePublishedCatalogLine({ productId: "db-active", size: "M", quantity: 2 }, published).lineTotal).toBe(1700);
    expect(() => normalizePublishedCatalogLine({ productId: "draft-only", size: "M", quantity: 1 }, published)).toThrow();
    expect(() => normalizePublishedCatalogLine({ productId: "db-active", size: "M", quantity: 3 }, published)).toThrow();
    expect(() => normalizePublishedCatalogLine({ productId: "db-active", size: "M", quantity: 1 }, [{ ...published[0], stockStatus: "outofstock" }])).toThrow();
  });

  it("accepts a complete product payload", () => {
    expect(productAdminInputSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects unsafe slugs and invalid sale-price relationships", () => {
    expect(productAdminInputSchema.safeParse({ ...validProduct, slug: "شبكة شتوية" }).success).toBe(false);
    expect(productAdminInputSchema.safeParse({ ...validProduct, salePrice: 1200 }).success).toBe(false);
    expect(productAdminInputSchema.safeParse({ ...validProduct, compareAtPrice: 900 }).success).toBe(false);
  });

  it("requires a direct image asset for the primary image rather than a product or 3D viewer page", () => {
    expect(isDirectProductImageUrl("https://cdn.example.com/hoodie.webp")).toBe(true);
    expect(productAdminInputSchema.safeParse({ ...validProduct, imageUrl: "https://printblur.com/shop/3d-hoodies" }).success).toBe(false);
  });

  it("accepts a variation with stock and a price override", () => {
    expect(variantAdminInputSchema.safeParse({ productId: 1, sku: "HF-WG-M-BLK", size: "M", color: "أسود", stock: 8, priceOverride: 1250, stockStatus: "instock", status: "active" }).success).toBe(true);
  });

  it("rejects negative stock, unsupported sizes, and empty variation SKUs", () => {
    expect(variantAdminInputSchema.safeParse({ productId: 1, sku: "HF-WG-M-BLK", size: "XXL", color: "أسود", stock: 8 }).success).toBe(false);
    expect(variantAdminInputSchema.safeParse({ productId: 1, sku: "HF-WG-M-BLK", size: "M", color: "أسود", stock: -1 }).success).toBe(false);
    expect(variantAdminInputSchema.safeParse({ productId: 1, sku: "", size: "M", color: "أسود", stock: 8 }).success).toBe(false);
  });

  it("validates media URLs and category slugs before persistence", () => {
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "https://cdn.example.com/angle.jpg", altText: "هودي من الجانب", sortOrder: 1 }).success).toBe(true);
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "/manus-storage/angle.jpg", sortOrder: 1 }).success).toBe(true);
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "https://cdn.example.com/hoodie.glb", mediaType: "model3d" }).success).toBe(true);
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "/manus-storage/hoodie.gltf", mediaType: "model3d" }).success).toBe(true);
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "https://cdn.example.com/hoodie.obj", mediaType: "model3d" }).success).toBe(false);
    expect(mediaAdminInputSchema.safeParse({ productId: 1, url: "not-a-url" }).success).toBe(false);
    expect(categoryAdminInputSchema.safeParse({ slug: "winter-hoodies", name: "هوديز شتوية", status: "active" }).success).toBe(true);
    expect(categoryAdminInputSchema.safeParse({ slug: "Winter Hoodies", name: "هوديز شتوية" }).success).toBe(false);
  });

  it("requires a GLB filename for an uploaded 3D model payload", () => {
    expect(model3dUploadInputSchema.safeParse({ productId: 1, fileName: "hoodie.glb", base64: "Z2xURg==", altText: null }).success).toBe(true);
    expect(model3dUploadInputSchema.safeParse({ productId: 1, fileName: "hoodie.gltf", base64: "Z2xURg==", altText: null }).success).toBe(false);
  });
});
