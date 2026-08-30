import { Link, useLocation, useRoute } from "wouter";
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Copy,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Link2,
  MapPinned,
  PackagePlus,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  Truck,
  Upload,
  UsersRound,
  Ruler,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DashboardLayout, { type DashboardNavItem } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/products";
import { isDirectModelUrl, MAX_PRODUCT_MODEL_BYTES, validateGlbUpload } from "@shared/model3d";
import { buildOrderStatusWhatsAppUrl, type CustomerOrderStatus } from "@shared/orderStatusWhatsApp";
import { teamRoleLabels, type TeamRole } from "@shared/teamAccess";

const adminNavigation: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: "نظرة عامة", path: "/admin" },
  { icon: ShoppingBag, label: "المنتجات", path: "/admin/products" },
  { icon: Tags, label: "التصنيفات", path: "/admin/categories" },
  { icon: Palette, label: "السمات", path: "/admin/attributes" },
  { icon: Truck, label: "الطلبات", path: "/admin/orders" },
  { icon: MapPinned, label: "الشحن", path: "/admin/shipping" },
  { icon: CreditCard, label: "الدفع", path: "/admin/payments" },
  { icon: BarChart3, label: "التحليلات", path: "/admin/analytics" },
  { icon: Archive, label: "النمو والتشغيل", path: "/admin/growth" },
  { icon: UsersRound, label: "الفريق", path: "/admin/team" },
  { icon: Settings2, label: "إعدادات المتجر", path: "/admin/settings" },
];

const orderStatusLabels: Record<string, string> = {
  pending: "جديد",
  confirmed: "تم التأكيد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const productStatusLabels: Record<string, string> = {
  active: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

const stockStatusLabels: Record<string, string> = {
  instock: "متاح",
  outofstock: "نفد المخزون",
  onbackorder: "طلب مسبق",
};

function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const accessQuery = trpc.admin.access.useQuery();
  const menuItems = useMemo(() => {
    const role = accessQuery.data?.role;
    if (!role || role === "owner") return adminNavigation;
    const pathsByRole: Record<string, string[]> = {
      order_operator: ["/admin", "/admin/orders"],
      catalog_editor: ["/admin", "/admin/products", "/admin/categories", "/admin/attributes"],
      analytics_viewer: ["/admin", "/admin/analytics"],
      store_manager: ["/admin", "/admin/products", "/admin/categories", "/admin/attributes", "/admin/orders", "/admin/analytics"],
    };
    return adminNavigation.filter((item) => pathsByRole[role]?.includes(item.path));
  }, [accessQuery.data?.role]);
  return (
    <DashboardLayout menuItems={menuItems} brand="مرج / إدارة">
      <div className="admin-workspace">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker"><span className="red-block" /> لوحة التحكم / {title}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <Link href="/" className="admin-store-link"><ArrowUpRight size={15} /> العودة للمتجر</Link>
        </header>
        {children}
      </div>
    </DashboardLayout>
  );
}

function AdminError({ message }: { message?: string }) {
  return (
    <div className="admin-empty-state">
      <ShieldCheck size={28} />
      <h2>هذه الصفحة للمدير فقط</h2>
      <p>{message || "سجّل الدخول بحساب المدير للوصول إلى أدوات المتجر."}</p>
    </div>
  );
}

function LoadingState({ label = "جاري تحميل البيانات..." }: { label?: string }) {
  return <div className="admin-loading"><RefreshCw size={18} className="spin" /> {label}</div>;
}

export function AdminDashboard() {
  const { data, isLoading, error } = trpc.admin.dashboard.useQuery();
  const productsQuery = trpc.admin.products.list.useQuery();
  const operations = data?.operations;
  return (
    <AdminShell title="نظرة عامة" description="ابدأ بما يحتاج قرارًا الآن: تنفيذ الطلبات، مخزون الـ variations، ثم الكتالوج.">
      {isLoading ? <LoadingState /> : error ? <AdminError message={error.message} /> : (
        <>
          <section className="admin-stat-grid" aria-label="ملخص المتجر">
            <StatCard icon={Truck} label="طلبات تحتاج إجراء" value={operations?.actionOrders.length ?? 0} detail="جديد أو مؤكد أو قيد التجهيز" accent="ink" />
            <StatCard icon={Boxes} label="تنبيهات الـ variations" value={data?.lowStockCount ?? 0} detail="كمية منخفضة أو نفاد فعلي" accent="red" />
            <StatCard icon={Archive} label="مسودات تحتاج مراجعة" value={data?.draftCount ?? 0} detail="قبل النشر في الكتالوج" accent="cream" />
            <StatCard icon={ShoppingBag} label="المنتجات المنشورة" value={data?.publishedCount ?? 0} detail={`${data?.productsCount ?? 0} إجمالي المنتجات`} accent="outline" />
          </section>
          <section className="admin-operations-grid" aria-label="قوائم العمل">
            <section className="admin-panel admin-operation-panel">
              <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">ORDER QUEUE</p><h2>طلبات تحتاج إجراء</h2></div><Link href="/admin/orders?status=action" className="admin-secondary-action">فتح القائمة <ArrowUpRight size={15} /></Link></div>
              {!operations?.actionOrders.length ? <div className="admin-inline-empty">لا توجد طلبات معلّقة أو قيد التجهيز الآن.</div> : <div className="admin-operation-list">{operations.actionOrders.slice(0, 5).map((order) => <Link href="/admin/orders?status=action" className="admin-operation-row" key={order.id}><span><strong className="admin-mono">{order.orderNumber}</strong><small>{order.customerName} · {order.city}</small></span><em className={`order-status-badge order-status-${order.status}`}>{orderStatusLabels[order.status]}</em><b>{formatPrice(order.total)}</b></Link>)}</div>}
            </section>
            <section className="admin-panel admin-operation-panel">
              <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">INVENTORY WATCH</p><h2>Variations تحتاج متابعة</h2></div><Link href="/admin/products?inventory=attention" className="admin-secondary-action">افتح الكتالوج <ArrowUpRight size={15} /></Link></div>
              {!operations?.stockAlerts.length ? <div className="admin-inline-empty">لا توجد variations منخفضة المخزون وفق الحد الحالي.</div> : <div className="admin-operation-list">{operations.stockAlerts.slice(0, 5).map((variant) => <Link href={`/admin/products/${variant.productId}`} className="admin-operation-row" key={variant.id}><span><strong>{variant.productName}</strong><small>{variant.color} · {variant.size} · {variant.sku}</small></span><em className={`inventory-severity inventory-${variant.severity}`}>{variant.severity === "critical" ? "نفد المخزون" : "منخفض"}</em><b>{variant.stock.toLocaleString("ar-EG")}</b></Link>)}</div>}
            </section>
          </section>
          <section className="admin-dashboard-grid admin-dashboard-secondary">
            <div className="admin-panel admin-quick-panel">
              <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">QUICK ACTIONS</p><h2>إجراءات سريعة</h2></div><CircleDollarSign size={22} /></div>
              <div className="admin-quick-actions">
                <Link href="/admin/products/new" className="admin-quick-action"><PackagePlus size={20} /><span><strong>أضف منتجًا</strong><small>ابدأ صفحة منتج جديدة</small></span><ChevronLeft size={17} /></Link>
                <Link href="/admin/products?inventory=attention" className="admin-quick-action"><Boxes size={20} /><span><strong>راجع المخزون</strong><small>الـ variations التي تحتاج قرارًا</small></span><ChevronLeft size={17} /></Link>
                <Link href="/admin/orders" className="admin-quick-action"><Truck size={20} /><span><strong>تابع الطلبات</strong><small>حدّث حالة التنفيذ والشحن</small></span><ChevronLeft size={17} /></Link>
              </div>
            </div>
            <div className="admin-panel admin-ops-note-panel">
              <p className="admin-panel-eyebrow">DATA SCOPE / MARJ</p>
              <h2>ما الذي تقيسه اللوحة الآن؟</h2>
              <p>تعتمد النظرة العامة على بيانات المنتجات والـ variations والطلبات الفعلية فقط. الإيراد، الدفع، التتبع، والإرجاع لا تظهر كمؤشرات قبل ربط مصادرها.</p>
              <Link href="/admin/settings" className="admin-ops-note-link">راجع إعدادات الشحن والدفع <ArrowUpRight size={15} /></Link>
            </div>
          </section>
          <section className="admin-dashboard-products admin-panel">
            <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">CATALOG / LIVE DATA</p><h2>الكتالوج الحالي</h2></div><Link href="/admin/products" className="admin-secondary-action">عرض الكل <ArrowUpRight size={15} /></Link></div>
            {productsQuery.isLoading ? <LoadingState label="جاري تحميل المنتجات..." /> : productsQuery.error ? <AdminError message={productsQuery.error.message} /> : !productsQuery.data?.length ? <div className="admin-inline-empty">لا توجد منتجات في قاعدة البيانات بعد.</div> : <div className="admin-dashboard-product-list">{productsQuery.data.slice(0, 6).map((product) => <Link href={`/admin/products/${product.id}`} className="admin-dashboard-product-row" key={product.id}><img src={product.imageUrl} alt="" /><span><strong>{product.nameArabic}</strong><small>{product.sku || "بدون SKU"} · {product.variants.length.toLocaleString("ar-EG")} variations</small></span><b>{formatPrice(product.salePrice ?? product.price)}</b><em className={`stock-badge stock-${product.stockStatus}`}>{stockStatusLabels[product.stockStatus]}</em></Link>)}</div>}
          </section>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent }: { icon: typeof ShoppingBag; label: string; value: number | string; detail: string; accent: "ink" | "cream" | "red" | "outline" }) {
  return <div className={`admin-stat-card admin-stat-${accent}`}><div className="admin-stat-top"><span>{label}</span><Icon size={18} /></div><strong>{typeof value === "number" ? value.toLocaleString("ar-EG") : value}</strong><small>{detail}</small></div>;
}

export function AdminProducts() {
  const { data, isLoading, error } = trpc.admin.products.list.useQuery();
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const inventoryFilterFromUrl = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("inventory") === "attention" ? "attention" : "all";
  const [inventory, setInventory] = useState(inventoryFilterFromUrl);
  useEffect(() => setInventory(inventoryFilterFromUrl), [inventoryFilterFromUrl]);
  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return (data ?? []).filter((product) => {
      const matchesSearch = !normalized || product.name.toLowerCase().includes(normalized) || product.nameArabic.includes(search.trim()) || product.slug.includes(normalized) || (product.sku ?? "").toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || product.status === status;
      const needsInventoryAttention = product.stockStatus === "outofstock" || product.variants.some((variant) => variant.status === "active" && (variant.stockStatus === "outofstock" || variant.stock <= 3));
      return matchesSearch && matchesStatus && (inventory === "all" || needsInventoryAttention);
    });
  }, [data, inventory, search, status]);

  return (
    <AdminShell title="المنتجات" description="أنشئ منتجات حقيقية، أدِر أسعارها، وانشرها في الكتالوج.">
      <div className="admin-toolbar">
        <div className="admin-filter-group"><label htmlFor="product-search">بحث</label><input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اسم، slug أو SKU" /></div>
        <div className="admin-filter-group"><label htmlFor="product-status">الحالة</label><select id="product-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">كل الحالات</option><option value="active">منشور</option><option value="draft">مسودة</option><option value="archived">مؤرشف</option></select></div>
        <div className="admin-filter-group"><label htmlFor="inventory-status">المخزون</label><select id="inventory-status" value={inventory} onChange={(event) => setInventory(event.target.value)}><option value="all">كل المخزون</option><option value="attention">يحتاج متابعة</option></select></div>
        <Link href="/admin/products/new" className="admin-primary-action"><Plus size={17} /> أضف منتجًا</Link>
      </div>
      {isLoading ? <LoadingState /> : error ? <AdminError message={error.message} /> : !filteredProducts.length ? <div className="admin-empty-state"><ShoppingBag size={30} /><h2>لا توجد منتجات مطابقة</h2><p>ابدأ بإضافة منتج جديد، أو غيّر كلمة البحث والفلاتر.</p><Link href="/admin/products/new" className="admin-primary-action"><Plus size={17} /> أضف أول منتج</Link></div> : (
        <div className="admin-table-card">
          <div className="admin-table-meta"><span>{filteredProducts.length.toLocaleString("ar-EG")} منتج</span><span>المعروض من قاعدة البيانات</span></div>
          <div className="admin-table-scroll"><table className="admin-products-table"><thead><tr><th>المنتج</th><th>SKU</th><th>السعر</th><th>Variations</th><th>المخزون</th><th>الحالة</th><th><span className="sr-only">إجراء</span></th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img src={product.imageUrl} alt={product.nameArabic} loading="lazy" /><div><strong>{product.nameArabic}</strong><small>{product.name} · {product.category}</small></div></div></td><td className="admin-mono">{product.sku || "—"}</td><td><strong>{formatPrice(product.salePrice ?? product.price)}</strong>{product.salePrice ? <small className="admin-old-price">{formatPrice(product.price)}</small> : null}</td><td>{product.variants.length.toLocaleString("ar-EG")}</td><td><span className={`stock-badge stock-${product.stockStatus}`}>{stockStatusLabels[product.stockStatus]}</span></td><td><span className={`product-status-badge product-status-${product.status}`}>{productStatusLabels[product.status]}</span></td><td><Link href={`/admin/products/${product.id}`} className="admin-icon-action" aria-label={`تعديل ${product.nameArabic}`}><Pencil size={16} /></Link></td></tr>)}</tbody></table></div>
        </div>
      )}
    </AdminShell>
  );
}

