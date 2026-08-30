import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { AccountWishlist, CatalogProduct, Coupon, InsertOrder, InsertOrderItem, InsertUser, LookbookEntry, PaymentMethod, ProductCategory, ProductMedia, ProductReview, ProductVariant, ShippingZone, StoreTeamInvite, StoreTeamMember, accountWishlists, catalogProducts, commerceEvents, coupons, inventoryAdjustments, lookbookEntries, loyaltyAccounts, loyaltyLedger, orders, orderItems, paymentMethods, productCategories, productMedia, productReviews, productVariants, shippingZones, storeSettings, storeTeamInvites, storeTeamMembers, users } from "../drizzle/schema";
import type { TeamRole } from "../shared/teamAccess";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreTeamMemberForUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeTeamMembers).where(eq(storeTeamMembers.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function listStoreTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: storeTeamMembers.id,
    userId: storeTeamMembers.userId,
    role: storeTeamMembers.role,
    createdAt: storeTeamMembers.createdAt,
    updatedAt: storeTeamMembers.updatedAt,
    name: users.name,
    email: users.email,
  }).from(storeTeamMembers).leftJoin(users, eq(storeTeamMembers.userId, users.id)).orderBy(desc(storeTeamMembers.createdAt));
}

export async function listStoreTeamInvites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeTeamInvites).orderBy(desc(storeTeamInvites.createdAt));
}

export async function createStoreTeamInvite(input: Pick<StoreTeamInvite, "tokenHash" | "role" | "createdByUserId" | "expiresAt">) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const result = await db.insert(storeTeamInvites).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(storeTeamInvites).where(eq(storeTeamInvites.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getStoreTeamInviteByHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeTeamInvites).where(eq(storeTeamInvites.tokenHash, tokenHash)).limit(1);
  return rows[0] ?? null;
}

export async function acceptStoreTeamInvite(inviteId: number, userId: number, role: TeamRole, createdByUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.transaction(async (tx) => {
    await tx.insert(storeTeamMembers).values({ userId, role, createdByUserId }).onDuplicateKeyUpdate({ set: { role, createdByUserId } });
    await tx.update(storeTeamInvites).set({ acceptedAt: new Date(), acceptedByUserId: userId }).where(eq(storeTeamInvites.id, inviteId));
  });
}

export async function revokeStoreTeamInvite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(storeTeamInvites).set({ revokedAt: new Date() }).where(eq(storeTeamInvites.id, id));
}

export async function updateStoreTeamMemberRole(id: number, role: TeamRole) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(storeTeamMembers).set({ role }).where(eq(storeTeamMembers.id, id));
}

export async function revokeStoreTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.delete(storeTeamMembers).where(eq(storeTeamMembers.id, id));
}

export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  return db.transaction(async (tx) => {
    const inserted = await tx.insert(orders).values(order);
    const orderId = Number(inserted[0].insertId);
    await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderId })));
    return { id: orderId, orderNumber: order.orderNumber };
  });
}

export async function listCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(catalogProducts).orderBy(desc(catalogProducts.createdAt));
}

function toStoreProduct(product: CatalogProduct, variants: ProductVariant[], media: ProductMedia[]) {
  const productVariantsForStore = variants.filter((variant) => variant.productId === product.id && variant.status === "active");
  const productMediaForStore = media.filter((asset) => asset.productId === product.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const images = [product.imageUrl, ...productMediaForStore.filter((asset) => asset.mediaType !== "model3d").map((asset) => asset.url)];
  const model3dUrl = productMediaForStore.find((asset) => asset.mediaType === "model3d")?.url ?? null;
  const sizes = productVariantsForStore.length ? Array.from(new Set(productVariantsForStore.map((variant) => variant.size))) : ["S", "M", "L", "XL"];
  const firstVariant = productVariantsForStore[0];
  const availability = product.stockStatus === "onbackorder" ? "متاح للطلب المسبق" : product.stockStatus === "outofstock" ? "نفدت الكمية" : productVariantsForStore.length && productVariantsForStore.every((variant) => variant.stock <= 0) ? "كمية محدودة" : "متوفر";
  return {
    id: product.slug,
    databaseId: product.id,
    slug: product.slug,
    name: product.name,
    nameArabic: product.nameArabic,
    price: product.salePrice ?? product.price,
    category: product.category,
    color: firstVariant?.color ?? "أساسي",
    colorHex: "#111111",
    description: product.shortDescription ?? product.description,
    longDescription: product.description,
    details: ["خامة مختارة بعناية", "قصة مريحة", "تصميم مستقل من مرج"],
    sizes,
    fit: "Relaxed / Unisex",
    fabric: "خامة قطنية ثقيلة",
    care: "غسيل بارد وتجفيف طبيعي",
    accent: "red",
    availability,
    images,
    stockStatus: product.stockStatus,
    manageStock: product.manageStock,
    variants: productVariantsForStore,
    media: productMediaForStore,
    model3dUrl,
  };
}

export async function listPublishedCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  const [products, variants, media] = await Promise.all([
    db.select().from(catalogProducts).where(eq(catalogProducts.status, "active")).orderBy(desc(catalogProducts.createdAt)),
    db.select().from(productVariants),
    db.select().from(productMedia).orderBy(productMedia.sortOrder),
  ]);
  return products.map((product) => toStoreProduct(product, variants, media));
}

