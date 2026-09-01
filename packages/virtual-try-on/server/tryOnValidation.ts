import { z } from "zod";

export const tryOnInputSchema = z.object({
  productId: z.string().trim().min(1).max(160),
  photoDataUrl: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/, "Only JPEG, PNG, or WebP data URLs are supported")
    .refine((value) => value.length <= 8_500_000, "The image is larger than the allowed limit"),
  consent: z.literal(true),
});

export type TryOnInput = z.infer<typeof tryOnInputSchema>;

export function parsePhotoDataUrl(value: string) {
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], encoded: match[2] };
}

export const TRY_ON_ERROR_MESSAGE = "Virtual Try-On is temporarily unavailable. Please try again.";