export function AdminAttributes() {
  const { data, isLoading, error } = trpc.admin.products.list.useQuery();
  const colors = Array.from(new Set((data ?? []).flatMap((product) => product.variants.map((variant) => variant.color).filter(Boolean))));
  const sizes = Array.from(new Set((data ?? []).flatMap((product) => product.variants.map((variant) => variant.size))));
  return <AdminShell title="السمات" description="أدر السمات التي تُبنى عليها variations مثل اللون والمقاس، بنفس منطق WooCommerce." >
    {isLoading ? <LoadingState label="جاري تحميل السمات..." /> : error ? <AdminError message={error.message} /> : <div className="admin-attribute-grid">
      <section className="admin-panel admin-attribute-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">GLOBAL ATTRIBUTE / COLOR</p><h2>الألوان</h2></div><Palette size={22} /></div><p className="admin-attribute-help">قيم الألوان الحالية مستخرجة من variations المنتجات. أضف اللون من محرر المنتج عند إنشاء variation جديدة.</p><div className="admin-attribute-list">{colors.length ? colors.map((color) => <span className="admin-attribute-chip" key={color}><i style={{ background: color.includes("أحمر") ? "#db2f27" : color.includes("أبيض") ? "#f4f1eb" : color.includes("رمادي") ? "#8d8b85" : "#111" }} />{color}</span>) : <span className="admin-inline-empty">لا توجد ألوان بعد.</span>}</div></section>
      <section className="admin-panel admin-attribute-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">GLOBAL ATTRIBUTE / SIZE</p><h2>المقاسات</h2></div><Ruler size={22} /></div><p className="admin-attribute-help">المقاسات النشطة التي يمكن اختيارها في variation وفي صفحة المنتج العامة.</p><div className="admin-attribute-list">{sizes.length ? sizes.map((size) => <span className="admin-attribute-chip admin-size-chip" key={size}>{size}</span>) : <span className="admin-inline-empty">لا توجد مقاسات بعد.</span>}</div></section>
    </div>}
  </AdminShell>;
}

export function AdminCategories() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.categories.list.useQuery();
  const create = trpc.admin.categories.create.useMutation({ onSuccess: () => { toast.success("تمت إضافة التصنيف"); utils.admin.categories.list.invalidate(); setForm({ slug: "", name: "", description: "" }); }, onError: (mutationError) => toast.error(mutationError.message) });
  const [form, setForm] = useState({ slug: "", name: "", description: "" });
  return <AdminShell title="التصنيفات" description="نظّم الكتالوج إلى مجموعات واضحة، ثم اربط المنتج بالتصنيف المناسب.">
    <div className="admin-two-column"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">NEW CATEGORY</p><h2>تصنيف جديد</h2></div><FolderTree size={22} /></div><form className="admin-form" onSubmit={(event) => { event.preventDefault(); create.mutate({ ...form, status: "active" }); }}><label>اسم التصنيف<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="هوديز شتوية" /></label><label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="winter-hoodies" /></label><label>وصف مختصر<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="وصف يظهر للمدير فقط" /></label><button className="admin-primary-action" disabled={create.isPending}><Save size={16} /> {create.isPending ? "جاري الحفظ..." : "حفظ التصنيف"}</button></form></section><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">CATALOG TAXONOMY</p><h2>التصنيفات الحالية</h2></div><Tags size={22} /></div>{isLoading ? <LoadingState /> : error ? <AdminError message={error.message} /> : !data?.length ? <div className="admin-inline-empty">لا توجد تصنيفات بعد.</div> : <div className="admin-category-list">{data.map((category) => <div className="admin-category-row" key={category.id}><span className="category-dot" /><div><strong>{category.name}</strong><small>{category.slug}</small></div><span className={`product-status-badge product-status-${category.status}`}>{category.status === "active" ? "نشط" : "مسودة"}</span></div>)}</div>}</section></div>
  </AdminShell>;
}