export async function getPublishedCatalogProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const product = (await db.select().from(catalogProducts).where(and(eq(catalogProducts.slug, slug), eq(catalogProducts.status, "active"))).limit(1))[0];
  if (!product) return null;
  const [variants, media] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    db.select().from(productMedia).where(eq(productMedia.productId, product.id)).orderBy(productMedia.sortOrder),
  ]);
  return toStoreProduct(product, variants, media);
}

type CatalogProductCreateInput = Pick<CatalogProduct, "slug" | "name" | "nameArabic" | "description" | "price" | "imageUrl" | "status"> & Partial<Omit<CatalogProduct, "id" | "createdAt" | "updatedAt" | "slug" | "name" | "nameArabic" | "description" | "price" | "imageUrl" | "status">>;

export async function createCatalogProduct(product: CatalogProductCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const values = {
    ...product,
    shortDescription: product.shortDescription ?? null,
    salePrice: product.salePrice ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    sku: product.sku ?? null,
    category: product.category ?? "هوديز",
    categoryId: product.categoryId ?? null,
    featured: product.featured ?? false,
    manageStock: product.manageStock ?? true,
    stockStatus: product.stockStatus ?? "instock",
  };
  const inserted = await db.insert(catalogProducts).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}

export async function updateCatalogProductStatus(id: number, status: "draft" | "active" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(catalogProducts).set({ status }).where(eq(catalogProducts.id, id));
  return { id, status };
}

export async function getOrderForCustomer(orderNumber: string, email: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = result[0];
  if (!order || order.email.toLowerCase() !== email.toLowerCase()) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function listOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function listOrdersForCustomerEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt));
}

export async function listOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}


export type CatalogProductUpdateInput = Partial<CatalogProductCreateInput>;
export type ProductVariantCreateInput = Pick<ProductVariant, "productId" | "sku" | "size"> & Partial<Pick<ProductVariant, "color" | "stock" | "priceOverride" | "stockStatus" | "status">>;
export type ProductVariantUpdateInput = Partial<Omit<ProductVariantCreateInput, "productId">>;
export type ProductMediaCreateInput = Pick<ProductMedia, "productId" | "url"> & Partial<Pick<ProductMedia, "mediaType" | "altText" | "sortOrder">>;
export type ProductCategoryCreateInput = Pick<ProductCategory, "slug" | "name"> & Partial<Pick<ProductCategory, "description" | "status">>;

export async function getAdminCatalog() {
  const db = await getDb();
  if (!db) return [];
  const [products, variants, media, categories] = await Promise.all([
    db.select().from(catalogProducts).orderBy(desc(catalogProducts.createdAt)),
    db.select().from(productVariants).orderBy(desc(productVariants.createdAt)),
    db.select().from(productMedia).orderBy(productMedia.sortOrder),
    db.select().from(productCategories).orderBy(productCategories.name),
  ]);
  return products.map((product) => ({
    ...product,
    variants: variants.filter((variant) => variant.productId === product.id),
    media: media.filter((asset) => asset.productId === product.id),
    categoryRecord: categories.find((category) => category.id === product.categoryId) ?? null,
  }));
}

export async function getAdminProduct(id: number) {
  const db = await getDb();
  if (!db) return null;
  const product = (await db.select().from(catalogProducts).where(eq(catalogProducts.id, id)).limit(1))[0];
  if (!product) return null;
  const [variants, media] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(desc(productVariants.createdAt)),
    db.select().from(productMedia).where(eq(productMedia.productId, id)).orderBy(productMedia.sortOrder),
  ]);
  return { ...product, variants, media };
}

export async function updateCatalogProduct(id: number, input: CatalogProductUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(catalogProducts).set(input).where(eq(catalogProducts.id, id));
  return getAdminProduct(id);
}

export async function listProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId)).orderBy(desc(productVariants.createdAt));
}

export async function createProductVariant(input: ProductVariantCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const values = {
    ...input,
    color: input.color ?? "أساسي",
    stock: input.stock ?? 0,
    priceOverride: input.priceOverride ?? null,
    stockStatus: input.stockStatus ?? "instock",
    status: input.status ?? "active",
  };
  const inserted = await db.insert(productVariants).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}

