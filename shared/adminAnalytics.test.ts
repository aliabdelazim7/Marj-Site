import { describe, expect, it } from "vitest";
import { buildAdminAnalytics } from "./adminAnalytics";

describe("admin analytics", () => {
  it("excludes cancelled orders from recorded-order value while retaining the cancellation count", () => {
    const result = buildAdminAnalytics([
      { id: 1, status: "delivered", city: "القاهرة", paymentMethod: "cod", subtotal: 800, shipping: 40, total: 840, createdAt: "2026-08-25T00:00:00.000Z" },
      { id: 2, status: "cancelled", city: "الجيزة", paymentMethod: "cod", subtotal: 900, shipping: 60, total: 960, createdAt: "2026-08-25T00:00:00.000Z" },
    ], [
      { orderId: 1, productId: "wave", productName: "هودي موج", quantity: 2, lineTotal: 800 },
      { orderId: 2, productId: "cancelled", productName: "ملغي", quantity: 1, lineTotal: 900 },
    ], [{ id: 1, status: "active", variants: [{ stock: 2, stockStatus: "instock", status: "active" }] }]);

    expect(result).toMatchObject({ recordedOrdersCount: 1, cancelledOrdersCount: 1, totalOrderValue: 840, totalShippingValue: 40, averageRecordedOrderValue: 840 });
    expect(result.topProducts).toEqual([{ productId: "wave", productName: "هودي موج", quantity: 2, value: 800 }]);
    expect(result.governorates).toEqual([{ city: "القاهرة", ordersCount: 1, value: 840 }]);
  });
});
