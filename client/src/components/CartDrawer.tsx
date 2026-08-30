import { useEffect, useRef } from "react";
import { ArrowDownLeft, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { formatPrice } from "@shared/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const cart = useCart();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lines = cart.lines.map((line) => ({ ...line, product: cart.getProduct(line.productId) })).filter((line) => line.product);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  return (
    <div className={`cart-drawer-backdrop ${open ? "is-open" : ""}`} aria-hidden={!open} onClick={() => onOpenChange(false)}>
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-label="سلة المشتريات" aria-hidden={!open} onClick={(event) => event.stopPropagation()}>
        <div className="cart-drawer-head">
          <div><p className="eyebrow">YOUR BAG / {cart.itemCount}</p><h2>السلة</h2></div>
          <button ref={closeButtonRef} type="button" aria-label="إغلاق السلة" onClick={() => onOpenChange(false)}><X size={21} /></button>
        </div>
        {lines.length === 0 ? <div className="cart-drawer-empty"><ShoppingBag size={27} /><p>السلة فاضية حاليًا.</p><Link href="/#collection" onClick={() => onOpenChange(false)}>ابدأ من المجموعة <ArrowDownLeft size={15} /></Link></div> : <><div className="cart-drawer-lines">{lines.map((line) => <div className="drawer-line" key={`${line.productId}-${line.size}`}><img src={line.product!.images[0]} alt="" /><div><strong>{line.product!.nameArabic}</strong><span>مقاس {line.size} · {formatPrice(line.product!.price)}</span><div className="quantity-control"><button type="button" aria-label="تقليل" onClick={() => cart.update(line.productId, line.size, line.quantity - 1)}><Minus size={13} /></button><b>{line.quantity}</b><button type="button" aria-label="زيادة" onClick={() => cart.update(line.productId, line.size, line.quantity + 1)}><Plus size={13} /></button></div></div><button type="button" className="icon-danger" aria-label={`حذف ${line.product!.nameArabic}`} onClick={() => cart.remove(line.productId, line.size)}><Trash2 size={15} /></button></div>)}</div><div className="cart-drawer-foot"><div><span>الإجمالي</span><strong>{formatPrice(cart.total)}</strong></div><p>{cart.shipping ? `الشحن ${formatPrice(cart.shipping)}` : "الشحن مجاني"}</p><Link href="/cart" onClick={() => onOpenChange(false)}><Button variant="outline" className="w-full">مراجعة السلة</Button></Link><Link href="/checkout" onClick={() => onOpenChange(false)}><Button className="w-full">إتمام الطلب <ArrowDownLeft size={16} /></Button></Link></div></>}
      </aside>
    </div>
  );
}
