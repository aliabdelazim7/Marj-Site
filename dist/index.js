// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var storeTeamMembers = mysqlTable("storeTeamMembers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  role: mysqlEnum("role", ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var storeTeamInvites = mysqlTable("storeTeamInvites", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  role: mysqlEnum("role", ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  expiresAt: timestamp("expiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  acceptedByUserId: int("acceptedByUserId"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 80 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 40 }).default("cod").notNull(),
  couponCode: varchar("couponCode", { length: 80 }),
  couponDiscount: int("couponDiscount").default(0).notNull(),
  shipmentCarrier: varchar("shipmentCarrier", { length: 120 }),
  trackingNumber: varchar("trackingNumber", { length: 160 }),
  trackingUrl: text("trackingUrl"),
  loyaltyAwarded: boolean("loyaltyAwarded").default(false).notNull(),
  notes: text("notes"),
  subtotal: int("subtotal").notNull(),
  shipping: int("shipping").notNull(),
  total: int("total").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: varchar("productId", { length: 80 }).notNull(),
  productName: varchar("productName", { length: 160 }).notNull(),
  size: varchar("size", { length: 8 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  lineTotal: int("lineTotal").notNull()
});
var coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  type: mysqlEnum("type", ["percentage", "fixed"]).notNull(),
  value: int("value").notNull(),
  minimumSubtotal: int("minimumSubtotal").default(0).notNull(),
  usageLimit: int("usageLimit"),
  usedCount: int("usedCount").default(0).notNull(),
  startsAt: timestamp("startsAt").notNull(),
  expiresAt: timestamp("expiresAt"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productReviews = mysqlTable("productReviews", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  rating: int("rating").notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [uniqueIndex("productReviews_order_product_unique").on(table.orderId, table.productId)]);
var accountWishlists = mysqlTable("accountWishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (table) => [uniqueIndex("accountWishlists_user_product_unique").on(table.userId, table.productId)]);
var loyaltyAccounts = mysqlTable("loyaltyAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  points: int("points").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var loyaltyLedger = mysqlTable("loyaltyLedger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["earned_delivery", "redeemed_checkout", "manual_adjustment"]).notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var inventoryAdjustments = mysqlTable("inventoryAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  variantId: int("variantId").notNull(),
  delta: int("delta").notNull(),
  resultingStock: int("resultingStock").notNull(),
  reason: varchar("reason", { length: 240 }).notNull(),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var lookbookEntries = mysqlTable("lookbookEntries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  titleArabic: varchar("titleArabic", { length: 160 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  productId: int("productId"),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var commerceEvents = mysqlTable("commerceEvents", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 128 }).notNull(),
  userId: int("userId"),
  eventName: mysqlEnum("eventName", ["product_view", "add_to_cart", "checkout_started", "purchase_completed"]).notNull(),
  productId: int("productId"),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var catalogProducts = mysqlTable("catalogProducts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  nameArabic: varchar("nameArabic", { length: 160 }).notNull(),
  description: text("description").notNull(),
  shortDescription: text("shortDescription"),
  price: int("price").notNull(),
  salePrice: int("salePrice"),
  compareAtPrice: int("compareAtPrice"),
  sku: varchar("sku", { length: 80 }),
  imageUrl: text("imageUrl").notNull(),
  category: varchar("category", { length: 80 }).default("\u0647\u0648\u062F\u064A\u0632").notNull(),
  categoryId: int("categoryId"),
  featured: boolean("featured").default(false).notNull(),
  manageStock: boolean("manageStock").default(true).notNull(),
  stockStatus: mysqlEnum("stockStatus", ["instock", "outofstock", "onbackorder"]).default("instock").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productVariants = mysqlTable("productVariants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  size: varchar("size", { length: 8 }).notNull(),
  color: varchar("color", { length: 80 }).default("\u0623\u0633\u0627\u0633\u064A").notNull(),
  stock: int("stock").default(0).notNull(),
  safetyStock: int("safetyStock").default(3).notNull(),
  priceOverride: int("priceOverride"),
  stockStatus: mysqlEnum("stockStatus", ["instock", "outofstock", "onbackorder"]).default("instock").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productCategories = mysqlTable("productCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "draft"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var storeSettings = mysqlTable("storeSettings", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 120 }).default("\u0645\u0631\u062C").notNull(),
  shippingScope: varchar("shippingScope", { length: 240 }).default("\u0627\u0644\u0634\u062D\u0646 \u0645\u062A\u0627\u062D \u0644\u062C\u0645\u064A\u0639 \u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0645\u0635\u0631").notNull(),
  shippingFee: int("shippingFee").default(0).notNull(),
  freeShippingThreshold: int("freeShippingThreshold"),
  shippingNotice: text("shippingNotice").notNull(),
  returnPolicy: text("returnPolicy").notNull(),
  paymentNotice: text("paymentNotice").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var shippingZones = mysqlTable("shippingZones", {
  id: int("id").autoincrement().primaryKey(),
  governorate: varchar("governorate", { length: 80 }).notNull().unique(),
  fee: int("fee").default(0).notNull(),
  deliveryNote: varchar("deliveryNote", { length: 240 }),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  type: mysqlEnum("type", ["cod", "manual_transfer", "online_card"]).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  instructions: text("instructions"),
  whatsappNumber: varchar("whatsappNumber", { length: 16 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productMedia = mysqlTable("productMedia", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  mediaType: mysqlEnum("mediaType", ["front", "back", "gallery", "model3d"]).default("gallery").notNull(),
  altText: varchar("altText", { length: 180 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 128 }).notNull().unique(),
  userId: int("userId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  variantId: int("variantId").notNull(),
  quantity: int("quantity").notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getStoreTeamMemberForUser(userId) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeTeamMembers).where(eq(storeTeamMembers.userId, userId)).limit(1);
  return rows[0] ?? null;
}
async function listStoreTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: storeTeamMembers.id,
    userId: storeTeamMembers.userId,
    role: storeTeamMembers.role,
    createdAt: storeTeamMembers.createdAt,
    updatedAt: storeTeamMembers.updatedAt,
    name: users.name,
    email: users.email
  }).from(storeTeamMembers).leftJoin(users, eq(storeTeamMembers.userId, users.id)).orderBy(desc(storeTeamMembers.createdAt));
}
async function listStoreTeamInvites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeTeamInvites).orderBy(desc(storeTeamInvites.createdAt));
}
async function createStoreTeamInvite(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const result = await db.insert(storeTeamInvites).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(storeTeamInvites).where(eq(storeTeamInvites.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getStoreTeamInviteByHash(tokenHash) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeTeamInvites).where(eq(storeTeamInvites.tokenHash, tokenHash)).limit(1);
  return rows[0] ?? null;
}
async function acceptStoreTeamInvite(inviteId, userId, role, createdByUserId) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.transaction(async (tx) => {
    await tx.insert(storeTeamMembers).values({ userId, role, createdByUserId }).onDuplicateKeyUpdate({ set: { role, createdByUserId } });
    await tx.update(storeTeamInvites).set({ acceptedAt: /* @__PURE__ */ new Date(), acceptedByUserId: userId }).where(eq(storeTeamInvites.id, inviteId));
  });
}
async function revokeStoreTeamInvite(id) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(storeTeamInvites).set({ revokedAt: /* @__PURE__ */ new Date() }).where(eq(storeTeamInvites.id, id));
}
async function updateStoreTeamMemberRole(id, role) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(storeTeamMembers).set({ role }).where(eq(storeTeamMembers.id, id));
}
async function revokeStoreTeamMember(id) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.delete(storeTeamMembers).where(eq(storeTeamMembers.id, id));
}
async function createOrder(order, items) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  return db.transaction(async (tx) => {
    const inserted = await tx.insert(orders).values(order);
    const orderId = Number(inserted[0].insertId);
    await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderId })));
    return { id: orderId, orderNumber: order.orderNumber };
  });
}
async function listCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(catalogProducts).orderBy(desc(catalogProducts.createdAt));
}
function toStoreProduct(product, variants, media) {
  const productVariantsForStore = variants.filter((variant) => variant.productId === product.id && variant.status === "active");
  const productMediaForStore = media.filter((asset) => asset.productId === product.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const images = [product.imageUrl, ...productMediaForStore.filter((asset) => asset.mediaType !== "model3d").map((asset) => asset.url)];
  const model3dUrl = productMediaForStore.find((asset) => asset.mediaType === "model3d")?.url ?? null;
  const sizes = productVariantsForStore.length ? Array.from(new Set(productVariantsForStore.map((variant) => variant.size))) : ["S", "M", "L", "XL"];
  const firstVariant = productVariantsForStore[0];
  const availability = product.stockStatus === "onbackorder" ? "\u0645\u062A\u0627\u062D \u0644\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u0628\u0642" : product.stockStatus === "outofstock" ? "\u0646\u0641\u062F\u062A \u0627\u0644\u0643\u0645\u064A\u0629" : productVariantsForStore.length && productVariantsForStore.every((variant) => variant.stock <= 0) ? "\u0643\u0645\u064A\u0629 \u0645\u062D\u062F\u0648\u062F\u0629" : "\u0645\u062A\u0648\u0641\u0631";
  return {
    id: product.slug,
    databaseId: product.id,
    slug: product.slug,
    name: product.name,
    nameArabic: product.nameArabic,
    price: product.salePrice ?? product.price,
    category: product.category,
    color: firstVariant?.color ?? "\u0623\u0633\u0627\u0633\u064A",
    colorHex: "#111111",
    description: product.shortDescription ?? product.description,
    longDescription: product.description,
    details: ["\u062E\u0627\u0645\u0629 \u0645\u062E\u062A\u0627\u0631\u0629 \u0628\u0639\u0646\u0627\u064A\u0629", "\u0642\u0635\u0629 \u0645\u0631\u064A\u062D\u0629", "\u062A\u0635\u0645\u064A\u0645 \u0645\u0633\u062A\u0642\u0644 \u0645\u0646 \u0645\u0631\u062C"],
    sizes,
    fit: "Relaxed / Unisex",
    fabric: "\u062E\u0627\u0645\u0629 \u0642\u0637\u0646\u064A\u0629 \u062B\u0642\u064A\u0644\u0629",
    care: "\u063A\u0633\u064A\u0644 \u0628\u0627\u0631\u062F \u0648\u062A\u062C\u0641\u064A\u0641 \u0637\u0628\u064A\u0639\u064A",
    accent: "red",
    availability,
    images,
    stockStatus: product.stockStatus,
    manageStock: product.manageStock,
    variants: productVariantsForStore,
    media: productMediaForStore,
    model3dUrl
  };
}
async function listPublishedCatalogProducts() {
  const db = await getDb();
  if (!db) return [];
  const [products, variants, media] = await Promise.all([
    db.select().from(catalogProducts).where(eq(catalogProducts.status, "active")).orderBy(desc(catalogProducts.createdAt)),
    db.select().from(productVariants),
    db.select().from(productMedia).orderBy(productMedia.sortOrder)
  ]);
  return products.map((product) => toStoreProduct(product, variants, media));
}
async function getPublishedCatalogProductBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const product = (await db.select().from(catalogProducts).where(and(eq(catalogProducts.slug, slug), eq(catalogProducts.status, "active"))).limit(1))[0];
  if (!product) return null;
  const [variants, media] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
    db.select().from(productMedia).where(eq(productMedia.productId, product.id)).orderBy(productMedia.sortOrder)
  ]);
  return toStoreProduct(product, variants, media);
}
async function createCatalogProduct(product) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const values = {
    ...product,
    shortDescription: product.shortDescription ?? null,
    salePrice: product.salePrice ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    sku: product.sku ?? null,
    category: product.category ?? "\u0647\u0648\u062F\u064A\u0632",
    categoryId: product.categoryId ?? null,
    featured: product.featured ?? false,
    manageStock: product.manageStock ?? true,
    stockStatus: product.stockStatus ?? "instock"
  };
  const inserted = await db.insert(catalogProducts).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}
