import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getHoodieById, hoodieProducts } from "@shared/products";
import { calculateTotals, isValidCustomerEmail, validateCommerceLine } from "@shared/commerce";
import { buildAdminOperationsSummary } from "@shared/adminDashboard";
import { buildAdminAnalytics } from "@shared/adminAnalytics";
import { getPaymentActivationError } from "@shared/paymentRules";
import { calculateShippingForGovernorate } from "@shared/shippingRules";
import { isDirectModelUrl, MAX_PRODUCT_MODEL_BYTES, validateGlbUpload } from "@shared/model3d";
import { buildManualPaymentWhatsAppMessage, normalizeEgyptianWhatsAppNumber } from "@shared/whatsappReceipt";
import { canTeamRoleAccess, isActiveTeamInvite, isTeamRole, type TeamCapability, type TeamRole } from "@shared/teamAccess";
import { calculateDeliveryPoints, calculateLoyaltyDiscount, validateCouponForSubtotal } from "@shared/growthRules";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateImage } from "./_core/imageGeneration";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { acceptStoreTeamInvite, addLoyaltyLedgerEntry, adjustVariantStock, awardDeliveredOrderLoyalty, consumeCoupon, createCatalogProduct, createCoupon, createLookbookEntry, createOrder, createProductCategory, createProductMedia, createProductVariant, createStoreTeamInvite, createVerifiedReview, deleteProductMedia, deleteProductVariant, getAdminAnalytics, getAdminCatalog, getAdminProduct, getCommerceEventCounts, getCouponByCode, getLoyaltyAccount, getOrderById, getOrderForCustomer, getPaymentMethodByCode, getPublishedCatalogProductBySlug, getShippingZoneForGovernorate, getStoreSettings, getStoreTeamInviteByHash, getStoreTeamMemberForUser, listApprovedReviews, listCatalogProducts, listCoupons, listEnabledPaymentMethods, listEnabledShippingZones, listInventoryAdjustments, listLookbookEntries, listOrders, listOrdersForCustomerEmail, listPaymentMethods, listProductCategories, listProductVariants, listPublishedCatalogProducts, listShippingZones, listStoreTeamInvites, listStoreTeamMembers, listReviewsForAdmin, listWishlistProductIds, recordCommerceEvent, revokeStoreTeamInvite, revokeStoreTeamMember, toggleWishlistProduct, updateCatalogProduct, updateCatalogProductStatus, updateCoupon, updateLookbookEntry, updateOrderFulfillment, updateOrderStatus, updatePaymentMethod, updateProductVariant, updateReviewStatus, updateShippingZone, updateStoreSettings, updateStoreTeamMemberRole } from "./db";
import { storagePut } from "./storage";
import { parsePhotoDataUrl } from "./photo";
import { TRY_ON_ERROR_MESSAGE } from "./tryOnErrors";

const dataUrlSchema = z
  .string()
  .regex(/^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/, "صيغة الصورة غير مدعومة")
  .refine((value) => value.length <= 8_500_000, "حجم الصورة أكبر من الحد المسموح");

const customerEmailSchema = z.string().trim().email().max(320).refine(isValidCustomerEmail, "اكتب بريدًا إلكترونيًا صحيحًا.");

export const createOrderInputSchema = z.object({
  customerName: z.string().trim().min(2).max(160), email: customerEmailSchema, phone: z.string().trim().min(8).max(40), address: z.string().trim().min(8).max(1000), city: z.string().trim().min(2).max(80), notes: z.string().trim().max(1000).optional(), consent: z.literal(true),
  paymentMethod: z.string().trim().min(1).max(40),
  couponCode: z.string().trim().min(2).max(80).optional(),
  loyaltyPoints: z.number().int().min(0).max(100_000).default(0),
  items: z.array(z.object({ productId: z.string().min(1), size: z.enum(["S", "M", "L", "XL"]), quantity: z.number().int().min(1).max(5) })).min(1).max(30),
});

export const orderLookupInputSchema = z.object({
  orderNumber: z.string().trim().min(6).max(32),
  email: customerEmailSchema,
});

const productStatusSchema = z.enum(["draft", "active", "archived"]);
const stockStatusSchema = z.enum(["instock", "outofstock", "onbackorder"]);
export const isDirectProductImageUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed, "https://marj.local");
    return /\.(avif|jpe?g|png|webp)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};
