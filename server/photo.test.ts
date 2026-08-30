import { describe, expect, it } from "vitest";
import { parsePhotoDataUrl } from "./photo";

describe("parsePhotoDataUrl", () => {
  it("normalizes a browser JPEG data URL", () => {
    expect(parsePhotoDataUrl("data:image/jpg;base64,abc123=")).toEqual({ mimeType: "image/jpeg", encoded: "abc123=" });
  });

  it("rejects unsupported or malformed data URLs", () => {
    expect(() => parsePhotoDataUrl("data:image/gif;base64,abc")).toThrow("صيغة الصورة غير مدعومة");
    expect(() => parsePhotoDataUrl("not-a-data-url")).toThrow("صيغة الصورة غير مدعومة");
  });
});
