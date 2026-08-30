export function calculateShippingForGovernorate(subtotal: number, governorateFee: number, freeShippingThreshold: number | null | undefined) {
  if (subtotal <= 0) return 0;
  if (freeShippingThreshold !== null && freeShippingThreshold !== undefined && subtotal >= freeShippingThreshold) return 0;
  return governorateFee;
}
