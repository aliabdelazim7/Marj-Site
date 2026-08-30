import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type WishlistContextValue = { ids: string[]; count: number; has: (id: string, databaseId?: number) => boolean; toggle: (id: string, databaseId?: number) => void; clear: () => void };
const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "hoodiefit-wishlist-v1";
function loadWishlist() { try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []; } catch { return []; } }
function persistWishlist(ids: string[]) { if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => typeof window === "undefined" ? [] : loadWishlist());
  const { user } = useAuth();
  const accountWishlist = trpc.growth.wishlist.list.useQuery(undefined, { enabled: Boolean(user) });
  const utils = trpc.useUtils();
  const toggleAccountWishlist = trpc.growth.wishlist.toggle.useMutation({ onSuccess: () => void utils.growth.wishlist.list.invalidate() });
  useEffect(() => { persistWishlist(ids); }, [ids]);
  const commit = (updater: (current: string[]) => string[]) => setIds((current) => { const next = updater(current); persistWishlist(next); return next; });
  const accountIds = accountWishlist.data ?? [];
  const value = useMemo(() => ({ ids, count: ids.length, has: (id: string, databaseId?: number) => ids.includes(id) || (databaseId !== undefined && accountIds.includes(databaseId)), toggle: (id: string, databaseId?: number) => { const alreadySaved = ids.includes(id) || (databaseId !== undefined && accountIds.includes(databaseId)); commit((current) => alreadySaved ? current.filter((item) => item !== id) : [...current, id]); if (user && databaseId !== undefined) toggleAccountWishlist.mutate({ productId: databaseId }); }, clear: () => commit(() => []) }), [accountIds, ids, toggleAccountWishlist, user]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() { const value = useContext(WishlistContext); if (!value) throw new Error("useWishlist must be used inside WishlistProvider"); return value; }
