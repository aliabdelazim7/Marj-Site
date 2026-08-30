import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, CheckCircle2, Loader2, MessageCircle, Paperclip, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@shared/products";
import { useCart } from "@/contexts/CartContext";
import { isValidCustomerEmail } from "@shared/commerce";
import StoreHeader from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";

const initialForm = { customerName: "", email: "", phone: "", address: "", city: "القاهرة", notes: "" };
const EGYPTIAN_MOBILE_PATTERN = /^01[0125]\d{8}$/;
type WhatsAppHandoff = { number: string; message: string };
type SubmittedOrder = { orderNumber: string; total: number; paymentInstructions: string | null; whatsappHandoff: WhatsAppHandoff | null };
function getCommerceSessionKey() { const key = "marj-commerce-session"; const existing = typeof window === "undefined" ? null : localStorage.getItem(key); if (existing) return existing; const next = `marj-${crypto.randomUUID()}`; if (typeof window !== "undefined") localStorage.setItem(key, next); return next; }

export default function Checkout() {
  const [, navigate] = useLocation();
  const cart = useCart();
  const settingsQuery = trpc.store.settings.useQuery();
  const zonesQuery = trpc.store.shippingZones.useQuery();
  const methodsQuery = trpc.store.paymentMethods.useQuery();
  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [consent, setConsent] = useState(false);
  const [order, setOrder] = useState<SubmittedOrder | null>(null);
  const [error, setError] = useState("");
  const createOrder = trpc.orders.create.useMutation({ onSuccess: (result) => { cart.clear(); setOrder({ orderNumber: result.orderNumber, total: result.total, paymentInstructions: result.paymentInstructions ?? null, whatsappHandoff: result.whatsappHandoff ?? null }); }, onError: (mutationError) => setError(mutationError.message) });
  const commerceEvent = trpc.growth.event.useMutation();
  const loyaltyQuery = trpc.growth.loyalty.useQuery(undefined, { retry: false });
  useEffect(() => {
    if (window.location.hash === "#checkout-consent") document.getElementById("checkout-consent")?.scrollIntoView({ block: "center" });
  }, []);
  useEffect(() => {
    if (zonesQuery.data?.length && !zonesQuery.data.some((zone) => zone.governorate === form.city)) setForm((current) => ({ ...current, city: zonesQuery.data![0].governorate }));
  }, [form.city, zonesQuery.data]);
  useEffect(() => {
    if (methodsQuery.data?.length && !methodsQuery.data.some((method) => method.code === paymentMethod)) setPaymentMethod(methodsQuery.data[0].code);
  }, [methodsQuery.data, paymentMethod]);
  const pricedLines = cart.lines.map((line) => { const product = cart.getProduct(line.productId); const variant = product?.variants?.find((candidate) => candidate.size === line.size && candidate.status === "active"); return { ...line, product, unitPrice: variant?.priceOverride ?? product?.price ?? 0 }; }).filter((line) => line.product);
  const selectedZone = zonesQuery.data?.find((zone) => zone.governorate === form.city) ?? null;
  const selectedPayment = methodsQuery.data?.find((method) => method.code === paymentMethod) ?? null;
  const pricedSubtotal = pricedLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const couponPreview = trpc.growth.couponPreview.useQuery({ code: couponCode.trim(), subtotal: pricedSubtotal }, { enabled: couponCode.trim().length >= 2, retry: false });
  const couponDiscount = couponPreview.data?.ok ? couponPreview.data.discount : 0;
  const availablePoints = loyaltyQuery.data?.points ?? 0;
  const appliedPoints = Math.min(Math.max(0, loyaltyPoints), availablePoints, Math.max(0, pricedSubtotal - couponDiscount));
  const freeShipping = settingsQuery.data?.freeShippingThreshold !== null && settingsQuery.data?.freeShippingThreshold !== undefined && pricedSubtotal - couponDiscount - appliedPoints >= settingsQuery.data.freeShippingThreshold;
  const checkoutShipping = pricedSubtotal === 0 || freeShipping ? 0 : (selectedZone?.fee ?? 0);
  const checkoutTotal = Math.max(0, pricedSubtotal - couponDiscount - appliedPoints) + checkoutShipping;
  const update = (field: keyof typeof initialForm, value: string) => { setForm((current) => ({ ...current, [field]: value })); setError(""); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!pricedLines.length) { navigate("/cart"); return; }
    if (!isValidCustomerEmail(form.email)) { setError("اكتب بريدًا إلكترونيًا صحيحًا."); return; }
    if (!EGYPTIAN_MOBILE_PATTERN.test(form.phone.trim())) { setError("اكتب رقم هاتف مصري صحيحًا من 11 رقمًا ويبدأ بـ 01."); return; }
    if (!selectedZone) { setError("اختر محافظة مفعلة للشحن."); return; }
    if (!selectedPayment) { setError("اختر طريقة دفع مفعلة."); return; }
    if (!consent) { setError("يجب الموافقة على استخدام بياناتك لإرسال الطلب."); return; }
    if (couponCode.trim() && !couponPreview.data?.ok) { setError(couponPreview.data && !couponPreview.data.ok ? couponPreview.data.message : "تحقق من كود الخصم ثم أعد المحاولة."); return; }
    commerceEvent.mutate({ sessionKey: getCommerceSessionKey(), eventName: "checkout_started" });
    createOrder.mutate({ ...form, paymentMethod, couponCode: couponCode.trim() || undefined, loyaltyPoints: appliedPoints, consent: true, items: pricedLines.map((line) => ({ productId: line.productId, size: line.size as "S" | "M" | "L" | "XL", quantity: line.quantity })) });
  };
  if (order) return <OrderSuccess order={order} />;
  if (!pricedLines.length) return <div className="site-shell min-h-screen"><StoreHeader meta="CHECKOUT / EMPTY" /><main className="container checkout-page"><div className="empty-commerce"><h2>لا يمكن إتمام طلب بسلة فارغة</h2><Link href="/cart"><Button>العودة للسلة</Button></Link></div></main></div>;
  return <div className="site-shell min-h-screen"><StoreHeader meta="إتمام آمن وبسيط" /><main className="container checkout-page"><div className="commerce-heading"><div><p className="kicker"><span className="red-block" /> checkout / 01</p><h1>بيانات<br /><em>التوصيل.</em></h1></div><p className="section-aside">{settingsQuery.data?.shippingScope ?? "الشحن متاح لجميع محافظات مصر"}<br />اختر المحافظة وطريقة الدفع قبل تأكيد الطلب.</p></div><div className="checkout-layout"><form className="checkout-form" noValidate onSubmit={submit}><div className="form-section"><p className="eyebrow">بيانات العميل</p><label>الاسم بالكامل<input required value={form.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="اكتب اسمك" /></label><div className="form-grid"><label>البريد الإلكتروني<input required type="text" inputMode="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@example.com" /></label><label>رقم الهاتف<input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="01xxxxxxxxx" /></label></div></div><div className="form-section checkout-rewards"><p className="eyebrow">خصمك ونقاطك</p><label>كود الخصم<input value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setError(""); }} placeholder="MARJ10" /></label>{couponCode.trim() ? <small className={couponPreview.data?.ok ? "coupon-valid" : "coupon-invalid"}>{couponPreview.isFetching ? "جاري التحقق..." : couponPreview.data?.ok ? `تم تطبيق خصم ${formatPrice(couponPreview.data.discount)}` : couponPreview.data?.message || "الكود غير صالح"}</small> : null}{loyaltyQuery.data ? <label>نقاط الولاء المتاحة: {availablePoints.toLocaleString("ar-EG")} نقطة<input type="number" min="0" max={Math.min(availablePoints, pricedSubtotal - couponDiscount)} value={loyaltyPoints} onChange={(event) => setLoyaltyPoints(Number(event.target.value) || 0)} /><small>كل نقطة = 1 ج.م خصم. تُمنح النقاط بعد تسليم الطلب.</small></label> : <small>سجّل الدخول لاستخدام نقاط الولاء وحفظ المفضلة في حسابك.</small>}</div><div className="form-section"><p className="eyebrow">عنوان التوصيل</p><div className="form-grid"><label>المحافظة<select required value={form.city} onChange={(event) => update("city", event.target.value)} disabled={zonesQuery.isLoading || !zonesQuery.data?.length}>{zonesQuery.isLoading ? <option>جاري تحميل المحافظات...</option> : zonesQuery.data?.map((zone) => <option key={zone.id} value={zone.governorate}>{zone.governorate} — {zone.fee ? formatPrice(zone.fee) : "شحن مجاني"}</option>)}</select>{selectedZone?.deliveryNote ? <span>{selectedZone.deliveryNote}</span> : null}</label><label>العنوان بالتفصيل<input required value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="الشارع، رقم المبنى، الدور" /></label></div><label>ملاحظات إضافية <span>(اختياري)</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="أي تفاصيل تساعدنا في التوصيل" rows={3} /></label></div><div className="form-section"><p className="eyebrow">طريقة الدفع</p>{methodsQuery.isLoading ? <LoadingStateCheckout label="جاري تحميل طرق الدفع..." /> : !methodsQuery.data?.length ? <div className="error-message" role="alert">لا توجد طريقة دفع مفعلة حاليًا. راجع إدارة المتجر.</div> : <div className="checkout-payment-list">{methodsQuery.data.map((method) => <label className={`checkout-payment-option ${paymentMethod === method.code ? "selected" : ""}`} key={method.id}><input type="radio" name="payment-method" value={method.code} checked={paymentMethod === method.code} onChange={() => { setPaymentMethod(method.code); setError(""); }} /><span><strong>{method.label}</strong><small>{method.instructions || (method.type === "cod" ? "يتم الدفع عند الاستلام." : "ستظهر تعليمات الدفع بعد اختيار الطريقة.")}</small></span></label>)}</div>}{selectedPayment?.instructions ? <p className="checkout-payment-instructions">{selectedPayment.instructions}</p> : null}</div><label id="checkout-consent" className="checkout-consent"><input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setError(""); }} /><ShieldCheck size={20} /><span>أوافق على استخدام بياناتي للتواصل بخصوص هذا الطلب فقط. لا يتم حفظ صور Virtual Try-On ضمن الطلب.</span><strong className="consent-status" aria-live="polite">{consent ? "تم تأكيد الموافقة." : "الموافقة مطلوبة لإرسال الطلب."}</strong></label>{error && <div className="error-message" role="alert">{error}</div>}<Button className="submit-order" type="submit" disabled={createOrder.isPending || zonesQuery.isLoading || methodsQuery.isLoading}>{createOrder.isPending ? <><Loader2 className="spin" size={18} /> جاري تسجيل الطلب</> : <>تأكيد الطلب — {formatPrice(checkoutTotal)} <ArrowDownLeft size={18} /></>}</Button></form><aside className="order-summary checkout-summary"><p className="eyebrow">مراجعة القطع</p>{pricedLines.map((line) => <div className="mini-line" key={`${line.productId}-${line.size}`}><img src={line.product!.images[0]} alt="" /><span>{line.product!.nameArabic}<small>مقاس {line.size} · ×{line.quantity}</small></span><strong>{formatPrice(line.unitPrice * line.quantity)}</strong></div>)}<hr /><div><span>الإجمالي الفرعي</span><strong>{formatPrice(pricedSubtotal)}</strong></div>{couponDiscount ? <div><span>خصم الكوبون</span><strong>−{formatPrice(couponDiscount)}</strong></div> : null}{appliedPoints ? <div><span>خصم نقاط الولاء</span><strong>−{formatPrice(appliedPoints)}</strong></div> : null}<div><span>الشحن {selectedZone ? `— ${selectedZone.governorate}` : ""}</span><strong>{checkoutShipping ? formatPrice(checkoutShipping) : "مجاني"}</strong></div><div className="summary-total"><span>الإجمالي</span><strong>{formatPrice(checkoutTotal)}</strong></div><p className="summary-note">{freeShipping ? "تم تطبيق حد الشحن المجاني من إعدادات المتجر." : selectedZone?.deliveryNote || settingsQuery.data?.shippingNotice}</p><Link href="/policies" className="summary-policy-link">الشحن والاستبدال ووسائل الدفع</Link></aside></div></main></div>;
}