const productImageUrlSchema = z.string().trim().max(2000).refine(isDirectProductImageUrl, "الصورة الرئيسية يجب أن تكون رابط ملف صورة مباشرًا مثل JPG أو PNG أو WEBP، وليست صفحة متجر أو رابط 3D.");
const mediaTypeSchema = z.enum(["front", "back", "gallery", "model3d"]);
export const productAdminInputShape = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "استخدم slug إنجليزيًا بشرطات فقط"),
  name: z.string().trim().min(2).max(160),
  nameArabic: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(5000),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  price: z.number().int().positive().max(10_000_000),
  salePrice: z.number().int().positive().max(10_000_000).nullable().optional(),
  compareAtPrice: z.number().int().positive().max(10_000_000).nullable().optional(),
  sku: z.string().trim().max(80).nullable().optional(),
  imageUrl: productImageUrlSchema,
  category: z.string().trim().min(2).max(80).default("هوديز"),
  categoryId: z.number().int().positive().nullable().optional(),
  featured: z.boolean().default(false),
  manageStock: z.boolean().default(true),
  stockStatus: stockStatusSchema.default("instock"),
  status: productStatusSchema.default("draft"),
});
export const productAdminInputSchema = productAdminInputShape.superRefine((value, ctx) => {
  if (value.salePrice !== null && value.salePrice !== undefined && value.salePrice >= value.price) {
    ctx.addIssue({ code: "custom", path: ["salePrice"], message: "سعر التخفيض يجب أن يكون أقل من السعر الأساسي" });
  }
  if (value.compareAtPrice !== null && value.compareAtPrice !== undefined && value.compareAtPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "السعر قبل الخصم يجب ألا يقل عن السعر الأساسي" });
  }
});
export const productAdminUpdateSchema = productAdminInputShape.partial().superRefine((value, ctx) => {
  if (value.price !== undefined && value.salePrice !== null && value.salePrice !== undefined && value.salePrice >= value.price) {
    ctx.addIssue({ code: "custom", path: ["salePrice"], message: "سعر التخفيض يجب أن يكون أقل من السعر الأساسي" });
  }
  if (value.price !== undefined && value.compareAtPrice !== null && value.compareAtPrice !== undefined && value.compareAtPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "السعر قبل الخصم يجب ألا يقل عن السعر الأساسي" });
  }
});
export const productAdminUpdateInputSchema = productAdminInputShape.partial().extend({ id: z.number().int().positive() }).superRefine((value, ctx) => {
  if (value.price !== undefined && value.salePrice !== null && value.salePrice !== undefined && value.salePrice >= value.price) {
    ctx.addIssue({ code: "custom", path: ["salePrice"], message: "سعر التخفيض يجب أن يكون أقل من السعر الأساسي" });
  }
  if (value.price !== undefined && value.compareAtPrice !== null && value.compareAtPrice !== undefined && value.compareAtPrice < value.price) {
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "السعر قبل الخصم يجب ألا يقل عن السعر الأساسي" });
  }
});
export const variantAdminInputSchema = z.object({
  productId: z.number().int().positive(),
  sku: z.string().trim().min(1).max(80),
  size: z.enum(["S", "M", "L", "XL"]),
  color: z.string().trim().min(1).max(80).default("أساسي"),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  safetyStock: z.number().int().min(0).max(1_000_000).default(3),
  priceOverride: z.number().int().positive().max(10_000_000).nullable().optional(),
  stockStatus: stockStatusSchema.default("instock"),
  status: z.enum(["active", "inactive"]).default("active"),
});
export const variantAdminUpdateSchema = variantAdminInputSchema.partial().extend({ id: z.number().int().positive() });
const publicAssetUrlSchema = z.string().trim().max(2000).refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"), "أدخل رابط ملف عامًا أو مسارًا محليًا صحيحًا");
export const mediaAdminInputSchema = z.object({
  productId: z.number().int().positive(),
  url: publicAssetUrlSchema,
  mediaType: mediaTypeSchema.default("gallery"),
  altText: z.string().trim().max(180).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).default(0),
}).superRefine((value, ctx) => {
  if (value.mediaType === "model3d" && !isDirectModelUrl(value.url)) {
    ctx.addIssue({ code: "custom", path: ["url"], message: "ملف 3D يجب أن يكون بصيغة GLB أو GLTF." });
  }
  if (value.mediaType !== "model3d" && !isDirectProductImageUrl(value.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "الوسيط يجب أن يكون رابط ملف صورة مباشرًا." });
});
export const model3dUploadInputSchema = z.object({
  productId: z.number().int().positive(),
  fileName: z.string().trim().min(5).max(180).regex(/\.glb$/i, "ارفع ملف GLB فقط."),
  base64: z.string().min(8).max(Math.ceil(MAX_PRODUCT_MODEL_BYTES * 4 / 3) + 16),
  altText: z.string().trim().max(180).nullable().optional(),
});
export const categoryAdminInputSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["active", "draft"]).default("active"),
});
export const storeSettingsInputSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  shippingScope: z.string().trim().min(8).max(240),
  shippingFee: z.number().int().min(0).max(1_000_000),
  freeShippingThreshold: z.number().int().positive().max(10_000_000).nullable(),
  shippingNotice: z.string().trim().min(8).max(5000),
  returnPolicy: z.string().trim().min(8).max(5000),
  paymentNotice: z.string().trim().min(8).max(5000),
});
export const shippingZoneUpdateSchema = z.object({ id: z.number().int().positive(), fee: z.number().int().min(0).max(1_000_000), enabled: z.boolean(), deliveryNote: z.string().trim().max(240).nullable() });
export const paymentMethodUpdateSchema = z.object({ id: z.number().int().positive(), label: z.string().trim().min(2).max(120), enabled: z.boolean(), instructions: z.string().trim().max(5000).nullable(), whatsappNumber: z.string().trim().max(30).nullable().optional() });
const positiveIdSchema = z.object({ id: z.number().int().positive() });
export const canManageCatalog = (role: string) => role === "admin";
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!canManageCatalog(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "هذه العملية متاحة للمدير فقط" });
  return next({ ctx });
});
const adminProcedure = ownerProcedure;

