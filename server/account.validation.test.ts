import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("customer account access", () => {
  it("does not expose personal orders to anonymous callers", async () => {
    await expect(appRouter.createCaller(anonymousContext).orders.mine()).rejects.toThrow();
  });
});
