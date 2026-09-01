import { parsePhotoDataUrl } from "./tryOnValidation";

export type GeneratedImage = { b64Json: string; mimeType: string };

export type ImageUploader = (args: {
  bytes: Buffer;
  mimeType: string;
  key: string;
}) => Promise<{ url: string }>;

export type ManusForgeGeneratorOptions = {
  forgeApiUrl: string;
  forgeApiKey: string;
  uploadGeneratedImage: ImageUploader;
  model?: string;
  quality?: string;
};

export function createManusForgeGenerator(options: ManusForgeGeneratorOptions) {
  return async (args: { prompt: string; photoDataUrl: string }) => {
    if (!options.forgeApiUrl || !options.forgeApiKey) {
      throw new Error("The image provider is not configured");
    }

    const { mimeType, encoded } = parsePhotoDataUrl(args.photoDataUrl);
    const baseUrl = options.forgeApiUrl.endsWith("/") ? options.forgeApiUrl : `${options.forgeApiUrl}/`;
    const endpoint = new URL("images.v1.ImageService/GenerateImage", baseUrl).toString();
    const model = options.model ?? "MODEL_GPT_IMAGE_2";
    const quality = options.quality ?? "medium";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "connect-protocol-version": "1",
        authorization: `Bearer ${options.forgeApiKey}`,
      },
      body: JSON.stringify({
        prompt: args.prompt,
        original_images: [{ b64Json: encoded, mimeType }],
        model,
        quality,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image provider failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { image?: GeneratedImage };
    if (!payload.image?.b64Json || !payload.image.mimeType) {
      throw new Error("Image provider returned an invalid image");
    }

    const bytes = Buffer.from(payload.image.b64Json, "base64");
    return options.uploadGeneratedImage({
      bytes,
      mimeType: payload.image.mimeType,
      key: `virtual-try-on/${Date.now()}.png`,
    });
  };
}
