import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpLeft, Check, Download, FileImage, Heart, Loader2, RefreshCcw, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getHoodieFromTryOnSearch, hoodieProducts, formatPrice, type HoodieProduct } from "@shared/products";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { preserveTryOnRetryState } from "@shared/tryOnState";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import StoreHeader from "@/components/StoreHeader";

type TryOnStatus = "idle" | "ready" | "loading" | "success" | "error";

function HoodieVisual({ product, large = false }: { product: HoodieProduct; large?: boolean }) {
  return (
    <div className={`hoodie-visual ${large ? "hoodie-visual-large" : ""}`} style={{ ["--hoodie-color" as string]: product.colorHex }} aria-label={`صورة توضيحية لهودي ${product.nameArabic}`}>
      <div className="hoodie-hood" />
      <div className="hoodie-body">
        <span className="hoodie-mark">HF</span>
        <span className="hoodie-pocket" />
      </div>
      <span className="hoodie-sleeve hoodie-sleeve-right" />
      <span className="hoodie-sleeve hoodie-sleeve-left" />
    </div>
  );
}

function ProductCard({ product, index, onTryOn }: { product: HoodieProduct; index: number; onTryOn: (product: HoodieProduct, lockContext?: boolean) => void }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const favorite = wishlist.has(product.id, product.databaseId);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="product-card">
      <div className="product-card-media">
        <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
        <Link href={`/product/${product.slug}`} className="product-image-link">{imageFailed ? <ProductImageFallback name={product.nameArabic} /> : <img src={product.images[0]} alt={`هودي ${product.nameArabic}`} loading="eager" onError={() => setImageFailed(true)} />}</Link>
        <span className={`product-dot ${product.accent}`} />
        <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} aria-label={favorite ? `إزالة ${product.nameArabic} من المفضلة` : `إضافة ${product.nameArabic} للمفضلة`} onClick={() => wishlist.toggle(product.id, product.databaseId)}><Heart size={17} fill={favorite ? "currentColor" : "none"} /></button>
      </div>
      <div className="product-card-info">
        <div>
          <p className="eyebrow">{product.name}</p>
          <h3><Link href={`/product/${product.slug}`}>{product.nameArabic}</Link></h3>
        </div>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <p className="product-description">{product.description}</p>
      <div className="card-actions"><Button className="card-buy-button" onClick={() => cart.add(product, "M")}>أضف للسلة <span>↙</span></Button><Button className="card-try-button" variant="outline" onClick={() => onTryOn(product, true)}>جرّبه عليك <ArrowUpLeft size={16} /></Button></div>
    </article>
  );
}