async function updateCatalogProductStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(catalogProducts).set({ status }).where(eq(catalogProducts.id, id));
  return { id, status };
}
async function getOrderForCustomer(orderNumber, email) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = result[0];
  if (!order || order.email.toLowerCase() !== email.toLowerCase()) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
async function listOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
async function listOrdersForCustomerEmail(email) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt));
}
async function getAdminCatalog() {
  const db = await getDb();
  if (!db) return [];
  const [products, variants, media, categories] = await Promise.all([
    db.select().from(catalogProducts).orderBy(desc(catalogProducts.createdAt)),
    db.select().from(productVariants).orderBy(desc(productVariants.createdAt)),
    db.select().from(productMedia).orderBy(productMedia.sortOrder),
    db.select().from(productCategories).orderBy(productCategories.name)
  ]);
  return products.map((product) => ({
    ...product,
    variants: variants.filter((variant) => variant.productId === product.id),
    media: media.filter((asset) => asset.productId === product.id),
    categoryRecord: categories.find((category) => category.id === product.categoryId) ?? null
  }));
}
async function getAdminProduct(id) {
  const db = await getDb();
  if (!db) return null;
  const product = (await db.select().from(catalogProducts).where(eq(catalogProducts.id, id)).limit(1))[0];
  if (!product) return null;
  const [variants, media] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(desc(productVariants.createdAt)),
    db.select().from(productMedia).where(eq(productMedia.productId, id)).orderBy(productMedia.sortOrder)
  ]);
  return { ...product, variants, media };
}
async function updateCatalogProduct(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(catalogProducts).set(input).where(eq(catalogProducts.id, id));
  return getAdminProduct(id);
}
async function listProductVariants(productId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId)).orderBy(desc(productVariants.createdAt));
}
async function createProductVariant(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const values = {
    ...input,
    color: input.color ?? "\u0623\u0633\u0627\u0633\u064A",
    stock: input.stock ?? 0,
    priceOverride: input.priceOverride ?? null,
    stockStatus: input.stockStatus ?? "instock",
    status: input.status ?? "active"
  };
  const inserted = await db.insert(productVariants).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}
async function updateProductVariant(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(productVariants).set(input).where(eq(productVariants.id, id));
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return result[0] ?? null;
}
async function deleteProductVariant(id) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.delete(productVariants).where(eq(productVariants.id, id));
  return { id };
}
async function createProductMedia(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const values = { ...input, mediaType: input.mediaType ?? "gallery", altText: input.altText ?? null, sortOrder: input.sortOrder ?? 0 };
  if (values.mediaType === "model3d") await db.delete(productMedia).where(and(eq(productMedia.productId, values.productId), eq(productMedia.mediaType, "model3d")));
  const inserted = await db.insert(productMedia).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}
async function deleteProductMedia(id) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.delete(productMedia).where(eq(productMedia.id, id));
  return { id };
}
async function listProductCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productCategories).orderBy(productCategories.name);
}
async function createProductCategory(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const values = { ...input, description: input.description ?? null, status: input.status ?? "active" };
  const inserted = await db.insert(productCategories).values(values);
  return { id: Number(inserted[0].insertId), ...values };
}
async function getStoreSettings() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(storeSettings).orderBy(desc(storeSettings.id)).limit(1);
  return rows[0] ?? null;
}
async function updateStoreSettings(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const existing = await getStoreSettings();
  if (existing) {
    await db.update(storeSettings).set(input).where(eq(storeSettings.id, existing.id));
    const rows2 = await db.select().from(storeSettings).where(eq(storeSettings.id, existing.id)).limit(1);
    return rows2[0] ?? null;
  }
  const inserted = await db.insert(storeSettings).values(input);
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, Number(inserted[0].insertId))).limit(1);
  return rows[0] ?? null;
}
async function listShippingZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shippingZones).orderBy(shippingZones.sortOrder, shippingZones.governorate);
}
async function listEnabledShippingZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shippingZones).where(eq(shippingZones.enabled, true)).orderBy(shippingZones.sortOrder, shippingZones.governorate);
}
async function getShippingZoneForGovernorate(governorate) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(shippingZones).where(eq(shippingZones.governorate, governorate.trim())).limit(1);
  return rows[0] ?? null;
}
async function updateShippingZone(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(shippingZones).set(input).where(eq(shippingZones.id, id));
  const rows = await db.select().from(shippingZones).where(eq(shippingZones.id, id)).limit(1);
  return rows[0] ?? null;
}
async function listPaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).orderBy(paymentMethods.sortOrder, paymentMethods.id);
}
async function listEnabledPaymentMethods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.enabled, true)).orderBy(paymentMethods.sortOrder, paymentMethods.id);
}
async function getPaymentMethodByCode(code) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.code, code)).limit(1);
  return rows[0] ?? null;
}
async function updatePaymentMethod(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(paymentMethods).set(input).where(eq(paymentMethods.id, id));
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getAdminAnalytics() {
  const db = await getDb();
  if (!db) return { catalog: [], orders: [], items: [] };
  const [catalog, orderRows, items] = await Promise.all([
    getAdminCatalog(),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems)
  ]);
  return { catalog, orders: orderRows, items };
}
async function updateOrderStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  return { id, status };
}
async function getOrderById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}
async function listCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}
async function getCouponByCode(code) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  return rows[0] ?? null;
}
async function createCoupon(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const result = await db.insert(coupons).values({ ...input, code: input.code.toUpperCase(), usedCount: 0 });
  const rows = await db.select().from(coupons).where(eq(coupons.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}
async function updateCoupon(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(coupons).set(input).where(eq(coupons.id, id));
  const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return rows[0] ?? null;
}
async function consumeCoupon(id) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, id));
}
async function updateOrderFulfillment(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(orders).set(input).where(eq(orders.id, id));
}
async function getLoyaltyAccount(userId) {
  const db = await getDb();
  if (!db) return { userId, points: 0 };
  const rows = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, userId)).limit(1);
  return rows[0] ?? { userId, points: 0 };
}
async function addLoyaltyLedgerEntry(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.transaction(async (tx) => {
    const current = await tx.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, input.userId)).limit(1);
    const points = Math.max(0, (current[0]?.points ?? 0) + input.points);
    await tx.insert(loyaltyAccounts).values({ userId: input.userId, points }).onDuplicateKeyUpdate({ set: { points } });
    await tx.insert(loyaltyLedger).values(input);
  });
}
async function awardDeliveredOrderLoyalty(orderId, points) {
  const db = await getDb();
  if (!db) return;
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = rows[0];
    if (!order?.userId || order.loyaltyAwarded || order.status !== "delivered" || points <= 0) return;
    const current = await tx.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.userId, order.userId)).limit(1);
    await tx.insert(loyaltyAccounts).values({ userId: order.userId, points: (current[0]?.points ?? 0) + points }).onDuplicateKeyUpdate({ set: { points: (current[0]?.points ?? 0) + points } });
    await tx.insert(loyaltyLedger).values({ userId: order.userId, orderId, points, type: "earned_delivery", note: "\u0646\u0642\u0627\u0637 \u0628\u0639\u062F \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0644\u0628" });
    await tx.update(orders).set({ loyaltyAwarded: true }).where(eq(orders.id, orderId));
  });
}
async function listWishlistProductIds(userId) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ productId: accountWishlists.productId }).from(accountWishlists).where(eq(accountWishlists.userId, userId));
  return rows.map((row) => row.productId);
}
async function toggleWishlistProduct(userId, productId) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const rows = await db.select().from(accountWishlists).where(and(eq(accountWishlists.userId, userId), eq(accountWishlists.productId, productId))).limit(1);
  if (rows[0]) {
    await db.delete(accountWishlists).where(eq(accountWishlists.id, rows[0].id));
    return false;
  }
  await db.insert(accountWishlists).values({ userId, productId });
  return true;
}
async function listApprovedReviews(productId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved"))).orderBy(desc(productReviews.createdAt));
}
async function createVerifiedReview(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const result = await db.insert(productReviews).values({ ...input, status: "pending" });
  const rows = await db.select().from(productReviews).where(eq(productReviews.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}
async function listReviewsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews).orderBy(desc(productReviews.createdAt));
}
async function updateReviewStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(productReviews).set({ status }).where(eq(productReviews.id, id));
}
async function adjustVariantStock(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
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
async function listInventoryAdjustments(variantId) {
  const db = await getDb();
  if (!db) return [];
  return variantId ? db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.variantId, variantId)).orderBy(desc(inventoryAdjustments.createdAt)) : db.select().from(inventoryAdjustments).orderBy(desc(inventoryAdjustments.createdAt));
}
async function listLookbookEntries(publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  return publishedOnly ? db.select().from(lookbookEntries).where(eq(lookbookEntries.published, true)).orderBy(lookbookEntries.sortOrder, lookbookEntries.id) : db.select().from(lookbookEntries).orderBy(lookbookEntries.sortOrder, lookbookEntries.id);
}
async function createLookbookEntry(input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  const result = await db.insert(lookbookEntries).values(input);
  const rows = await db.select().from(lookbookEntries).where(eq(lookbookEntries.id, Number(result[0].insertId))).limit(1);
  return rows[0] ?? null;
}
async function updateLookbookEntry(id, input) {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627");
  await db.update(lookbookEntries).set(input).where(eq(lookbookEntries.id, id));
}
async function recordCommerceEvent(input) {
  const db = await getDb();
  if (!db) return;
  await db.insert(commerceEvents).values(input);
}
async function getCommerceEventCounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ eventName: commerceEvents.eventName, count: sql`count(*)` }).from(commerceEvents).groupBy(commerceEvents.eventName);
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
import { createHash } from "node:crypto";

