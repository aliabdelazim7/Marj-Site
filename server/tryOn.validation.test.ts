import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

const validPhoto = "data:image/jpeg;base64," + "a".repeat(100);

describe("tryOn.generate validation", () => {
  it("rejects generation when consent is missing", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tryOn.generate({ productId: "signal-red", photoDataUrl: validPhoto, consent: false })).rejects.toThrow();
  });

  it("rejects unsupported image formats", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tryOn.generate({ productId: "signal-red", photoDataUrl: "data:image/gif;base64,abc", consent: true })).rejects.toThrow();
  });

  it("rejects an unknown hoodie before image generation", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tryOn.generate({ productId: "missing", photoDataUrl: validPhoto, consent: true })).rejects.toThrow("الهودي المختار غير موجود");
  });
});
