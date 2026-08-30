import "@google/model-viewer";
import { createElement, useEffect, useState } from "react";
import { ArrowRight, Check, Hand, Heart, Ruler, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice, getHoodieBySlug, hoodieProducts, type HoodieProduct } from "@shared/products";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import StoreHeader from "@/components/StoreHeader";
import { isDirectModelUrl } from "@shared/model3d";

function ProductViewer({ product }: { product: HoodieProduct }) {
  const [rotation, setRotation] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = (event.clientX - bounds.left) / bounds.width;
    setRotation(Math.round((progress - 0.5) * 18));
  };
  if (!product) return null;
  return <div className="detail-media" onPointerDown={() => setDragging(true)} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} onPointerMove={handlePointerMove}>
    <span className="detail-index">PRODUCT / 3D VIEW</span>
    <div className="product-viewer-stage" style={{ transform: `perspective(900px) rotateY(${rotation}deg)` }}><span className="viewer-depth" /><img src={product.images[selectedAngle]} alt={`عرض تفاعلي لهودي ${product.nameArabic}`} /></div>
    <div className="viewer-hint"><Hand size={15} /> اسحب يمين / شمال لرؤية القطعة</div>
    <div className="concept-note">صور العرض الحالية concept photography للتوضيح البصري. سيتم استبدالها بصور المنتج الفعلية عند اعتماد المخزون.</div>
    <div className="viewer-thumbnails">{product.images.map((image, index) => { const asset = index ? product.media?.filter((item) => item.mediaType !== "model3d")[index - 1] : undefined; const label = index === 0 ? "الواجهة الأمامية" : asset?.mediaType === "back" ? "الجهة الخلفية / الطباعة" : asset?.mediaType === "front" ? "الواجهة الأمامية" : "زاوية إضافية"; return <button key={image} className={selectedAngle === index ? "active" : ""} onClick={(event) => { event.stopPropagation(); setSelectedAngle(index); setRotation(index ? 9 : 0); }}><img src={image} alt={label} /><span>{label}</span></button>; })}</div>
    {product.model3dUrl ? <ProductModelViewer url={product.model3dUrl} productName={product.nameArabic} /> : <div className="product-model-note">سيظهر عارض 3D هنا بمجرد رفع ملف GLB أو GLTF للمنتج من لوحة الإدارة.</div>}
    <div className="media-caption"><span>INTERACTIVE VIEW</span><span>MARJ OBJECT STUDY</span></div>
  </div>;
}

function ProductModelViewer({ url, productName }: { url: string; productName: string }) {
  const [failed, setFailed] = useState(false);
  if (!isDirectModelUrl(url)) return <div className="product-model-note is-error">هذا المنتج يحتوي على رابط 3D غير مباشر. يجب أن يكون الملف بصيغة GLB أو GLTF، وليس صفحة متجر أو viewer.</div>;
  if (failed) return <div className="product-model-note is-error">تعذر تحميل نموذج 3D. تأكد أن الملف GLB/GLTF عام وصالح، ثم أعد رفعه من لوحة الإدارة.</div>;
  return <section className="product-model-viewer"><div className="model-viewer-heading"><span>3D OBJECT</span><strong>حرّك المنتج وشوف التفاصيل</strong></div>{createElement("model-viewer", { src: url, alt: `نموذج ثلاثي الأبعاد لهودي ${productName}`, "camera-controls": "", "auto-rotate": "", "shadow-intensity": "1", onError: () => setFailed(true), style: { width: "100%", height: "420px", background: "#f5f2ec" } })}</section>;
}

