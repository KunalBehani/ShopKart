import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWishlistApi, 
  addToWishlistApi, 
  removeFromWishlistApi, 
  toggleWishlistApi 
} from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingMap, setSavingMap] = useState({}); // { [productId]: boolean }

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getWishlistApi();
      if (data && data.success) {
        setWishlist(data.wishlist || []);
      } else {
        setError('Unable to load wishlist.');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      const msg = err.response?.data?.message || 'Unable to load wishlist.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refetch whenever authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchWishlist]);

  // Set of product IDs currently in wishlist for quick lookup
  const wishlistIds = useMemo(() => {
    return new Set(wishlist.map((item) => (item._id ? item._id.toString() : item.toString())));
  }, [wishlist]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlistIds.has(productId.toString());
    },
    [wishlistIds]
  );

  const isSaving = useCallback(
    (productId) => {
      return !!savingMap[productId];
    },
    [savingMap]
  );

  // Add a product to wishlist
  const addToWishlist = useCallback(
    async (product) => {
      const productId = typeof product === 'string' ? product : product._id;
      if (!productId) return { success: false, message: 'Invalid product' };

      // Prevent duplicate concurrent requests
      if (savingMap[productId]) {
        return { success: false, message: 'Request in progress' };
      }

      setSavingMap((prev) => ({ ...prev, [productId]: true }));

      try {
        const data = await addToWishlistApi(productId);
        if (data && data.success) {
          // If we passed the full product object, optimistically add to list or refetch
          if (typeof product === 'object' && product._id) {
            setWishlist((prev) => {
              if (prev.some((item) => item._id === product._id)) return prev;
              return [...prev, product];
            });
          } else {
            await fetchWishlist();
          }
          return { success: true, message: data.message || 'Added to Wishlist' };
        } else {
          return { success: false, message: data?.message || 'Unable to save product. Please try again.' };
        }
      } catch (err) {
        console.error('Error adding to wishlist:', err);
        const msg = err.response?.data?.message || 'Unable to save product. Please try again.';
        return { success: false, message: msg };
      } finally {
        setSavingMap((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [savingMap, fetchWishlist]
  );

  // Remove a product from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return { success: false, message: 'Invalid product ID' };

      if (savingMap[productId]) {
        return { success: false, message: 'Request in progress' };
      }

      setSavingMap((prev) => ({ ...prev, [productId]: true }));

      try {
        const data = await removeFromWishlistApi(productId);
        if (data && data.success) {
          // Update local state without full reload
          setWishlist((prev) => prev.filter((item) => (item._id ? item._id.toString() !== productId.toString() : item.toString() !== productId.toString())));
          return { success: true, message: data.message || 'Removed from wishlist' };
        } else {
          return { success: false, message: data?.message || 'Failed to remove from wishlist' };
        }
      } catch (err) {
        console.error('Error removing from wishlist:', err);
        const msg = err.response?.data?.message || 'Unable to remove product. Please try again.';
        return { success: false, message: msg };
      } finally {
        setSavingMap((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [savingMap]
  );

  // Toggle wishlist action
  const toggleWishlist = useCallback(
    async (product) => {
      const productId = typeof product === 'string' ? product : product._id;
      if (isInWishlist(productId)) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    error,
    isInWishlist,
    isSaving,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    fetchWishlist,
    setWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