// shared/products.ts
var productImages = {
  signalRed: "/manus-storage/signal-red-front_ea8ae7ae.jpg",
  paperWhite: "/manus-storage/paper-white-front_c5e44344.jpg",
  nightGrid: "/manus-storage/night-grid-front_c4bb4ea5.jpg",
  concreteGrey: "/manus-storage/concrete-grey-front_a010e741.jpg"
};
var hoodieProducts = [
  {
    id: "signal-red",
    slug: "signal-red-hoodie",
    name: "Signal Red",
    nameArabic: "\u0625\u0634\u0627\u0631\u0629 \u062D\u0645\u0631\u0627\u0621",
    price: 899,
    color: "\u0623\u062D\u0645\u0631 \u0625\u0634\u0627\u0631\u0629",
    colorHex: "#db2f27",
    description: "\u0647\u0648\u062F\u064A \u0642\u0637\u0646\u064A \u062B\u0642\u064A\u0644 \u0628\u0642\u0635\u0629 \u0646\u0638\u064A\u0641\u0629 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u062D\u0645\u0631\u0627\u0621 \u062D\u0627\u062F\u0629.",
    longDescription: "\u0642\u0637\u0639\u0629 \u0623\u0633\u0627\u0633\u064A\u0629 \u0628\u0644\u0648\u0646 \u0644\u0627 \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0634\u0631\u062D. \u0635\u0645\u0645\u0646\u0627 \u0625\u0634\u0627\u0631\u0629 \u062D\u0645\u0631\u0627\u0621 \u0645\u0646 \u0642\u0637\u0646 \u062B\u0642\u064A\u0644 \u0628\u0645\u0644\u0645\u0633 \u0646\u0627\u0639\u0645 \u0645\u0646 \u0627\u0644\u062F\u0627\u062E\u0644\u060C \u0648\u0642\u0635\u0629 \u0645\u0631\u064A\u062D\u0629 \u062A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0634\u0643\u0644\u0647\u0627 \u0628\u0639\u062F \u064A\u0648\u0645 \u0637\u0648\u064A\u0644.",
    details: ["\u0642\u0637\u0646 \u0639\u0636\u0648\u064A 100%", "\u0642\u0635\u0629 \u0645\u0631\u064A\u062D\u0629", "\u062C\u064A\u0628 \u0623\u0645\u0627\u0645\u064A", "\u062A\u0634\u0637\u064A\u0628 \u0645\u0637\u0641\u064A"],
    sizes: ["S", "M", "L", "XL"],
    fit: "Relaxed / Unisex",
    fabric: "420gsm organic cotton",
    care: "\u063A\u0633\u064A\u0644 \u0628\u0627\u0631\u062F\u060C \u0645\u0642\u0644\u0648\u0628\u064B\u0627\u060C \u0648\u062A\u062C\u0641\u064A\u0641 \u0637\u0628\u064A\u0639\u064A",
    accent: "red",
    availability: "\u0645\u062A\u0648\u0641\u0631",
    images: [productImages.signalRed, "/manus-storage/signal-red-side_1a2ce874.jpg"]
  },
  {
    id: "paper-white",
    slug: "paper-white-hoodie",
    name: "Paper White",
    nameArabic: "\u0623\u0628\u064A\u0636 \u0648\u0631\u0642\u064A",
    price: 849,
    color: "\u0623\u0628\u064A\u0636 \u0646\u0627\u0635\u0639",
    colorHex: "#f4f1eb",
    description: "\u0646\u0633\u062E\u0629 \u0647\u0627\u062F\u0626\u0629 \u0645\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0627\u062A\u060C \u0645\u0635\u0645\u0645\u0629 \u0644\u062A\u0639\u064A\u0634 \u0645\u0639 \u0643\u0644 \u0625\u0637\u0644\u0627\u0644\u0629.",
    longDescription: "\u0623\u0628\u064A\u0636 \u0648\u0631\u0642\u064A \u0644\u064A\u0633 \u0623\u0628\u064A\u0636\u064B\u0627 \u0639\u0627\u062F\u064A\u064B\u0627. \u062F\u0631\u062C\u0629 \u062F\u0627\u0641\u0626\u0629 \u0648\u0642\u0645\u0627\u0634 \u0643\u062B\u064A\u0641 \u064A\u062C\u0639\u0644\u0627\u0646 \u0627\u0644\u0642\u0637\u0639\u0629 \u0623\u0633\u0627\u0633\u064B\u0627 \u0646\u0638\u064A\u0641\u064B\u0627 \u0644\u0643\u0644 \u0637\u0628\u0642\u0627\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.",
    details: ["\u0646\u0633\u064A\u062C \u0646\u0627\u0639\u0645 420gsm", "\u062A\u0634\u0637\u064A\u0628 \u0645\u0637\u0641\u064A", "\u0642\u0635\u0629 unisex", "\u0628\u0637\u0627\u0646\u0629 \u0641\u0631\u0646\u0633\u064A\u0629"],
    sizes: ["S", "M", "L", "XL"],
    fit: "Relaxed / Unisex",
    fabric: "420gsm brushed cotton",
    care: "\u063A\u0633\u064A\u0644 \u0628\u0627\u0631\u062F \u0645\u0639 \u0623\u0644\u0648\u0627\u0646 \u0645\u0634\u0627\u0628\u0647\u0629",
    accent: "black",
    availability: "\u0645\u062A\u0648\u0641\u0631",
    images: [productImages.paperWhite, "/manus-storage/paper-white-side_6428f880.jpg"]
  },
  {
    id: "night-grid",
    slug: "night-grid-hoodie",
    name: "Night Grid",
    nameArabic: "\u0634\u0628\u0643\u0629 \u0644\u064A\u0644\u064A\u0629",
    price: 949,
    color: "\u0623\u0633\u0648\u062F \u0644\u064A\u0644\u064A",
    colorHex: "#111111",
    description: "\u0623\u0633\u0648\u062F \u0639\u0645\u064A\u0642 \u0645\u0639 \u0637\u0628\u0627\u0639\u0629 \u0634\u0628\u0643\u064A\u0629 \u0635\u063A\u064A\u0631\u0629 \u0644\u0645\u062D\u0628\u064A \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0647\u0627\u062F\u0626\u0629.",
    longDescription: "\u062A\u0641\u0635\u064A\u0644\u0629 \u0635\u063A\u064A\u0631\u0629 \u062A\u063A\u064A\u0651\u0631 \u0643\u0644 \u0634\u064A\u0621. \u0634\u0628\u0643\u0629 \u062D\u0645\u0631\u0627\u0621 \u062F\u0642\u064A\u0642\u0629 \u0639\u0644\u0649 \u0623\u0633\u0648\u062F \u0644\u064A\u0644\u064A \u0639\u0645\u064A\u0642\u060C \u0645\u0639 \u0642\u0645\u0627\u0634 \u064A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062D\u0636\u0648\u0631\u0647 \u0628\u062F\u0648\u0646 \u0636\u0648\u0636\u0627\u0621.",
    details: ["\u0642\u0637\u0646 \u0645\u0645\u0634\u0637", "\u0637\u0628\u0627\u0639\u0629 \u0645\u0642\u0627\u0648\u0645\u0629", "\u062C\u064A\u0628 \u0623\u0645\u0627\u0645\u064A", "\u0623\u0633\u0627\u0648\u0631 \u0645\u0636\u0644\u0639\u0629"],
    sizes: ["S", "M", "L", "XL"],
    fit: "Relaxed / Unisex",
    fabric: "400gsm combed cotton",
    care: "\u063A\u0633\u064A\u0644 \u0645\u0642\u0644\u0648\u0628\u060C \u0628\u062F\u0648\u0646 \u0643\u064A \u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0628\u0627\u0639\u0629",
    accent: "red",
    availability: "\u0643\u0645\u064A\u0629 \u0645\u062D\u062F\u0648\u062F\u0629",
    images: [productImages.nightGrid, "/manus-storage/night-grid-side_02e9d7ec.jpg"]
  },
  {
    id: "concrete-grey",
    slug: "concrete-grey-hoodie",
    name: "Concrete Grey",
    nameArabic: "\u0631\u0645\u0627\u062F\u064A \u062E\u0631\u0633\u0627\u0646\u0629",
    price: 879,
    color: "\u0631\u0645\u0627\u062F\u064A \u062E\u0631\u0633\u0627\u0646\u0629",
    colorHex: "#9a9a95",
    description: "\u062A\u0648\u0627\u0632\u0646 \u0639\u0645\u0644\u064A \u0628\u064A\u0646 \u0627\u0644\u0645\u0644\u0645\u0633 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0631\u0627\u062D\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.",
    longDescription: "\u0631\u0645\u0627\u062F\u064A \u0645\u062D\u0627\u064A\u062F \u0628\u0642\u0635\u0629 \u0648\u0627\u0633\u0639\u0629 \u0648\u0645\u062F\u0631\u0648\u0633\u0629. \u0642\u0637\u0639\u0629 \u0633\u0647\u0644\u0629\u060C \u0644\u0643\u0646 \u0644\u064A\u0633\u062A \u0639\u0627\u062F\u064A\u0629\u061B \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0637\u0628\u0642\u0627\u062A \u0648\u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u064A\u0648\u0645\u064A \u0627\u0644\u0645\u062A\u0643\u0631\u0631.",
    details: ["\u0628\u0637\u0627\u0646\u0629 \u0641\u0631\u0646\u0633\u064A\u0629", "\u0623\u0633\u0627\u0648\u0631 \u0645\u0636\u0644\u0639\u0629", "\u0642\u0635\u0629 \u0648\u0627\u0633\u0639\u0629", "\u062D\u064A\u0627\u0643\u0629 \u0645\u062A\u064A\u0646\u0629"],
    sizes: ["S", "M", "L", "XL"],
    fit: "Relaxed / Unisex",
    fabric: "420gsm French terry",
    care: "\u063A\u0633\u064A\u0644 \u0628\u0627\u0631\u062F \u0648\u062A\u062C\u0641\u064A\u0641 \u0645\u0646\u062E\u0641\u0636",
    accent: "black",
    availability: "\u0645\u062A\u0648\u0641\u0631",
    images: [productImages.concreteGrey, "/manus-storage/concrete-grey-side_d55f77ef.jpg"]
  }
];
var getHoodieById = (id) => hoodieProducts.find((product) => product.id === id);

