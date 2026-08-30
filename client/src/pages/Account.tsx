import { ArrowUpRight, LogOut, Package, UserRound } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import StoreHeader from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/products";

const statusLabels: Record<string, string> = { pending: "جديد", confirmed: "مؤكد", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

export default function Account() {
  const { user, loading: authLoading, logout } = useAuth();
  const ordersQuery = trpc.orders.mine.useQuery(undefined, { enabled: Boolean(user) });
  const loyaltyQuery = trpc.growth.loyalty.useQuery(undefined, { enabled: Boolean(user) });

  if (authLoading) return <div className="account-page"><StoreHeader meta="حساب العميل" /><main className="container account-state">جاري تحميل الحساب...</main></div>;
  if (!user) return <div className="account-page"><StoreHeader meta="حساب العميل" /><main className="container account-state"><UserRound size={34} /><p>سجّل الدخول لمتابعة طلباتك وبيانات حسابك.</p><button className="account-primary-action" onClick={() => startLogin()}>تسجيل الدخول</button></main></div>;

  return <div className="account-page"><StoreHeader meta="حساب العميل" /><main className="container account-shell">
    <header className="account-header"><div><p className="kicker"><span className="red-block" /> حسابي / مرج</p><h1>حسابي.</h1><p>بياناتك وطلباتك في مكان واحد، بدون تعقيد.</p></div><button className="account-secondary-action" onClick={() => void logout()}><LogOut size={16} /> تسجيل الخروج</button></header>
    <section className="account-grid"><article className="account-profile"><UserRound size={22} /><p className="eyebrow">PROFILE</p><h2>{user.name || "عميل مرج"}</h2><p>{user.email || "لا يوجد بريد مسجل"}</p><small>حساب مصادق عليه عبر Manus OAuth.</small></article><article className="account-profile loyalty-card"><p className="eyebrow">MARJ POINTS</p><h2>{loyaltyQuery.isLoading ? "…" : `${(loyaltyQuery.data?.points ?? 0).toLocaleString("ar-EG")} نقطة`}</h2><p>كل نقطة = 1 ج.م خصم في checkout.</p><small>تُضاف النقاط تلقائيًا بعد تسليم الطلب، ولا تُمنح عند إنشاء الطلب فقط.</small></article><article className="account-orders"><div className="account-section-heading"><div><p className="eyebrow">ORDER HISTORY</p><h2>طلباتي</h2></div><Package size={22} /></div>{ordersQuery.isLoading ? <p className="account-muted">جاري تحميل الطلبات...</p> : ordersQuery.error ? <p className="account-error">تعذر تحميل الطلبات حاليًا.</p> : !ordersQuery.data?.length ? <div className="account-empty"><p>لا توجد طلبات مرتبطة بهذا الحساب بعد.</p><Link href="/" className="account-primary-action">استكشف المنتجات <ArrowUpRight size={15} /></Link></div> : <div className="account-order-list">{ordersQuery.data.map((order) => <Link className="account-order-row" href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} key={order.id}><span><strong>{order.orderNumber}</strong><small>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</small></span><b>{formatPrice(order.total)}</b><em className={`account-status account-status-${order.status}`}>{statusLabels[order.status] || order.status}</em><ArrowUpRight size={16} /></Link>)}</div>}</article></section>
  </main></div>;
}
