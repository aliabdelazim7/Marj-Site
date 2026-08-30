import { CreditCard, RefreshCw, Truck } from "lucide-react";
import StoreHeader from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";

export default function StorePolicies() {
  const settingsQuery = trpc.store.settings.useQuery();
  const settings = settingsQuery.data;
  return <div className="site-shell min-h-screen"><StoreHeader />
    <main className="container policy-page">
      <header className="commerce-heading"><div><p className="kicker"><span className="red-block" /> مرج / المعلومات المهمة</p><h1>الشحن<br /><em>والاستبدال.</em></h1></div><p className="section-aside">نوضح لك طريقة وصول طلبك وما تحتاج معرفته قبل الإتمام.</p></header>
      {settingsQuery.isLoading ? <div className="policy-loading">جاري تحميل الإعدادات...</div> : !settings ? <div className="policy-loading">تعذر تحميل إعدادات المتجر حاليًا.</div> : <section className="policy-grid">
        <article className="policy-card"><Truck size={24} /><p className="eyebrow">SHIPPING / مصر</p><h2>{settings.shippingScope}</h2><p>{settings.shippingNotice}</p>{settings.freeShippingThreshold ? <strong>الشحن مجاني للطلبات من {settings.freeShippingThreshold.toLocaleString("ar-EG")} ج.م.</strong> : <strong>رسوم الشحن تُعرض عند إتمام الطلب.</strong>}</article>
        <article className="policy-card"><RefreshCw size={24} /><p className="eyebrow">RETURNS & EXCHANGES</p><h2>الاستبدال والإرجاع</h2><p>{settings.returnPolicy}</p></article>
        <article className="policy-card"><CreditCard size={24} /><p className="eyebrow">PAYMENT</p><h2>وسائل الدفع</h2><p>{settings.paymentNotice}</p></article>
      </section>}
    </main>
  </div>;
}
