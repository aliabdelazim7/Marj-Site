import { useMemo, useState } from "react";
import { ArrowUpLeft, Heart, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import StoreHeader from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { trpc } from "@/lib/trpc";
import { formatPrice, hoodieProducts, type HoodieProduct } from "@shared/products";
import { filterAndSortCatalog, type CatalogFilterVariant } from "@shared/catalogFilters";
import { preferredQuickAddSize } from "@shared/cartSelection";
import { useLanguage } from "@/contexts/LanguageContext";

type StoreProduct = HoodieProduct & { category?: string; stockStatus?: "instock" | "outofstock" | "onbackorder"; variants?: CatalogFilterVariant[] };
type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name";

function CatalogProductImage({ src, alt, name }: { src?: string; alt: string; name: string }) {
  const [failed, setFailed] = useState(!src);
  return failed ? <span className="catalog-image-fallback" role="img" aria-label={`صورة ${name} قيد الرفع`}><strong>MARJ</strong><small>صورة المنتج قيد الرفع</small></span> : <img src={src} alt={alt} loading="eager" onError={() => setFailed(true)} />;
}

function ToggleChip({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return <button type="button" className={`catalog-filter-chip ${active ? "is-active" : ""}`} onClick={onClick}>{dot && <i style={{ background: dot }} />}{label}</button>;
}

export default function Products() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const { data, isLoading, isError } = trpc.products.list.useQuery();
  const products = (data?.length ? data : hoodieProducts) as StoreProduct[];
  const cart = useCart();
  const wishlist = useWishlist();
  const [search, setSearch] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"all" | "available" | "out">("all");
  const [priceRange, setPriceRange] = useState<"all" | "under-900" | "900-plus">("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickAddSizes, setQuickAddSizes] = useState<Record<string, string>>({});

  const facets = useMemo(() => {
    const sizes = Array.from(new Set(products.flatMap((product) => product.sizes))).sort((a, b) => ["S", "M", "L", "XL"].indexOf(a) - ["S", "M", "L", "XL"].indexOf(b));
    const colors = Array.from(new Set(products.flatMap((product) => product.variants?.map((variant) => variant.color || product.color) ?? [product.color])));
    const categories = Array.from(new Set(products.map((product) => product.category || "هوديز")));
    return { sizes, colors, categories };
  }, [products]);

  const toggle = (value: string, current: string[], setCurrent: (next: string[]) => void) => setCurrent(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const resetFilters = () => { setSearch(""); setSelectedSizes([]); setSelectedColors([]); setSelectedCategories([]); setAvailability("all"); setPriceRange("all"); setSort("featured"); };
  const activeCount = selectedSizes.length + selectedColors.length + selectedCategories.length + Number(availability !== "all") + Number(priceRange !== "all");

  const visibleProducts = useMemo(() => filterAndSortCatalog(products, { search, sizes: selectedSizes, colors: selectedColors, categories: selectedCategories, availability, priceRange, sort }), [availability, priceRange, products, search, selectedCategories, selectedColors, selectedSizes, sort]);

  return <div className="site-shell catalog-page">
    <StoreHeader meta="CATALOG / المنتجات" />
    <main className="container catalog-shell">
      <header className="catalog-heading"><div><p className="kicker"><span className="red-block" /> 01 / الكتالوج</p><h1>كل القطع.<br /><em>اختيارك أوضح.</em></h1><p>فلتر حسب اللون والمقاس والسعر والتوفر، ثم ادخل على القطعة أو جرّبها عليك مباشرة.</p></div><div className="catalog-heading-meta"><b>{products.length}</b><span>قطعة منشورة</span></div></header>
      <div className="catalog-toolbar"><label className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث باسم القطعة أو اللون" aria-label="ابحث في المنتجات" />{search && <button type="button" aria-label="مسح البحث" onClick={() => setSearch("")}><X size={16} /></button>}</label><div className="catalog-toolbar-actions"><button type="button" className="catalog-filter-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><SlidersHorizontal size={16} /> الفلاتر {activeCount ? <b>{activeCount}</b> : null}</button><label className="catalog-sort"><span>ترتيب</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="featured">الأحدث في الكتالوج</option><option value="price-asc">السعر: الأقل أولًا</option><option value="price-desc">السعر: الأعلى أولًا</option><option value="name">الاسم</option></select></label></div></div>
      <div className="catalog-content"><aside className={`catalog-filters ${filtersOpen ? "is-open" : ""}`} aria-label="فلاتر المنتجات"><div className="catalog-filter-title"><div><p className="eyebrow">FILTERS</p><h2>التصفية</h2></div>{activeCount ? <button type="button" onClick={resetFilters}>إلغاء الكل</button> : null}</div><section><h3>التصنيف</h3><div className="catalog-filter-list">{facets.categories.map((category) => <ToggleChip key={category} label={category} active={selectedCategories.includes(category)} onClick={() => toggle(category, selectedCategories, setSelectedCategories)} />)}</div></section><section><h3>المقاس</h3><div className="catalog-filter-list catalog-size-list">{facets.sizes.map((size) => <ToggleChip key={size} label={size} active={selectedSizes.includes(size)} onClick={() => toggle(size, selectedSizes, setSelectedSizes)} />)}</div></section><section><h3>اللون</h3><div className="catalog-filter-list">{facets.colors.map((color) => <ToggleChip key={color} label={color} active={selectedColors.includes(color)} onClick={() => toggle(color, selectedColors, setSelectedColors)} />)}</div></section><section><h3>السعر</h3><div className="catalog-filter-list"><ToggleChip label="أقل من ٩٠٠ ج.م" active={priceRange === "under-900"} onClick={() => setPriceRange(priceRange === "under-900" ? "all" : "under-900")} /><ToggleChip label="٩٠٠ ج.م فأكثر" active={priceRange === "900-plus"} onClick={() => setPriceRange(priceRange === "900-plus" ? "all" : "900-plus")} /></div></section><section><h3>التوفر</h3><div className="catalog-filter-list"><ToggleChip label="متوفر الآن" active={availability === "available"} onClick={() => setAvailability(availability === "available" ? "all" : "available")} /><ToggleChip label="نفدت الكمية" active={availability === "out"} onClick={() => setAvailability(availability === "out" ? "all" : "out")} /></div></section></aside>
        <section className="catalog-results" aria-live="polite"><div className="catalog-result-meta"><span>{isLoading ? "جاري تحميل المنتجات..." : `${visibleProducts.length} قطعة مطابقة`}</span>{isError ? <span className="catalog-error">تعذر تحديث الكتالوج، نعرض البيانات المتاحة.</span> : null}</div>{!isLoading && !visibleProducts.length ? <div className="catalog-empty"><PackageSearch size={34} /><h2>لا توجد قطع مطابقة.</h2><p>جرّب إزالة بعض الفلاتر أو ابحث بكلمة مختلفة.</p><button type="button" onClick={resetFilters}>إلغاء كل الفلاتر</button></div> : <div className="catalog-grid">{visibleProducts.map((product) => { const favorite = wishlist.has(product.id, product.databaseId); const soldOut = product.stockStatus === "outofstock"; const selectedQuickSize = quickAddSizes[product.id] ?? preferredQuickAddSize(product.sizes); const displayName = language === "en" ? product.name : product.nameArabic; const addLabel = language === "en" ? `Add size ${selectedQuickSize}` : `أضف مقاس ${selectedQuickSize}`; const sizeLabel = language === "en" ? `Choose a size for ${displayName}` : `اختر مقاس ${displayName}`; const addSelectedSize = () => { cart.add(product, selectedQuickSize); toast.success(language === "en" ? "Item added to cart" : "تمت إضافة القطعة للسلة", { description: `${displayName} — ${language === "en" ? "Size" : "مقاس"} ${selectedQuickSize}`, action: { label: language === "en" ? "View cart" : "عرض السلة", onClick: () => navigate("/cart") } }); }; return <article className="catalog-card" key={product.id}><div className="catalog-card-media"><Link href={`/product/${product.slug}`}><CatalogProductImage src={product.images[0]} alt={`هودي ${product.nameArabic}`} name={product.nameArabic} /></Link><button type="button" className={`favorite-button ${favorite ? "is-favorite" : ""}`} aria-label={favorite ? `إزالة ${product.nameArabic} من المفضلة` : `إضافة ${product.nameArabic} للمفضلة`} onClick={() => wishlist.toggle(product.id, product.databaseId)}><Heart size={17} fill={favorite ? "currentColor" : "none"} /></button>{soldOut ? <span className="catalog-stock-pill is-out">نفدت الكمية</span> : <span className="catalog-stock-pill">متوفر</span>}</div><div className="catalog-card-copy"><p className="eyebrow">{product.name}</p><h2><Link href={`/product/${product.slug}`}>{product.nameArabic}</Link></h2><p>{product.description}</p><div className="catalog-card-meta"><b>{formatPrice(product.price)}</b><span>{product.color}</span></div><div className="catalog-card-sizes" role="group" aria-label={sizeLabel}>{product.sizes.map((size) => <button type="button" key={size} className={size === selectedQuickSize ? "is-selected" : ""} aria-pressed={size === selectedQuickSize} disabled={soldOut} onClick={() => setQuickAddSizes((current) => ({ ...current, [product.id]: size }))}>{size}</button>)}</div><div className="catalog-card-actions"><Button disabled={soldOut || !selectedQuickSize} aria-label={language === "en" ? `Add ${displayName}, size ${selectedQuickSize}, to cart` : `أضف ${displayName} بمقاس ${selectedQuickSize} إلى السلة`} onClick={addSelectedSize}>{addLabel} <span>↙</span></Button><Link href={`/?tryOn=${product.slug}#try-on`} className="catalog-try-link">جرّبه عليك <ArrowUpLeft size={15} /></Link></div></div></article>; })}</div>}</section>
      </div>
    </main>
    <footer className="site-footer container"><Link className="brand" href="/"><span className="brand-wordmark">مرج</span></Link><p>اختار القطعة. شوفها عليك. قرر بوضوح.</p><span>© 2026 MARJ</span></footer>
  </div>;
}
