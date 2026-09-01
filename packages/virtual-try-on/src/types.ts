export type TryOnRequest = {
  productId: string;
  photoDataUrl: string;
  consent: true;
};

export type TryOnResponse = {
  url: string;
  productId: string;
  productName?: string;
};

export type TryOnStatus = "idle" | "reading" | "generating" | "success" | "error";

export type TryOnProduct = {
  id: string;
  name: string;
  imageUrl?: string;
};

export type TryOnEndpoint = (input: TryOnRequest) => Promise<TryOnResponse>;