async function resolveTeamAccess(user: { id: number; role: string }) {
  if (user.role === "admin") return { role: "owner" as const };
  const member = await getStoreTeamMemberForUser(user.id);
  if (!member || !isTeamRole(member.role)) return null;
  return { role: member.role };
}

const teamProcedure = (capability: TeamCapability) => protectedProcedure.use(async ({ ctx, next }) => {
  const access = await resolveTeamAccess(ctx.user);
  const allowed = access?.role === "owner" || (access && isTeamRole(access.role) && canTeamRoleAccess(access.role, capability));
  if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "هذه الصفحة غير متاحة ضمن صلاحيتك الحالية." });
  return next({ ctx: { ...ctx, teamAccess: access } });
});

const dashboardProcedure = teamProcedure("dashboard");
const ordersProcedure = teamProcedure("orders");
const catalogProcedure = teamProcedure("catalog");
const analyticsProcedure = teamProcedure("analytics");
const teamRoleSchema = z.enum(["order_operator", "catalog_editor", "analytics_viewer", "store_manager"]);
const inviteTokenSchema = z.string().trim().min(32).max(160);
const inviteExpirySchema = z.union([z.literal(24), z.literal(72), z.literal(168), z.literal(720), z.literal("unlimited")]).default(168);
const hashInviteToken = (token: string) => createHash("sha256").update(token).digest("hex");
const couponInputShape = z.object({
  code: z.string().trim().min(3).max(80).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().int().positive().max(1_000_000),
  minimumSubtotal: z.number().int().min(0).max(10_000_000).default(0),
  usageLimit: z.number().int().positive().max(1_000_000).nullable(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  enabled: z.boolean(),
});
const couponInputSchema = couponInputShape.superRefine((input, ctx) => {
  if (input.type === "percentage" && input.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "نسبة الخصم لا تتجاوز 100%." });
  if (input.expiresAt && input.expiresAt <= input.startsAt) ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "تاريخ الانتهاء يجب أن يأتي بعد البداية." });
});
const couponUpdateInputSchema = couponInputShape.partial().extend({ id: z.number().int().positive() }).superRefine((input, ctx) => {
  if (input.type === "percentage" && input.value !== undefined && input.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "نسبة الخصم لا تتجاوز 100%." });
  if (input.startsAt && input.expiresAt && input.expiresAt <= input.startsAt) ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "تاريخ الانتهاء يجب أن يأتي بعد البداية." });
});
const fulfillmentInputSchema = z.object({ id: z.number().int().positive(), shipmentCarrier: z.string().trim().max(120).nullable(), trackingNumber: z.string().trim().max(160).nullable(), trackingUrl: z.string().trim().max(2000).url().nullable() });
const inventoryAdjustmentInputSchema = z.object({ variantId: z.number().int().positive(), delta: z.number().int().min(-100_000).max(100_000).refine((value) => value !== 0), reason: z.string().trim().min(3).max(240) });
const reviewInputSchema = z.object({ orderNumber: z.string().trim().min(6).max(32), email: customerEmailSchema, productId: z.number().int().positive(), rating: z.number().int().min(1).max(5), body: z.string().trim().min(12).max(2000) });

