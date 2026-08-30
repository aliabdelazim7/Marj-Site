export type ConfigurablePaymentType = "cod" | "manual_transfer" | "online_card";

export function getPaymentActivationError(type: ConfigurablePaymentType, enabled: boolean, instructions: string | null) {
  if (!enabled) return null;
  if (type === "online_card") return "لا يمكن تفعيل البطاقات قبل ربط مزود دفع وحساب تاجر.";
  if (type === "manual_transfer" && !instructions?.trim()) return "أدخل تعليمات التحويل الفعلية قبل تفعيل المحفظة أو التحويل.";
  return null;
}
