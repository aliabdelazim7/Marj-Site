import { normalizeEgyptianWhatsAppNumber } from "./whatsappReceipt";

export type CustomerOrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const statusMessages: Record<CustomerOrderStatus, string> = {
  pending: "استلمنا طلبك وهو الآن بانتظار المراجعة.",
  confirmed: "تم تأكيد طلبك وسنبدأ التجهيز قريبًا.",
  processing: "طلبك قيد التجهيز الآن.",
  shipped: "تم شحن طلبك وهو في الطريق إليك.",
  delivered: "تم تسجيل طلبك كتسليم. نتمنى أن تنال القطعة إعجابك.",
  cancelled: "تم إلغاء طلبك. إذا كنت تحتاج مساعدة، تواصل معنا في هذه المحادثة.",
};

export function buildOrderStatusWhatsAppMessage(input: { orderNumber: string; customerName: string; total: number; status: CustomerOrderStatus }) {
  return `مرحبًا ${input.customerName}،\n\nتحديث طلب مرج رقم ${input.orderNumber}:\n${statusMessages[input.status]}\nإجمالي الطلب: ${input.total.toLocaleString("ar-EG")} ج.م\n\nشكرًا لاختيارك مرج.`;
}

export function buildOrderStatusWhatsAppUrl(input: { orderNumber: string; customerName: string; customerPhone: string; total: number; status: CustomerOrderStatus }) {
  const number = normalizeEgyptianWhatsAppNumber(input.customerPhone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderStatusWhatsAppMessage(input))}`;
}