type PublishedCatalogLine = { productId: string; size: "S" | "M" | "L" | "XL"; quantity: number };
export function normalizePublishedCatalogLine(item: PublishedCatalogLine, publishedProducts: Array<any>) {
  const catalogProduct = publishedProducts.find((product) => product.id === item.productId);
  const staticValidation = validateCommerceLine(item);
  const product = catalogProduct ?? (staticValidation.ok ? staticValidation.product : null);
  if (!product) throw new TRPCError({ code: "BAD_REQUEST", message: staticValidation.ok ? "أحد المنتجات لم يعد متاحًا." : staticValidation.message });
  if (!product.sizes.includes(item.size)) throw new TRPCError({ code: "BAD_REQUEST", message: `المقاس ${item.size} غير متاح لهذا المنتج.` });
  const variant = "variants" in product ? product.variants.find((candidate: any) => candidate.size === item.size && candidate.status === "active") : undefined;
  if (catalogProduct && catalogProduct.stockStatus === "outofstock") throw new TRPCError({ code: "BAD_REQUEST", message: "هذا المنتج نفدت كميته حاليًا." });
  if (variant && variant.stockStatus === "outofstock") throw new TRPCError({ code: "BAD_REQUEST", message: `المقاس ${item.size} نفد حاليًا.` });
  if (variant && catalogProduct?.manageStock && item.quantity > variant.stock) throw new TRPCError({ code: "BAD_REQUEST", message: `الكمية المتاحة من مقاس ${item.size} هي ${variant.stock} فقط.` });
  const unitPrice = variant?.priceOverride ?? product.price;
  return { ...item, product, unitPrice, lineTotal: unitPrice * item.quantity };
}

