import type { TryOnResponse } from "../src/types";
import { parsePhotoDataUrl, TRY_ON_ERROR_MESSAGE, tryOnInputSchema } from "./tryOnValidation";

export type TryOnProduct = {
  id: string;
  name: string;
  color?: string;
  description?: string;
};

export type TryOnHandlerOptions = {
  resolveProduct: (productId: string) => Promise<TryOnProduct | null>;
  generateImage: (args: { prompt: string; photoDataUrl: string }) => Promise<{ url: string }>;
};

function buildPrompt(product: TryOnProduct) {
  return [
    "Create a realistic e-commerce virtual try-on preview.",
    "Keep the person's identity, face, body proportions, pose, lighting, and background unchanged.",
    `Replace only the upper garment with the selected hoodie: ${product.name}${product.color ? `, ${product.color}` : ""}${product.description ? `, ${product.description}` : ""}.`,
    "The hoodie must fit naturally, preserve realistic folds, hood shape, cuffs, and fabric texture.",
    "Do not add text, logos, extra people, accessories, or alter the person's face.",
  ].join(" ");
}

/** Express-compatible handler. Do not log photoDataUrl or provider responses. */
export function createTryOnHandler(options: TryOnHandlerOptions) {
  return async (req: { body?: unknown }, res: { status: (code: number) => { json: (body: unknown) => unknown }; json: (body: unknown) => unknown }) => {
    const parsed = tryOnInputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid Try-On request" });

    const product = await options.resolveProduct(parsed.data.productId);
    if (!product) return res.status(404).json({ message: "Selected product was not found" });

    // Parse once here to validate the body before passing it to the image provider.
    parsePhotoDataUrl(parsed.data.photoDataUrl);

    try {
      const generated = await options.generateImage({ prompt: buildPrompt(product), photoDataUrl: parsed.data.photoDataUrl });
      const result: TryOnResponse = { url: generated.url, productId: product.id, productName: product.name };
      return res.json(result);
    } catch (error) {
      console.error("[VirtualTryOn] generation failed", error instanceof Error ? error.message : "unknown error");
      return res.status(502).json({ message: TRY_ON_ERROR_MESSAGE });
    }
  };
}
