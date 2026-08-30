export type HoodieProduct = {
  id: string;
  databaseId?: number;
  slug: string;
  name: string;
  nameArabic: string;
  price: number;
  category?: string;
  media?: Array<{ id?: number; url: string; mediaType?: "front" | "back" | "gallery" | "model3d"; altText?: string | null; sortOrder?: number }>;
  model3dUrl?: string | null;
  color: string;
  colorHex: string;
  description: string;
  longDescription: string;
  details: string[];
  sizes: string[];
  fit: string;
  fabric: string;
  care: string;
  accent: string;
  availability: "متوفر" | "كمية محدودة";
  images: string[];
};

const productImages = {
  signalRed: "/manus-storage/signal-red-front_ea8ae7ae.jpg",
  paperWhite: "/manus-storage/paper-white-front_c5e44344.jpg",
  nightGrid: "/manus-storage/night-grid-front_c4bb4ea5.jpg",
  concreteGrey: "/manus-storage/concrete-grey-front_a010e741.jpg",
};

export const hoodieProducts: HoodieProduct[] = [
  {
    id: "signal-red", slug: "signal-red-hoodie", name: "Signal Red", nameArabic: "إشارة حمراء", price: 899, color: "أحمر إشارة", colorHex: "#db2f27",
    description: "هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة.", longDescription: "قطعة أساسية بلون لا يحتاج إلى شرح. صممنا إشارة حمراء من قطن ثقيل بملمس ناعم من الداخل، وقصة مريحة تحافظ على شكلها بعد يوم طويل.",
    details: ["قطن عضوي 100%", "قصة مريحة", "جيب أمامي", "تشطيب مطفي"], sizes: ["S", "M", "L", "XL"], fit: "Relaxed / Unisex", fabric: "420gsm organic cotton", care: "غسيل بارد، مقلوبًا، وتجفيف طبيعي", accent: "red", availability: "متوفر", images: [productImages.signalRed, "/manus-storage/signal-red-side_1a2ce874.jpg"],
  },
  {
    id: "paper-white", slug: "paper-white-hoodie", name: "Paper White", nameArabic: "أبيض ورقي", price: 849, color: "أبيض ناصع", colorHex: "#f4f1eb",
    description: "نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة.", longDescription: "أبيض ورقي ليس أبيضًا عاديًا. درجة دافئة وقماش كثيف يجعلان القطعة أساسًا نظيفًا لكل طبقاتك اليومية.",
    details: ["نسيج ناعم 420gsm", "تشطيب مطفي", "قصة unisex", "بطانة فرنسية"], sizes: ["S", "M", "L", "XL"], fit: "Relaxed / Unisex", fabric: "420gsm brushed cotton", care: "غسيل بارد مع ألوان مشابهة", accent: "black", availability: "متوفر", images: [productImages.paperWhite, "/manus-storage/paper-white-side_6428f880.jpg"],
  },
  {
    id: "night-grid", slug: "night-grid-hoodie", name: "Night Grid", nameArabic: "شبكة ليلية", price: 949, color: "أسود ليلي", colorHex: "#111111",
    description: "أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة.", longDescription: "تفصيلة صغيرة تغيّر كل شيء. شبكة حمراء دقيقة على أسود ليلي عميق، مع قماش يحافظ على حضوره بدون ضوضاء.",
    details: ["قطن ممشط", "طباعة مقاومة", "جيب أمامي", "أساور مضلعة"], sizes: ["S", "M", "L", "XL"], fit: "Relaxed / Unisex", fabric: "400gsm combed cotton", care: "غسيل مقلوب، بدون كي مباشر على الطباعة", accent: "red", availability: "كمية محدودة", images: [productImages.nightGrid, "/manus-storage/night-grid-side_02e9d7ec.jpg"],
  },
  {
    id: "concrete-grey", slug: "concrete-grey-hoodie", name: "Concrete Grey", nameArabic: "رمادي خرسانة", price: 879, color: "رمادي خرسانة", colorHex: "#9a9a95",
    description: "توازن عملي بين الملمس الصناعي والراحة اليومية.", longDescription: "رمادي محايد بقصة واسعة ومدروسة. قطعة سهلة، لكن ليست عادية؛ مناسبة للطبقات وللاستخدام اليومي المتكرر.",
    details: ["بطانة فرنسية", "أساور مضلعة", "قصة واسعة", "حياكة متينة"], sizes: ["S", "M", "L", "XL"], fit: "Relaxed / Unisex", fabric: "420gsm French terry", care: "غسيل بارد وتجفيف منخفض", accent: "black", availability: "متوفر", images: [productImages.concreteGrey, "/manus-storage/concrete-grey-side_d55f77ef.jpg"],
  },
];

export const getHoodieById = (id: string) => hoodieProducts.find((product) => product.id === id);
export const getHoodieBySlug = (slug: string) => hoodieProducts.find((product) => product.slug === slug);
export const getHoodieFromTryOnSearch = (search: string) => {
  const id = new URLSearchParams(search.split("#")[0]).get("tryOn");
  return id ? getHoodieById(id) ?? getHoodieBySlug(id) : undefined;
};
export const formatPrice = (price: number) => {
  const language = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "ar";
  return language === "en" ? `${price.toLocaleString("en-EG")} EGP` : `${price.toLocaleString("ar-EG")} ج.م`;
};
