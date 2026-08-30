import { beforeEach, describe, expect, it, vi } from "vitest";

const generateImageMock = vi.fn();
vi.mock("./_core/imageGeneration", () => ({ generateImage: generateImageMock }));

const { appRouter } = await import("./routers");
import type { TrpcContext } from "./_core/context";

const ctx: TrpcContext = { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
const normalizedSamplePhoto = "data:image/jpeg;base64,abc123=";

describe("tryOn.generate integration contract", () => {
  beforeEach(() => generateImageMock.mockReset());

  it("passes a normalized sample image to the image service and returns the result", async () => {
    generateImageMock.mockResolvedValue({ url: "/manus-storage/try-on-result.png" });
    const result = await appRouter.createCaller(ctx).tryOn.generate({ productId: "signal-red", photoDataUrl: normalizedSamplePhoto, consent: true });
    expect(result).toMatchObject({ productId: "signal-red", url: "/manus-storage/try-on-result.png" });
    expect(generateImageMock).toHaveBeenCalledWith(expect.objectContaining({ originalImages: [{ b64Json: "abc123=", mimeType: "image/jpeg" }] }));
  });
});
