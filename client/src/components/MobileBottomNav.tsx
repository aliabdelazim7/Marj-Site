import { House, Package, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";

const navItems = [
  { href: "/", label: "الرئيسية", icon: House, match: (path: string) => path === "/" },
  { href: "/products", label: "المنتجات", icon: Package, match: (path: string) => path === "/products" || path.startsWith("/product/") },
  { href: "/#try-on", label: "جرّبه عليك", icon: Sparkles, match: () => false, accent: true },
  { href: "/cart", label: "السلة", icon: ShoppingBag, match: (path: string) => path === "/cart" },
  { href: "/account", label: "حسابي", icon: UserRound, match: (path: string) => path === "/account" },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const cart = useCart();
  const isHiddenRoute = location.startsWith("/admin") || location === "/checkout";
  useEffect(() => {
    document.body.classList.toggle("has-mobile-bottom-nav", !isHiddenRoute);
    return () => document.body.classList.remove("has-mobile-bottom-nav");
  }, [isHiddenRoute]);
  if (isHiddenRoute) return null;

  return <nav className="mobile-bottom-nav" aria-label="التنقل السريع">
    {navItems.map(({ href, label, icon: Icon, match, accent }) => {
      const active = match(location);
      const isCart = href === "/cart";
      return <Link href={href} key={href} className={`mobile-bottom-nav-item ${active ? "is-active" : ""} ${accent ? "is-accent" : ""}`} aria-current={active ? "page" : undefined}>
        <span className="mobile-bottom-nav-icon"><Icon size={19} strokeWidth={active || accent ? 2.4 : 1.9} />{isCart && cart.itemCount > 0 ? <b>{cart.itemCount}</b> : null}</span>
        <span>{label}</span>
      </Link>;
    })}
  </nav>;
}