export function AdminOrders() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.orders.list.useQuery();
  const [location, setLocation] = useLocation();
  const orderFilterFromUrl = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("status") ?? "all";
  const [statusFilter, setStatusFilter] = useState(orderFilterFromUrl);
  const [statusHandoff, setStatusHandoff] = useState<{ orderId: number; url: string } | null>(null);
  const [fulfillmentDrafts, setFulfillmentDrafts] = useState<Record<number, { shipmentCarrier: string; trackingNumber: string; trackingUrl: string }>>({});
  useEffect(() => setStatusFilter(orderFilterFromUrl), [orderFilterFromUrl]);
  const setStatus = trpc.admin.orders.setStatus.useMutation({ onSuccess: (_result, input) => { const order = data?.find((candidate) => candidate.id === input.id); const url = order ? buildOrderStatusWhatsAppUrl({ orderNumber: order.orderNumber, customerName: order.customerName, customerPhone: order.phone, total: order.total, status: input.status as CustomerOrderStatus }) : null; setStatusHandoff(url ? { orderId: input.id, url } : null); toast.success(url ? "تم تحديث الحالة. افتح WhatsApp لمراجعة وإرسال رسالة العميل." : "تم تحديث حالة الطلب. لا يوجد رقم WhatsApp مصري صالح لهذا العميل.", url ? { action: { label: "فتح WhatsApp", onClick: () => window.open(url, "_blank", "noopener,noreferrer") } } : undefined); utils.admin.orders.list.invalidate(); utils.admin.dashboard.invalidate(); }, onError: (mutationError) => toast.error(mutationError.message) });
  const updateFulfillment = trpc.admin.orders.fulfillment.useMutation({ onSuccess: () => { toast.success("تم حفظ بيانات الشحن. سيظهر الرابط للعميل فقط عند توفره."); utils.admin.orders.list.invalidate(); }, onError: (mutationError) => toast.error(mutationError.message) });
  const filteredOrders = useMemo(() => (data ?? []).filter((order) => statusFilter === "all" || (statusFilter === "action" ? ["pending", "confirmed", "processing"].includes(order.status) : order.status === statusFilter)), [data, statusFilter]);
  return <AdminShell title="الطلبات" description="راجع الطلبات الواردة وحدّث lifecycle التنفيذ من الجديد حتى التسليم.">
    {isLoading ? <LoadingState /> : error ? <AdminError message={error.message} /> : !data?.length ? <div className="admin-empty-state"><Truck size={30} /><h2>لا توجد طلبات بعد</h2><p>عندما يرسل عميل طلبًا سيظهر هنا مع بيانات التواصل والعنوان.</p></div> : <><div className="admin-orders-filter"><label htmlFor="order-status-filter">قائمة الطلبات</label><select id="order-status-filter" value={statusFilter} onChange={(event) => { const next = event.target.value; setStatusFilter(next); setLocation(next === "all" ? "/admin/orders" : `/admin/orders?status=${next}`); }}><option value="all">كل الطلبات</option><option value="action">تحتاج إجراء</option>{Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="admin-table-card"><div className="admin-table-meta"><span>{filteredOrders.length.toLocaleString("ar-EG")} طلب</span><span>{statusFilter === "action" ? "طلبات جديدة أو مؤكدة أو قيد التجهيز" : "الدفع عند الاستلام — لا يعني أن الطلب مدفوع"}</span></div><div className="admin-table-scroll"><table className="admin-orders-table"><thead><tr><th>الطلب</th><th>العميل</th><th>التوصيل</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>{filteredOrders.map((order) => { const draft = fulfillmentDrafts[order.id] ?? { shipmentCarrier: order.shipmentCarrier ?? "", trackingNumber: order.trackingNumber ?? "", trackingUrl: order.trackingUrl ?? "" }; return <tr key={order.id}><td><strong className="admin-mono">{order.orderNumber}</strong><small>{order.phone}</small></td><td><strong>{order.customerName}</strong><small>{order.email}</small></td><td><strong>{order.city}</strong><small>{order.address}</small><details className="admin-fulfillment"><summary>بيانات البوليصة</summary><input value={draft.shipmentCarrier} onChange={(event) => setFulfillmentDrafts({ ...fulfillmentDrafts, [order.id]: { ...draft, shipmentCarrier: event.target.value } })} placeholder="شركة الشحن" /><input value={draft.trackingNumber} onChange={(event) => setFulfillmentDrafts({ ...fulfillmentDrafts, [order.id]: { ...draft, trackingNumber: event.target.value } })} placeholder="رقم البوليصة" /><input type="url" value={draft.trackingUrl} onChange={(event) => setFulfillmentDrafts({ ...fulfillmentDrafts, [order.id]: { ...draft, trackingUrl: event.target.value } })} placeholder="رابط التتبع (اختياري)" /><button type="button" className="admin-secondary-action" disabled={updateFulfillment.isPending} onClick={() => updateFulfillment.mutate({ id: order.id, shipmentCarrier: draft.shipmentCarrier.trim() || null, trackingNumber: draft.trackingNumber.trim() || null, trackingUrl: draft.trackingUrl.trim() || null })}>حفظ الشحن</button></details></td><td><strong>{formatPrice(order.total)}</strong></td><td><select className={`admin-status-select status-${order.status}`} value={order.status} disabled={setStatus.isPending} onChange={(event) => setStatus.mutate({ id: order.id, status: event.target.value as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" })}>{Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{statusHandoff?.orderId === order.id ? <a className="admin-order-whatsapp" href={statusHandoff.url} target="_blank" rel="noreferrer">إرسال تحديث WhatsApp</a> : null}</td><td>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</td></tr>; })}</tbody></table></div>{!filteredOrders.length ? <div className="admin-inline-empty">لا توجد طلبات ضمن هذا الفلتر.</div> : null}</div></>}
  </AdminShell>;
}

export function AdminShipping() {
  const utils = trpc.useUtils();
  const zonesQuery = trpc.admin.shipping.list.useQuery();
  const [drafts, setDrafts] = useState<Record<number, { fee: string; enabled: boolean; deliveryNote: string }>>({});
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (zonesQuery.data) setDrafts(Object.fromEntries(zonesQuery.data.map((zone) => [zone.id, { fee: String(zone.fee), enabled: zone.enabled, deliveryNote: zone.deliveryNote ?? "" }])));
  }, [zonesQuery.data]);
  const update = trpc.admin.shipping.update.useMutation({
    onSuccess: () => { toast.success("تم حفظ إعدادات المحافظة"); utils.admin.shipping.list.invalidate(); utils.store.shippingZones.invalidate(); },
    onError: (error) => toast.error(error.message),
  });
  const filteredZones = (zonesQuery.data ?? []).filter((zone) => zone.governorate.includes(search.trim()));
  return <AdminShell title="الشحن" description="حدد رسم الشحن لكل محافظة، واكتب ملاحظة توصيل تظهر للعميل عند الاختيار.">
    <section className="admin-panel admin-shipping-panel">
      <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">EGYPT / SHIPPING ZONES</p><h2>رسوم المحافظات</h2></div><MapPinned size={22} /></div>
      <p className="admin-settings-note">تُحسب الرسوم من المحافظة المختارة في Checkout. إذا عطلت محافظة، لا يستطيع العميل إتمام طلب إليها حتى تعيد تفعيلها.</p>
      <div className="admin-zone-toolbar"><label htmlFor="zone-search">ابحث عن محافظة<input id="zone-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="مثال: القاهرة" /></label><span>{filteredZones.length.toLocaleString("ar-EG")} محافظة</span></div>
      {zonesQuery.isLoading ? <LoadingState label="جاري تحميل محافظات الشحن..." /> : zonesQuery.error ? <AdminError message={zonesQuery.error.message} /> : !filteredZones.length ? <div className="admin-inline-empty">لا توجد محافظة مطابقة للبحث.</div> : <div className="admin-zone-list">{filteredZones.map((zone) => {
        const draft = drafts[zone.id] ?? { fee: String(zone.fee), enabled: zone.enabled, deliveryNote: zone.deliveryNote ?? "" };
        return <form className="admin-zone-row" key={zone.id} onSubmit={(event) => { event.preventDefault(); update.mutate({ id: zone.id, fee: Number(draft.fee), enabled: draft.enabled, deliveryNote: draft.deliveryNote.trim() || null }); }}>
          <div className="admin-zone-name"><strong>{zone.governorate}</strong><label className="admin-switch"><input type="checkbox" checked={draft.enabled} onChange={(event) => setDrafts((current) => ({ ...current, [zone.id]: { ...draft, enabled: event.target.checked } }))} /><span>{draft.enabled ? "مفعّل" : "موقوف"}</span></label></div>
          <label>رسوم الشحن (ج.م)<input min="0" required type="number" value={draft.fee} onChange={(event) => setDrafts((current) => ({ ...current, [zone.id]: { ...draft, fee: event.target.value } }))} /></label>
          <label>ملاحظة التوصيل <input maxLength={240} value={draft.deliveryNote} onChange={(event) => setDrafts((current) => ({ ...current, [zone.id]: { ...draft, deliveryNote: event.target.value } }))} placeholder="اختياري — اكتب ملاحظة حقيقية فقط" /></label>
          <button className="admin-secondary-action" disabled={update.isPending}><Save size={15} /> حفظ</button>
        </form>;
      })}</div>}
    </section>
  </AdminShell>;
}

export function AdminPayments() {
  const utils = trpc.useUtils();
  const methodsQuery = trpc.admin.payments.list.useQuery();
  const [drafts, setDrafts] = useState<Record<number, { label: string; enabled: boolean; instructions: string; whatsappNumber: string }>>({});
  useEffect(() => {
    if (methodsQuery.data) setDrafts(Object.fromEntries(methodsQuery.data.map((method) => [method.id, { label: method.label, enabled: method.enabled, instructions: method.instructions ?? "", whatsappNumber: method.whatsappNumber ?? "" }])));
  }, [methodsQuery.data]);
  const update = trpc.admin.payments.update.useMutation({
    onSuccess: () => { toast.success("تم حفظ طريقة الدفع"); utils.admin.payments.list.invalidate(); utils.store.paymentMethods.invalidate(); },
    onError: (error) => toast.error(error.message),
  });
  const typeLabels = { cod: "دفع عند الاستلام", manual_transfer: "تحويل/محفظة يدوية", online_card: "دفع إلكتروني ببطاقة" };
  return <AdminShell title="الدفع" description="فعّل الطرق التي تستطيع تأكيدها الآن، واكتب تعليمات التحويل فقط عندما تكون جاهزة للعملاء.">
    <section className="admin-panel admin-payment-panel">
      <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PAYMENT METHODS / MARJ</p><h2>طرق الدفع</h2></div><CreditCard size={22} /></div>
      <p className="admin-settings-note">Vodafone Cash وInstaPay والمحافظ هنا طرق يدوية: لا يظهر للعميل أي رقم أو تعليمات حتى تحفظها وتفعّل الطريقة. البطاقات لا تعتبر متصلة قبل اختيار مزود دفع وإعداد بيانات التاجر.</p>
      {methodsQuery.isLoading ? <LoadingState label="جاري تحميل طرق الدفع..." /> : methodsQuery.error ? <AdminError message={methodsQuery.error.message} /> : <div className="admin-payment-list">{methodsQuery.data?.map((method) => {
        const draft = drafts[method.id] ?? { label: method.label, enabled: method.enabled, instructions: method.instructions ?? "", whatsappNumber: method.whatsappNumber ?? "" };
        const isCard = method.type === "online_card";
        return <form className="admin-payment-card" key={method.id} onSubmit={(event) => { event.preventDefault(); update.mutate({ id: method.id, label: draft.label, enabled: isCard ? false : draft.enabled, instructions: draft.instructions.trim() || null, whatsappNumber: isCard ? null : draft.whatsappNumber.trim() || null }); }}>
          <div className="admin-payment-card-head"><div><span className={`payment-type payment-${method.type}`}>{typeLabels[method.type]}</span><strong>{method.label}</strong></div><label className="admin-switch"><input type="checkbox" checked={isCard ? false : draft.enabled} disabled={isCard} onChange={(event) => setDrafts((current) => ({ ...current, [method.id]: { ...draft, enabled: event.target.checked } }))} /><span>{isCard ? "غير متصل" : draft.enabled ? "ظاهر للعميل" : "موقوف"}</span></label></div>
          <label>اسم الطريقة للعميل<input required value={draft.label} onChange={(event) => setDrafts((current) => ({ ...current, [method.id]: { ...draft, label: event.target.value } }))} /></label>
          <label>تعليمات العميل<textarea value={draft.instructions} disabled={isCard} rows={4} onChange={(event) => setDrafts((current) => ({ ...current, [method.id]: { ...draft, instructions: event.target.value } }))} placeholder={isCard ? "اختر مزود دفع وقدّم مفاتيح Test Mode أولًا." : method.type === "cod" ? "مثال: يتم الدفع عند الاستلام." : "أدخل رقم المحفظة أو رابط/تعليمات التحويل الفعلية."} /></label>
          {method.type === "manual_transfer" ? <label>رقم WhatsApp لاستلام Screenshot التحويل<input type="tel" inputMode="tel" value={draft.whatsappNumber} onChange={(event) => setDrafts((current) => ({ ...current, [method.id]: { ...draft, whatsappNumber: event.target.value } }))} placeholder="01012345678 أو +201012345678" /><small>اختياري. عند إضافته، يظهر للعميل بعد الطلب زر WhatsApp برسالة جاهزة؛ يرفق العميل Screenshot ويرسلها بنفسه.</small></label> : null}
          {isCard ? <p className="admin-payment-blocked">Blocked: يحتاج مزود دفع، حساب تاجر، مفاتيح server-side وcallback متحققًا من الخادم قبل التفعيل.</p> : <button className="admin-secondary-action" disabled={update.isPending}><Save size={15} /> حفظ الطريقة</button>}
        </form>;
      })}</div>}
    </section>
  </AdminShell>;
}

export function AdminAnalytics() {
  const analyticsQuery = trpc.admin.analytics.get.useQuery();
  const methodsQuery = trpc.admin.payments.list.useQuery();
  const paymentLabels = Object.fromEntries((methodsQuery.data ?? []).map((method) => [method.code, method.label]));
  const data = analyticsQuery.data;
  const maxGovernorateValue = Math.max(1, ...(data?.governorates.map((item) => item.value) ?? [0]));
  return <AdminShell title="التحليلات" description="اقرأ ما تسجله الطلبات والكتالوج بالفعل، مع توضيح ما يحتاج مصدر بيانات إضافيًا.">
    {analyticsQuery.isLoading ? <LoadingState label="جاري تجميع بيانات المتجر..." /> : analyticsQuery.error ? <AdminError message={analyticsQuery.error.message} /> : data ? <>
      <section className="admin-analytics-hero" aria-label="ملخص الطلبات المسجلة">
        <StatCard icon={CircleDollarSign} label="قيمة الطلبات المسجلة" value={formatPrice(data.totalOrderValue)} detail="غير الملغاة — لا تعني مبلغًا محصلًا" accent="ink" />
        <StatCard icon={Truck} label="طلبات مسجلة" value={data.recordedOrdersCount} detail={`${data.cancelledOrdersCount.toLocaleString("ar-EG")} طلبات ملغاة`} accent="cream" />
        <StatCard icon={ShoppingBag} label="متوسط الطلب المسجل" value={formatPrice(data.averageRecordedOrderValue)} detail="من إجمالي غير الملغي" accent="outline" />
        <StatCard icon={Boxes} label="Variations في خطر" value={data.catalog.atRiskVariations} detail="كمية ≤ 3 أو نفد المخزون" accent="red" />
      </section>
      <p className="admin-analytics-definition">قيمة الطلبات تشمل إجمالي الطلبات المسجلة غير الملغاة، بما فيها رسوم الشحن. لا توجد حاليًا بيانات تحصيل أو refunds أو traffic، لذلك لا تُعرض كإيراد محقق أو conversion rate.</p>
      <section className="admin-analytics-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">ORDER STATUS</p><h2>حالة التنفيذ</h2></div><Truck size={21} /></div><div className="analytics-stat-list">{Object.entries(orderStatusLabels).map(([status, label]) => <div key={status}><span>{label}</span><strong>{(data.orderStatusCounts[status] ?? 0).toLocaleString("ar-EG")}</strong></div>)}</div></section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PAYMENT MIX</p><h2>اختيارات الدفع</h2></div><CreditCard size={21} /></div>{Object.keys(data.paymentMethodCounts).length ? <div className="analytics-stat-list">{Object.entries(data.paymentMethodCounts).map(([code, count]) => <div key={code}><span>{paymentLabels[code] ?? code}</span><strong>{count.toLocaleString("ar-EG")}</strong></div>)}</div> : <div className="admin-inline-empty">لا توجد طلبات مسجلة بعد لعرض طرق الدفع.</div>}</section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">TOP PRODUCTS</p><h2>القطع في الطلبات</h2></div><ShoppingBag size={21} /></div>{data.topProducts.length ? <div className="analytics-stat-list">{data.topProducts.map((product) => <div key={product.productId}><span>{product.productName}<small>{product.quantity.toLocaleString("ar-EG")} قطعة</small></span><strong>{formatPrice(product.value)}</strong></div>)}</div> : <div className="admin-inline-empty">لا توجد عناصر طلبات مسجلة بعد.</div>}</section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">GOVERNORATES</p><h2>الطلبات حسب المحافظة</h2></div><MapPinned size={21} /></div>{data.governorates.length ? <div className="analytics-bars">{data.governorates.map((item) => <div className="analytics-bar" key={item.city}><span>{item.city}<small>{item.ordersCount.toLocaleString("ar-EG")} طلب</small></span><i><b style={{ width: `${Math.max(8, (item.value / maxGovernorateValue) * 100)}%` }} /></i><strong>{formatPrice(item.value)}</strong></div>)}</div> : <div className="admin-inline-empty">لا توجد طلبات قابلة للتحليل بعد.</div>}</section>
      </section>
      <section className="admin-analytics-blocked"><div><p className="admin-panel-eyebrow">BLOCKED / MISSING SOURCES</p><h2>مقاييس ستظهر بعد الربط</h2></div><p>الزيارات، استخدام الفلاتر، الإضافة للسلة، بدء إتمام الطلب، معدل التحويل، الإيراد المحصل، المبالغ المرتجعة، ومقارنة الفترات تحتاج أحداث تحليلات وبيانات بوابة الدفع والإرجاع. لن تُستبدل بأرقام تخمينية.</p></section>
    </> : null}
  </AdminShell>;
}

export function AdminTeam() {
  const utils = trpc.useUtils();
  const teamQuery = trpc.admin.team.list.useQuery();
  const [role, setRole] = useState<TeamRole>("order_operator");
  const [expiresInHours, setExpiresInHours] = useState<24 | 72 | 168 | 720 | "unlimited">(168);
  const [latestInvite, setLatestInvite] = useState<{ url: string; expiresAt: Date | null } | null>(null);
  const createInvite = trpc.admin.team.createInvite.useMutation({
    onSuccess: (invite) => {
      setLatestInvite({ url: `${window.location.origin}/team/join?token=${encodeURIComponent(invite.inviteToken)}`, expiresAt: invite.expiresAt });
      utils.admin.team.list.invalidate();
      toast.success("تم إنشاء رابط دعوة آمن. أرسله للشخص المقصود فقط.");
    },
    onError: (error) => toast.error(error.message),
  });
  const revokeInvite = trpc.admin.team.revokeInvite.useMutation({ onSuccess: () => { utils.admin.team.list.invalidate(); toast.success("تم إلغاء رابط الدعوة"); }, onError: (error) => toast.error(error.message) });
  const updateRole = trpc.admin.team.updateMemberRole.useMutation({ onSuccess: () => { utils.admin.team.list.invalidate(); toast.success("تم تحديث صلاحية العضو"); }, onError: (error) => toast.error(error.message) });
  const revokeMember = trpc.admin.team.revokeMember.useMutation({ onSuccess: () => { utils.admin.team.list.invalidate(); toast.success("تم إلغاء وصول العضو"); }, onError: (error) => toast.error(error.message) });
  const copyInvite = async () => {
    if (!latestInvite) return;
    try { await navigator.clipboard.writeText(latestInvite.url); toast.success("تم نسخ رابط الدعوة"); }
    catch { toast.error("تعذر النسخ تلقائيًا. انسخ الرابط يدويًا."); }
  };
  if (teamQuery.isLoading) return <AdminShell title="فريق المتجر" description="جاري تحميل أعضاء الفريق والدعوات."><LoadingState /></AdminShell>;
  if (teamQuery.error || !teamQuery.data) return <AdminShell title="فريق المتجر" description="أدر وصول الموظفين إلى المتجر."><AdminError message={teamQuery.error?.message} /></AdminShell>;
  return <AdminShell title="فريق المتجر" description="أنشئ دعوة مؤقتة لكل شخص، واختر أقل صلاحية مناسبة لعمله. لا تشارك حساب المدير.">
    <section className="admin-team-grid">
      <form className="admin-panel admin-team-invite" onSubmit={(event) => { event.preventDefault(); createInvite.mutate({ role, expiresInHours }); }}>
        <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">TEAM ACCESS</p><h2>دعوة عضو جديد</h2></div><UsersRound size={22} /></div>
        <p className="admin-team-help">الرابط يعمل لشخص واحد فقط، وينتهي تلقائيًا. بعد تسجيل الدخول يقبل العضو الدعوة بنفسه.</p>
        <label>صلاحية العضو<select value={role} onChange={(event) => setRole(event.target.value as TeamRole)}>{Object.entries(teamRoleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label>مدة الرابط<select value={String(expiresInHours)} onChange={(event) => setExpiresInHours(event.target.value === "unlimited" ? "unlimited" : Number(event.target.value) as 24 | 72 | 168 | 720)}><option value="24">24 ساعة / 24 hours</option><option value="72">3 أيام / 3 days</option><option value="168">7 أيام / 7 days</option><option value="720">30 يوم / 30 days</option><option value="unlimited">غير محدودة / Unlimited</option></select></label>
        <button className="admin-primary-action" disabled={createInvite.isPending}><Link2 size={16} /> {createInvite.isPending ? "جاري إنشاء الرابط..." : "إنشاء رابط دعوة"}</button>
        {latestInvite ? <div className="admin-invite-result"><strong>رابط الدعوة جاهز حتى {latestInvite.expiresAt ? new Date(latestInvite.expiresAt).toLocaleString("ar-EG") : "غير محدودة / Unlimited"}</strong><code dir="ltr">{latestInvite.url}</code><button type="button" className="admin-secondary-action" onClick={() => void copyInvite()}><Copy size={15} /> نسخ الرابط</button></div> : null}
      </form>
      <section className="admin-panel admin-team-roles"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">LEAST PRIVILEGE</p><h2>ماذا يرى كل دور؟</h2></div><ShieldCheck size={22} /></div><ul><li><strong>متابعة الطلبات:</strong> الطلبات وتغيير حالتها.</li><li><strong>إدارة المنتجات:</strong> المنتجات والمقاسات والوسائط فقط.</li><li><strong>عرض التحليلات:</strong> لوحة الأرقام والتحليلات فقط.</li><li><strong>مدير المتجر:</strong> الطلبات والمنتجات والتحليلات دون الدفع أو الشحن أو إعدادات الملكية.</li></ul></section>
    </section>
    <section className="admin-panel admin-team-list"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">ACTIVE TEAM</p><h2>الأعضاء النشطون</h2></div><span>{teamQuery.data.members.length.toLocaleString("ar-EG")} عضو</span></div>{!teamQuery.data.members.length ? <div className="admin-inline-empty">لا يوجد أعضاء فريق بعد. أنشئ رابط دعوة لإضافة شخص.</div> : <div className="team-member-list">{teamQuery.data.members.map((member) => <article key={member.id} className="team-member-row"><div><strong>{member.name || "عضو متجر"}</strong><small dir="ltr">{member.email || "لا يوجد بريد ظاهر"}</small></div><label>الصلاحية<select value={member.role} onChange={(event) => updateRole.mutate({ id: member.id, role: event.target.value as TeamRole })}>{Object.entries(teamRoleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><button type="button" className="admin-danger-action" onClick={() => { if (window.confirm("إلغاء وصول هذا العضو؟")) revokeMember.mutate({ id: member.id }); }}>إلغاء الوصول</button></article>)}</div>}</section>
    <section className="admin-panel admin-team-list"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">INVITE HISTORY</p><h2>روابط الدعوات</h2></div><span>{teamQuery.data.invites.length.toLocaleString("ar-EG")} دعوة</span></div>{!teamQuery.data.invites.length ? <div className="admin-inline-empty">لا توجد دعوات منشأة بعد.</div> : <div className="team-member-list">{teamQuery.data.invites.map((invite) => { const expired = invite.expiresAt ? new Date(invite.expiresAt).getTime() <= Date.now() : false; const status = invite.revokedAt ? "ملغاة" : invite.acceptedAt ? "مستخدمة" : expired ? "منتهية" : "نشطة"; return <article key={invite.id} className="team-member-row"><div><strong>{teamRoleLabels[invite.role as TeamRole]}</strong><small>تنتهي: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString("ar-EG") : "غير محدودة / Unlimited"} · {status}</small></div>{status === "نشطة" ? <button type="button" className="admin-danger-action" onClick={() => revokeInvite.mutate({ id: invite.id })}>إلغاء الرابط</button> : <span className="team-invite-status">{status}</span>}</article>; })}</div>}</section>
  </AdminShell>;
}

export function AdminStoreSettings() {
  const utils = trpc.useUtils();
  const settingsQuery = trpc.admin.settings.get.useQuery();
  const [form, setForm] = useState({ brandName: "مرج", shippingScope: "الشحن متاح لجميع محافظات مصر", shippingFee: "0", freeShippingThreshold: "", shippingNotice: "", returnPolicy: "", paymentNotice: "" });
  useEffect(() => {
    if (settingsQuery.data) setForm({ brandName: settingsQuery.data.brandName, shippingScope: settingsQuery.data.shippingScope, shippingFee: String(settingsQuery.data.shippingFee), freeShippingThreshold: settingsQuery.data.freeShippingThreshold ? String(settingsQuery.data.freeShippingThreshold) : "", shippingNotice: settingsQuery.data.shippingNotice, returnPolicy: settingsQuery.data.returnPolicy, paymentNotice: settingsQuery.data.paymentNotice });
  }, [settingsQuery.data]);
  const update = trpc.admin.settings.update.useMutation({ onSuccess: () => { toast.success("تم حفظ إعدادات المتجر"); utils.admin.settings.get.invalidate(); utils.store.settings.invalidate(); }, onError: (error) => toast.error(error.message) });
  if (settingsQuery.isLoading) return <AdminShell title="إعدادات المتجر" description="جاري تحميل إعدادات مرج."><LoadingState /></AdminShell>;
  if (settingsQuery.error || !settingsQuery.data) return <AdminShell title="إعدادات المتجر" description="تعذر تحميل الإعدادات."><AdminError message={settingsQuery.error?.message} /></AdminShell>;
  return <AdminShell title="إعدادات المتجر" description="عدّل ما يراه العميل عن الشحن والاستبدال والدفع قبل الإطلاق.">
    <form className="admin-settings-form admin-panel" onSubmit={(event) => { event.preventDefault(); update.mutate({ ...form, shippingFee: Number(form.shippingFee), freeShippingThreshold: form.freeShippingThreshold.trim() ? Number(form.freeShippingThreshold) : null }); }}>
      <div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">MARJ / OPERATIONS</p><h2>إعدادات التشغيل</h2></div><Settings2 size={22} /></div>
      <div className="admin-form-grid"><label>اسم العلامة<input required value={form.brandName} onChange={(event) => setForm({ ...form, brandName: event.target.value })} /></label><label>نطاق الشحن<input required value={form.shippingScope} onChange={(event) => setForm({ ...form, shippingScope: event.target.value })} /></label><label>رسوم الشحن (ج.م)<input required min="0" type="number" value={form.shippingFee} onChange={(event) => setForm({ ...form, shippingFee: event.target.value })} /></label><label>حد الشحن المجاني (اختياري)<input min="1" type="number" value={form.freeShippingThreshold} onChange={(event) => setForm({ ...form, freeShippingThreshold: event.target.value })} placeholder="اتركه فارغًا" /></label></div>
      <label>ملاحظة الشحن<textarea required rows={4} value={form.shippingNotice} onChange={(event) => setForm({ ...form, shippingNotice: event.target.value })} placeholder="مثال: تحدد تكلفة ومدة الشحن من لوحة الإدارة." /></label>
      <label>سياسة الاستبدال والإرجاع<textarea required rows={6} value={form.returnPolicy} onChange={(event) => setForm({ ...form, returnPolicy: event.target.value })} placeholder="اكتب فترة الاستبدال والشروط وطريقة التواصل." /></label>
      <label>وسائل الدفع<textarea required rows={4} value={form.paymentNotice} onChange={(event) => setForm({ ...form, paymentNotice: event.target.value })} placeholder="اذكر وسائل الدفع التي فعّلتها فعليًا." /></label>
      <p className="admin-settings-note">لن تظهر أي بوابة دفع كمتصلة قبل ربطها فعليًا. هذه الصفحة تتحكم في الإفصاح النصي للعملاء فقط.</p>
      <button className="admin-primary-action" disabled={update.isPending}><Save size={16} /> {update.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
    </form>
  </AdminShell>;
}

type ProductFormState = { slug: string; name: string; nameArabic: string; description: string; shortDescription: string; price: string; salePrice: string; compareAtPrice: string; sku: string; imageUrl: string; category: string; categoryId: string; featured: boolean; manageStock: boolean; stockStatus: "instock" | "outofstock" | "onbackorder"; status: "draft" | "active" | "archived" };
const emptyProductForm: ProductFormState = { slug: "", name: "", nameArabic: "", description: "", shortDescription: "", price: "", salePrice: "", compareAtPrice: "", sku: "", imageUrl: "", category: "هوديز", categoryId: "", featured: false, manageStock: true, stockStatus: "instock", status: "draft" };

type VariantFormState = { sku: string; size: "S" | "M" | "L" | "XL"; color: string; stock: string; safetyStock: string; priceOverride: string; stockStatus: "instock" | "outofstock" | "onbackorder"; status: "active" | "inactive" };
const emptyVariantForm: VariantFormState = { sku: "", size: "M", color: "أساسي", stock: "0", safetyStock: "3", priceOverride: "", stockStatus: "instock", status: "active" };
type MediaType = "front" | "back" | "gallery" | "model3d";
const mediaTypeLabels: Record<MediaType, string> = { front: "صورة أمامية", back: "صورة خلفية", gallery: "صورة إضافية", model3d: "نموذج 3D" };

type ProductMediaItem = { id: number; url: string; mediaType: MediaType; altText: string | null; sortOrder: number };

function ProductMediaManager({ productId, media, disabled = false }: { productId: number; media: ProductMediaItem[]; disabled?: boolean }) {
  const utils = trpc.useUtils();
  const [mediaType, setMediaType] = useState<MediaType>("gallery");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const reset = () => { setMediaType("gallery"); setMediaUrl(""); setMediaAlt(""); setModelFile(null); };
  const addMedia = trpc.admin.products.media.add.useMutation({ onSuccess: () => { toast.success("تمت إضافة الوسيط للمنتج"); reset(); utils.admin.products.get.invalidate({ id: productId }); }, onError: (error) => toast.error(error.message) });
  const uploadModel = trpc.admin.products.media.uploadModel.useMutation({ onSuccess: () => { toast.success("تم رفع نموذج 3D وهو جاهز للعرض في صفحة المنتج"); reset(); utils.admin.products.get.invalidate({ id: productId }); }, onError: (error) => toast.error(error.message) });
  const removeMedia = trpc.admin.products.media.remove.useMutation({ onSuccess: () => { toast.success("تم حذف الوسيط"); utils.admin.products.get.invalidate({ id: productId }); }, onError: (error) => toast.error(error.message) });
  const submitModelFile = async () => {
    if (!modelFile) return;
    const bytes = new Uint8Array(await modelFile.arrayBuffer());
    const validationError = validateGlbUpload(modelFile.name, bytes);
    if (validationError) return toast.error(validationError);
    const reader = new FileReader();
    reader.onload = () => { const base64 = String(reader.result || "").split(",")[1] || ""; uploadModel.mutate({ productId, fileName: modelFile.name, base64, altText: mediaAlt.trim() || null }); };
    reader.onerror = () => toast.error("تعذر قراءة ملف GLB. أعد تصدير النموذج ثم حاول مرة أخرى.");
    reader.readAsDataURL(modelFile);
  };
  const pending = addMedia.isPending || uploadModel.isPending;
  return <section className="admin-panel admin-media-panel admin-model-media-manager" aria-disabled={disabled} style={disabled ? { opacity: 0.68, pointerEvents: "none" } : undefined}><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PRODUCT MEDIA / 3D</p><h2>الصور والنموذج ثلاثي الأبعاد</h2></div><Upload size={21} /></div>{disabled && <p className="admin-media-help"><strong>احفظ بيانات المنتج الأساسية أولًا</strong> حتى يتاح رفع الصور والـGLB وربطها بالمنتج.</p>}<p className="admin-media-help">لا تضع رابط صفحة متجر أو viewer. للـ 3D ارفع ملف <strong>GLB</strong> من جهازك، أو استخدم رابطًا مباشرًا ينتهي بـ <strong>.glb</strong> أو <strong>.gltf</strong>.</p><form className={`media-form ${mediaType === "model3d" ? "model-media-form" : ""}`} onSubmit={(event) => { event.preventDefault(); if (disabled) return; if (mediaType === "model3d" && modelFile) { void submitModelFile(); return; } if (mediaType === "model3d" && !isDirectModelUrl(mediaUrl)) return toast.error("أدخل رابطًا مباشرًا ينتهي بـ .glb أو .gltf، أو ارفع ملف GLB من جهازك."); addMedia.mutate({ productId, url: mediaUrl, mediaType, altText: mediaAlt.trim() || null, sortOrder: media.length }); }}><label>نوع الوسيط<select value={mediaType} onChange={(event) => { setMediaType(event.target.value as MediaType); setModelFile(null); }}>{Object.entries(mediaTypeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>{mediaType === "model3d" ? <><label className="model-file-picker">ملف النموذج (.glb)<input type="file" accept=".glb,model/gltf-binary" onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file && file.size > MAX_PRODUCT_MODEL_BYTES) { toast.error("حجم ملف GLB أكبر من 12MB."); event.currentTarget.value = ""; return; } setModelFile(file); setMediaUrl(""); }} /><small>{modelFile ? `${modelFile.name} — ${(modelFile.size / 1024 / 1024).toFixed(2)}MB` : "GLB / glTF 2.0، بحجم أقصى 12MB. سيتم التحقق منه قبل الحفظ."}</small></label><span className="model-or">أو</span><label>رابط ملف مباشر<input type="url" disabled={Boolean(modelFile)} value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://cdn.example.com/hoodie.glb" /><small>صفحات المتاجر و3D viewer ليست ملفات نموذج.</small></label></> : <label>رابط الصورة<input required type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://.../hoodie-back.jpg" /><small>رابط صورة عامة أو S3.</small></label>}<label>وصف بديل<input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder={mediaType === "model3d" ? "نموذج ثلاثي الأبعاد للهودي" : mediaType === "back" ? "هودي من الخلف" : "صورة منتج"} /></label><button className="admin-secondary-action" disabled={pending}>{pending ? "جاري الرفع..." : <><Plus size={16} /> إضافة الوسيط</>}</button></form>{!media.length ? <div className="admin-inline-empty">لا توجد وسائط إضافية بعد.</div> : <div className="admin-media-grid">{media.map((asset) => <div className={`admin-media-item media-${asset.mediaType}`} key={asset.id}>{asset.mediaType === "model3d" ? <div className={`admin-model-placeholder ${isDirectModelUrl(asset.url) ? "" : "is-invalid"}`}>3D<small>{isDirectModelUrl(asset.url) ? "GLB / GLTF" : "رابط غير صالح — احذفه ثم ارفع GLB"}</small></div> : <img src={asset.url} alt={asset.altText || "صورة منتج"} />}<span>{mediaTypeLabels[asset.mediaType]}</span><button type="button" onClick={() => removeMedia.mutate({ id: asset.id })} aria-label="حذف الوسيط"><X size={15} /></button></div>)}</div>}</section>;
}

export function AdminProductEditor() {
  const [, params] = useRoute("/admin/products/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id ? Number(params.id) : 0;
  const isNew = !productId;
  const utils = trpc.useUtils();
  const productQuery = trpc.admin.products.get.useQuery({ id: productId }, { enabled: !isNew });
  const categoriesQuery = trpc.admin.categories.list.useQuery();
  const variantsQuery = trpc.admin.products.variants.list.useQuery({ productId }, { enabled: !isNew });
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [variantForm, setVariantForm] = useState<VariantFormState>(emptyVariantForm);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("gallery");
  const [hydrated, setHydrated] = useState(isNew);
  useEffect(() => { if (productQuery.data && !hydrated) { const product = productQuery.data; setForm({ slug: product.slug, name: product.name, nameArabic: product.nameArabic, description: product.description, shortDescription: product.shortDescription ?? "", price: String(product.price), salePrice: product.salePrice ? String(product.salePrice) : "", compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "", sku: product.sku ?? "", imageUrl: product.imageUrl, category: product.category, categoryId: product.categoryId ? String(product.categoryId) : "", featured: product.featured, manageStock: product.manageStock, stockStatus: product.stockStatus, status: product.status }); setHydrated(true); } }, [productQuery.data, hydrated]);
  const create = trpc.admin.products.create.useMutation({ onSuccess: (created) => { toast.success("تم إنشاء المنتج، أضف الآن الـ variations"); utils.admin.products.list.invalidate(); utils.admin.dashboard.invalidate(); setLocation(`/admin/products/${created.id}`); }, onError: (mutationError) => toast.error(mutationError.message) });
  const update = trpc.admin.products.update.useMutation({ onSuccess: () => { toast.success("تم حفظ تغييرات المنتج"); utils.admin.products.get.invalidate({ id: productId }); utils.admin.products.list.invalidate(); utils.admin.dashboard.invalidate(); }, onError: (mutationError) => toast.error(mutationError.message) });
  const addVariant = trpc.admin.products.variants.create.useMutation({ onSuccess: () => { toast.success("تمت إضافة variation"); setVariantForm(emptyVariantForm); utils.admin.products.variants.list.invalidate({ productId }); utils.admin.products.get.invalidate({ id: productId }); utils.admin.dashboard.invalidate(); }, onError: (mutationError) => toast.error(mutationError.message) });
  const removeVariant = trpc.admin.products.variants.remove.useMutation({ onSuccess: () => { toast.success("تم حذف variation"); utils.admin.products.variants.list.invalidate({ productId }); utils.admin.products.get.invalidate({ id: productId }); utils.admin.dashboard.invalidate(); }, onError: (mutationError) => toast.error(mutationError.message) });
  const addMedia = trpc.admin.products.media.add.useMutation({ onSuccess: () => { toast.success("تمت إضافة الوسيط للمنتج"); setMediaUrl(""); setMediaAlt(""); setMediaType("gallery"); utils.admin.products.get.invalidate({ id: productId }); }, onError: (mutationError) => toast.error(mutationError.message) });
  const removeMedia = trpc.admin.products.media.remove.useMutation({ onSuccess: () => { toast.success("تم حذف الصورة"); utils.admin.products.get.invalidate({ id: productId }); }, onError: (mutationError) => toast.error(mutationError.message) });
  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const numberOrNull = (value: string) => value.trim() ? Number(value) : null;
  const submitProduct = (event: React.FormEvent) => { event.preventDefault(); const payload = { slug: form.slug, name: form.name, nameArabic: form.nameArabic, description: form.description, shortDescription: form.shortDescription || null, price: Number(form.price), salePrice: numberOrNull(form.salePrice), compareAtPrice: numberOrNull(form.compareAtPrice), sku: form.sku || null, imageUrl: form.imageUrl, category: form.category, categoryId: form.categoryId ? Number(form.categoryId) : null, featured: form.featured, manageStock: form.manageStock, stockStatus: form.stockStatus, status: form.status }; if (isNew) create.mutate(payload); else update.mutate({ id: productId, ...payload }); };
  const submitVariant = (event: React.FormEvent) => { event.preventDefault(); if (!productId) return; addVariant.mutate({ productId, sku: variantForm.sku, size: variantForm.size, color: variantForm.color, stock: Number(variantForm.stock), safetyStock: Number(variantForm.safetyStock), priceOverride: numberOrNull(variantForm.priceOverride), stockStatus: variantForm.stockStatus, status: variantForm.status }); };
  if (!isNew && productQuery.isLoading) return <AdminShell title="تحرير المنتج" description="جاري تحميل تفاصيل المنتج."><LoadingState /></AdminShell>;
  if (!isNew && productQuery.error) return <AdminShell title="تحرير المنتج" description="تعذر تحميل هذا المنتج."><AdminError message={productQuery.error.message} /></AdminShell>;
  return <AdminShell title={isNew ? "منتج جديد" : "تحرير المنتج"} description={isNew ? "أدخل بيانات المنتج الأساسية ثم احفظه لإضافة الـ variations." : `إدارة ${productQuery.data?.nameArabic ?? "المنتج"} بكل تفاصيله.`}>
    <div className="admin-editor-toolbar"><Link href="/admin/products" className="admin-back-link"><ChevronLeft size={17} /> كل المنتجات</Link><div className="admin-editor-actions">{!isNew && <Link href={`/product/${productQuery.data?.slug}`} className="admin-secondary-action"><ArrowUpRight size={15} /> عرض المنتج</Link>}<button className="admin-primary-action" form="product-editor-form" disabled={create.isPending || update.isPending}><Save size={16} /> {create.isPending || update.isPending ? "جاري الحفظ..." : "حفظ المنتج"}</button></div></div>
    <form id="product-editor-form" className="admin-editor-grid" onSubmit={submitProduct}>
      <section className="admin-panel admin-editor-main"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PRODUCT CONTENT</p><h2>بيانات المنتج</h2></div><Pencil size={21} /></div><div className="admin-form-grid"><label>الاسم بالعربي<input required value={form.nameArabic} onChange={(event) => updateField("nameArabic", event.target.value)} placeholder="شبكة ليلية" /></label><label>الاسم الداخلي / English<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Night Grid" /></label><label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="night-grid" /><small>حروف إنجليزية صغيرة وأرقام وشرطات فقط.</small></label><label>SKU<input value={form.sku} onChange={(event) => updateField("sku", event.target.value)} placeholder="HF-NG-001" /></label></div><label>الوصف المختصر<textarea rows={3} value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} placeholder="سطر واحد يظهر في بطاقات المنتج." /></label><label>الوصف الكامل<textarea required rows={7} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="اكتب وصفًا واضحًا للخامة والقصة والاستخدام." /></label></section>
      <aside className="admin-editor-side"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PUBLISHING</p><h2>النشر</h2></div><Check size={21} /></div><label>حالة المنتج<select value={form.status} onChange={(event) => updateField("status", event.target.value as ProductFormState["status"])}><option value="draft">مسودة</option><option value="active">منشور</option><option value="archived">مؤرشف</option></select></label><label>حالة المخزون<select value={form.stockStatus} onChange={(event) => updateField("stockStatus", event.target.value as ProductFormState["stockStatus"])}><option value="instock">متاح</option><option value="outofstock">نفد المخزون</option><option value="onbackorder">طلب مسبق</option></select></label><label className="admin-check-row"><input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} /> منتج مميز في الكتالوج</label><label className="admin-check-row"><input type="checkbox" checked={form.manageStock} onChange={(event) => updateField("manageStock", event.target.checked)} /> إدارة المخزون</label></section><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PRICING</p><h2>الأسعار</h2></div><CircleDollarSign size={21} /></div><label>السعر الأساسي (ج.م)<input required type="number" min="1" value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="949" /></label><label>سعر التخفيض (اختياري)<input type="number" min="1" value={form.salePrice} onChange={(event) => updateField("salePrice", event.target.value)} placeholder="اتركه فارغًا" /></label><label>السعر قبل الخصم<input type="number" min="1" value={form.compareAtPrice} onChange={(event) => updateField("compareAtPrice", event.target.value)} placeholder="1100" /></label></section></aside>
      <section className="admin-panel admin-editor-main"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">CATALOG ORGANIZATION</p><h2>التصنيف والصورة الرئيسية</h2></div><FolderTree size={21} /></div><div className="admin-form-grid"><label>اسم التصنيف<input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="هوديز" /></label><label>ربط بتصنيف موجود<select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}><option value="">بدون ربط</option>{categoriesQuery.data?.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></label></div><label>رابط الصورة الرئيسية<input required type="url" value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="https://.../hoodie.jpg" /><small>ضع ملف صورة مباشرًا فقط: JPG أو PNG أو WEBP. هذا الحقل ليس لنموذج 3D أو رابط صفحة متجر؛ ارفع GLB من قسم «الصور والنموذج ثلاثي الأبعاد» أسفل المحرر.</small></label>{form.imageUrl ? <div className="admin-image-preview"><img src={form.imageUrl} alt="معاينة الصورة الرئيسية" /></div> : null}</section>
    </form>
    <section className="admin-panel admin-variation-panel" aria-disabled={isNew} style={isNew ? { opacity: 0.68, pointerEvents: "none" } : undefined}><div className="admin-media-help"><strong>احفظ بيانات المنتج الأساسية أولًا</strong> حتى يتاح إنشاء variations مرتبطة بهذا المنتج.</div><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PRODUCT VARIATIONS</p><h2>المقاسات والألوان والمخزون</h2></div><Boxes size={21} /></div><form className="variation-form" onSubmit={submitVariant}><label>SKU<input required value={variantForm.sku} onChange={(event) => setVariantForm({ ...variantForm, sku: event.target.value })} placeholder="HF-NG-M-BLK" /></label><label>المقاس<select value={variantForm.size} onChange={(event) => setVariantForm({ ...variantForm, size: event.target.value as VariantFormState["size"] })}><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option></select></label><label>اللون<input required value={variantForm.color} onChange={(event) => setVariantForm({ ...variantForm, color: event.target.value })} placeholder="أسود ليلي" /></label><label>المخزون<input required type="number" min="0" value={variantForm.stock} onChange={(event) => setVariantForm({ ...variantForm, stock: event.target.value })} /></label><label>حد تنبيه المخزون<input required type="number" min="0" value={variantForm.safetyStock} onChange={(event) => setVariantForm({ ...variantForm, safetyStock: event.target.value })} /></label><label>سعر مختلف<input type="number" min="1" value={variantForm.priceOverride} onChange={(event) => setVariantForm({ ...variantForm, priceOverride: event.target.value })} placeholder="اختياري" /></label><button className="admin-primary-action" disabled={addVariant.isPending}><Plus size={16} /> إضافة variation</button></form>{variantsQuery.isLoading ? <LoadingState /> : !variantsQuery.data?.length ? <div className="admin-inline-empty">لم تتم إضافة variations بعد. أضف المقاسات التي تبيعها فعليًا.</div> : <div className="variation-list">{variantsQuery.data.map((variant) => <div className="variation-row" key={variant.id}><span className="variation-color" style={{ background: variant.color === "أساسي" ? "#111" : variant.color }} /><strong>{variant.size}</strong><span>{variant.color}</span><span className="admin-mono">{variant.sku}</span><span>{variant.stock.toLocaleString("ar-EG")} قطعة · حد تنبيه {variant.safetyStock}</span><span>{variant.priceOverride ? formatPrice(variant.priceOverride) : "سعر المنتج"}</span><span className={`stock-badge stock-${variant.stockStatus}`}>{stockStatusLabels[variant.stockStatus]}</span><button type="button" className="admin-danger-action" onClick={() => { if (window.confirm("حذف هذا variation؟")) removeVariant.mutate({ id: variant.id }); }} aria-label="حذف variation"><Trash2 size={15} /></button></div>)}</div>}</section><section className="admin-panel admin-media-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">PRODUCT MEDIA</p><h2>الصور والـ 3D</h2></div><Upload size={21} /></div><p className="admin-media-help">الصورة الرئيسية هي الواجهة الافتراضية. أضف صورة ظهر للطباعة الخلفية، أو نموذج GLB/GLTF للعرض ثلاثي الأبعاد.</p><form className="media-form" onSubmit={(event) => { event.preventDefault(); addMedia.mutate({ productId, url: mediaUrl, mediaType, altText: mediaAlt || null, sortOrder: productQuery.data?.media.length ?? 0 }); }}><label>نوع الوسيط<select value={mediaType} onChange={(event) => setMediaType(event.target.value as MediaType)}>{Object.entries(mediaTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>الرابط<input required type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder={mediaType === "model3d" ? "https://.../hoodie.glb" : "https://.../hoodie-back.jpg"} /><small>{mediaType === "model3d" ? "نقبل GLB أو GLTF فقط." : "رابط صورة عامة أو S3."}</small></label><label>وصف بديل<input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder={mediaType === "back" ? "هودي أسود من الخلف" : "هودي أسود من الأمام"} /></label><button className="admin-secondary-action" disabled={addMedia.isPending}><Plus size={16} /> إضافة الوسيط</button></form>{!productQuery.data?.media.length ? <div className="admin-inline-empty">لا توجد وسائط إضافية بعد.</div> : <div className="admin-media-grid">{productQuery.data.media.map((asset) => <div className={`admin-media-item media-${asset.mediaType}`} key={asset.id}>{asset.mediaType === "model3d" ? <div className="admin-model-placeholder">3D<small>GLB / GLTF</small></div> : <img src={asset.url} alt={asset.altText || "صورة منتج"} />}<span>{mediaTypeLabels[(asset.mediaType || "gallery") as MediaType]}</span><button type="button" onClick={() => removeMedia.mutate({ id: asset.id })} aria-label="حذف الوسيط"><X size={15} /></button></div>)}</div>}</section>
    <ProductMediaManager productId={productId} media={(productQuery.data?.media ?? []) as ProductMediaItem[]} disabled={isNew} />
  </AdminShell>;
}

export function AdminGrowth() {
  const utils = trpc.useUtils();
  const couponsQuery = trpc.admin.coupons.list.useQuery();
  const reviewsQuery = trpc.admin.reviews.list.useQuery();
  const adjustmentsQuery = trpc.admin.inventory.adjustments.useQuery();
  const lookbookQuery = trpc.admin.lookbook.list.useQuery();
  const [coupon, setCoupon] = useState({ code: "", type: "percentage" as "percentage" | "fixed", value: "10", minimumSubtotal: "0", usageLimit: "", startsAt: new Date().toISOString().slice(0, 10), expiresAt: "", enabled: true });
  const [stock, setStock] = useState({ variantId: "", delta: "", reason: "" });
  const [lookbook, setLookbook] = useState({ title: "", titleArabic: "", description: "", imageUrl: "", productId: "", sortOrder: "0", published: false });
  const invalidateOperations = () => { void utils.admin.coupons.list.invalidate(); void utils.admin.inventory.adjustments.invalidate(); void utils.admin.lookbook.list.invalidate(); void utils.admin.reviews.list.invalidate(); void utils.admin.dashboard.invalidate(); };
  const createCoupon = trpc.admin.coupons.create.useMutation({ onSuccess: () => { toast.success("تم إنشاء الكوبون"); setCoupon({ code: "", type: "percentage", value: "10", minimumSubtotal: "0", usageLimit: "", startsAt: new Date().toISOString().slice(0, 10), expiresAt: "", enabled: true }); invalidateOperations(); }, onError: (error) => toast.error(error.message) });
  const updateCoupon = trpc.admin.coupons.update.useMutation({ onSuccess: invalidateOperations, onError: (error) => toast.error(error.message) });
  const setReviewStatus = trpc.admin.reviews.setStatus.useMutation({ onSuccess: invalidateOperations, onError: (error) => toast.error(error.message) });
  const adjustStock = trpc.admin.inventory.adjust.useMutation({ onSuccess: () => { toast.success("تم تسجيل تعديل المخزون"); setStock({ variantId: "", delta: "", reason: "" }); invalidateOperations(); }, onError: (error) => toast.error(error.message) });
  const createLookbook = trpc.admin.lookbook.create.useMutation({ onSuccess: () => { toast.success("تمت إضافة مدخلة Lookbook"); setLookbook({ title: "", titleArabic: "", description: "", imageUrl: "", productId: "", sortOrder: "0", published: false }); invalidateOperations(); }, onError: (error) => toast.error(error.message) });
  const updateLookbook = trpc.admin.lookbook.update.useMutation({ onSuccess: invalidateOperations, onError: (error) => toast.error(error.message) });
  return <AdminShell title="النمو والتشغيل" description="خصومات حقيقية، مراجعات مشترين موثقة، تعديل مخزون يدوي، وLookbook من محتوى تضيفه أنت فقط.">
    <div className="admin-editor-grid admin-growth-grid">
      <section className="admin-panel admin-editor-main"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">COUPONS</p><h2>كوبون جديد</h2></div><Tags size={21} /></div><form className="admin-form-grid" onSubmit={(event) => { event.preventDefault(); createCoupon.mutate({ code: coupon.code, type: coupon.type, value: Number(coupon.value), minimumSubtotal: Number(coupon.minimumSubtotal || 0), usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : null, startsAt: new Date(coupon.startsAt), expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null, enabled: coupon.enabled }); }}><label>الكود<input required value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} placeholder="MARJ10" /></label><label>نوع الخصم<select value={coupon.type} onChange={(event) => setCoupon({ ...coupon, type: event.target.value as typeof coupon.type })}><option value="percentage">نسبة مئوية</option><option value="fixed">قيمة ثابتة</option></select></label><label>القيمة<input required type="number" min="1" value={coupon.value} onChange={(event) => setCoupon({ ...coupon, value: event.target.value })} /></label><label>حد أدنى للسلة<input type="number" min="0" value={coupon.minimumSubtotal} onChange={(event) => setCoupon({ ...coupon, minimumSubtotal: event.target.value })} /></label><label>عدد الاستخدامات (اختياري)<input type="number" min="1" value={coupon.usageLimit} onChange={(event) => setCoupon({ ...coupon, usageLimit: event.target.value })} /></label><label>يبدأ في<input required type="date" value={coupon.startsAt} onChange={(event) => setCoupon({ ...coupon, startsAt: event.target.value })} /></label><label>ينتهي في (اختياري)<input type="date" value={coupon.expiresAt} onChange={(event) => setCoupon({ ...coupon, expiresAt: event.target.value })} /></label><label className="admin-check-row"><input type="checkbox" checked={coupon.enabled} onChange={(event) => setCoupon({ ...coupon, enabled: event.target.checked })} /> مفعّل للعملاء</label><button className="admin-primary-action" disabled={createCoupon.isPending}><Plus size={16} /> إنشاء الكوبون</button></form>{couponsQuery.isLoading ? <LoadingState /> : <div className="admin-growth-list">{couponsQuery.data?.map((item) => <div className="admin-growth-row" key={item.id}><strong>{item.code}</strong><span>{item.type === "percentage" ? `${item.value}%` : formatPrice(item.value)} · استخدم {item.usedCount}{item.usageLimit ? ` / ${item.usageLimit}` : ""}</span><button type="button" className="admin-secondary-action" onClick={() => updateCoupon.mutate({ id: item.id, enabled: !item.enabled })}>{item.enabled ? "إيقاف" : "تفعيل"}</button></div>) || <p className="admin-inline-empty">لا توجد كوبونات بعد.</p>}</div>}</section>
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">VERIFIED REVIEWS</p><h2>مراجعات تنتظر القرار</h2></div><Check size={21} /></div>{reviewsQuery.isLoading ? <LoadingState /> : !reviewsQuery.data?.length ? <div className="admin-inline-empty">لا توجد مراجعات. لا ينشئ المتجر مراجعات أو تقييمات تجريبية.</div> : <div className="admin-growth-list">{reviewsQuery.data.map((review) => <article className="admin-growth-row" key={review.id}><div><strong>{review.customerName} · {review.rating}/5</strong><p>{review.body}</p><small>طلب #{review.orderId} · حالة: {review.status}</small></div><span className="admin-row-actions"><button type="button" className="admin-secondary-action" onClick={() => setReviewStatus.mutate({ id: review.id, status: "approved" })}>نشر</button><button type="button" className="admin-danger-action" onClick={() => setReviewStatus.mutate({ id: review.id, status: "rejected" })}>رفض</button></span></article>)}</div>}</section>
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">INVENTORY LOG</p><h2>تعديل مخزون Variation</h2></div><Boxes size={21} /></div><p className="admin-media-help">استخدم رقم الـvariation من شاشة المنتج؛ يسجل النظام السبب والرصيد الناتج ولا يسمح برصيد سالب.</p><form className="admin-form-grid" onSubmit={(event) => { event.preventDefault(); adjustStock.mutate({ variantId: Number(stock.variantId), delta: Number(stock.delta), reason: stock.reason }); }}><label>رقم Variation<input required inputMode="numeric" value={stock.variantId} onChange={(event) => setStock({ ...stock, variantId: event.target.value })} /></label><label>التغيير (+ أو -)<input required type="number" value={stock.delta} onChange={(event) => setStock({ ...stock, delta: event.target.value })} /></label><label>سبب التعديل<input required value={stock.reason} onChange={(event) => setStock({ ...stock, reason: event.target.value })} placeholder="استلام دفعة جديدة" /></label><button className="admin-primary-action" disabled={adjustStock.isPending}>تسجيل التعديل</button></form><div className="admin-growth-list">{adjustmentsQuery.data?.slice(0, 8).map((item) => <div className="admin-growth-row" key={item.id}><strong>Variation #{item.variantId}</strong><span>{item.delta > 0 ? "+" : ""}{item.delta} · الرصيد {item.resultingStock}</span><small>{item.reason}</small></div>) || <p className="admin-inline-empty">لا توجد تعديلات مسجلة.</p>}</div></section>
      <section className="admin-panel admin-editor-main"><div className="admin-panel-heading"><div><p className="admin-panel-eyebrow">LOOKBOOK</p><h2>إضافة محتوى Lookbook</h2></div><Archive size={21} /></div><p className="admin-media-help">أضف صورًا تملك حق استخدامها فقط. لا ينشئ المتجر صورًا أو قصص عملاء من تلقاء نفسه.</p><form className="admin-form-grid" onSubmit={(event) => { event.preventDefault(); createLookbook.mutate({ title: lookbook.title, titleArabic: lookbook.titleArabic, description: lookbook.description.trim() || null, imageUrl: lookbook.imageUrl, productId: lookbook.productId ? Number(lookbook.productId) : null, sortOrder: Number(lookbook.sortOrder || 0), published: lookbook.published }); }}><label>العنوان بالعربية<input required value={lookbook.titleArabic} onChange={(event) => setLookbook({ ...lookbook, titleArabic: event.target.value })} /></label><label>العنوان بالإنجليزية<input required value={lookbook.title} onChange={(event) => setLookbook({ ...lookbook, title: event.target.value })} /></label><label>رابط الصورة المباشر<input required type="url" value={lookbook.imageUrl} onChange={(event) => setLookbook({ ...lookbook, imageUrl: event.target.value })} placeholder="https://.../lookbook.jpg" /></label><label>معرّف المنتج (اختياري)<input inputMode="numeric" value={lookbook.productId} onChange={(event) => setLookbook({ ...lookbook, productId: event.target.value })} /></label><label>الترتيب<input type="number" min="0" value={lookbook.sortOrder} onChange={(event) => setLookbook({ ...lookbook, sortOrder: event.target.value })} /></label><label className="admin-check-row"><input type="checkbox" checked={lookbook.published} onChange={(event) => setLookbook({ ...lookbook, published: event.target.checked })} /> نشر للعملاء</label><label className="admin-full-span">وصف اختياري<textarea value={lookbook.description} onChange={(event) => setLookbook({ ...lookbook, description: event.target.value })} rows={3} /></label><button className="admin-primary-action" disabled={createLookbook.isPending}><Plus size={16} /> إضافة المدخلة</button></form><div className="admin-growth-list">{lookbookQuery.data?.map((entry) => <div className="admin-growth-row" key={entry.id}><img src={entry.imageUrl} alt="" /><span><strong>{entry.titleArabic}</strong><small>{entry.published ? "منشور" : "مسودة"}</small></span><button type="button" className="admin-secondary-action" onClick={() => updateLookbook.mutate({ id: entry.id, published: !entry.published })}>{entry.published ? "إخفاء" : "نشر"}</button></div>) || <p className="admin-inline-empty">لا توجد مدخلات Lookbook بعد.</p>}</div></section>
    </div>
  </AdminShell>;
}

export default AdminOrders;
