'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pincode shipping configuration
  const [shippingCharge, setShippingCharge] = useState(100); // default shipping charge
  const [estDays, setEstDays] = useState(5);
  const [serviceablePincode, setServiceablePincode] = useState(null);

  // Helper functions for localStorage guest operations
  const getGuestCart = () => {
    if (typeof window === 'undefined') return { items: [] };
    const raw = localStorage.getItem('guest_cart');
    return raw ? JSON.parse(raw) : { items: [] };
  };

  const setGuestCart = (newCart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
    }
    setCart(newCart);
  };

  const getGuestWishlist = () => {
    if (typeof window === 'undefined') return { products: [] };
    const raw = localStorage.getItem('guest_wishlist');
    return raw ? JSON.parse(raw) : { products: [] };
  };

  const setGuestWishlist = (newWishlist) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_wishlist', JSON.stringify(newWishlist));
    }
    setWishlist(newWishlist);
  };
  
  // Calculate totals
  const subtotal = cart.items.reduce((acc, item) => {
    if (item.product) {
      return acc + item.product.finalPrice * item.quantity;
    }
    return acc;
  }, 0);
  
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal > 0 ? subtotal + gst + shippingCharge : 0;

  // Fetch Cart and Wishlist on login, merge guest items if exist
  useEffect(() => {
    async function initCartAndWishlist() {
      if (user) {
        // Merge guest cart if items exist
        if (typeof window !== 'undefined') {
          const guestCartRaw = localStorage.getItem('guest_cart');
          if (guestCartRaw) {
            try {
              const guestCartObj = JSON.parse(guestCartRaw);
              if (guestCartObj && guestCartObj.items && guestCartObj.items.length > 0) {
                for (const item of guestCartObj.items) {
                  if (item.product?._id) {
                    await api.post('/cart/add', {
                      productId: item.product._id,
                      size: item.size,
                      quantity: item.quantity,
                    });
                  }
                }
              }
            } catch (err) {
              console.error('Error merging guest cart on login', err);
            } finally {
              localStorage.removeItem('guest_cart');
            }
          }

          // Merge guest wishlist if items exist
          const guestWishlistRaw = localStorage.getItem('guest_wishlist');
          if (guestWishlistRaw) {
            try {
              const guestWishlistObj = JSON.parse(guestWishlistRaw);
              if (guestWishlistObj && guestWishlistObj.products && guestWishlistObj.products.length > 0) {
                const currentWish = await api.get('/wishlist');
                const currentIds = (currentWish.products || []).map((p) => (p._id || p).toString());
                for (const prod of guestWishlistObj.products) {
                  const prodId = (prod._id || prod).toString();
                  if (!currentIds.includes(prodId)) {
                    await api.post('/wishlist/toggle', { productId: prodId });
                  }
                }
              }
            } catch (err) {
              console.error('Error merging guest wishlist on login', err);
            } finally {
              localStorage.removeItem('guest_wishlist');
            }
          }
        }

        fetchCart();
        fetchWishlist();
      } else {
        // Load guest cart/wishlist if not logged in
        setCart(getGuestCart());
        setWishlist(getGuestWishlist());
        setServiceablePincode(null);
        setShippingCharge(100);
      }
    }
    
    initCartAndWishlist();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await api.get('/cart');
      setCart(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await api.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  };

  const addToCart = async (productId, size, quantity = 1) => {
    if (!user) {
      setLoading(true);
      try {
        const productData = await api.get(`/products/${productId}`);
        const currentCart = getGuestCart();
        const items = [...currentCart.items];
        const existingIndex = items.findIndex(
          (item) => item.product?._id === productId && item.size === size
        );
        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            product: productData,
            size,
            quantity,
          });
        }
        const newCart = { items };
        setGuestCart(newCart);
        setLoading(false);
        return newCart;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }
    setLoading(true);
    try {
      const data = await api.post('/cart/add', { productId, size, quantity });
      setCart(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const updateCartItem = async (productId, size, quantity) => {
    if (!user) {
      const currentCart = getGuestCart();
      const items = [...currentCart.items];
      const existingIndex = items.findIndex(
        (item) => item.product?._id === productId && item.size === size
      );
      if (existingIndex > -1) {
        items[existingIndex].quantity = quantity;
      }
      const newCart = { items };
      setGuestCart(newCart);
      return newCart;
    }
    setLoading(true);
    try {
      const data = await api.put('/cart/update', { productId, size, quantity });
      setCart(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const removeFromCart = async (productId, size) => {
    if (!user) {
      const currentCart = getGuestCart();
      const items = currentCart.items.filter(
        (item) => !(item.product?._id === productId && item.size === size)
      );
      const newCart = { items };
      setGuestCart(newCart);
      return newCart;
    }
    setLoading(true);
    try {
      const data = await api.post('/cart/remove', { productId, size });
      setCart(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) {
      setGuestCart({ items: [] });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guest_cart');
      }
      return;
    }
    setLoading(true);
    try {
      await api.delete('/cart/empty');
      setCart({ items: [] });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      try {
        const productData = await api.get(`/products/${productId}`);
        const currentWishlist = getGuestWishlist();
        const products = [...currentWishlist.products];
        const existingIndex = products.findIndex((p) => p._id === productId);
        let inWishlist = false;
        if (existingIndex > -1) {
          products.splice(existingIndex, 1);
          inWishlist = false;
        } else {
          products.push(productData);
          inWishlist = true;
        }
        const newWishlist = { products };
        setGuestWishlist(newWishlist);
        return { message: inWishlist ? 'Product added to wishlist' : 'Product removed from wishlist', inWishlist };
      } catch (err) {
        throw err;
      }
    }
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      fetchWishlist();
      return res; // returns { message, inWishlist }
    } catch (err) {
      throw err;
    }
  };

  const checkDelivery = async (pincode) => {
    try {
      const data = await api.get(`/pincodes/check/${pincode}`);
      if (data.serviceable) {
        setServiceablePincode(pincode);
        setShippingCharge(data.deliveryCharge);
        setEstDays(data.estDays);
      } else {
        setServiceablePincode(null);
      }
      return data; // returns { serviceable, deliveryCharge, estDays, message }
    } catch (err) {
      setServiceablePincode(null);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        subtotal,
        gst,
        shippingCharge,
        grandTotal,
        estDays,
        serviceablePincode,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        toggleWishlist,
        checkDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
