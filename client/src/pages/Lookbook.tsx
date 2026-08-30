import { ArrowUpRight, Images } from "lucide-react";
import { Link } from "wouter";
import StoreHeader from "@/components/StoreHeader";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Lookbook() {
  const { language } = useLanguage();
  const entriesQuery = trpc.growth.lookbook.useQuery();
  const entries = entriesQuery.data ?? [];
  return <div className="site-shell min-h-screen"><StoreHeader meta="LOOKBOOK / مرج" /><main className="container commerce-page"><header className="commerce-heading"><div><p className="kicker"><span className="red-block" /> LOOKBOOK</p><h1>{language === "en" ? <>The brand,<br /><em>in motion.</em></> : <>الهوية<br /><em>في حركة.</em></>}</h1></div><p className="section-aside">{language === "en" ? "A curated visual edit published by the store." : "اختيارات بصرية ينشرها المتجر بنفسه."}</p></header>{entriesQuery.isLoading ? <div className="empty-commerce"><Images size={30} /><p>{language === "en" ? "Loading lookbook…" : "جاري تحميل الـ Lookbook…"}</p></div> : !entries.length ? <div className="empty-commerce"><Images size={30} /><h2>{language === "en" ? "No entries published yet" : "لا توجد مدخلات منشورة بعد"}</h2><p>{language === "en" ? "The store will publish lookbook entries when they are ready." : "سيضيف المتجر مدخلات Lookbook عند جاهزية المحتوى."}</p><Link href="/products" className="account-primary-action">{language === "en" ? "Shop products" : "تسوق المنتجات"} <ArrowUpRight size={16} /></Link></div> : <section className="lookbook-grid">{entries.map((entry) => <article className="lookbook-card" key={entry.id}><img src={entry.imageUrl} alt={language === "en" ? entry.title : entry.titleArabic} /><div><p className="eyebrow">LOOKBOOK / {String(entry.sortOrder + 1).padStart(2, "0")}</p><h2>{language === "en" ? entry.title : entry.titleArabic}</h2>{entry.description ? <p>{entry.description}</p> : null}{entry.productId ? <Link href={`/product/${entry.productId}`} className="lookbook-link">{language === "en" ? "View linked product" : "عرض المنتج المرتبط"} <ArrowUpRight size={15} /></Link> : null}</div></article>)}</section>}</main></div>;
}
