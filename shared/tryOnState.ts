export type RetrySnapshot = {
  selectedProductId: string;
  photoDataUrl: string;
  resultUrl: string | null;
};

export function preserveTryOnRetryState(snapshot: RetrySnapshot, errorMessage: string) {
  return { ...snapshot, status: "error" as const, errorMessage, resultUrl: null };
}