function ProductReviews({ productId }: { productId?: number }) {
  const reviewsQuery = trpc.growth.reviews.useQuery({ productId: productId ?? 0 }, { enabled: Boolean(productId) });
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ orderNumber: "", email: "", rating: 5, body: "" });
  const submit = trpc.growth.submitReview.useMutation({ onSuccess: () => { toast.success("شكرًا لك. أُرسلت مراجعتك للمراجعة قبل النشر."); setForm({ orderNumber: "", email: "", rating: 5, body: "" }); void utils.growth.reviews.invalidate({ productId }); }, onError: (error) => toast.error(error.message) });
  if (!productId) return <section className="product-reviews"><div className="section-heading"><div><p className="kicker">03 / CUSTOMER REVIEWS</p><h2>مراجعات المشترين.</h2></div></div><p className="product-model-note">تتاح مراجعات المشترين للمنتجات المنشورة من قاعدة بيانات المتجر فقط.</p></section>;
  return <section className="product-reviews"><div className="section-heading"><div><p className="kicker">03 / VERIFIED REVIEWS</p><h2>مراجعات<br /><em>حقيقية فقط.</em></h2></div><p className="section-aside">لا نعرض إلا مراجعات مشتريات تم تسليمها ووافق عليها المتجر.</p></div><div className="product-reviews-grid"><div className="review-list">{reviewsQuery.isLoading ? <p>جاري تحميل المراجعات...</p> : !reviewsQuery.data?.length ? <p className="product-model-note">لا توجد مراجعات منشورة لهذه القطعة حتى الآن.</p> : reviewsQuery.data.map((review) => <article className="review-card" key={review.id}><div><strong>{review.customerName}</strong><span aria-label={`${review.rating} من 5`}>{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</span></div><p>{review.body}</p></article>)}</div><form className="review-form" onSubmit={(event) => { event.preventDefault(); submit.mutate({ ...form, productId }); }}><p className="eyebrow">راجِع شراءك</p><p>أدخل رقم طلب تم تسليمه وبريد الطلب. تُراجع مشاركتك قبل نشرها.</p><label>رقم الطلب<input required value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value.toUpperCase() })} placeholder="HF-2026-XXXXXXXX" /></label><label>البريد الإلكتروني<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" /></label><label>تقييمك<select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label><label>مراجعتك<textarea required minLength={12} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows={4} placeholder="اكتب تجربتك الفعلية مع القطعة" /></label><Button type="submit" disabled={submit.isPending}>{submit.isPending ? "جاري الإرسال..." : "إرسال للمراجعة"}</Button></form></div></section>;
}

function getCommerceSessionKey() {
  const key = "marj-commerce-session";
  const existing = typeof window === "undefined" ? null : window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `marj-${crypto.randomUUID()}`;
  if (typeof window !== "undefined") window.localStorage.setItem(key, next);
  return next;
}