function OrderSuccess({ order }: { order: SubmittedOrder }) {
  return <div className="site-shell min-h-screen"><StoreHeader meta="ORDER / CONFIRMED" /><main className="container checkout-page"><div className="success-order"><CheckCircle2 size={54} /><p className="kicker">تم استلام طلبك</p><h1>شكرًا، <em>اختيارك اتسجل.</em></h1><p>رقم الطلب الخاص بك هو <strong>{order.orderNumber}</strong>. هنتواصل معك لتأكيد التفاصيل قبل الشحن.</p>{order.paymentInstructions ? <p className="checkout-payment-instructions">{order.paymentInstructions}</p> : null}{order.whatsappHandoff ? <ManualPaymentWhatsAppHandoff handoff={order.whatsappHandoff} /> : null}<strong className="order-total">الإجمالي: {formatPrice(order.total)}</strong><div className="success-actions"><Link href="/"><Button>العودة للمجموعة <ArrowDownLeft size={17} /></Button></Link><Link href="/track-order" className="text-link">تتبع الطلب لاحقًا</Link></div></div></main></div>;
}

function ManualPaymentWhatsAppHandoff({ handoff }: { handoff: WhatsAppHandoff }) {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [shareError, setShareError] = useState("");
  const whatsappUrl = `https://wa.me/${handoff.number}?text=${encodeURIComponent(handoff.message)}`;
  const shareReceipt = async () => {
    if (!receipt || typeof navigator.share !== "function" || typeof navigator.canShare !== "function" || !navigator.canShare({ files: [receipt] })) return;
    try { await navigator.share({ title: "إيصال تحويل مرج", text: handoff.message, files: [receipt] }); }
    catch (error) { if ((error as DOMException).name !== "AbortError") setShareError("تعذر فتح المشاركة. افتح WhatsApp وأرفق الصورة يدويًا."); }
  };
  return <section className="manual-payment-whatsapp" aria-label="إرسال إيصال التحويل"><div><MessageCircle size={24} /><p className="eyebrow">إيصال التحويل</p></div><h2>ابعت Screenshot التحويل على WhatsApp</h2><p>زر WhatsApp يفتح محادثة المتجر برسالة فيها رقم الطلب والإجمالي تلقائيًا. لا نخزن Screenshot التحويل داخل مرج.</p><label className="receipt-upload"><Paperclip size={16} /><span>{receipt ? receipt.name : "اختَر Screenshot التحويل (اختياري)"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setReceipt(event.target.files?.[0] ?? null); setShareError(""); }} /></label><div className="manual-payment-actions"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-link"><MessageCircle size={18} /> فتح WhatsApp بالرسالة الجاهزة</a>{receipt && typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [receipt] }) ? <button type="button" className="share-receipt-button" onClick={() => { void shareReceipt(); }}>مشاركة Screenshot والرسالة</button> : null}</div><small>الإرسال النهائي وإرفاق الصورة يتمان من WhatsApp وبموافقتك. {receipt ? "يمكنك استخدام المشاركة إن ظهرت، أو إرفاق الصورة يدويًا بعد فتح المحادثة." : "بعد فتح المحادثة أرفق Screenshot ثم اضغط إرسال."}</small>{shareError ? <p className="manual-payment-error" role="alert">{shareError}</p> : null}</section>;
}

function LoadingStateCheckout({ label }: { label: string }) {
  return <p className="summary-note">{label}</p>;
}
