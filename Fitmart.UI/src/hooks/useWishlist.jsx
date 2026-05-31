import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { wishlistApi } from '../services/api';
import { useAuth } from './useAuth';

/* ───────────────────────────── Context ───────────────────────────── */
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  /* ── Fetch wishlist IDs khi user đăng nhập ───────────────────────── */
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }

    let cancelled = false;
    setLoading(true);

    wishlistApi.getIds()
      .then((ids) => {
        if (!cancelled && Array.isArray(ids)) {
          setWishlistIds(new Set(ids));
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách yêu thích:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  /* ── isWishlisted ────────────────────────────────────────────────── */
  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds]
  );

  /* ── toggleWishlist — optimistic UI ──────────────────────────────── */
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) return false;

      const wasWishlisted = wishlistIds.has(productId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        if (wasWishlisted) {
          await wishlistApi.remove(productId);
        } else {
          await wishlistApi.add(productId);
        }
        return true;
      } catch (err) {
        console.error('Lỗi khi cập nhật yêu thích:', err);
        // Revert on failure
        setWishlistIds((prev) => {
          const reverted = new Set(prev);
          if (wasWishlisted) {
            reverted.add(productId);
          } else {
            reverted.delete(productId);
          }
          return reverted;
        });
        return false;
      }
    },
    [isAuthenticated, wishlistIds]
  );

  /* ── refreshWishlist — full reload from API ──────────────────────── */
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const ids = await wishlistApi.getIds();
      if (Array.isArray(ids)) {
        setWishlistIds(new Set(ids));
      }
    } catch (err) {
      console.error('Lỗi khi refresh danh sách yêu thích:', err);
    }
  }, [isAuthenticated]);

  /* ── Derived ─────────────────────────────────────────────────────── */
  const wishlistCount = useMemo(() => wishlistIds.size, [wishlistIds]);

  const value = useMemo(
    () => ({
      wishlistIds,
      isWishlisted,
      toggleWishlist,
      refreshWishlist,
      wishlistCount,
      loading,
    }),
    [wishlistIds, isWishlisted, toggleWishlist, refreshWishlist, wishlistCount, loading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/* ── Hook ─────────────────────────────────────────────────────────── */
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a <WishlistProvider>');
  return ctx;
}