export async function updateProductVariant(id: number, input: ProductVariantUpdateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(productVariants).set(input).where(eq(productVariants.id, id));
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return result[0] ?? null;
}

export async function deleteProductVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.delete(productVariants).where(eq(productVariants.id, id));
  return { id };
}

export async function createProductMedia(input: ProductMediaCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const values = { ...input, mediaType: input.mediaType ?? "gallery" as const, altText: input.altText ?? null, sortOrder: input.sortOrder ?? 0 };
  if (values.mediaType === "model3d") await db.delete(productMedia).where(and(eq(productMedia.productId, values.productId), eq(productMedia.mediaType, "model3d")));
  const inserted = await db.insert(productMedia).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}

export async function deleteProductMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.delete(productMedia).where(eq(productMedia.id, id));
  return { id };
}

export async function listProductCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productCategories).orderBy(productCategories.name);
}

export async function createProductCategory(input: ProductCategoryCreateInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const values = { ...input, description: input.description ?? null, status: input.status ?? "active" };
  const inserted = await db.insert(productCategories).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}

export type StoreSettingsInput = {
  brandName: string;
  shippingScope: string;
  shippingFee: number;
  freeShippingThreshold: number | null;
  shippingNotice: string;
  returnPolicy: string;
  paymentNotice: string;
};

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeSettings).orderBy(desc(storeSettings.id)).limit(1);
  return rows[0] ?? null;
}

export async function updateStoreSettings(input: StoreSettingsInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const existing = await getStoreSettings();
  if (existing) {
    await db.update(storeSettings).set(input).where(eq(storeSettings.id, existing.id));
    const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, existing.id)).limit(1);
    return rows[0] ?? null;
  }
  const inserted = await db.insert(storeSettings).values(input);
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, Number(inserted[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export type ShippingZoneInput = Pick<ShippingZone, "governorate" | "fee" | "enabled" | "sortOrder"> & { deliveryNote: string | null };

export async function listShippingZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shippingZones).orderBy(shippingZones.sortOrder, shippingZones.governorate);
}

export async function listEnabledShippingZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shippingZones).where(eq(shippingZones.enabled, true)).orderBy(shippingZones.sortOrder, shippingZones.governorate);
}

export async function getShippingZoneForGovernorate(governorate: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(shippingZones).where(eq(shippingZones.governorate, governorate.trim())).limit(1);
  return rows[0] ?? null;
}

export async function updateShippingZone(id: number, input: Partial<ShippingZoneInput>) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(shippingZones).set(input).where(eq(shippingZones.id, id));
  const rows = await db.select().from(shippingZones).where(eq(shippingZones.id, id)).limit(1);
  return rows[0] ?? null;
}

export type PaymentMethodUpdateInput = Pick<PaymentMethod, "label" | "enabled" | "sortOrder" | "whatsappNumber"> & { instructions: string | null };

export async function listPaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).orderBy(paymentMethods.sortOrder, paymentMethods.id);
}

export async function listEnabledPaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)).orderBy(paymentMethods.sortOrder, paymentMethods.id);
}

export async function getPaymentMethodByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function updatePaymentMethod(id: number, input: Partial<PaymentMethodUpdateInput>) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(paymentMethods).set(input).where(eq(paymentMethods.id, id));
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAdminAnalytics() {
  const db = await getDb();
  if (!db) return { catalog: [], orders: [], items: [] };
  const [catalog, orderRows, items] = await Promise.all([
    getAdminCatalog(),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
  ]);
  return { catalog, orders: orderRows, items };
}


export async function updateOrderStatus(id: number, status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  return { id, status };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  return rows[0] ?? null;
}

export async function createCoupon(input: Omit<typeof coupons.$inferInsert, "id" | "usedCount" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const result = await db.insert(coupons).values({ ...input, code: input.code.toUpperCase(), usedCount: 0 });
  const rows = await db.select().from(coupons).where(eq(coupons.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function updateCoupon(id: number, input: Partial<Pick<Coupon, "type" | "value" | "minimumSubtotal" | "usageLimit" | "startsAt" | "expiresAt" | "enabled">>) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(coupons).set(input).where(eq(coupons.id, id));
  const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function consumeCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, id));
}

export async function updateOrderFulfillment(id: number, input: { shipmentCarrier: string | null; trackingNumber: string | null; trackingUrl: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(orders).set(input).where(eq(orders.id, id));
}

export async function getLoyaltyAccount(userId: number) {
  const db = await getDb();
  if (!db) return { userId, points: 0 };
  const rows = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, userId)).limit(1);
  return rows[0] ?? { userId, points: 0 };
}

