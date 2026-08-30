const EGYPTIAN_WHATSAPP_PATTERN = /^20(10|11|12|15)\d{8}$/;

export function normalizeEgyptianWhatsAppNumber(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("00") ? digits.slice(2) : digits.startsWith("0") ? `20${digits.slice(1)}` : digits;
  return EGYPTIAN_WHATSAPP_PATTERN.test(normalized) ? normalized : null;
}

export function buildManualPaymentWhatsAppMessage(input: { orderNumber: string; total: number; paymentLabel: string; customerName: string; customerPhone: string; items: Array<{ productName: string; size: string; quantity: number }> }) {
  const itemLines = input.items.map((item) => `- ${item.productName} | مقاس ${item.size} | ×${item.quantity}`).join("\n");
  return `مرحبًا مرج،\n\nأرسلت تحويل ${input.paymentLabel} للطلب ${input.orderNumber}.\nالإجمالي: ${input.total.toLocaleString("ar-EG")} ج.م\nالاسم: ${input.customerName}\nرقم العميل: ${input.customerPhone}\n\nالقطع:\n${itemLines}\n\nأرفقت Screenshot التحويل للمراجعة. شكرًا.`;
}
