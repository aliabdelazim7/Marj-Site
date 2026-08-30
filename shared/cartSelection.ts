export function preferredQuickAddSize(sizes: readonly string[]): string {
  return sizes.includes("M") ? "M" : (sizes[0] ?? "");
}
