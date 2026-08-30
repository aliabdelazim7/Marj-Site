export type AnalyticsOrder = {
  id: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  city: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date | string;
};

export type AnalyticsOrderItem = {
  orderId: number;
  productId: string;
  productName: string;
  quantity: number;
  lineTotal: number;
};

export type AnalyticsCatalogProduct = {
  id: number;
  status: "draft" | "active" | "archived";
  variants: Array<{ stock: number; stockStatus: "instock" | "outofstock" | "onbackorder"; status: "active" | "inactive" }>;
};

const activeOrderStatuses = new Set<AnalyticsOrder["status"]>(["pending", "confirmed", "processing", "shipped", "delivered"]);

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }), {});
}

export function buildAdminAnalytics(orders: AnalyticsOrder[], items: AnalyticsOrderItem[], catalog: AnalyticsCatalogProduct[]) {
  const recordedOrders = orders.filter((order) => activeOrderStatuses.has(order.status));
  const recordedOrderIds = new Set(recordedOrders.map((order) => order.id));
  const totalOrderValue = recordedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalShippingValue = recordedOrders.reduce((sum, order) => sum + order.shipping, 0);
  const topProducts = Object.values(items
    .filter((item) => recordedOrderIds.has(item.orderId))
    .reduce<Record<string, { productId: string; productName: string; quantity: number; value: number }>>((acc, item) => {
      const current = acc[item.productId] ?? { productId: item.productId, productName: item.productName, quantity: 0, value: 0 };
      current.quantity += item.quantity;
      current.value += item.lineTotal;
      acc[item.productId] = current;
      return acc;
    }, {}))
    .sort((a, b) => b.value - a.value || b.quantity - a.quantity)
    .slice(0, 5);
  const governorates = Object.entries(countBy(recordedOrders.map((order) => order.city))).map(([city, ordersCount]) => ({ city, ordersCount, value: recordedOrders.filter((order) => order.city === city).reduce((sum, order) => sum + order.total, 0) })).sort((a, b) => b.value - a.value || b.ordersCount - a.ordersCount).slice(0, 5);

  return {
    recordedOrdersCount: recordedOrders.length,
    cancelledOrdersCount: orders.filter((order) => order.status === "cancelled").length,
    totalOrderValue,
    totalShippingValue,
    averageRecordedOrderValue: recordedOrders.length ? Math.round(totalOrderValue / recordedOrders.length) : 0,
    orderStatusCounts: countBy(orders.map((order) => order.status)),
    paymentMethodCounts: countBy(recordedOrders.map((order) => order.paymentMethod)),
    topProducts,
    governorates,
    catalog: {
      published: catalog.filter((product) => product.status === "active").length,
      drafts: catalog.filter((product) => product.status === "draft").length,
      atRiskVariations: catalog.flatMap((product) => product.variants).filter((variant) => variant.status === "active" && (variant.stockStatus === "outofstock" || variant.stock <= 3)).length,
    },
  };
}
