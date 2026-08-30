import { describe, expect, it } from "vitest";
import { TRY_ON_ERROR_MESSAGE } from "./tryOnErrors";

describe("try-on error contract", () => {
  it("exposes a privacy-safe retry message", () => {
    expect(TRY_ON_ERROR_MESSAGE).toBe("تعذر إنشاء المعاينة الآن");
    expect(TRY_ON_ERROR_MESSAGE).not.toContain("403");
    expect(TRY_ON_ERROR_MESSAGE).not.toContain("Forbidden");
  });
});
