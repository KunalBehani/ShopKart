import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getCartApi,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi
} from '../services/api';

const CartContext = createContext(null);

export const getCartProductId = (item) => {
  if (!item) return null;
  if (item.product && typeof item.product === 'object') {
    return item.product._id ? item.product._id.toString() : null;
  }
  return item.product ? item.product.toString() : null;
};

export const getLineSubtotal = (item) => {
  const price = Number(item?.product?.price) || 0;
  const quantity = Number(item?.quantity) || 0;
  return price * quantity;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingMap, setSavingMap] = useState({});

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCartApi();
      if (data && data.success) {
        setCart(data.cart || []);
      } else {
        setError('Unable to load cart.');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      const msg = err.response?.data?.message || 'Unable to load cart.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const isSaving = useCallback(
    (productId) => !!savingMap[productId],
    [savingMap]
  );

  const getItemByProductId = useCallback(
    (productId) => {
      if (!productId) return null;
      return cart.find((item) => getCartProductId(item) === productId.toString()) || null;
    },
    [cart]
  );

  const getItemQuantity = useCallback(
    (productId) => getItemByProductId(productId)?.quantity || 0,
    [getItemByProductId]
  );

  const isInCart = useCallback(
    (productId) => getItemQuantity(productId) > 0,
    [getItemQuantity]
  );

  const applyCartResponse = (data) => {
    if (data && data.success && Array.isArray(data.cart)) {
      setCart(data.cart);
    }
  };

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const productId = typeof product === 'string' ? product : product?._id;
      if (!productId) return { success: false, message: 'Invalid product' };

      const qtyToAdd = Number(quantity);
      if (!Number.isInteger(qtyToAdd) || qtyToAdd < 1) {
        return { success: false, message: 'Quantity must be at least 1' };
      }

      if (savingMap[productId]) {
        return { success: false, message: 'Request in progress' };
      }

      const stock = typeof product === 'object' ? Number(product.stock) : null;
      const currentQty = getItemQuantity(productId);
      const nextQty = currentQty + qtyToAdd;

      if (stock !== null && !Number.isNaN(stock)) {
        if (stock <= 0) {
          return { success: false, message: 'Product is out of stock' };
        }
        if (nextQty > stock) {
          return {
            success: false,
            message: `Cannot add more than available stock (${stock})`
          };
        }
      }

      setSavingMap((prev) => ({ ...prev, [productId]: true }));

      try {
        if (currentQty === 0) {
          const data = await addToCartApi(productId);
          if (!data?.success) {
            return { success: false, message: data?.message || 'Unable to add to cart.' };
          }

          if (qtyToAdd > 1) {
            const updated = await updateCartQuantityApi(productId, nextQty);
            if (!updated?.success) {
              applyCartResponse(data);
              return { success: false, message: updated?.message || 'Unable to update quantity.' };
            }
            applyCartResponse(updated);
            return { success: true, message: updated.message || 'Cart updated' };
          }

          applyCartResponse(data);
          return { success: true, message: data.message || 'Cart updated' };
        }

        const data = await updateCartQuantityApi(productId, nextQty);
        if (data && data.success) {
          applyCartResponse(data);
          return { success: true, message: data.message || 'Cart updated' };
        }
        return { success: false, message: data?.message || 'Unable to add to cart.' };
      } catch (err) {
        console.error('Error adding to cart:', err);
        const msg = err.response?.data?.message || 'Unable to add to cart. Please try again.';
        return { success: false, message: msg };
      } finally {
        setSavingMap((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [savingMap, getItemQuantity]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!productId) return { success: false, message: 'Invalid product ID' };

      const numQty = Number(quantity);
      if (!Number.isInteger(numQty) || numQty < 1) {
        return { success: false, message: 'Quantity must be an integer and at least 1' };
      }

      const existing = getItemByProductId(productId);
      const stock = existing?.product?.stock;
      if (typeof stock === 'number' && numQty > stock) {
        return {
          success: false,
          message: `Requested quantity exceeds available stock (${stock})`
        };
      }

      if (savingMap[productId]) {
        return { success: false, message: 'Request in progress' };
      }

      setSavingMap((prev) => ({ ...prev, [productId]: true }));

      try {
        const data = await updateCartQuantityApi(productId, numQty);
        if (data && data.success) {
          applyCartResponse(data);
          return { success: true, message: data.message || 'Cart updated' };
        }
        return { success: false, message: data?.message || 'Unable to update quantity.' };
      } catch (err) {
        console.error('Error updating cart quantity:', err);
        const msg = err.response?.data?.message || 'Unable to update quantity. Please try again.';
        return { success: false, message: msg };
      } finally {
        setSavingMap((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [savingMap, getItemByProductId]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!productId) return { success: false, message: 'Invalid product ID' };

      if (savingMap[productId]) {
        return { success: false, message: 'Request in progress' };
      }

      setSavingMap((prev) => ({ ...prev, [productId]: true }));

      try {
        const data = await removeFromCartApi(productId);
        if (data && data.success) {
          applyCartResponse(data);
          return { success: true, message: data.message || 'Item removed from cart' };
        }
        return { success: false, message: data?.message || 'Failed to remove from cart' };
      } catch (err) {
        console.error('Error removing from cart:', err);
        const msg = err.response?.data?.message || 'Unable to remove product. Please try again.';
        return { success: false, message: msg };
      } finally {
        setSavingMap((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [savingMap]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getLineSubtotal(item), 0),
    [cart]
  );

  const value = {
    cart,
    cartCount,
    subtotal,
    loading,
    error,
    isInCart,
    isSaving,
    getItemQuantity,
    addToCart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    setCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
