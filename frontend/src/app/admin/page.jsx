'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Trash2, Edit, CheckCircle, Package, Truck, Compass, Star, Ban, Unlock, Settings, MapPin, BarChart3, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Stats state
  const [stats, setStats] = useState(null);

  // 2. Product list state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding

  // Product form fields
  const [prodName, setProdName] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('Saree');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodSizes, setProdSizes] = useState(['M', 'L', 'XL']);
  const [prodImages, setProdImages] = useState('');
  
  // Specs form fields
  const [specFabric, setSpecFabric] = useState('');
  const [specMaterial, setSpecMaterial] = useState('');
  const [specQuality, setSpecQuality] = useState('');
  const [specWeight, setSpecWeight] = useState('');
  const [specColor, setSpecColor] = useState('');
  const [specDesign, setSpecDesign] = useState('');
  const [specPattern, setSpecPattern] = useState('');
  const [specSleeve, setSpecSleeve] = useState('');
  const [specNeck, setSpecNeck] = useState('');
  const [specOccasion, setSpecOccasion] = useState('');
  const [specWash, setSpecWash] = useState('');

  // 3. Orders list state
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Placed');
  const [courier, setCourier] = useState('');
  const [trackId, setTrackId] = useState('');
  const [estDelivery, setEstDelivery] = useState('');

  // 4. Pincodes state
  const [pincodes, setPincodes] = useState([]);
  const [pinInput, setPinInput] = useState('');
  const [pinCharge, setPinCharge] = useState('50');
  const [pinDays, setPinDays] = useState('5');
  const [pinServiceable, setPinServiceable] = useState(true);

  // 5. Customers state
  const [customers, setCustomers] = useState([]);

  // Role verification redirection
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'admin') {
      router.push('/');
    } else {
      loadStats();
      loadProducts();
      loadOrders();
      loadPincodes();
      loadCustomers();
    }
  }, [user]);

  // Load functions
  const loadStats = async () => {
    try {
      const data = await api.get('/admin/dashboard-stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.get('/products?pageSize=100');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPincodes = async () => {
    try {
      const data = await api.get('/admin/pincodes');
      setPincodes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await api.get('/admin/customers');
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Product operations
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCode('');
    setProdBrand('');
    setProdCategory('Saree');
    setProdOrigPrice('');
    setProdDiscount('0');
    setProdStock('');
    setProdSizes(['M', 'L', 'XL']);
    setProdImages('');
    
    // Clear specs
    setSpecFabric('Georgette');
    setSpecMaterial('Polyester Georgette');
    setSpecQuality('Premium');
    setSpecWeight('400 grams');
    setSpecColor('Crimson Red');
    setSpecDesign('Floral border');
    setSpecPattern('Printed');
    setSpecSleeve('3/4th sleeves');
    setSpecNeck('Round neck');
    setSpecOccasion('Wedding Wear');
    setSpecWash('Dry clean only');

    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCode(prod.code);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdOrigPrice(prod.originalPrice);
    setProdDiscount(prod.discountPercentage);
    setProdStock(prod.stock);
    setProdSizes(prod.sizes);
    setProdImages(prod.images.join(', '));
    
    // Specs
    const desc = prod.description || {};
    setSpecFabric(desc.fabric || '');
    setSpecMaterial(desc.material || '');
    setSpecQuality(desc.quality || '');
    setSpecWeight(desc.weight || '');
    setSpecColor(desc.color || '');
    setSpecDesign(desc.design || '');
    setSpecPattern(desc.pattern || '');
    setSpecSleeve(desc.sleeveType || '');
    setSpecNeck(desc.neckType || '');
    setSpecOccasion(desc.occasion || '');
    setSpecWash(desc.washCare || '');

    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');
    
    const prodData = {
      name: prodName,
      code: prodCode,
      brand: prodBrand,
      category: prodCategory,
      originalPrice: Number(prodOrigPrice),
      discountPercentage: Number(prodDiscount),
      stock: Number(prodStock),
      sizes: prodSizes,
      images: prodImages.split(',').map((img) => img.trim()).filter((img) => img !== ''),
      description: {
        fabric: specFabric,
        material: specMaterial,
        quality: specQuality,
        weight: specWeight,
        color: specColor,
        design: specDesign,
        pattern: specPattern,
        sleeveType: specSleeve,
        neckType: specNeck,
        occasion: specOccasion,
        washCare: specWash,
      },
    };

    try {
      if (editingProduct) {
        // Edit API call
        await api.put(`/admin/products/${editingProduct._id}`, prodData);
      } else {
        // Create API call
        await api.post('/admin/products', prodData);
      }
      setShowProductModal(false);
      loadProducts();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
      loadStats();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        courierPartner: courier,
        trackingId: trackId,
        expectedDeliveryDate: estDelivery,
      });
      setSelectedOrder(null);
      loadOrders();
      loadStats();
      alert('Order status updated!');
    } catch (err) {
      alert(err.message || 'Failed to update order');
    }
  };

  // Customer block/unblock
  const handleToggleBlock = async (id, currentBlockStatus) => {
    try {
      await api.put(`/admin/customers/${id}/block`, {
        isBlocked: !currentBlockStatus,
      });
      loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to block/unblock customer');
    }
  };

  // Pincode add/remove
  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!pinInput || pinInput.length !== 6 || isNaN(pinInput)) {
      alert('Enter a valid 6-digit pincode');
      return;
    }
    try {
      await api.post('/admin/pincodes', {
        pincode: pinInput,
        serviceable: pinServiceable,
        deliveryCharge: Number(pinCharge),
        estDays: Number(pinDays),
      });
      setPinInput('');
      loadPincodes();
    } catch (err) {
      alert(err.message || 'Failed to save pincode');
    }
  };

  const handleDeletePincode = async (id) => {
    try {
      await api.delete(`/admin/pincodes/${id}`);
      loadPincodes();
    } catch (err) {
      alert(err.message || 'Failed to delete pincode');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar navigation panel */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-fit">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 dark:border-slate-700/60 mb-6">
          <div className="w-10 h-10 bg-brand-teal/15 text-brand-teal rounded-full flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-150 text-sm">Seller Panel</h3>
            <span className="text-[9px] uppercase bg-brand-gold text-brand-teal-dark px-1.5 py-0.5 rounded font-extrabold tracking-wider">
              Control
            </span>
          </div>
        </div>

        <ul className="space-y-2 text-sm font-semibold">
          <li>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'stats'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 size={18} />
              <span>Metrics & Stats</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Package size={18} />
              <span>Manage Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Truck size={18} />
              <span>Manage Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('pincodes')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'pincodes'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin size={18} />
              <span>Deliverable Zones</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
                activeTab === 'customers'
                  ? 'bg-brand-teal text-white shadow'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Ban size={18} />
              <span>Manage Customers</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main panel displays */}
      <div className="flex-grow bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 rounded-3xl shadow-sm min-h-[520px]">
        
        {/* STATS TAB */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3">
              Performance Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
                <span className="text-xs text-slate-450 uppercase font-semibold">Total Revenue</span>
                <p className="text-2xl font-extrabold text-brand-teal mt-1">₹{stats.totalSales}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
                <span className="text-xs text-slate-450 uppercase font-semibold">Total Orders</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
                <span className="text-xs text-slate-450 uppercase font-semibold">Total Inventory</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
                <span className="text-xs text-slate-450 uppercase font-semibold">User Accounts</span>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-205 uppercase tracking-wider">Recent Orders Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-100 dark:border-slate-700/60">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                    {stats.recentOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-brand-teal">{ord.invoiceNumber}</td>
                        <td className="p-3">{ord.user?.name || 'Guest'}</td>
                        <td className="p-3 font-bold">₹{ord.grandTotal}</td>
                        <td className="p-3 uppercase font-bold text-brand-gold">{ord.status}</td>
                        <td className="p-3 text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Package size={20} className="text-brand-teal" />
                <span>Inventory Catalog</span>
              </h2>
              <button
                onClick={handleOpenAddProduct}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Catalog list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-100 dark:border-slate-700/60">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold">{prod.code}</td>
                      <td className="p-3 font-bold">{prod.name}</td>
                      <td className="p-3">{prod.category}</td>
                      <td className="p-3">₹{prod.finalPrice}</td>
                      <td className={`p-3 font-semibold ${prod.stock === 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{prod.stock} Units</td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1 text-slate-400 hover:text-brand-teal"
                          aria-label="Edit product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS DISPATCH STATUS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3">
              Manage Active Orders
            </h2>

            {/* List orders */}
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-5 border border-slate-150 dark:border-slate-700/60 rounded-2xl bg-slate-50 dark:bg-slate-900/50 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-850 dark:text-slate-100">Order #{ord.invoiceNumber}</span>
                        <span className="text-[9px] bg-brand-gold/15 text-brand-gold-dark px-1.5 py-0.5 rounded font-extrabold uppercase">{ord.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Customer: {ord.user?.name || 'Unregistered'} | Mobile: {ord.user?.mobile || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Items: {ord.items.map((i) => `${i.name} (${i.size} x${i.quantity})`).join(', ')}</p>
                      <p className="text-xs text-slate-500">Destination: {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.status);
                          setCourier(ord.courierPartner || '');
                          setTrackId(ord.trackingId || '');
                          setEstDelivery(ord.expectedDeliveryDate ? new Date(ord.expectedDeliveryDate).toISOString().slice(0, 10) : '');
                        }}
                        className="py-2 px-4 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Update Dispatch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Status Dialog Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <form onSubmit={handleUpdateOrderStatus} className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm border shadow-xl space-y-4">
                  <h3 className="font-bold text-base text-slate-850 dark:text-slate-100">Update Order Dispatch Details</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Status Flow</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    >
                      <option value="Placed">Order Placed</option>
                      <option value="Confirmed">Payment Confirmed</option>
                      <option value="Accepted">Order Accepted</option>
                      <option value="Packed">Product Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="InTransit">In Transit</option>
                      <option value="OutForDelivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Courier Partner</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhivery, DTDC"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Tracking ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TRACK12345"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={estDelivery}
                      onChange={(e) => setEstDelivery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold"
                    >
                      Save Status
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* PINCODES CONFIGURATION TAB */}
        {activeTab === 'pincodes' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
              <MapPin size={20} className="text-brand-teal" />
              <span>Serviceable Pincodes Configuration</span>
            </h2>

            {/* Add Pincode form */}
            <form onSubmit={handleAddPincode} className="p-5 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-4 max-w-lg shadow-sm">
              <h3 className="font-bold text-sm text-slate-705 dark:text-slate-200">Configure Pincode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-Digit Pincode (e.g., 360001)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                />
                <input
                  type="number"
                  required
                  placeholder="Delivery Charge (₹)"
                  value={pinCharge}
                  onChange={(e) => setPinCharge(e.target.value)}
                  className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                />
                <input
                  type="number"
                  required
                  placeholder="Estimated Days (e.g. 5)"
                  value={pinDays}
                  onChange={(e) => setPinDays(e.target.value)}
                  className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800"
                />
                <select
                  value={pinServiceable}
                  onChange={(e) => setPinServiceable(e.target.value === 'true')}
                  className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800"
                >
                  <option value="true">Serviceable (Delivery Available)</option>
                  <option value="false">Unserviceable (Delivery Blocked)</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm"
              >
                Save Pincode
              </button>
            </form>

            {/* Pincode directory grid */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-205 uppercase tracking-wider">Serviceable Directory</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pincodes.map((pin) => (
                  <div
                    key={pin._id}
                    className="p-4 border border-slate-150 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/40 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-150">{pin.pincode}</p>
                      <p className="text-[10px] text-slate-400">Charge: ₹{pin.deliveryCharge} | Days: {pin.estDays}</p>
                      <p className={`text-[9px] font-bold ${pin.serviceable ? 'text-green-600' : 'text-red-500'}`}>
                        {pin.serviceable ? 'SERVICEABLE' : 'BLOCKED'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePincode(pin._id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      aria-label="Delete pincode"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS MANAGEMENT TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
              <Ban size={20} className="text-brand-teal" />
              <span>Customer Registry</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-100 dark:border-slate-700/60">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {customers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold">{cust.name}</td>
                      <td className="p-3">{cust.email}</td>
                      <td className="p-3">{cust.mobile}</td>
                      <td className={`p-3 font-bold ${cust.isBlocked ? 'text-red-500' : 'text-green-600'}`}>
                        {cust.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleBlock(cust._id, cust.isBlocked)}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                            cust.isBlocked
                              ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                              : 'border-red-200 text-red-550 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {cust.isBlocked ? (
                            <>
                              <Unlock size={10} />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <Ban size={10} />
                              <span>Block</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add/Edit Product Modal Dialog Overlay */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-8">
            <h3 className="font-bold text-lg font-serif text-slate-850 dark:text-slate-100 border-b pb-2">
              {editingProduct ? 'Edit Dress Product' : 'Add New Dress Product'}
            </h3>

            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 text-red-650 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Basic info */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Elegant Silk Saree"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="e.g. SAREE-SILK-01"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. Varanasi Weaves"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  >
                    <option value="Saree">Saree</option>
                    <option value="Kurti">Kurti</option>
                    <option value="Salwar Suit">Salwar Suit</option>
                    <option value="Lehenga">Lehenga</option>
                    <option value="Western Dress">Western Dress</option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Men's Wear">Men's Wear</option>
                    <option value="Kids Wear">Kids Wear</option>
                  </select>
                </div>
                
                {/* Pricing & Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodOrigPrice}
                    onChange={(e) => setProdOrigPrice(e.target.value)}
                    placeholder="3999"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sizes (Separated by space)</label>
                  <input
                    type="text"
                    placeholder="XS S M L XL XXL"
                    value={prodSizes.join(' ')}
                    onChange={(e) => setProdSizes(e.target.value.toUpperCase().split(' ').filter(s => s !== ''))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Images (URLs separated by comma)</label>
                  <input
                    type="text"
                    required
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                {/* Fabric Specifications Section */}
                <div className="sm:col-span-2 border-t pt-3 mt-3">
                  <h4 className="font-bold text-xs uppercase text-brand-teal mb-3">Fabric & Design Specifications</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-450 uppercase mb-1">Fabric</label>
                      <input type="text" required value={specFabric} onChange={(e) => setSpecFabric(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Material</label>
                      <input type="text" required value={specMaterial} onChange={(e) => setSpecMaterial(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Quality</label>
                      <input type="text" required value={specQuality} onChange={(e) => setSpecQuality(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Weight</label>
                      <input type="text" required value={specWeight} onChange={(e) => setSpecWeight(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Color</label>
                      <input type="text" required value={specColor} onChange={(e) => setSpecColor(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Design</label>
                      <input type="text" required value={specDesign} onChange={(e) => setSpecDesign(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Pattern</label>
                      <input type="text" required value={specPattern} onChange={(e) => setSpecPattern(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Sleeve Type</label>
                      <input type="text" required value={specSleeve} onChange={(e) => setSpecSleeve(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Neck Type</label>
                      <input type="text" required value={specNeck} onChange={(e) => setSpecNeck(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Occasion</label>
                      <input type="text" required value={specOccasion} onChange={(e) => setSpecOccasion(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-semibold text-slate-455 uppercase mb-1">Wash Care</label>
                      <input type="text" required value={specWash} onChange={(e) => setSpecWash(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border text-xs py-1.5 px-3 rounded" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2.5 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-teal text-white rounded-lg text-xs font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
