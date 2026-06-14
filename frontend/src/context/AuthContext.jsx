'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync auth state on mount
  useEffect(() => {
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    let storedInfo = localStorage.getItem(isAdminPath ? 'adminInfo' : 'userInfo');
    if (!storedInfo) {
      storedInfo = localStorage.getItem(isAdminPath ? 'userInfo' : 'adminInfo');
    }
    if (storedInfo) {
      setUser(JSON.parse(storedInfo));
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/login', { loginId, password });
      setUser(data);
      if (data.role === 'admin') {
        localStorage.setItem('adminInfo', JSON.stringify(data));
      } else {
        localStorage.setItem('userInfo', JSON.stringify(data));
      }
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, mobile, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/register', {
        name,
        email,
        mobile,
        password,
        confirmPassword,
      });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    localStorage.removeItem(isAdminPath ? 'adminInfo' : 'userInfo');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put('/auth/profile', profileData);
      setUser(data);
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      localStorage.setItem(isAdminPath ? 'adminInfo' : 'userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const changeUserPassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put('/auth/change-password', passwordData);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changeUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
