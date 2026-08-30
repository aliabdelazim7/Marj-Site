import { describe, expect, it } from "vitest";
import { preserveTryOnRetryState } from "./tryOnState";

describe("try-on retry state", () => {
  it("preserves selected hoodie and uploaded photo after a failure", () => {
    const result = preserveTryOnRetryState({ selectedProductId: "night-grid", photoDataUrl: "data:image/jpeg;base64,abc=", resultUrl: "/old-result.png" }, "تعذر إنشاء المعاينة الآن");
    expect(result).toMatchObject({ selectedProductId: "night-grid", photoDataUrl: "data:image/jpeg;base64,abc=", status: "error", resultUrl: null, errorMessage: "تعذر إنشاء المعاينة الآن" });
  });
});