export default function ProductDetails() {
  const [, params] = useRoute("/product/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ?? "";
  const productQuery = trpc.products.getBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const product = (productQuery.data ?? getHoodieBySlug(slug)) as HoodieProduct | undefined;
  const productsQuery = trpc.products.list.useQuery();
  const relatedProducts = (productsQuery.data ?? hoodieProducts) as HoodieProduct[];
  const cart = useCart();
  const wishlist = useWishlist();
  const { language } = useLanguage();
  const favorite = wishlist.has(product?.id ?? "", product?.databaseId);
  const [selectedSize, setSelectedSize] = useState("M");
  const commerceEvent = trpc.growth.event.useMutation();
  useEffect(() => {
    if (!product?.databaseId) return;
    commerceEvent.mutate({ sessionKey: getCommerceSessionKey(), eventName: "product_view", productId: product.databaseId });
    const previousTitle = document.title;
    document.title = `${product.nameArabic} | مرج`;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "marj-product-jsonld";
    const availability = product.availability.includes("نفدت") ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
    script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.nameArabic, alternateName: product.name, description: product.longDescription, image: product.images, offers: { "@type": "Offer", priceCurrency: "EGP", price: product.price, availability } }).replace(/</g, "\\u003c");
    document.head.appendChild(script);
    return () => { document.title = previousTitle; script.remove(); };
  }, [product?.databaseId, product?.slug]);

  if (!product) {
    return <main className="detail-not-found container"><p className="kicker">404 / غير موجود</p><h1>القطعة دي مش موجودة.</h1><Link href="/">ارجع للكتالوج</Link></main>;
  }

  return (
    <div className="site-shell detail-page">
      <StoreHeader meta={`PRODUCT / ${product.name}`} tryOnHref={`/?tryOn=${product.slug}#try-on`} />
      <main className="container">
        <div className="detail-breadcrumb"><Link href="/">المجموعة</Link><ArrowRight size={14} />{product.nameArabic}</div>
        <section className="detail-hero">
          <ProductViewer product={product} />
          <div className="detail-copy"><p className="kicker"><span className="red-block" /> {product.name} · {product.availability}</p><h1>{product.nameArabic}</h1><p className="detail-price">{formatPrice(product.price)} <span className="availability-badge">{product.availability}</span></p><p className="detail-description">{product.longDescription}</p><div className="detail-rule" /><div className="detail-meta"><span>اللون</span><strong>{product.color}</strong><span>القصة</span><strong>{product.fit}</strong><span>الخامة</span><strong>{product.fabric}</strong></div><div className="size-block"><div><span>اختار المقاس</span><button className="size-guide"><Ruler size={15} /> دليل المقاسات</button></div><div className="size-list">{product.sizes.map((size) => <button type="button" key={size} className={selectedSize === size ? "active" : ""} onClick={() => setSelectedSize(size)}>{size}</button>)}</div></div><div className="detail-buy-actions"><Button id="detail-add-to-cart" className="detail-cart-button" onClick={() => { const displayName = language === "en" ? product.name : product.nameArabic; cart.add(product, selectedSize); toast.success(language === "en" ? "Item added to cart" : "تمت إضافة القطعة للسلة", { description: `${displayName} — ${language === "en" ? "Size" : "مقاس"} ${selectedSize}`, action: { label: language === "en" ? "View cart" : "عرض السلة", onClick: () => navigate("/cart") } }); }}>{language === "en" ? `Add size ${selectedSize}` : `أضف مقاس ${selectedSize}`} <span>↙</span></Button><Link href={`/?tryOn=${product.slug}#try-on`}><Button className="detail-try-button">شوفه عليك مجانًا <Sparkles size={17} /></Button></Link><button className={`detail-favorite-button ${favorite ? "is-favorite" : ""}`} onClick={() => wishlist.toggle(product.id, product.databaseId)} aria-label={favorite ? `إزالة ${product.nameArabic} من المفضلة` : `إضافة ${product.nameArabic} للمفضلة`}><Heart size={18} fill={favorite ? "currentColor" : "none"} /> {favorite ? "محفوظ" : "مفضلة"}</button></div><p className="detail-assurance"><ShieldCheck size={16} /> تجربة Virtual Try-On مجانية — اختار صورتك وشوف القطعة قبل القرار.</p></div>
        </section>
        <section className="detail-information"><div className="section-label"><span>DETAILS / 01</span><span>تفاصيل القطعة</span></div><div className="detail-info-grid"><div><h2>مصممة<br /><em>للاستخدام.</em></h2></div><div className="spec-list">{product.details.map((detail) => <p key={detail}><Check size={16} />{detail}</p>)}<p><Check size={16} />العناية: {product.care}</p></div></div></section>
        <ProductReviews productId={product.databaseId} />
        <section className="related-products"><div className="section-heading"><div><p className="kicker">02 / قطع أخرى</p><h2>كمّل المجموعة.</h2></div></div><div className="related-grid">{relatedProducts.filter((item) => item.id !== product.id).slice(0, 3).map((item) => <Link key={item.id} href={`/product/${item.slug}`} className="related-card"><img src={item.images[0]} alt={item.nameArabic} loading="lazy" /><span>{item.nameArabic}</span><strong>{formatPrice(item.price)}</strong></Link>)}</div></section>
      </main>
      <footer className="site-footer container"><Link className="brand" href="/"><span className="brand-wordmark">مرج</span></Link><span>© 2026 MARJ</span></footer>
    </div>
  );
}
