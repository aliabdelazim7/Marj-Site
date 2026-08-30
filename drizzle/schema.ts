import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const storeTeamMembers = mysqlTable("storeTeamMembers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  role: mysqlEnum("role", ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storeTeamInvites = mysqlTable("storeTeamInvites", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  role: mysqlEnum("role", ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  expiresAt: timestamp("expiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  acceptedByUserId: int("acceptedByUserId"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: varchar("productId", { length: 80 }).notNull(),
  productName: varchar("productName", { length: 160 }).notNull(),
  size: varchar("size", { length: 8 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  lineTotal: int("lineTotal").notNull(),
});

export const coupons = mysqlTable("coupons", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productReviews = mysqlTable("productReviews", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  rating: int("rating").notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("productReviews_order_product_unique").on(table.orderId, table.productId)]);

export const accountWishlists = mysqlTable("accountWishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("accountWishlists_user_product_unique").on(table.userId, table.productId)]);

export const loyaltyAccounts = mysqlTable("loyaltyAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  points: int("points").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loyaltyLedger = mysqlTable("loyaltyLedger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["earned_delivery", "redeemed_checkout", "manual_adjustment"]).notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inventoryAdjustments = mysqlTable("inventoryAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  variantId: int("variantId").notNull(),
  delta: int("delta").notNull(),
  resultingStock: int("resultingStock").notNull(),
  reason: varchar("reason", { length: 240 }).notNull(),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const lookbookEntries = mysqlTable("lookbookEntries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  titleArabic: varchar("titleArabic", { length: 160 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  productId: int("productId"),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commerceEvents = mysqlTable("commerceEvents", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 128 }).notNull(),
  userId: int("userId"),
  eventName: mysqlEnum("eventName", ["product_view", "add_to_cart", "checkout_started", "purchase_completed"]).notNull(),
  productId: int("productId"),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type StoreTeamMember = typeof storeTeamMembers.$inferSelect;
export type StoreTeamInvite = typeof storeTeamInvites.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type ProductReview = typeof productReviews.$inferSelect;
export type AccountWishlist = typeof accountWishlists.$inferSelect;
export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type LoyaltyLedgerEntry = typeof loyaltyLedger.$inferSelect;
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type LookbookEntry = typeof lookbookEntries.$inferSelect;

export const catalogProducts = mysqlTable("catalogProducts", {
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
  category: varchar("category", { length: 80 }).default("هوديز").notNull(),
  categoryId: int("categoryId"),
  featured: boolean("featured").default(false).notNull(),
  manageStock: boolean("manageStock").default(true).notNull(),
  stockStatus: mysqlEnum("stockStatus", ["instock", "outofstock", "onbackorder"]).default("instock").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productVariants = mysqlTable("productVariants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  size: varchar("size", { length: 8 }).notNull(),
  color: varchar("color", { length: 80 }).default("أساسي").notNull(),
  stock: int("stock").default(0).notNull(),
  safetyStock: int("safetyStock").default(3).notNull(),
  priceOverride: int("priceOverride"),
  stockStatus: mysqlEnum("stockStatus", ["instock", "outofstock", "onbackorder"]).default("instock").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productCategories = mysqlTable("productCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "draft"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storeSettings = mysqlTable("storeSettings", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 120 }).default("مرج").notNull(),
  shippingScope: varchar("shippingScope", { length: 240 }).default("الشحن متاح لجميع محافظات مصر").notNull(),
  shippingFee: int("shippingFee").default(0).notNull(),
  freeShippingThreshold: int("freeShippingThreshold"),
  shippingNotice: text("shippingNotice").notNull(),
  returnPolicy: text("returnPolicy").notNull(),
  paymentNotice: text("paymentNotice").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const shippingZones = mysqlTable("shippingZones", {
  id: int("id").autoincrement().primaryKey(),
  governorate: varchar("governorate", { length: 80 }).notNull().unique(),
  fee: int("fee").default(0).notNull(),
  deliveryNote: varchar("deliveryNote", { length: 240 }),
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  type: mysqlEnum("type", ["cod", "manual_transfer", "online_card"]).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  instructions: text("instructions"),
  whatsappNumber: varchar("whatsappNumber", { length: 16 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productMedia = mysqlTable("productMedia", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  mediaType: mysqlEnum("mediaType", ["front", "back", "gallery", "model3d"]).default("gallery").notNull(),
  altText: varchar("altText", { length: 180 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  sessionKey: varchar("sessionKey", { length: 128 }).notNull().unique(),
  userId: int("userId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  variantId: int("variantId").notNull(),
  quantity: int("quantity").notNull(),
});

export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductMedia = typeof productMedia.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
