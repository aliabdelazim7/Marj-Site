export type DashboardProductVariant = {
  id: number;
  sku: string;
  size: string;
  color: string;
  stock: number;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  status: "active" | "inactive";
  safetyStock?: number;
};

export type DashboardProduct = {
  id: number;
  nameArabic: string;
  slug: string;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  variants: DashboardProductVariant[];
};

export type DashboardOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  city: string;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date | string;
};

const actionOrderStatuses = new Set<DashboardOrder["status"]>(["pending", "confirmed", "processing"]);

export function buildAdminOperationsSummary(products: DashboardProduct[], orders: DashboardOrder[]) {
  const stockAlerts = products.flatMap((product) => product.variants
    .filter((variant) => variant.status === "active")
    .filter((variant) => product.stockStatus === "outofstock" || variant.stockStatus === "outofstock" || variant.stock <= (variant.safetyStock ?? 3))
    .map((variant) => ({
      productId: product.id,
      productName: product.nameArabic,
      productSlug: product.slug,
      productStockStatus: product.stockStatus,
      ...variant,
      severity: product.stockStatus === "outofstock" || variant.stockStatus === "outofstock" || variant.stock === 0 ? "critical" as const : "low" as const,
    })))
    .sort((a, b) => Number(b.severity === "critical") - Number(a.severity === "critical") || a.stock - b.stock);

  const actionOrders = orders
    .filter((order) => actionOrderStatuses.has(order.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    stockAlerts,
    actionOrders,
    statusCounts: {
      pending: orders.filter((order) => order.status === "pending").length,
      confirmed: orders.filter((order) => order.status === "confirmed").length,
      processing: orders.filter((order) => order.status === "processing").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
    },
  };
}
