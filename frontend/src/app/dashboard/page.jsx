'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, MapPin, Heart, ShoppingBag, Lock, Trash2, Edit2, Download, Eye, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile, changeUserPassword } = useAuth();
  const { wishlist, toggleWishlist, checkDelivery } = useCart();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  // Profile states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addrErr, setAddrErr] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      setName(user.name);
      setEmail(user.email);
      setMobile(user.mobile);
      loadAddresses();
      loadOrders();
    }
  }, [user]);

  // Sync tab with url query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadAddresses = async () => {
    try {
      const data = await api.get('/orders/addresses');
      setAddresses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setLoading(true);
    try {
      await updateProfile({ name, email, mobile });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    if (newPassword !== confirmNewPassword) {
      setPwdErr('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changeUserPassword({ currentPassword, newPassword, confirmNewPassword });
      setPwdMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPwdErr(err.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddrErr('');
    setLoading(true);
    try {
      // Check pincode serviceability
      const pinData = await checkDelivery(pincode);
      if (!pinData.serviceable) {
        setAddrErr('Sorry, Delivery Not Available At Your Location (Pincode not serviceable)');
        setLoading(false);
        return;
      }

      const newAddr = await api.post('/orders/addresses', {
        fullName,
        mobile: addrMobile,
        houseNo,
        streetAddress,
        area,
        city,
        district,
        state,
        pincode,
        landmark,
      });

      setAddresses((prev) => [newAddr, ...prev]);
      setShowAddressForm(false);
      
      // Clear form
      setFullName('');
      setAddrMobile('');
      setHouseNo('');
      setStreetAddress('');
      setArea('');
      setCity('');
      setDistrict('');
      setState('');
      setPincode('');
      setLandmark('');
    } catch (err) {
      setAddrErr(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/orders/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleDownloadInvoice = async (orderId, invoiceNo) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download invoice PDF');
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-fit">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-700/60 mb-6">
          <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal font-bold text-lg shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{user.name}</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold">{user.role}</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm font-semibold">
          <li>
            <button
              onClick={() => { setActiveTab('profile'); router.push('/dashboard?tab=profile'); }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <User size={18} />
              <span>Edit Details</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('orders'); router.push('/dashboard?tab=orders'); }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('addresses'); router.push('/dashboard?tab=addresses'); }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'addresses'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin size={18} />
              <span>Delivery Addresses</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('wishlist'); router.push('/dashboard?tab=wishlist'); }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart size={18} />
              <span>Wishlist Grid</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 rounded-3xl shadow-sm min-h-[500px]">
        
        {/* EDIT PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
              <User size={20} className="text-brand-teal" />
              <span>Account Information</span>
            </h2>

            {/* Profile Info Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Update Profile Details</h3>
              {profileMsg && <div className="p-3 text-xs bg-green-50 rounded-lg text-green-700 font-semibold">{profileMsg}</div>}
              {profileErr && <div className="p-3 text-xs bg-red-50 rounded-lg text-red-650">{profileErr}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow"
              >
                Save Details
              </button>
            </form>

            {/* Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg pt-6 border-t">
              <h3 className="font-bold text-sm text-slate-755 dark:text-slate-200">Change Account Password</h3>
              {pwdMsg && <div className="p-3 text-xs bg-green-50 rounded-lg text-green-700 font-semibold">{pwdMsg}</div>}
              {pwdErr && <div className="p-3 text-xs bg-red-50 rounded-lg text-red-650">{pwdErr}</div>}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-saffron hover:bg-brand-saffron-dark text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow"
              >
                Change Password
              </button>
            </form>
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
              <ShoppingBag size={20} className="text-brand-teal" />
              <span>Purchase History</span>
            </h2>

            {ordersLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="bg-slate-100 h-20 rounded-xl" />
                <div className="bg-slate-100 h-20 rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-dashed rounded-3xl text-sm text-slate-400">
                No purchases found. Visit the catalog to make an order.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-5 border border-slate-150 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Order #{order.invoiceNumber}</span>
                        <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded font-bold uppercase">{order.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1 truncate max-w-sm">
                        Items: {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                      <p className="text-sm font-bold text-brand-teal dark:text-brand-teal-light mt-1">₹{order.grandTotal}</p>
                    </div>

                    <div className="flex sm:flex-col gap-2 justify-end sm:items-end">
                      <Link
                        href={`/order-tracking/${order._id}`}
                        className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-lg text-xs font-semibold border flex items-center space-x-1.5"
                      >
                        <Eye size={12} />
                        <span>Track Status</span>
                      </Link>
                      
                      <button
                        onClick={() => handleDownloadInvoice(order._id, order.invoiceNumber)}
                        className="py-2 px-4 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download size={12} />
                        <span>PDF Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DELIVERY ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <MapPin size={20} className="text-brand-teal" />
                <span>Delivery Addresses</span>
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {addrErr && <div className="p-3 text-xs bg-red-50 rounded-lg text-red-650 max-w-lg">{addrErr}</div>}

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-6 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-4 max-w-lg shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">New Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-Digit Mobile"
                    value={addrMobile}
                    onChange={(e) => setAddrMobile(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="House / Flat No"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Colony"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Locality"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-850"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg text-xs font-semibold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List saved addresses */}
            <div className="grid grid-cols-1 gap-4">
              {addresses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-dashed rounded-3xl text-sm text-slate-400">
                  No saved addresses. Please click Add New to configure one.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-5 border border-slate-150 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm flex justify-between items-start"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-brand-gold/15 text-brand-gold-dark px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Mobile: {addr.mobile}</p>
                      <p className="text-xs text-slate-400">{addr.houseNo}, {addr.streetAddress}, {addr.area}</p>
                      <p className="text-xs text-slate-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                      aria-label="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* WISHLIST GRID TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
              <Heart size={20} className="text-brand-teal" />
              <span>Wishlist Collection</span>
            </h2>

            {wishlist.products?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-dashed rounded-3xl text-sm text-slate-400">
                Your wishlist is empty. Add dresses from the catalog!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {wishlist.products?.map((prod) => (
                  <div key={prod._id} className="relative flex flex-col bg-slate-50 dark:bg-slate-900/30 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <Image
                        src={prod.images && prod.images.length > 0 ? prod.images[0] : ''}
                        alt={prod.name}
                        fill
                        className="object-cover object-top"
                      />
                      <button
                        onClick={() => handleRemoveWishlist(prod._id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow hover:scale-110 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-brand-teal dark:text-brand-teal-light font-bold mt-1">₹{prod.finalPrice}</p>
                      </div>
                      <Link
                        href={`/product/${prod._id}`}
                        className="mt-3 block text-center py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg text-[10px] font-bold shadow-sm"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