// shared/commerce.ts
function isValidCustomerEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}
function validateCommerceLine(line) {
  const product = getHoodieById(line.productId);
  if (!product) return { ok: false, message: "\u0623\u062D\u062F \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0645 \u064A\u0639\u062F \u0645\u062A\u0627\u062D\u064B\u0627." };
  if (!product.sizes.includes(line.size)) return { ok: false, message: `\u0627\u0644\u0645\u0642\u0627\u0633 ${line.size} \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C.` };
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 5) return { ok: false, message: "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0628\u064A\u0646 1 \u06485." };
  return { ok: true, product };
}

// shared/adminDashboard.ts
var actionOrderStatuses = /* @__PURE__ */ new Set(["pending", "confirmed", "processing"]);
function buildAdminOperationsSummary(products, orders2) {
  const stockAlerts = products.flatMap((product) => product.variants.filter((variant) => variant.status === "active").filter((variant) => product.stockStatus === "outofstock" || variant.stockStatus === "outofstock" || variant.stock <= (variant.safetyStock ?? 3)).map((variant) => ({
    productId: product.id,
    productName: product.nameArabic,
    productSlug: product.slug,
    productStockStatus: product.stockStatus,
    ...variant,
    severity: product.stockStatus === "outofstock" || variant.stockStatus === "outofstock" || variant.stock === 0 ? "critical" : "low"
  }))).sort((a, b) => Number(b.severity === "critical") - Number(a.severity === "critical") || a.stock - b.stock);
  const actionOrders = orders2.filter((order) => actionOrderStatuses.has(order.status)).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return {
    stockAlerts,
    actionOrders,
    statusCounts: {
      pending: orders2.filter((order) => order.status === "pending").length,
      confirmed: orders2.filter((order) => order.status === "confirmed").length,
      processing: orders2.filter((order) => order.status === "processing").length,
      shipped: orders2.filter((order) => order.status === "shipped").length
    }
  };
}

// shared/adminAnalytics.ts
var activeOrderStatuses = /* @__PURE__ */ new Set(["pending", "confirmed", "processing", "shipped", "delivered"]);
function countBy(values) {
  return values.reduce((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {});
}
function buildAdminAnalytics(orders2, items, catalog) {
  const recordedOrders = orders2.filter((order) => activeOrderStatuses.has(order.status));
  const recordedOrderIds = new Set(recordedOrders.map((order) => order.id));
  const totalOrderValue = recordedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalShippingValue = recordedOrders.reduce((sum, order) => sum + order.shipping, 0);
  const topProducts = Object.values(items.filter((item) => recordedOrderIds.has(item.orderId)).reduce((acc, item) => {
    const current = acc[item.productId] ?? { productId: item.productId, productName: item.productName, quantity: 0, value: 0 };
    current.quantity += item.quantity;
    current.value += item.lineTotal;
    acc[item.productId] = current;
    return acc;
  }, {})).sort((a, b) => b.value - a.value || b.quantity - a.quantity).slice(0, 5);
  const governorates = Object.entries(countBy(recordedOrders.map((order) => order.city))).map(([city, ordersCount]) => ({ city, ordersCount, value: recordedOrders.filter((order) => order.city === city).reduce((sum, order) => sum + order.total, 0) })).sort((a, b) => b.value - a.value || b.ordersCount - a.ordersCount).slice(0, 5);
  return {
    recordedOrdersCount: recordedOrders.length,
    cancelledOrdersCount: orders2.filter((order) => order.status === "cancelled").length,
    totalOrderValue,
    totalShippingValue,
    averageRecordedOrderValue: recordedOrders.length ? Math.round(totalOrderValue / recordedOrders.length) : 0,
    orderStatusCounts: countBy(orders2.map((order) => order.status)),
    paymentMethodCounts: countBy(recordedOrders.map((order) => order.paymentMethod)),
    topProducts,
    governorates,
    catalog: {
      published: catalog.filter((product) => product.status === "active").length,
      drafts: catalog.filter((product) => product.status === "draft").length,
      atRiskVariations: catalog.flatMap((product) => product.variants).filter((variant) => variant.status === "active" && (variant.stockStatus === "outofstock" || variant.stock <= 3)).length
    }
  };
}

// shared/paymentRules.ts
function getPaymentActivationError(type, enabled, instructions) {
  if (!enabled) return null;
  if (type === "online_card") return "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0642\u0628\u0644 \u0631\u0628\u0637 \u0645\u0632\u0648\u062F \u062F\u0641\u0639 \u0648\u062D\u0633\u0627\u0628 \u062A\u0627\u062C\u0631.";
  if (type === "manual_transfer" && !instructions?.trim()) return "\u0623\u062F\u062E\u0644 \u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0641\u0639\u0644\u064A\u0629 \u0642\u0628\u0644 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0623\u0648 \u0627\u0644\u062A\u062D\u0648\u064A\u0644.";
  return null;
}

// shared/shippingRules.ts
function calculateShippingForGovernorate(subtotal, governorateFee, freeShippingThreshold) {
  if (subtotal <= 0) return 0;
  if (freeShippingThreshold !== null && freeShippingThreshold !== void 0 && subtotal >= freeShippingThreshold) return 0;
  return governorateFee;
}

// shared/model3d.ts
var MAX_PRODUCT_MODEL_BYTES = 12 * 1024 * 1024;
function isDirectModelUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed, "https://marj.local");
    return /\.(glb|gltf)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
function validateGlbUpload(fileName, bytes) {
  if (!/\.glb$/i.test(fileName)) return "\u0627\u0631\u0641\u0639 \u0645\u0644\u0641 GLB \u0641\u0642\u0637. \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0623\u0648 \u0635\u0648\u0631 3D \u0644\u0627 \u062A\u0639\u0645\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u0639\u0627\u0631\u0636.";
  if (bytes.byteLength > MAX_PRODUCT_MODEL_BYTES) return "\u062D\u062C\u0645 \u0645\u0644\u0641 GLB \u0623\u0643\u0628\u0631 \u0645\u0646 12MB. \u0642\u0644\u0651\u0644 \u062D\u062C\u0645 \u0627\u0644\u0646\u0645\u0648\u0630\u062C \u0648\u0627\u0644\u0640 textures \u062B\u0645 \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629.";
  if (bytes.byteLength < 20) return "\u0645\u0644\u0641 GLB \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644 \u0623\u0648 \u062A\u0627\u0644\u0641.";
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 1179937895) return "\u0627\u0644\u0645\u0644\u0641 \u0644\u064A\u0633 \u0646\u0645\u0648\u0630\u062C GLB \u0635\u0627\u0644\u062D\u064B\u0627.";
  if (view.getUint32(4, true) !== 2) return "\u0627\u0633\u062A\u062E\u062F\u0645 GLB \u0628\u0625\u0635\u062F\u0627\u0631 glTF 2.0.";
  if (view.getUint32(8, true) !== bytes.byteLength) return "\u0645\u0644\u0641 GLB \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644 \u0623\u0648 \u062A\u0627\u0644\u0641.";
  return null;
}

