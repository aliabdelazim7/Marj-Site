import { useState } from "react";
import { ArrowDownLeft, Check, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@shared/products";
import { trpc } from "@/lib/trpc";
import StoreHeader from "@/components/StoreHeader";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
const statusLabels: Record<string, string> = { pending: "استلمنا الطلب", confirmed: "أكدنا التفاصيل", processing: "بنجهز طلبك", shipped: "خرج للتوصيل", delivered: "تم التسليم" };
export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const lookup = trpc.orders.lookup.useQuery({ orderNumber: orderNumber.trim(), email: email.trim() }, { enabled: false, retry: false });
  const submit = (event: React.FormEvent) => { event.preventDefault(); lookup.refetch(); };
  const result = lookup.data;
  const currentIndex = result ? statuses.indexOf(result.order.status) : -1;
  return <div className="site-shell min-h-screen"><StoreHeader meta="ORDER / TRACKING" /><main className="container checkout-page"><div className="commerce-heading"><div><p className="kicker"><span className="red-block" /> متابعة الطلب</p><h1>أين وصل<br /><em>طلبك؟</em></h1></div><p className="section-aside">اكتب رقم الطلب والبريد المستخدم<br />عند إتمام الشراء.</p></div><div className="track-layout"><form className="track-form" onSubmit={submit}><label>رقم الطلب<input required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="HF-2026-XXXXXXXX" /></label><label>البريد الإلكتروني<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label><Button type="submit" disabled={lookup.isFetching}>{lookup.isFetching ? "جاري البحث..." : <>ابحث عن الطلب <Search size={16} /></>}</Button>{lookup.error && <div className="error-message" role="alert">{lookup.error.message}</div>}</form>{result && <section className="track-result"><div className="track-result-head"><div><p className="eyebrow">{result.order.orderNumber}</p><h2>{statusLabels[result.order.status] || result.order.status}</h2></div><strong>{formatPrice(result.order.total)}</strong></div><div className="status-timeline">{statuses.map((status, index) => <div className={`status-step ${index <= currentIndex ? "done" : ""}`} key={status}><span>{index <= currentIndex ? <Check size={14} /> : index + 1}</span><small>{statusLabels[status]}</small></div>)}</div>{result.order.trackingNumber ? <div className="shipment-tracking"><strong>بيانات الشحن</strong><span>{result.order.shipmentCarrier || "شركة الشحن"} · <b dir="ltr">{result.order.trackingNumber}</b></span>{result.order.trackingUrl ? <a href={result.order.trackingUrl} target="_blank" rel="noreferrer">تتبع البوليصة لدى شركة الشحن</a> : null}</div> : null}<div className="track-items">{result.items.map((item) => <div key={item.id}><span>{item.productName} · {item.size} × {item.quantity}</span><strong>{formatPrice(item.lineTotal)}</strong></div>)}</div><p className="track-note">الحالة الحالية لا تعني إتمام الدفع؛ الدفع عند الاستلام ويتم تأكيده هاتفيًا قبل الشحن.</p></section>}</div>{!result && !lookup.isFetching && <div className="track-help"><ArrowDownLeft size={18} />بعد تسجيل الطلب، ستجد رقم المتابعة في شاشة التأكيد.</div>}</main></div>;
}