function ProductImageFallback({ name }: { name: string }) {
  return <span className="product-image-fallback" role="img" aria-label={`صورة ${name} قيد الرفع`}><strong>MARJ</strong><small>صورة المنتج قيد الرفع</small></span>;
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<HoodieProduct>(hoodieProducts[0]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<TryOnStatus>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [productContextLocked, setProductContextLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tryOnRef = useRef<HTMLElement>(null);
  const productsQuery = trpc.products.list.useQuery();
  const generateTryOn = trpc.tryOn.generate.useMutation();

  const products = useMemo(() => {
    if (!productsQuery.data?.length) return hoodieProducts;
    return productsQuery.data as HoodieProduct[];
  }, [productsQuery.data]);

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search.split("#")[0]).get("tryOn");
    const requestedProduct = requestedId ? products.find((item) => item.id === requestedId || item.slug === requestedId) ?? getHoodieFromTryOnSearch(window.location.search) : undefined;
    if (requestedProduct) {
      setSelectedProduct(requestedProduct);
      setProductContextLocked(true);
      window.setTimeout(() => document.getElementById("try-on")?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [products]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const chooseProduct = (product: HoodieProduct, lockContext = false) => {
    setSelectedProduct(product);
    if (lockContext) setProductContextLocked(true);
    setResultUrl(null);
    setStatus(photoDataUrl ? "ready" : "idle");
    tryOnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const compressPhoto = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("تعذر قراءة الصورة"));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("تعذر تجهيز الصورة"));
          const compressedReader = new FileReader();
          compressedReader.onerror = () => reject(new Error("تعذر تجهيز الصورة"));
          compressedReader.onload = () => resolve(String(compressedReader.result));
          compressedReader.readAsDataURL(blob);
        }, "image/jpeg", 0.82);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("ارفع صورة بصيغة JPG أو PNG أو WebP فقط.");
      setStatus("error");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setErrorMessage("حجم الصورة كبير. استخدم صورة أقل من 6MB للحصول على تجربة أسرع.");
      setStatus("error");
      return;
    }
    try {
      const compressedPhoto = await compressPhoto(file);
      setPhotoDataUrl(compressedPhoto);
      setPhotoName(file.name);
      setErrorMessage("");
      setResultUrl(null);
      setStatus("ready");
    } catch {
      setErrorMessage("لم نتمكن من تجهيز الصورة. جرّب صورة أخرى.");
      setStatus("error");
    }
  };

  const generate = async () => {
    if (!photoDataUrl) {
      setErrorMessage("اختار صورة واضحة أولًا.");
      setStatus("error");
      return;
    }
    if (!consent) {
      setErrorMessage("لازم توافق على معالجة الصورة قبل البدء.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await generateTryOn.mutateAsync({ productId: selectedProduct.id, photoDataUrl, consent: true });
      setResultUrl(result.url ?? null);
      setStatus("success");
    } catch (error) {
      console.error("[TryOn] generation failed", error);
      const retryState = preserveTryOnRetryState({ selectedProductId: selectedProduct.id, photoDataUrl, resultUrl }, "حصلت مشكلة مؤقتة أثناء التوليد. جرّب مرة ثانية بعد لحظات.");
      setResultUrl(retryState.resultUrl);
      setErrorMessage(retryState.errorMessage);
      setStatus(retryState.status);
    }
  };

  return (
    <div className="site-shell">
      <StoreHeader tryOnHref="/#try-on" />

      <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <p className="kicker"><span className="red-block" /> ملابس يومية، بقرار واضح</p>
            <h1>الهودي<br /><em>اللي عليك.</em></h1>
            <p className="hero-lede">اختار القطعة. ارفع صورتك. شوفها عليك قبل ما تطلبها — مجانًا، وبخطوات بسيطة.</p>
            <div className="hero-actions"><Link className="hero-catalog-link" href="/products">استكشف المنتجات <ArrowDownLeft size={18} /></Link><button className="text-link" onClick={() => scrollTo("try-on")}>ابدأ التجربة المجانية <span>↙</span></button></div>
          </div>
          <div className="hero-art" aria-label="عرض بصري لهودي أسود مع مربع أحمر">
            <span className="hero-coordinate">30° 02′ N / 31° 14′ E</span>
            <div className="hero-red-square" />
            <div className="hero-hoodie-wrap"><img className="hero-product-photo" src={(products[2] ?? hoodieProducts[2]).images[0]} alt="هودي شبكات ليلية" /></div>
            <div className="hero-caption"><span>01</span><span>FORM / FUNCTION</span></div>
          </div>
        </section>

        <section className="principles container" id="story">
          <div className="section-label"><span>01</span><span>الفكرة</span></div>
          <div className="principle-grid"><h2>مش بنبيع شكل.<br /><span>بنصمم اختيار.</span></h2><div className="principle-text"><p>مرج مساحة لقطع يومية مستوحاة من البحر وحركة الموج. كل موديل له شخصية، وكل قرار شراء يبدأ من إنك تشوفه عليك فعلًا.</p><p className="micro-note">MADE FOR THE EVERYDAY / FROM THE SEA, IN EGYPT</p></div></div>
        </section>

        <section className="collection container" id="collection">
          <div className="section-heading"><div><p className="kicker">02 / المجموعة</p><h2>اختار مزاجك.</h2></div><div className="collection-heading-actions"><p className="section-aside">أربع قطع. ألوان واضحة.<br />ولا شيء زائد.</p><Link className="view-all-link" href="/products">عرض كل المنتجات <ArrowDownLeft size={16} /></Link></div></div>
          <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} onTryOn={chooseProduct} />)}</div>
        </section>

        <section className="try-on-section" id="try-on" ref={tryOnRef}>
          <div className="container">
            <div className="try-on-header"><div><p className="kicker"><span className="red-block" /> 03 / التجربة الافتراضية</p><h2>شوفه عليك<br /><em>قبل القرار.</em></h2></div><div className="try-on-intro"><Sparkles size={22} /><p>تجربة مجانية تساعدك تشوف القصة واللون على صورتك. بدون اشتراك، وبدون تعقيد.</p></div></div>
            <div className="try-on-layout">
              <div className="try-on-panel upload-panel">
                <div className="panel-top"><span>01</span><span>صورتك</span></div>
                <button className={`dropzone ${photoDataUrl ? "has-photo" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files[0]); }}>
                  {photoDataUrl ? <img src={photoDataUrl} alt="صورتك المختارة للتجربة" /> : <><Upload size={27} /><strong>ارفع صورة واضحة</strong><span>من الأمام، إضاءة جيدة، JPG / PNG / WebP</span></>}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                </button>
                <div className="photo-meta"><FileImage size={15} />{photoName || "لم يتم اختيار صورة بعد"}{photoDataUrl && <button aria-label="حذف الصورة" onClick={(event) => { event.stopPropagation(); setPhotoDataUrl(null); setPhotoName(""); setStatus("idle"); setResultUrl(null); }}><X size={15} /></button>}</div>
                <div className="privacy-note"><ShieldCheck size={18} /><span><strong>خصوصيتك أولًا.</strong> تُرسل الصورة فقط لطلب إنشاء المعاينة ولا تُنشر في الكتالوج أو تُعرض لمستخدمين آخرين.</span></div>
              </div>
              <div className="try-on-panel garment-panel">
                <div className="panel-top"><span>02</span><span>الهودي المختار</span></div>
                <div className="selected-garment"><img className="selected-product-photo" src={selectedProduct.images[0]} alt={`هودي ${selectedProduct.nameArabic}`} /><div className="selected-garment-copy"><p className="eyebrow">{selectedProduct.name}</p><h3>{selectedProduct.nameArabic}</h3><p>{formatPrice(selectedProduct.price)} · {selectedProduct.color}</p></div></div>
                {productContextLocked ? <div className="locked-garment-note"><Check size={16} /><span>تم اختيار القطعة من صفحة المنتج. ارفع صورتك فقط.</span></div> : <><label className="select-label" htmlFor="garment-select">غيّر القطعة</label><select id="garment-select" value={selectedProduct.id} onChange={(event) => { const next = products.find((product) => product.id === event.target.value); if (next) chooseProduct(next); }}><option value="">اختار هودي</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nameArabic} — {formatPrice(product.price)}</option>)}</select></>}
              </div>
              <div className="try-on-panel result-panel">
                <div className="panel-top"><span>03</span><span>النتيجة</span></div>
                <div className={`result-frame ${status === "success" ? "result-ready" : ""}`}>
                  {status === "success" && resultUrl ? <button type="button" className="result-image-button" onClick={() => setLightboxOpen(true)} aria-label="فتح نتيجة التجربة بالحجم الكامل"><img src={resultUrl} alt={`نتيجة تجربة ${selectedProduct.nameArabic}`} /><span>اضغط لفتح الصورة</span></button> : status === "loading" ? <div className="result-state"><Loader2 className="spin" size={30} /><strong>بنجهّز المعاينة...</strong><span>قد يستغرق الأمر لحظات</span></div> : <div className="result-state"><span className="result-cross">＋</span><strong>المعاينة هتظهر هنا</strong><span>اختار صورة وابدأ</span></div>}
                </div>
                {status === "success" && resultUrl ? <a className="download-link" href={resultUrl} download={`hoodiefit-${selectedProduct.id}.png`}><Download size={16} /> نزّل النتيجة</a> : <div className="result-placeholder">PREVIEW / 03</div>}
              </div>
            </div>
            <div className="try-on-footer"><label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span className="custom-check"><Check size={13} /></span><span>أوافق على معالجة صورتي مؤقتًا لإنشاء المعاينة.</span></label><Button className="generate-button" onClick={generate} disabled={status === "loading"}>{status === "loading" ? <><Loader2 className="spin" size={18} /> جاري الإنشاء</> : status === "error" ? <><RefreshCcw size={17} /> جرّب مرة أخرى</> : <>ولّد المعاينة <ArrowUpLeft size={18} /></>}</Button></div>
            {status === "error" && <div className="error-message" role="alert">{errorMessage}</div>}
            {status === "success" && <div className="success-message" role="status">تم إنشاء المعاينة بنجاح. اضغط على الصورة لفتحها بالحجم الكامل، أو نزّلها إذا احتجت.</div>}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}><DialogContent className="try-on-lightbox"><DialogTitle className="sr-only">نتيجة تجربة {selectedProduct.nameArabic}</DialogTitle><DialogDescription className="sr-only">عرض نتيجة التجربة بالحجم الكامل</DialogDescription>{resultUrl && <img src={resultUrl} alt={`نتيجة تجربة ${selectedProduct.nameArabic} بالحجم الكامل`} />}</DialogContent></Dialog>
          </div>
        </section>
      </main>
      <footer className="site-footer container"><a className="brand" href="#top"><span className="brand-wordmark">مرج</span></a><p>قطعة واضحة. وموجة أقرب لك.</p><span>© 2026 MARJ</span></footer>
    </div>
  );
}
