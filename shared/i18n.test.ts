import { describe, expect, it } from "vitest";
import { languageDirection, translateVisibleText } from "../client/src/lib/i18n";

describe("Marj interface language helpers", () => {
  it("translates shared interface labels in both directions", () => {
    expect(translateVisibleText("المنتجات", "en")).toBe("Products");
    expect(translateVisibleText("Products", "ar")).toBe("المنتجات");
  });

  it("covers the storefront copy that is rendered in the English home and product pages", () => {
    expect(translateVisibleText("مرج مساحة لقطع يومية مستوحاة من البحر وحركة الموج. كل موديل له شخصية، وكل قرار شراء يبدأ من إنك تشوفه عليك فعلًا.", "en")).toContain("Marj is a space");
    expect(translateVisibleText("مصممة", "en")).toBe("Designed");
    expect(translateVisibleText("للاستخدام.", "en")).toBe("for everyday use.");
    expect(translateVisibleText("خامة مختارة بعناية", "en")).toBe("Carefully selected fabric");
  });

  it("sets the correct document direction", () => {
    expect(languageDirection("ar")).toBe("rtl");
    expect(languageDirection("en")).toBe("ltr");
  });
});