// shared/whatsappReceipt.ts
var EGYPTIAN_WHATSAPP_PATTERN = /^20(10|11|12|15)\d{8}$/;
function normalizeEgyptianWhatsAppNumber(value) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("00") ? digits.slice(2) : digits.startsWith("0") ? `20${digits.slice(1)}` : digits;
  return EGYPTIAN_WHATSAPP_PATTERN.test(normalized) ? normalized : null;
}
function buildManualPaymentWhatsAppMessage(input) {
  const itemLines = input.items.map((item) => `- ${item.productName} | \u0645\u0642\u0627\u0633 ${item.size} | \xD7${item.quantity}`).join("\n");
  return `\u0645\u0631\u062D\u0628\u064B\u0627 \u0645\u0631\u062C\u060C

\u0623\u0631\u0633\u0644\u062A \u062A\u062D\u0648\u064A\u0644 ${input.paymentLabel} \u0644\u0644\u0637\u0644\u0628 ${input.orderNumber}.
\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ${input.total.toLocaleString("ar-EG")} \u062C.\u0645
\u0627\u0644\u0627\u0633\u0645: ${input.customerName}
\u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u064A\u0644: ${input.customerPhone}

\u0627\u0644\u0642\u0637\u0639:
${itemLines}

\u0623\u0631\u0641\u0642\u062A Screenshot \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u0634\u0643\u0631\u064B\u0627.`;
}

// shared/teamAccess.ts
var teamRoles = ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"];
var capabilitiesByRole = {
  order_operator: ["dashboard", "orders"],
  catalog_editor: ["dashboard", "catalog"],
  analytics_viewer: ["dashboard", "analytics"],
  store_manager: ["dashboard", "orders", "catalog", "analytics"]
};
function isTeamRole(value) {
  return teamRoles.includes(value);
}
function canTeamRoleAccess(role, capability) {
  return capabilitiesByRole[role].includes(capability);
}
function isActiveTeamInvite(invite, now = /* @__PURE__ */ new Date()) {
  return !invite.acceptedAt && !invite.revokedAt && (invite.expiresAt === null || invite.expiresAt.getTime() > now.getTime());
}

// shared/growthRules.ts
function validateCouponForSubtotal(coupon, subtotal, now = /* @__PURE__ */ new Date()) {
  if (!coupon || !coupon.enabled) return { ok: false, message: "\u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D." };
  if (coupon.startsAt.getTime() > now.getTime() || coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) return { ok: false, message: "\u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0645\u0646\u062A\u0647\u064A \u0623\u0648 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0628\u0639\u062F." };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { ok: false, message: "\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0628\u0627\u0644\u0643\u0627\u0645\u0644." };
  if (subtotal < coupon.minimumSubtotal) return { ok: false, message: `\u064A\u062A\u0637\u0644\u0628 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u062F \u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0628\u0642\u064A\u0645\u0629 ${coupon.minimumSubtotal} \u062C\u0646\u064A\u0647 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.` };
  const raw = coupon.type === "percentage" ? Math.floor(subtotal * coupon.value / 100) : coupon.value;
  return { ok: true, discount: Math.min(subtotal, Math.max(0, raw)), code: coupon.code };
}
var LOYALTY_POINTS_PER_EGP = 10;
var LOYALTY_EGP_PER_POINT = 1;
function calculateDeliveryPoints(orderTotal) {
  return Math.max(0, Math.floor(orderTotal / LOYALTY_POINTS_PER_EGP));
}
function calculateLoyaltyDiscount(requestedPoints, availablePoints, subtotalAfterCoupon) {
  const points = Math.max(0, Math.min(Math.floor(requestedPoints), availablePoints, subtotalAfterCoupon * LOYALTY_EGP_PER_POINT));
  return { points, discount: Math.floor(points / LOYALTY_EGP_PER_POINT) };
}

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/_core/imageGeneration.ts
var DEFAULT_IMAGE_MODEL = "MODEL_GPT_IMAGE_2";
var DEFAULT_IMAGE_QUALITY = "medium";
async function generateImage(options) {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL(
    "images.v1.ImageService/GenerateImage",
    baseUrl
  ).toString();
  const model = options.model ?? DEFAULT_IMAGE_MODEL;
  const quality = options.quality ?? (model === DEFAULT_IMAGE_MODEL ? DEFAULT_IMAGE_QUALITY : void 0);
  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify({
      prompt: options.prompt,
      original_images: options.originalImages || [],
      model,
      ...quality ? { quality } : {}
    })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }
  const result = await response.json();
  const base64Data = result.image.b64Json;
  const buffer = Buffer.from(base64Data, "base64");
  const { url } = await storagePut(
    `generated/${Date.now()}.png`,
    buffer,
    result.image.mimeType
  );
  return {
    url
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/photo.ts
var PHOTO_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,([a-zA-Z0-9+/=]+)$/;
function parsePhotoDataUrl(value) {
  const match = value.match(PHOTO_DATA_URL_PATTERN);
  if (!match) throw new Error("\u0635\u064A\u063A\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629");
  return { mimeType: `image/${match[1] === "jpg" ? "jpeg" : match[1]}`, encoded: match[2] };
}

// server/tryOnErrors.ts
var TRY_ON_ERROR_MESSAGE = "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0622\u0646";

// server/routers.ts
var dataUrlSchema = z2.string().regex(/^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/, "\u0635\u064A\u063A\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629").refine((value) => value.length <= 85e5, "\u062D\u062C\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D");
var customerEmailSchema = z2.string().trim().email().max(320).refine(isValidCustomerEmail, "\u0627\u0643\u062A\u0628 \u0628\u0631\u064A\u062F\u064B\u0627 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627.");
var createOrderInputSchema = z2.object({
  customerName: z2.string().trim().min(2).max(160),
  email: customerEmailSchema,
  phone: z2.string().trim().min(8).max(40),
  address: z2.string().trim().min(8).max(1e3),
  city: z2.string().trim().min(2).max(80),
  notes: z2.string().trim().max(1e3).optional(),
  consent: z2.literal(true),
  paymentMethod: z2.string().trim().min(1).max(40),
  couponCode: z2.string().trim().min(2).max(80).optional(),
  loyaltyPoints: z2.number().int().min(0).max(1e5).default(0),
  items: z2.array(z2.object({ productId: z2.string().min(1), size: z2.enum(["S", "M", "L", "XL"]), quantity: z2.number().int().min(1).max(5) })).min(1).max(30)
});
var orderLookupInputSchema = z2.object({
  orderNumber: z2.string().trim().min(6).max(32),
  email: customerEmailSchema
});
var productStatusSchema = z2.enum(["draft", "active", "archived"]);
var stockStatusSchema = z2.enum(["instock", "outofstock", "onbackorder"]);
var isDirectProductImageUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed, "https://marj.local");
    return /\.(avif|jpe?g|png|webp)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};
