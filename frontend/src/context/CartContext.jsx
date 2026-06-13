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
  
  // Calculate totals
  const subtotal = cart.items.reduce((acc, item) => {
    if (item.product) {
      return acc + item.product.finalPrice * item.quantity;
    }
    return acc;
  }, 0);
  
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal > 0 ? subtotal + gst + shippingCharge : 0;

  // Fetch Cart and Wishlist on login
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart({ items: [] });
      setWishlist({ products: [] });
      setServiceablePincode(null);
      setShippingCharge(100);
    }
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
      throw new Error('Please login to add items to cart');
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
      throw new Error('Please login to manage wishlist');
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
