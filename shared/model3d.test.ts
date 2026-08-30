import { describe, expect, it } from "vitest";
import { isDirectModelUrl, validateGlbUpload } from "./model3d";

function validGlbHeader() {
  const bytes = new Uint8Array(20);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.byteLength, true);
  return bytes;
}

describe("3D product model validation", () => {
  it("accepts only direct GLB/GLTF asset URLs, not product or viewer pages", () => {
    expect(isDirectModelUrl("https://cdn.example.com/models/hoodie.glb")).toBe(true);
    expect(isDirectModelUrl("/manus-storage/products/hoodie.glb")).toBe(true);
    expect(isDirectModelUrl("https://printblur.com/shop/3d-hoodies")).toBe(false);
  });

  it("checks the GLB signature, version, and declared length before upload", () => {
    expect(validateGlbUpload("hoodie.glb", validGlbHeader())).toBeNull();
    expect(validateGlbUpload("hoodie.glb", new Uint8Array(20))).toContain("ليس نموذج GLB صالحًا");
    expect(validateGlbUpload("hoodie.gltf", validGlbHeader())).toContain("ملف GLB فقط");
  });
});