async function resolveTryOnProduct(productId: string) {
  const staticProduct = getHoodieById(productId) ?? hoodieProducts.find((item) => item.slug === productId);
  if (staticProduct) return staticProduct;
  if (!productId.includes("-")) return null;
  return getPublishedCatalogProductBySlug(productId);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  products: router({
    list: publicProcedure.query(async () => {
      const products = await listPublishedCatalogProducts();
      return products.length ? products : hoodieProducts;
    }),
    getBySlug: publicProcedure.input(z.object({ slug: z.string().min(2).max(120) })).query(async ({ input }) => {
      return (await getPublishedCatalogProductBySlug(input.slug)) ?? getHoodieById(input.slug) ?? hoodieProducts.find((product) => product.slug === input.slug) ?? null;
    }),
  }),
  store: router({
    settings: publicProcedure.query(() => getStoreSettings()),
    shippingZones: publicProcedure.query(() => listEnabledShippingZones()),
    paymentMethods: publicProcedure.query(async () => (await listEnabledPaymentMethods()).map(({ whatsappNumber: _whatsappNumber, ...method }) => method)),
  }),
  admin: router({
    dashboard: dashboardProcedure.query(async () => {
      const [products, orders, categories] = await Promise.all([getAdminCatalog(), listOrders(), listProductCategories()]);
      const operations = buildAdminOperationsSummary(products, orders);
      return {
        productsCount: products.length,
        publishedCount: products.filter((product) => product.status === "active").length,
        draftCount: products.filter((product) => product.status === "draft").length,
        lowStockCount: operations.stockAlerts.length,
        ordersCount: orders.length,
        categoriesCount: categories.length,
        operations,
      };
    }),
    access: protectedProcedure.query(async ({ ctx }) => resolveTeamAccess(ctx.user)),
    products: router({
      list: catalogProcedure.query(() => getAdminCatalog()),
      get: catalogProcedure.input(positiveIdSchema).query(({ input }) => getAdminProduct(input.id)),
      create: catalogProcedure.input(productAdminInputSchema).mutation(({ input }) => createCatalogProduct(input)),
      update: catalogProcedure.input(productAdminUpdateInputSchema).mutation(({ input }) => {
        const { id, ...values } = input;
        return updateCatalogProduct(id, values);
      }),
      setStatus: catalogProcedure.input(z.object({ id: z.number().int().positive(), status: productStatusSchema })).mutation(({ input }) => updateCatalogProductStatus(input.id, input.status)),
      variants: router({
        list: catalogProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => listProductVariants(input.productId)),
        create: catalogProcedure.input(variantAdminInputSchema).mutation(async ({ input }) => {
          if (!(await getAdminProduct(input.productId))) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
          return createProductVariant(input);
        }),
        update: catalogProcedure.input(variantAdminUpdateSchema).mutation(({ input }) => {
          const { id, productId: _productId, ...values } = input;
          return updateProductVariant(id, values);
        }),
        remove: catalogProcedure.input(positiveIdSchema).mutation(({ input }) => deleteProductVariant(input.id)),
      }),
      media: router({
        add: catalogProcedure.input(mediaAdminInputSchema).mutation(async ({ input }) => {
          if (!(await getAdminProduct(input.productId))) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
          return createProductMedia(input);
        }),
        uploadModel: catalogProcedure.input(model3dUploadInputSchema).mutation(async ({ input }) => {
          if (!(await getAdminProduct(input.productId))) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
          const bytes = Buffer.from(input.base64, "base64");
          const validationError = validateGlbUpload(input.fileName, bytes);
          if (validationError) throw new TRPCError({ code: "BAD_REQUEST", message: validationError });
          const safeFileName = input.fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
          const stored = await storagePut(`products/${input.productId}/models/${safeFileName}`, bytes, "model/gltf-binary");
          return createProductMedia({ productId: input.productId, url: stored.url, mediaType: "model3d", altText: input.altText || null, sortOrder: 0 });
        }),
        remove: catalogProcedure.input(positiveIdSchema).mutation(({ input }) => deleteProductMedia(input.id)),
      }),
    }),
    categories: router({
      list: catalogProcedure.query(() => listProductCategories()),
      create: catalogProcedure.input(categoryAdminInputSchema).mutation(({ input }) => createProductCategory(input)),
    }),
    settings: router({
      get: adminProcedure.query(() => getStoreSettings()),
      update: adminProcedure.input(storeSettingsInputSchema).mutation(({ input }) => updateStoreSettings(input)),
    }),
    shipping: router({
      list: adminProcedure.query(() => listShippingZones()),
      update: adminProcedure.input(shippingZoneUpdateSchema).mutation(({ input }) => updateShippingZone(input.id, input)),
    }),
    payments: router({
      list: adminProcedure.query(() => listPaymentMethods()),
      update: adminProcedure.input(paymentMethodUpdateSchema).mutation(async ({ input }) => {
        const method = (await listPaymentMethods()).find((candidate) => candidate.id === input.id);
        if (!method) throw new TRPCError({ code: "NOT_FOUND", message: "طريقة الدفع غير موجودة." });
        const activationError = getPaymentActivationError(method.type, input.enabled, input.instructions);
        if (activationError) throw new TRPCError({ code: "BAD_REQUEST", message: activationError });
        const whatsappNumber = input.whatsappNumber === undefined ? undefined : normalizeEgyptianWhatsAppNumber(input.whatsappNumber);
        if (input.whatsappNumber?.trim() && !whatsappNumber) throw new TRPCError({ code: "BAD_REQUEST", message: "اكتب رقم WhatsApp مصريًا صحيحًا، مثل 01012345678 أو +201012345678." });
        return updatePaymentMethod(input.id, { ...input, ...(input.whatsappNumber === undefined ? {} : { whatsappNumber }) });
      }),
    }),
    analytics: router({
      get: analyticsProcedure.query(async () => {
        const data = await getAdminAnalytics();
        const [base, events] = await Promise.all([Promise.resolve(buildAdminAnalytics(data.orders, data.items, data.catalog)), getCommerceEventCounts()]);
        return { ...base, commerceEvents: events };
      }),
    }),
    orders: router({
      list: ordersProcedure.query(() => listOrders()),
      setStatus: ordersProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]) })).mutation(async ({ input }) => {
        const updated = await updateOrderStatus(input.id, input.status);
        if (input.status === "delivered") { const order = await getOrderById(input.id); if (order) await awardDeliveredOrderLoyalty(input.id, calculateDeliveryPoints(order.total)); }
        return updated;
      }),
      fulfillment: ordersProcedure.input(fulfillmentInputSchema).mutation(({ input }) => updateOrderFulfillment(input.id, input)),
    }),
    coupons: router({
      list: adminProcedure.query(() => listCoupons()),
      create: adminProcedure.input(couponInputSchema).mutation(({ input }) => createCoupon(input)),
      update: adminProcedure.input(couponUpdateInputSchema).mutation(({ input }) => { const { id, ...values } = input; return updateCoupon(id, values); }),
    }),
    reviews: router({
      list: adminProcedure.query(() => listReviewsForAdmin()),
      setStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "approved", "rejected"]) })).mutation(({ input }) => updateReviewStatus(input.id, input.status)),
    }),
    inventory: router({
      adjustments: catalogProcedure.input(z.object({ variantId: z.number().int().positive().optional() }).optional()).query(({ input }) => listInventoryAdjustments(input?.variantId)),
      adjust: catalogProcedure.input(inventoryAdjustmentInputSchema).mutation(({ ctx, input }) => adjustVariantStock({ ...input, createdByUserId: ctx.user.id })),
    }),
    lookbook: router({
      list: adminProcedure.query(() => listLookbookEntries()),
      create: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(160), titleArabic: z.string().trim().min(2).max(160), description: z.string().trim().max(2000).nullable(), imageUrl: productImageUrlSchema, productId: z.number().int().positive().nullable(), sortOrder: z.number().int().min(0).max(999).default(0), published: z.boolean().default(false) })).mutation(({ input }) => createLookbookEntry(input)),
      update: adminProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(2).max(160).optional(), titleArabic: z.string().trim().min(2).max(160).optional(), description: z.string().trim().max(2000).nullable().optional(), imageUrl: productImageUrlSchema.optional(), productId: z.number().int().positive().nullable().optional(), sortOrder: z.number().int().min(0).max(999).optional(), published: z.boolean().optional() })).mutation(({ input }) => { const { id, ...values } = input; return updateLookbookEntry(id, values); }),
    }),
    team: router({
      list: adminProcedure.query(async () => {
        const [members, invites] = await Promise.all([listStoreTeamMembers(), listStoreTeamInvites()]);
        return { members, invites: invites.map(({ tokenHash: _tokenHash, ...invite }) => invite) };
      }),
      createInvite: adminProcedure.input(z.object({ role: teamRoleSchema, expiresInHours: inviteExpirySchema })).mutation(async ({ ctx, input }) => {
        const inviteToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
        const expiresAt = input.expiresInHours === "unlimited" ? null : new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000);
        const invite = await createStoreTeamInvite({ tokenHash: hashInviteToken(inviteToken), role: input.role, createdByUserId: ctx.user.id, expiresAt });
        if (!invite) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الدعوة الآن." });
        return { id: invite.id, role: invite.role, expiresAt: invite.expiresAt, inviteToken };
      }),
      revokeInvite: adminProcedure.input(positiveIdSchema).mutation(({ input }) => revokeStoreTeamInvite(input.id)),
      updateMemberRole: adminProcedure.input(z.object({ id: z.number().int().positive(), role: teamRoleSchema })).mutation(({ input }) => updateStoreTeamMemberRole(input.id, input.role)),
      revokeMember: adminProcedure.input(positiveIdSchema).mutation(({ input }) => revokeStoreTeamMember(input.id)),
    }),
  }),
  team: router({
    acceptInvite: protectedProcedure.input(z.object({ token: inviteTokenSchema })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "حساب المدير لديه صلاحيات كاملة بالفعل." });
      if (await getStoreTeamMemberForUser(ctx.user.id)) throw new TRPCError({ code: "CONFLICT", message: "هذا الحساب عضو فريق بالفعل. اطلب من المدير تعديل صلاحيتك من لوحة الفريق." });
      const invite = await getStoreTeamInviteByHash(hashInviteToken(input.token));
      if (!invite || !isActiveTeamInvite(invite) || !isTeamRole(invite.role)) throw new TRPCError({ code: "NOT_FOUND", message: "رابط الدعوة غير صالح أو انتهت صلاحيته." });
      await acceptStoreTeamInvite(invite.id, ctx.user.id, invite.role, invite.createdByUserId);
      return { role: invite.role };
    }),
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => {
      if (!ctx.user.email) return [];
      return listOrdersForCustomerEmail(ctx.user.email);
    }),
    create: publicProcedure
      .input(createOrderInputSchema)
      .mutation(async ({ input, ctx }) => {
        const [publishedProducts, settings, shippingZone, paymentMethod] = await Promise.all([listPublishedCatalogProducts(), getStoreSettings(), getShippingZoneForGovernorate(input.city), getPaymentMethodByCode(input.paymentMethod)]);
        if (!shippingZone || !shippingZone.enabled) throw new TRPCError({ code: "BAD_REQUEST", message: "هذه المحافظة غير متاحة للشحن حاليًا. اختر محافظة مفعلة." });
        if (!paymentMethod || !paymentMethod.enabled) throw new TRPCError({ code: "BAD_REQUEST", message: "طريقة الدفع المختارة غير مفعلة حاليًا." });
        const normalizedItems = input.items.map((item) => normalizePublishedCatalogLine(item, publishedProducts));
        const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const coupon = input.couponCode ? await getCouponByCode(input.couponCode) : null;
        const couponResult = input.couponCode ? validateCouponForSubtotal(coupon, subtotal) : null;
        if (couponResult && !couponResult.ok) throw new TRPCError({ code: "BAD_REQUEST", message: couponResult.message });
        const couponDiscount = couponResult?.ok ? couponResult.discount : 0;
        const loyalty = ctx.user ? await getLoyaltyAccount(ctx.user.id) : { points: 0 };
        const loyaltyUse = calculateLoyaltyDiscount(input.loyaltyPoints, loyalty.points, subtotal - couponDiscount);
        const discountedSubtotal = subtotal - couponDiscount - loyaltyUse.discount;
        const shipping = calculateShippingForGovernorate(discountedSubtotal, shippingZone.fee, settings?.freeShippingThreshold);
        const total = discountedSubtotal + shipping;

        const orderNumber = `HF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const result = await createOrder({ orderNumber, userId: ctx.user?.id ?? null, status: "pending", customerName: input.customerName, email: input.email, phone: input.phone, address: input.address, city: input.city, paymentMethod: paymentMethod.code, couponCode: couponResult?.ok ? couponResult.code : null, couponDiscount, notes: input.notes || null, subtotal, shipping, total }, normalizedItems.map((item) => ({ orderId: 0, productId: item.product.id, productName: item.product.nameArabic, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })));
        if (couponResult?.ok && coupon) await consumeCoupon(coupon.id);
        if (ctx.user && loyaltyUse.points > 0) await addLoyaltyLedgerEntry({ userId: ctx.user.id, orderId: result.id, points: -loyaltyUse.points, type: "redeemed_checkout", note: "استخدام نقاط في إتمام الطلب" });
        await recordCommerceEvent({ sessionKey: ctx.req.headers["x-marj-session"]?.toString() || crypto.randomUUID(), userId: ctx.user?.id ?? null, eventName: "purchase_completed", orderId: result.id });
        const whatsappNumber = paymentMethod.type === "manual_transfer" ? normalizeEgyptianWhatsAppNumber(paymentMethod.whatsappNumber) : null;
        const whatsappHandoff = whatsappNumber ? { number: whatsappNumber, message: buildManualPaymentWhatsAppMessage({ orderNumber, total, paymentLabel: paymentMethod.label, customerName: input.customerName, customerPhone: input.phone, items: normalizedItems.map((item) => ({ productName: item.product.nameArabic, size: item.size, quantity: item.quantity })) }) } : null;
        return { ...result, subtotal, couponDiscount, loyaltyDiscount: loyaltyUse.discount, loyaltyPointsUsed: loyaltyUse.points, shipping, total, paymentMethod: paymentMethod.code, paymentInstructions: paymentMethod.instructions, whatsappHandoff };
      }),
    lookup: publicProcedure.input(orderLookupInputSchema).query(async ({ input }) => {
      const result = await getOrderForCustomer(input.orderNumber.toUpperCase(), input.email);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "لم نجد طلبًا بهذه البيانات. راجع رقم الطلب والبريد." });
      return result;
    }),
    catalogAdminList: protectedProcedure.query(({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return listCatalogProducts(); }),
    catalogCreate: protectedProcedure.input(z.object({ slug: z.string().min(2).max(120), name: z.string().min(2).max(160), nameArabic: z.string().min(2).max(160), description: z.string().min(2), price: z.number().int().positive(), imageUrl: z.string().url(), status: z.enum(["draft", "active", "archived"]).default("draft") })).mutation(({ ctx, input }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return createCatalogProduct(input); }),
    catalogSetStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]) })).mutation(({ ctx, input }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return updateCatalogProductStatus(input.id, input.status); }),
    adminList: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return listOrders();
    }),
  }),
  growth: router({
    couponPreview: publicProcedure.input(z.object({ code: z.string().trim().min(2).max(80), subtotal: z.number().int().min(0) })).query(async ({ input }) => validateCouponForSubtotal(await getCouponByCode(input.code), input.subtotal)),
    reviews: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => listApprovedReviews(input.productId)),
    submitReview: publicProcedure.input(reviewInputSchema).mutation(async ({ input }) => {
      const order = await getOrderForCustomer(input.orderNumber.toUpperCase(), input.email);
      if (!order || order.order.status !== "delivered") throw new TRPCError({ code: "FORBIDDEN", message: "يمكن إرسال تقييم بعد تسليم الطلب فقط." });
      const item = order.items.find((candidate) => Number(candidate.productId) === input.productId);
      if (!item) throw new TRPCError({ code: "FORBIDDEN", message: "هذه القطعة ليست ضمن الطلب المحدد." });
      return createVerifiedReview({ orderId: order.order.id, productId: input.productId, customerName: order.order.customerName, rating: input.rating, body: input.body });
    }),
    wishlist: router({
      list: protectedProcedure.query(({ ctx }) => listWishlistProductIds(ctx.user.id)),
      toggle: protectedProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleWishlistProduct(ctx.user.id, input.productId)),
    }),
    loyalty: protectedProcedure.query(({ ctx }) => getLoyaltyAccount(ctx.user.id)),
    lookbook: publicProcedure.query(() => listLookbookEntries(true)),
    event: publicProcedure.input(z.object({ sessionKey: z.string().trim().min(12).max(128), eventName: z.enum(["product_view", "add_to_cart", "checkout_started"]), productId: z.number().int().positive().nullable().optional() })).mutation(({ ctx, input }) => recordCommerceEvent({ ...input, userId: ctx.user?.id ?? null, productId: input.productId ?? null })),
  }),
  tryOn: router({
    generate: publicProcedure
      .input(
        z.object({
          productId: z.string().min(1),
          photoDataUrl: dataUrlSchema,
          consent: z.literal(true),
        }),
      )
      .mutation(async ({ input }) => {
        const product = await resolveTryOnProduct(input.productId);
        if (!product) throw new Error("الهودي المختار غير موجود");

        const { mimeType, encoded } = parsePhotoDataUrl(input.photoDataUrl);
        const prompt = [
          "Create a realistic e-commerce virtual try-on preview.",
          "Keep the person's identity, face, body proportions, pose, lighting, and background unchanged.",
          `Replace only the upper garment with the selected hoodie: ${product.name}, ${product.color}, ${product.description}.`,
          "The hoodie must fit naturally, preserve realistic folds, hood shape, cuffs, and fabric texture.",
          "Do not add text, logos, extra people, accessories, or alter the person's face.",
        ].join(" ");

        try {
          const { url } = await generateImage({
            prompt,
            originalImages: [{ b64Json: encoded, mimeType }],
          });
          if (!url) throw new Error("Image service returned no preview URL");
          return { url, productId: product.id, productName: product.nameArabic };
        } catch (error) {
          console.error("[TryOn] image generation failed", error);
          throw new TRPCError({ code: "BAD_GATEWAY", message: TRY_ON_ERROR_MESSAGE });
        }
      }),
  }),
});

const hoodieProductsForClient = [
  {
    id: "signal-red",
    name: "Signal Red",
    nameArabic: "إشارة حمراء",
    price: 899,
    color: "أحمر إشارة",
    colorHex: "#db2f27",
    description: "هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة.",
    details: ["قطن عضوي 100%", "قصة مريحة", "صنع بعناية"],
    accent: "red",
  },
  {
    id: "paper-white",
    name: "Paper White",
    nameArabic: "أبيض ورقي",
    price: 849,
    color: "أبيض ناصع",
    colorHex: "#f4f1eb",
    description: "نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة.",
    details: ["نسيج ناعم 420gsm", "تشطيب مطفي", "قصة unisex"],
    accent: "black",
  },
  {
    id: "night-grid",
    name: "Night Grid",
    nameArabic: "شبكة ليلية",
    price: 949,
    color: "أسود ليلي",
    colorHex: "#111111",
    description: "أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة.",
    details: ["قطن ممشط", "طباعة مقاومة", "جيب أمامي"],
    accent: "red",
  },
  {
    id: "concrete-grey",
    name: "Concrete Grey",
    nameArabic: "رمادي خرسانة",
    price: 879,
    color: "رمادي خرسانة",
    colorHex: "#9a9a95",
    description: "توازن عملي بين الملمس الصناعي والراحة اليومية.",
    details: ["بطانة فرنسية", "أساور مضلعة", "قصة واسعة"],
    accent: "black",
  },
];

export type AppRouter = typeof appRouter;
