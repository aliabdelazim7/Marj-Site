import { describe, expect, it } from "vitest";
import { buildAdminOperationsSummary } from "./adminDashboard";

describe("admin operations summary", () => {
  it("lists active at-risk variations and separates critical stockouts", () => {
    const summary = buildAdminOperationsSummary([
      {
        id: 1,
        nameArabic: "هودي موج",
        slug: "wave-hoodie",
        stockStatus: "instock",
        variants: [
          { id: 11, sku: "WV-S", size: "S", color: "أزرق", stock: 2, stockStatus: "instock", status: "active" },
          { id: 12, sku: "WV-M", size: "M", color: "أزرق", stock: 0, stockStatus: "outofstock", status: "active" },
          { id: 13, sku: "WV-L", size: "L", color: "أزرق", stock: 1, stockStatus: "instock", status: "inactive" },
        ],
      },
    ], []);

    expect(summary.stockAlerts.map((item) => [item.sku, item.severity])).toEqual([["WV-M", "critical"], ["WV-S", "low"]]);
  });

  it("keeps only pending fulfillment work in the action queue and orders it oldest first", () => {
    const summary = buildAdminOperationsSummary([], [
      { id: 1, orderNumber: "MRJ-3", customerName: "ثالث", city: "القاهرة", total: 900, status: "shipped", createdAt: "2026-08-24T12:00:00.000Z" },
      { id: 2, orderNumber: "MRJ-2", customerName: "ثان", city: "الجيزة", total: 800, status: "processing", createdAt: "2026-08-23T12:00:00.000Z" },
      { id: 3, orderNumber: "MRJ-1", customerName: "أول", city: "القاهرة", total: 700, status: "pending", createdAt: "2026-08-22T12:00:00.000Z" },
      { id: 4, orderNumber: "MRJ-4", customerName: "ملغي", city: "القاهرة", total: 600, status: "cancelled", createdAt: "2026-08-21T12:00:00.000Z" },
    ]);

    expect(summary.actionOrders.map((order) => order.orderNumber)).toEqual(["MRJ-1", "MRJ-2"]);
    expect(summary.statusCounts).toMatchObject({ pending: 1, processing: 1, shipped: 1 });
  });
});