export async function addLoyaltyLedgerEntry(input: { userId: number; orderId?: number | null; points: number; type: "earned_delivery" | "redeemed_checkout" | "manual_adjustment"; note?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.transaction(async (tx) => {
    const current = await tx.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, input.userId)).limit(1);
    const points = Math.max(0, (current[0]?.points ?? 0) + input.points);
    await tx.insert(loyaltyAccounts).values({ userId: input.userId, points }).onDuplicateKeyUpdate({ set: { points } });
    await tx.insert(loyaltyLedger).values(input);
  });
}

export async function awardDeliveredOrderLoyalty(orderId: number, points: number) {
  const db = await getDb();
  if (!db) return;
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = rows[0];
    if (!order?.userId || order.loyaltyAwarded || order.status !== "delivered" || points <= 0) return;
    const current = await tx.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, order.userId)).limit(1);
    await tx.insert(loyaltyAccounts).values({ userId: order.userId, points: (current[0]?.points ?? 0) + points }).onDuplicateKeyUpdate({ set: { points: (current[0]?.points ?? 0) + points } });
    await tx.insert(loyaltyLedger).values({ userId: order.userId, orderId, points, type: "earned_delivery", note: "نقاط بعد تسليم الطلب" });
    await tx.update(orders).set({ loyaltyAwarded: true }).where(eq(orders.id, orderId));
  });
}

export async function listWishlistProductIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ productId: accountWishlists.productId }).from(accountWishlists).where(eq(accountWishlists.userId, userId));
  return rows.map((row) => row.productId);
}

export async function toggleWishlistProduct(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const rows = await db.select().from(accountWishlists).where(and(eq(accountWishlists.userId, userId), eq(accountWishlists.productId, productId))).limit(1);
  if (rows[0]) { await db.delete(accountWishlists).where(eq(accountWishlists.id, rows[0].id)); return false; }
  await db.insert(accountWishlists).values({ userId, productId });
  return true;
}

export async function listApprovedReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved"))).orderBy(desc(productReviews.createdAt));
}

export async function createVerifiedReview(input: Omit<typeof productReviews.$inferInsert, "id" | "status" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const result = await db.insert(productReviews).values({ ...input, status: "pending" });
  const rows = await db.select().from(productReviews).where(eq(productReviews.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function listReviewsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews).orderBy(desc(productReviews.createdAt));
}

export async function updateReviewStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(productReviews).set({ status }).where(eq(productReviews.id, id));
}

export async function adjustVariantStock(input: { variantId: number; delta: number; reason: string; createdByUserId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(productVariants).where(eq(productVariants.id, input.variantId)).limit(1);
    const variant = rows[0];
    if (!variant) return null;
    const stock = Math.max(0, variant.stock + input.delta);
    await tx.update(productVariants).set({ stock }).where(eq(productVariants.id, input.variantId));
    await tx.insert(inventoryAdjustments).values({ ...input, resultingStock: stock });
    return { ...variant, stock };
  });
}

export async function listInventoryAdjustments(variantId?: number) {
  const db = await getDb();
  if (!db) return [];
  return variantId ? db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.variantId, variantId)).orderBy(desc(inventoryAdjustments.createdAt)) : db.select().from(inventoryAdjustments).orderBy(desc(inventoryAdjustments.createdAt));
}

export async function listLookbookEntries(publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  return publishedOnly ? db.select().from(lookbookEntries).where(eq(lookbookEntries.published, true)).orderBy(lookbookEntries.sortOrder, lookbookEntries.id) : db.select().from(lookbookEntries).orderBy(lookbookEntries.sortOrder, lookbookEntries.id);
}

export async function createLookbookEntry(input: Omit<typeof lookbookEntries.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  const result = await db.insert(lookbookEntries).values(input);
  const rows = await db.select().from(lookbookEntries).where(eq(lookbookEntries.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}

export async function updateLookbookEntry(id: number, input: Partial<Pick<LookbookEntry, "title" | "titleArabic" | "description" | "imageUrl" | "productId" | "sortOrder" | "published">>) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا");
  await db.update(lookbookEntries).set(input).where(eq(lookbookEntries.id, id));
}

export async function recordCommerceEvent(input: { sessionKey: string; userId?: number | null; eventName: "product_view" | "add_to_cart" | "checkout_started" | "purchase_completed"; productId?: number | null; orderId?: number | null }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(commerceEvents).values(input);
}

export async function getCommerceEventCounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ eventName: commerceEvents.eventName, count: sql<number>`count(*)` }).from(commerceEvents).groupBy(commerceEvents.eventName);
}
