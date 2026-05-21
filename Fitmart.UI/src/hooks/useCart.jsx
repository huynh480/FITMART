import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'fitmart_cart';

/**
 * Read cart from localStorage (returns [] on any failure).
 */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist cart to localStorage.
 */
function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

/* ───────────────────────────── Context ───────────────────────────── */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage whenever cartItems change
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  /* ── addToCart ───────────────────────────────────────────────────── */
  const addToCart = useCallback((product, size, color, quantity = 1) => {
    setCartItems((prev) => {
      // Check if exact product+size+color combo already exists
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size === size &&
          item.colorId === color.id
      );

      if (existingIdx !== -1) {
        // Increase quantity of existing item
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }

      // New cart item
      const newItem = {
        id: `${product.id}_${color.id}_${size}_${Date.now()}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: color.images?.[0] || '',
        colorId: color.id,
        colorName: color.name,
        size,
        price: product.salePrice || product.price,
        originalPrice: product.price,
        salePrice: product.salePrice || null,
        quantity,
      };

      return [...prev, newItem];
    });
  }, []);

  /* ── removeFromCart ──────────────────────────────────────────────── */
  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  /* ── updateQuantity ─────────────────────────────────────────────── */
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.min(quantity, 99) } : item
      )
    );
  }, []);

  /* ── clearCart ───────────────────────────────────────────────────── */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /* ── Drawer open/close ──────────────────────────────────────────── */
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /* ── Derived values ─────────────────────────────────────────────── */
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      totalPrice,
      totalItems,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart, isCartOpen, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ── Hook ─────────────────────────────────────────────────────────── */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a <CartProvider>');
  return ctx;
}
