import { ArrowDownLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@shared/products";
import { useCart } from "@/contexts/CartContext";
import StoreHeader from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";

export default function Cart() {
  const { lines, subtotal, update, remove, getProduct } = useCart();
  const settingsQuery = trpc.store.settings.useQuery();
  const pricedLines = lines.map((line) => { const product = getProduct(line.productId); const variant = product?.variants?.find((candidate) => candidate.size === line.size && candidate.status === "active"); return { ...line, product, unitPrice: variant?.priceOverride ?? product?.price ?? 0 }; }).filter((line) => line.product);
  return <div className="site-shell min-h-screen">
    <StoreHeader meta="طلبك يبدأ من اختيار واضح" />
    <main className="container commerce-page">
      <div className="commerce-heading"><div><p className="kicker"><span className="red-block" /> السلة</p><h1>اختياراتك<br /><em>جاهزة.</em></h1></div><p className="section-aside">راجع المقاس والكمية قبل إتمام الطلب.<br />{settingsQuery.data?.shippingScope ?? "الشحن متاح لجميع محافظات مصر"}</p></div>
      {pricedLines.length === 0 ? <div className="empty-commerce"><ShoppingBag size={32} /><h2>السلة لسه فاضية</h2><p>اختار هودي من المجموعة، أو جرّبه عليك أولًا.</p><Link href="/"><Button>استكشف المجموعة <ArrowDownLeft size={17} /></Button></Link></div> : <div className="cart-layout">
        <section className="cart-lines">{pricedLines.map((line) => <article className="cart-line" key={`${line.productId}-${line.size}`}><img src={line.product!.images[0]} alt={line.product!.nameArabic} /><div className="cart-line-copy"><p className="eyebrow">{line.product!.name}</p><h2>{line.product!.nameArabic}</h2><p>{formatPrice(line.unitPrice)} · المقاس {line.size}</p><Link href={`/product/${line.product!.slug}`}>عرض المنتج</Link></div><div className="cart-line-actions"><div className="quantity-control"><button aria-label="تقليل الكمية" onClick={() => update(line.productId, line.size, line.quantity - 1)}><Minus size={15} /></button><strong>{line.quantity}</strong><button aria-label="زيادة الكمية" onClick={() => update(line.productId, line.size, line.quantity + 1)}><Plus size={15} /></button></div><strong>{formatPrice(line.unitPrice * line.quantity)}</strong><button className="icon-danger" aria-label={`حذف ${line.product!.nameArabic}`} onClick={() => remove(line.productId, line.size)}><Trash2 size={17} /></button></div></article>)}</section>
        <aside className="order-summary"><p className="eyebrow">ملخص الطلب</p><div><span>الإجمالي الفرعي</span><strong>{formatPrice(subtotal)}</strong></div><div><span>الشحن</span><strong>يُحدد حسب المحافظة</strong></div><hr /><div className="summary-total"><span>الإجمالي قبل الشحن</span><strong>{formatPrice(subtotal)}</strong></div><Link href="/checkout" className="cart-checkout-cta"><span>إتمام الطلب</span><small>اختر المحافظة وطريقة الدفع</small><ArrowDownLeft size={20} /></Link><p className="summary-note">يظهر رسم الشحن النهائي بعد اختيار المحافظة في صفحة الإتمام. {settingsQuery.data?.paymentNotice ?? "تظهر وسائل الدفع بعد تفعيلها من الإدارة."}</p><Link href="/policies" className="summary-policy-link">الشحن والاستبدال ووسائل الدفع</Link></aside>
      </div>}
    </main>
  </div>;
}