var productImageUrlSchema = z2.string().trim().max(2e3).refine(isDirectProductImageUrl, "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0631\u0627\u0628\u0637 \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u064B\u0627 \u0645\u062B\u0644 JPG \u0623\u0648 PNG \u0623\u0648 WEBP\u060C \u0648\u0644\u064A\u0633\u062A \u0635\u0641\u062D\u0629 \u0645\u062A\u062C\u0631 \u0623\u0648 \u0631\u0627\u0628\u0637 3D.");
var mediaTypeSchema = z2.enum(["front", "back", "gallery", "model3d"]);
var productAdminInputSchema = z2.object({
  slug: z2.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "\u0627\u0633\u062A\u062E\u062F\u0645 slug \u0625\u0646\u062C\u0644\u064A\u0632\u064A\u064B\u0627 \u0628\u0634\u0631\u0637\u0627\u062A \u0641\u0642\u0637"),
  name: z2.string().trim().min(2).max(160),
  nameArabic: z2.string().trim().min(2).max(160),
  description: z2.string().trim().min(2).max(5e3),
  shortDescription: z2.string().trim().max(500).nullable().optional(),
  price: z2.number().int().positive().max(1e7),
  salePrice: z2.number().int().positive().max(1e7).nullable().optional(),
  compareAtPrice: z2.number().int().positive().max(1e7).nullable().optional(),
  sku: z2.string().trim().max(80).nullable().optional(),
  imageUrl: productImageUrlSchema,
  category: z2.string().trim().min(2).max(80).default("\u0647\u0648\u062F\u064A\u0632"),
  categoryId: z2.number().int().positive().nullable().optional(),
  featured: z2.boolean().default(false),
  manageStock: z2.boolean().default(true),
  stockStatus: stockStatusSchema.default("instock"),
  status: productStatusSchema.default("draft")
}).superRefine((value, ctx) => {
  if (value.salePrice !== null && value.salePrice !== void 0 && value.salePrice >= value.price) {
    ctx.addIssue({ code: "custom", path: ["salePrice"], message: "\u0633\u0639\u0631 \u0627\u0644\u062A\u062E\u0641\u064A\u0636 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A" });
  }
  if (value.compareAtPrice !== null && value.compareAtPrice !== void 0 && value.compareAtPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "\u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0627\u0644\u062E\u0635\u0645 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A" });
  }
});
var productAdminUpdateSchema = productAdminInputSchema.partial();
var variantAdminInputSchema = z2.object({
  productId: z2.number().int().positive(),
  sku: z2.string().trim().min(1).max(80),
  size: z2.enum(["S", "M", "L", "XL"]),
  color: z2.string().trim().min(1).max(80).default("\u0623\u0633\u0627\u0633\u064A"),
  stock: z2.number().int().min(0).max(1e6).default(0),
  safetyStock: z2.number().int().min(0).max(1e6).default(3),
  priceOverride: z2.number().int().positive().max(1e7).nullable().optional(),
  stockStatus: stockStatusSchema.default("instock"),
  status: z2.enum(["active", "inactive"]).default("active")
});
var variantAdminUpdateSchema = variantAdminInputSchema.partial().extend({ id: z2.number().int().positive() });
var publicAssetUrlSchema = z2.string().trim().max(2e3).refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"), "\u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0645\u0644\u0641 \u0639\u0627\u0645\u064B\u0627 \u0623\u0648 \u0645\u0633\u0627\u0631\u064B\u0627 \u0645\u062D\u0644\u064A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627");
var mediaAdminInputSchema = z2.object({
  productId: z2.number().int().positive(),
  url: publicAssetUrlSchema,
  mediaType: mediaTypeSchema.default("gallery"),
  altText: z2.string().trim().max(180).nullable().optional(),
  sortOrder: z2.number().int().min(0).max(999).default(0)
}).superRefine((value, ctx) => {
  if (value.mediaType === "model3d" && !isDirectModelUrl(value.url)) {
    ctx.addIssue({ code: "custom", path: ["url"], message: "\u0645\u0644\u0641 3D \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u0635\u064A\u063A\u0629 GLB \u0623\u0648 GLTF." });
  }
  if (value.mediaType !== "model3d" && !isDirectProductImageUrl(value.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "\u0627\u0644\u0648\u0633\u064A\u0637 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0627\u0628\u0637 \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u064B\u0627." });
});
var model3dUploadInputSchema = z2.object({
  productId: z2.number().int().positive(),
  fileName: z2.string().trim().min(5).max(180).regex(/\.glb$/i, "\u0627\u0631\u0641\u0639 \u0645\u0644\u0641 GLB \u0641\u0642\u0637."),
  base64: z2.string().min(8).max(Math.ceil(MAX_PRODUCT_MODEL_BYTES * 4 / 3) + 16),
  altText: z2.string().trim().max(180).nullable().optional()
});
var categoryAdminInputSchema = z2.object({
  slug: z2.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z2.string().trim().min(2).max(120),
  description: z2.string().trim().max(500).nullable().optional(),
  status: z2.enum(["active", "draft"]).default("active")
});
var storeSettingsInputSchema = z2.object({
  brandName: z2.string().trim().min(2).max(120),
  shippingScope: z2.string().trim().min(8).max(240),
  shippingFee: z2.number().int().min(0).max(1e6),
  freeShippingThreshold: z2.number().int().positive().max(1e7).nullable(),
  shippingNotice: z2.string().trim().min(8).max(5e3),
  returnPolicy: z2.string().trim().min(8).max(5e3),
  paymentNotice: z2.string().trim().min(8).max(5e3)
});
var shippingZoneUpdateSchema = z2.object({ id: z2.number().int().positive(), fee: z2.number().int().min(0).max(1e6), enabled: z2.boolean(), deliveryNote: z2.string().trim().max(240).nullable() });
var paymentMethodUpdateSchema = z2.object({ id: z2.number().int().positive(), label: z2.string().trim().min(2).max(120), enabled: z2.boolean(), instructions: z2.string().trim().max(5e3).nullable(), whatsappNumber: z2.string().trim().max(30).nullable().optional() });
var positiveIdSchema = z2.object({ id: z2.number().int().positive() });
var canManageCatalog = (role) => role === "admin";
var ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canManageCatalog(ctx.user.role)) throw new TRPCError3({ code: "FORBIDDEN", message: "\u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0645\u062F\u064A\u0631 \u0641\u0642\u0637" });
  return next({ ctx });
});
var adminProcedure2 = ownerProcedure;
async function resolveTeamAccess(user) {
  if (user.role === "admin") return { role: "owner" };
  const member = await getStoreTeamMemberForUser(user.id);
  if (!member || !isTeamRole(member.role)) return null;
  return { role: member.role };
}
var teamProcedure = (capability) => protectedProcedure.use(async ({ ctx, next }) => {
  const access = await resolveTeamAccess(ctx.user);
  const allowed = access?.role === "owner" || access && isTeamRole(access.role) && canTeamRoleAccess(access.role, capability);
  if (!allowed) throw new TRPCError3({ code: "FORBIDDEN", message: "\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0636\u0645\u0646 \u0635\u0644\u0627\u062D\u064A\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629." });
  return next({ ctx: { ...ctx, teamAccess: access } });
});
var dashboardProcedure = teamProcedure("dashboard");
var ordersProcedure = teamProcedure("orders");
var catalogProcedure = teamProcedure("catalog");
var analyticsProcedure = teamProcedure("analytics");
var teamRoleSchema = z2.enum(["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]);
var inviteTokenSchema = z2.string().trim().min(32).max(160);
var inviteExpirySchema = z2.union([z2.literal(24), z2.literal(72), z2.literal(168), z2.literal(720), z2.literal("unlimited")]).default(168);
var hashInviteToken = (token) => createHash("sha256").update(token).digest("hex");
var couponInputSchema = z2.object({ code: z2.string().trim().min(3).max(80).regex(/^[A-Za-z0-9_-]+$/), type: z2.enum(["percentage", "fixed"]), value: z2.number().int().positive().max(1e6), minimumSubtotal: z2.number().int().min(0).max(1e7).default(0), usageLimit: z2.number().int().positive().max(1e6).nullable(), startsAt: z2.coerce.date(), expiresAt: z2.coerce.date().nullable(), enabled: z2.boolean() }).superRefine((input, ctx) => {
  if (input.type === "percentage" && input.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645 \u0644\u0627 \u062A\u062A\u062C\u0627\u0648\u0632 100%." });
  if (input.expiresAt && input.expiresAt <= input.startsAt) ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0623\u062A\u064A \u0628\u0639\u062F \u0627\u0644\u0628\u062F\u0627\u064A\u0629." });
});
var fulfillmentInputSchema = z2.object({ id: z2.number().int().positive(), shipmentCarrier: z2.string().trim().max(120).nullable(), trackingNumber: z2.string().trim().max(160).nullable(), trackingUrl: z2.string().trim().max(2e3).url().nullable() });
var inventoryAdjustmentInputSchema = z2.object({ variantId: z2.number().int().positive(), delta: z2.number().int().min(-1e5).max(1e5).refine((value) => value !== 0), reason: z2.string().trim().min(3).max(240) });
var reviewInputSchema = z2.object({ orderNumber: z2.string().trim().min(6).max(32), email: customerEmailSchema, productId: z2.number().int().positive(), rating: z2.number().int().min(1).max(5), body: z2.string().trim().min(12).max(2e3) });
function normalizePublishedCatalogLine(item, publishedProducts) {
  const catalogProduct = publishedProducts.find((product2) => product2.id === item.productId);
  const staticValidation = validateCommerceLine(item);
  const product = catalogProduct ?? (staticValidation.ok ? staticValidation.product : null);
  if (!product) throw new TRPCError3({ code: "BAD_REQUEST", message: staticValidation.ok ? "\u0623\u062D\u062F \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0645 \u064A\u0639\u062F \u0645\u062A\u0627\u062D\u064B\u0627." : staticValidation.message });
  if (!product.sizes.includes(item.size)) throw new TRPCError3({ code: "BAD_REQUEST", message: `\u0627\u0644\u0645\u0642\u0627\u0633 ${item.size} \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C.` });
  const variant = "variants" in product ? product.variants.find((candidate) => candidate.size === item.size && candidate.status === "active") : void 0;
  if (catalogProduct && catalogProduct.stockStatus === "outofstock") throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0646\u0641\u062F\u062A \u0643\u0645\u064A\u062A\u0647 \u062D\u0627\u0644\u064A\u064B\u0627." });
  if (variant && variant.stockStatus === "outofstock") throw new TRPCError3({ code: "BAD_REQUEST", message: `\u0627\u0644\u0645\u0642\u0627\u0633 ${item.size} \u0646\u0641\u062F \u062D\u0627\u0644\u064A\u064B\u0627.` });
  if (variant && catalogProduct?.manageStock && item.quantity > variant.stock) throw new TRPCError3({ code: "BAD_REQUEST", message: `\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0645\u0646 \u0645\u0642\u0627\u0633 ${item.size} \u0647\u064A ${variant.stock} \u0641\u0642\u0637.` });
  const unitPrice = variant?.priceOverride ?? product.price;
  return { ...item, product, unitPrice, lineTotal: unitPrice * item.quantity };
}
async function resolveTryOnProduct(productId) {
  const staticProduct = getHoodieById(productId) ?? hoodieProducts.find((item) => item.slug === productId);
  if (staticProduct) return staticProduct;
  if (!productId.includes("-")) return null;
  return getPublishedCatalogProductBySlug(productId);
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  products: router({
    list: publicProcedure.query(async () => {
      const products = await listPublishedCatalogProducts();
      return products.length ? products : hoodieProducts;
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string().min(2).max(120) })).query(async ({ input }) => {
      return await getPublishedCatalogProductBySlug(input.slug) ?? getHoodieById(input.slug) ?? hoodieProducts.find((product) => product.slug === input.slug) ?? null;
    })
  }),
  store: router({
    settings: publicProcedure.query(() => getStoreSettings()),
    shippingZones: publicProcedure.query(() => listEnabledShippingZones()),
    paymentMethods: publicProcedure.query(async () => (await listEnabledPaymentMethods()).map(({ whatsappNumber: _whatsappNumber, ...method }) => method))
  }),
  admin: router({
    dashboard: dashboardProcedure.query(async () => {
      const [products, orders2, categories] = await Promise.all([getAdminCatalog(), listOrders(), listProductCategories()]);
      const operations = buildAdminOperationsSummary(products, orders2);
      return {
        productsCount: products.length,
        publishedCount: products.filter((product) => product.status === "active").length,
        draftCount: products.filter((product) => product.status === "draft").length,
        lowStockCount: operations.stockAlerts.length,
        ordersCount: orders2.length,
        categoriesCount: categories.length,
        operations
      };
    }),
    access: protectedProcedure.query(async ({ ctx }) => resolveTeamAccess(ctx.user)),
    products: router({
      list: catalogProcedure.query(() => getAdminCatalog()),
      get: catalogProcedure.input(positiveIdSchema).query(({ input }) => getAdminProduct(input.id)),
      create: catalogProcedure.input(productAdminInputSchema).mutation(({ input }) => createCatalogProduct(input)),
      update: catalogProcedure.input(productAdminUpdateSchema.extend({ id: z2.number().int().positive() })).mutation(({ input }) => {
        const { id, ...values } = input;
        return updateCatalogProduct(id, values);
      }),
      setStatus: catalogProcedure.input(z2.object({ id: z2.number().int().positive(), status: productStatusSchema })).mutation(({ input }) => updateCatalogProductStatus(input.id, input.status)),
      variants: router({
        list: catalogProcedure.input(z2.object({ productId: z2.number().int().positive() })).query(({ input }) => listProductVariants(input.productId)),
        create: catalogProcedure.input(variantAdminInputSchema).mutation(async ({ input }) => {
          if (!await getAdminProduct(input.productId)) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
          return createProductVariant(input);
        }),
        update: catalogProcedure.input(variantAdminUpdateSchema).mutation(({ input }) => {
          const { id, productId: _productId, ...values } = input;
          return updateProductVariant(id, values);
        }),
        remove: catalogProcedure.input(positiveIdSchema).mutation(({ input }) => deleteProductVariant(input.id))
      }),
      media: router({
        add: catalogProcedure.input(mediaAdminInputSchema).mutation(async ({ input }) => {
          if (!await getAdminProduct(input.productId)) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
          return createProductMedia(input);
        }),
        uploadModel: catalogProcedure.input(model3dUploadInputSchema).mutation(async ({ input }) => {
          if (!await getAdminProduct(input.productId)) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
          const bytes = Buffer.from(input.base64, "base64");
          const validationError = validateGlbUpload(input.fileName, bytes);
          if (validationError) throw new TRPCError3({ code: "BAD_REQUEST", message: validationError });
          const safeFileName = input.fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
          const stored = await storagePut(`products/${input.productId}/models/${safeFileName}`, bytes, "model/gltf-binary");
          return createProductMedia({ productId: input.productId, url: stored.url, mediaType: "model3d", altText: input.altText || null, sortOrder: 0 });
        }),
        remove: catalogProcedure.input(positiveIdSchema).mutation(({ input }) => deleteProductMedia(input.id))
      })
    }),
    categories: router({
      list: catalogProcedure.query(() => listProductCategories()),
      create: catalogProcedure.input(categoryAdminInputSchema).mutation(({ input }) => createProductCategory(input))
    }),
    settings: router({
      get: adminProcedure2.query(() => getStoreSettings()),
      update: adminProcedure2.input(storeSettingsInputSchema).mutation(({ input }) => updateStoreSettings(input))
    }),
    shipping: router({
      list: adminProcedure2.query(() => listShippingZones()),
      update: adminProcedure2.input(shippingZoneUpdateSchema).mutation(({ input }) => updateShippingZone(input.id, input))
    }),
    payments: router({
      list: adminProcedure2.query(() => listPaymentMethods()),
      update: adminProcedure2.input(paymentMethodUpdateSchema).mutation(async ({ input }) => {
        const method = (await listPaymentMethods()).find((candidate) => candidate.id === input.id);
        if (!method) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." });
        const activationError = getPaymentActivationError(method.type, input.enabled, input.instructions);
        if (activationError) throw new TRPCError3({ code: "BAD_REQUEST", message: activationError });
        const whatsappNumber = input.whatsappNumber === void 0 ? void 0 : normalizeEgyptianWhatsAppNumber(input.whatsappNumber);
        if (input.whatsappNumber?.trim() && !whatsappNumber) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0627\u0643\u062A\u0628 \u0631\u0642\u0645 WhatsApp \u0645\u0635\u0631\u064A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627\u060C \u0645\u062B\u0644 01012345678 \u0623\u0648 +201012345678." });
        return updatePaymentMethod(input.id, { ...input, ...input.whatsappNumber === void 0 ? {} : { whatsappNumber } });
      })
    }),
    analytics: router({
      get: analyticsProcedure.query(async () => {
        const data = await getAdminAnalytics();
        const [base, events] = await Promise.all([Promise.resolve(buildAdminAnalytics(data.orders, data.items, data.catalog)), getCommerceEventCounts()]);
        return { ...base, commerceEvents: events };
      })
    }),
    orders: router({
      list: ordersProcedure.query(() => listOrders()),
      setStatus: ordersProcedure.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]) })).mutation(async ({ input }) => {
        const updated = await updateOrderStatus(input.id, input.status);
        if (input.status === "delivered") {
          const order = await getOrderById(input.id);
          if (order) await awardDeliveredOrderLoyalty(input.id, calculateDeliveryPoints(order.total));
        }
        return updated;
      }),
      fulfillment: ordersProcedure.input(fulfillmentInputSchema).mutation(({ input }) => updateOrderFulfillment(input.id, input))
    }),
    coupons: router({
      list: adminProcedure2.query(() => listCoupons()),
      create: adminProcedure2.input(couponInputSchema).mutation(({ input }) => createCoupon(input)),
      update: adminProcedure2.input(couponInputSchema.partial().extend({ id: z2.number().int().positive() })).mutation(({ input }) => {
        const { id, ...values } = input;
        return updateCoupon(id, values);
      })
    }),
    reviews: router({
      list: adminProcedure2.query(() => listReviewsForAdmin()),
      setStatus: adminProcedure2.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["pending", "approved", "rejected"]) })).mutation(({ input }) => updateReviewStatus(input.id, input.status))
    }),
    inventory: router({
      adjustments: catalogProcedure.input(z2.object({ variantId: z2.number().int().positive().optional() }).optional()).query(({ input }) => listInventoryAdjustments(input?.variantId)),
      adjust: catalogProcedure.input(inventoryAdjustmentInputSchema).mutation(({ ctx, input }) => adjustVariantStock({ ...input, createdByUserId: ctx.user.id }))
    }),
    lookbook: router({
      list: adminProcedure2.query(() => listLookbookEntries()),
      create: adminProcedure2.input(z2.object({ title: z2.string().trim().min(2).max(160), titleArabic: z2.string().trim().min(2).max(160), description: z2.string().trim().max(2e3).nullable(), imageUrl: productImageUrlSchema, productId: z2.number().int().positive().nullable(), sortOrder: z2.number().int().min(0).max(999).default(0), published: z2.boolean().default(false) })).mutation(({ input }) => createLookbookEntry(input)),
      update: adminProcedure2.input(z2.object({ id: z2.number().int().positive(), title: z2.string().trim().min(2).max(160).optional(), titleArabic: z2.string().trim().min(2).max(160).optional(), description: z2.string().trim().max(2e3).nullable().optional(), imageUrl: productImageUrlSchema.optional(), productId: z2.number().int().positive().nullable().optional(), sortOrder: z2.number().int().min(0).max(999).optional(), published: z2.boolean().optional() })).mutation(({ input }) => {
        const { id, ...values } = input;
        return updateLookbookEntry(id, values);
      })
    }),
    team: router({
      list: adminProcedure2.query(async () => {
        const [members, invites] = await Promise.all([listStoreTeamMembers(), listStoreTeamInvites()]);
        return { members, invites: invites.map(({ tokenHash: _tokenHash, ...invite }) => invite) };
      }),
      createInvite: adminProcedure2.input(z2.object({ role: teamRoleSchema, expiresInHours: inviteExpirySchema })).mutation(async ({ ctx, input }) => {
        const inviteToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
        const expiresAt = input.expiresInHours === "unlimited" ? null : new Date(Date.now() + input.expiresInHours * 60 * 60 * 1e3);
        const invite = await createStoreTeamInvite({ tokenHash: hashInviteToken(inviteToken), role: input.role, createdByUserId: ctx.user.id, expiresAt });
        if (!invite) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062F\u0639\u0648\u0629 \u0627\u0644\u0622\u0646." });
        return { id: invite.id, role: invite.role, expiresAt: invite.expiresAt, inviteToken };
      }),
      revokeInvite: adminProcedure2.input(positiveIdSchema).mutation(({ input }) => revokeStoreTeamInvite(input.id)),
      updateMemberRole: adminProcedure2.input(z2.object({ id: z2.number().int().positive(), role: teamRoleSchema })).mutation(({ input }) => updateStoreTeamMemberRole(input.id, input.role)),
      revokeMember: adminProcedure2.input(positiveIdSchema).mutation(({ input }) => revokeStoreTeamMember(input.id))
    })
  }),
  team: router({
    acceptInvite: protectedProcedure.input(z2.object({ token: inviteTokenSchema })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "admin") throw new TRPCError3({ code: "BAD_REQUEST", message: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u064A\u0631 \u0644\u062F\u064A\u0647 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0628\u0627\u0644\u0641\u0639\u0644." });
      if (await getStoreTeamMemberForUser(ctx.user.id)) throw new TRPCError3({ code: "CONFLICT", message: "\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0639\u0636\u0648 \u0641\u0631\u064A\u0642 \u0628\u0627\u0644\u0641\u0639\u0644. \u0627\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0645\u062F\u064A\u0631 \u062A\u0639\u062F\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u062A\u0643 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u0641\u0631\u064A\u0642." });
      const invite = await getStoreTeamInviteByHash(hashInviteToken(input.token));
      if (!invite || !isActiveTeamInvite(invite) || !isTeamRole(invite.role)) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0631\u0627\u0628\u0637 \u0627\u0644\u062F\u0639\u0648\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647." });
      await acceptStoreTeamInvite(invite.id, ctx.user.id, invite.role, invite.createdByUserId);
      return { role: invite.role };
    })
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => {
      if (!ctx.user.email) return [];
      return listOrdersForCustomerEmail(ctx.user.email);
    }),
    create: publicProcedure.input(createOrderInputSchema).mutation(async ({ input, ctx }) => {
      const [publishedProducts, settings, shippingZone, paymentMethod] = await Promise.all([listPublishedCatalogProducts(), getStoreSettings(), getShippingZoneForGovernorate(input.city), getPaymentMethodByCode(input.paymentMethod)]);
      if (!shippingZone || !shippingZone.enabled) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0634\u062D\u0646 \u062D\u0627\u0644\u064A\u064B\u0627. \u0627\u062E\u062A\u0631 \u0645\u062D\u0627\u0641\u0638\u0629 \u0645\u0641\u0639\u0644\u0629." });
      if (!paymentMethod || !paymentMethod.enabled) throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0641\u0639\u0644\u0629 \u062D\u0627\u0644\u064A\u064B\u0627." });
      const normalizedItems = input.items.map((item) => normalizePublishedCatalogLine(item, publishedProducts));
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const coupon = input.couponCode ? await getCouponByCode(input.couponCode) : null;
      const couponResult = input.couponCode ? validateCouponForSubtotal(coupon, subtotal) : null;
      if (couponResult && !couponResult.ok) throw new TRPCError3({ code: "BAD_REQUEST", message: couponResult.message });
      const couponDiscount = couponResult?.ok ? couponResult.discount : 0;
      const loyalty = ctx.user ? await getLoyaltyAccount(ctx.user.id) : { points: 0 };
      const loyaltyUse = calculateLoyaltyDiscount(input.loyaltyPoints, loyalty.points, subtotal - couponDiscount);
      const discountedSubtotal = subtotal - couponDiscount - loyaltyUse.discount;
      const shipping = calculateShippingForGovernorate(discountedSubtotal, shippingZone.fee, settings?.freeShippingThreshold);
      const total = discountedSubtotal + shipping;
      const orderNumber = `HF-${(/* @__PURE__ */ new Date()).getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const result = await createOrder({ orderNumber, userId: ctx.user?.id ?? null, status: "pending", customerName: input.customerName, email: input.email, phone: input.phone, address: input.address, city: input.city, paymentMethod: paymentMethod.code, couponCode: couponResult?.ok ? couponResult.code : null, couponDiscount, notes: input.notes || null, subtotal, shipping, total }, normalizedItems.map((item) => ({ orderId: 0, productId: item.product.id, productName: item.product.nameArabic, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })));
      if (couponResult?.ok && coupon) await consumeCoupon(coupon.id);
      if (ctx.user && loyaltyUse.points > 0) await addLoyaltyLedgerEntry({ userId: ctx.user.id, orderId: result.id, points: -loyaltyUse.points, type: "redeemed_checkout", note: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0646\u0642\u0627\u0637 \u0641\u064A \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628" });
      await recordCommerceEvent({ sessionKey: ctx.req.headers["x-marj-session"]?.toString() || crypto.randomUUID(), userId: ctx.user?.id ?? null, eventName: "purchase_completed", orderId: result.id });
      const whatsappNumber = paymentMethod.type === "manual_transfer" ? normalizeEgyptianWhatsAppNumber(paymentMethod.whatsappNumber) : null;
      const whatsappHandoff = whatsappNumber ? { number: whatsappNumber, message: buildManualPaymentWhatsAppMessage({ orderNumber, total, paymentLabel: paymentMethod.label, customerName: input.customerName, customerPhone: input.phone, items: normalizedItems.map((item) => ({ productName: item.product.nameArabic, size: item.size, quantity: item.quantity })) }) } : null;
      return { ...result, subtotal, couponDiscount, loyaltyDiscount: loyaltyUse.discount, loyaltyPointsUsed: loyaltyUse.points, shipping, total, paymentMethod: paymentMethod.code, paymentInstructions: paymentMethod.instructions, whatsappHandoff };
    }),
    lookup: publicProcedure.input(orderLookupInputSchema).query(async ({ input }) => {
      const result = await getOrderForCustomer(input.orderNumber.toUpperCase(), input.email);
      if (!result) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0644\u0645 \u0646\u062C\u062F \u0637\u0644\u0628\u064B\u0627 \u0628\u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A. \u0631\u0627\u062C\u0639 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u0628\u0631\u064A\u062F." });
      return result;
    }),
    catalogAdminList: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return listCatalogProducts();
    }),
    catalogCreate: protectedProcedure.input(z2.object({ slug: z2.string().min(2).max(120), name: z2.string().min(2).max(160), nameArabic: z2.string().min(2).max(160), description: z2.string().min(2), price: z2.number().int().positive(), imageUrl: z2.string().url(), status: z2.enum(["draft", "active", "archived"]).default("draft") })).mutation(({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return createCatalogProduct(input);
    }),
    catalogSetStatus: protectedProcedure.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["draft", "active", "archived"]) })).mutation(({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return updateCatalogProductStatus(input.id, input.status);
    }),
    adminList: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      return listOrders();
    })
  }),
  growth: router({
    couponPreview: publicProcedure.input(z2.object({ code: z2.string().trim().min(2).max(80), subtotal: z2.number().int().min(0) })).query(async ({ input }) => validateCouponForSubtotal(await getCouponByCode(input.code), input.subtotal)),
    reviews: publicProcedure.input(z2.object({ productId: z2.number().int().positive() })).query(({ input }) => listApprovedReviews(input.productId)),
    submitReview: publicProcedure.input(reviewInputSchema).mutation(async ({ input }) => {
      const order = await getOrderForCustomer(input.orderNumber.toUpperCase(), input.email);
      if (!order || order.order.status !== "delivered") throw new TRPCError3({ code: "FORBIDDEN", message: "\u064A\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u064A\u064A\u0645 \u0628\u0639\u062F \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0644\u0628 \u0641\u0642\u0637." });
      const item = order.items.find((candidate) => Number(candidate.productId) === input.productId);
      if (!item) throw new TRPCError3({ code: "FORBIDDEN", message: "\u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629 \u0644\u064A\u0633\u062A \u0636\u0645\u0646 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u062D\u062F\u062F." });
      return createVerifiedReview({ orderId: order.order.id, productId: input.productId, customerName: order.order.customerName, rating: input.rating, body: input.body });
    }),
    wishlist: router({
      list: protectedProcedure.query(({ ctx }) => listWishlistProductIds(ctx.user.id)),
      toggle: protectedProcedure.input(z2.object({ productId: z2.number().int().positive() })).mutation(({ ctx, input }) => toggleWishlistProduct(ctx.user.id, input.productId))
    }),
    loyalty: protectedProcedure.query(({ ctx }) => getLoyaltyAccount(ctx.user.id)),
    lookbook: publicProcedure.query(() => listLookbookEntries(true)),
    event: publicProcedure.input(z2.object({ sessionKey: z2.string().trim().min(12).max(128), eventName: z2.enum(["product_view", "add_to_cart", "checkout_started"]), productId: z2.number().int().positive().nullable().optional() })).mutation(({ ctx, input }) => recordCommerceEvent({ ...input, userId: ctx.user?.id ?? null, productId: input.productId ?? null }))
  }),
  tryOn: router({
    generate: publicProcedure.input(
      z2.object({
        productId: z2.string().min(1),
        photoDataUrl: dataUrlSchema,
        consent: z2.literal(true)
      })
    ).mutation(async ({ input }) => {
      const product = await resolveTryOnProduct(input.productId);
      if (!product) throw new Error("\u0627\u0644\u0647\u0648\u062F\u064A \u0627\u0644\u0645\u062E\u062A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      const { mimeType, encoded } = parsePhotoDataUrl(input.photoDataUrl);
      const prompt = [
        "Create a realistic e-commerce virtual try-on preview.",
        "Keep the person's identity, face, body proportions, pose, lighting, and background unchanged.",
        `Replace only the upper garment with the selected hoodie: ${product.name}, ${product.color}, ${product.description}.`,
        "The hoodie must fit naturally, preserve realistic folds, hood shape, cuffs, and fabric texture.",
        "Do not add text, logos, extra people, accessories, or alter the person's face."
      ].join(" ");
      try {
        const { url } = await generateImage({
          prompt,
          originalImages: [{ b64Json: encoded, mimeType }]
        });
        if (!url) throw new Error("Image service returned no preview URL");
        return { url, productId: product.id, productName: product.nameArabic };
      } catch (error) {
        console.error("[TryOn] image generation failed", error);
        throw new TRPCError3({ code: "BAD_GATEWAY", message: TRY_ON_ERROR_MESSAGE });
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const candidates = [
    path2.resolve(import.meta.dirname, "public"),
    path2.resolve(import.meta.dirname, "../dist/public"),
    path2.resolve(import.meta.dirname, "../../dist/public"),
    path2.resolve(process.cwd(), "dist", "public"),
    path2.resolve(process.cwd(), "public")
  ];
  const distPath = candidates.find((candidate) => fs2.existsSync(path2.resolve(candidate, "index.html"))) || path2.resolve(process.cwd(), "dist", "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = process.env.PORT;
  let port = 3e3;
  if (preferredPort && isNaN(Number(preferredPort))) {
    port = preferredPort;
  } else {
    const numericPort = parseInt(preferredPort || "3000", 10);
    port = await findAvailablePort(numericPort);
    if (port !== numericPort) {
      console.log(`Port ${numericPort} is busy, using port ${port} instead`);
    }
  }
  server.listen(port, () => {
    console.log(`Server running on ${typeof port === "number" ? `http://localhost:${port}/` : port}`);
  });
}
startServer().catch(console.error);
