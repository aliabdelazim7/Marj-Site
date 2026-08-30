import { Heart, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { LanguageToggle } from "@/contexts/LanguageContext";

type StoreHeaderProps = {
  meta?: string;
  tryOnHref?: string;
};

export default function StoreHeader({ tryOnHref = "/#try-on" }: StoreHeaderProps) {
  const cart = useCart();
  const wishlist = useWishlist();

  return (
    <header className="site-header container">
      <Link className="brand" href="/" aria-label="مرج الرئيسية">
        <span className="brand-wordmark">مرج</span>
      </Link>
      <nav className="main-nav" aria-label="التنقل الرئيسي">
        <Link href="/products">المنتجات</Link>
        <Link href="/lookbook">Lookbook</Link>
        <Link href={tryOnHref}>جرّبه عليك</Link>
        <Link href="/track-order">طلباتي</Link>
      </nav>
      <details className="mobile-nav-menu">
        <summary aria-label="فتح قائمة التنقل"><Menu size={18} /></summary>
        <nav aria-label="قائمة التنقل على الهاتف">
          <Link href="/products">كل المنتجات</Link>
          <Link href="/lookbook">Lookbook</Link>
          <Link href={tryOnHref}>جرّبه عليك</Link>
          <Link href="/track-order">تتبّع طلبك</Link>
          <Link href="/account">حسابي</Link>
          <Link href="/policies">الشحن والاستبدال</Link>
          <LanguageToggle className="mobile-language-toggle" />
        </nav>
      </details>
      <div className="header-actions">
        <Link className="header-account-button" href="/account" aria-label="فتح حسابي"><UserRound size={16} /></Link>
        <Link className="header-favorites-button" href="/favorites" aria-label={`فتح المفضلة، ${wishlist.count} عناصر`}>
          <Heart size={16} fill={wishlist.count ? "currentColor" : "none"} />
          <b>{wishlist.count}</b>
        </Link>
        <Link className="header-cart-button" href="/cart" aria-label={`فتح السلة، ${cart.itemCount} عناصر`}>
          <ShoppingBag className="header-cart-glyph" size={19} strokeWidth={2.7} aria-hidden="true" />
          <span>السلة</span>
          <b>{cart.itemCount}</b>
        </Link>
        <LanguageToggle className="header-language-toggle" />
      </div>
    </header>
  );
}
