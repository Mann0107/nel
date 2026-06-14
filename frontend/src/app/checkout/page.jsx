'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, CheckCircle, ShieldCheck, ShoppingBag, CreditCard, ChevronRight, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, subtotal, gst, shippingCharge, grandTotal, clearCart, checkDelivery } = useCart();

  const [step, setStep] = useState(1); // 1 = Address, 2 = Review, 3 = Pay, 4 = Confirmed
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // Placed order information
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' or 'COD'
  const [transactionId, setTransactionId] = useState('');
  const [verificationMsg, setVerificationMsg] = useState('');

  // Fetch addresses on mount
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await api.get('/orders/addresses');
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((addr) => addr.isDefault) || data[0];
        setSelectedAddressId(defaultAddr._id);
        // check shipping for the default address
        checkDelivery(defaultAddr.pincode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAddress = (id, pincodeVal) => {
    setSelectedAddressId(id);
    checkDelivery(pincodeVal);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newAddr = await api.post('/orders/addresses', {
        fullName,
        mobile,
        houseNo,
        streetAddress,
        area,
        city,
        district,
        state,
        pincode,
        landmark,
        isDefault: addresses.length === 0,
      });

      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr._id);
      checkDelivery(newAddr.pincode);
      setShowAddressForm(false);
      
      // Clear form
      setFullName('');
      setMobile('');
      setHouseNo('');
      setStreetAddress('');
      setArea('');
      setCity('');
      setDistrict('');
      setState('');
      setPincode('');
      setLandmark('');
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (paymentMethod === 'COD') {
        const verifyRes = await api.post('/orders/verify-payment', {
          addressId: selectedAddressId,
          paymentMethod: 'COD',
        });
        
        setConfirmedOrder(verifyRes);
        clearCart();
        setStep(4);
        setLoading(false);
        return;
      }

      if (paymentMethod === 'Online') {
        if (!transactionId.trim()) {
          setError('Please enter the Transaction Reference Number (UTR) first.');
          setLoading(false);
          return;
        }

        // Simulate verification steps before placing the order
        setVerificationMsg('Initiating payment verification for UTR: ' + transactionId.trim() + '...');
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVerificationMsg('Verifying payment amount ₹' + grandTotal + ' with UPI network...');
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVerificationMsg('Authenticating reference transaction ID with bank registry...');
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setVerificationMsg('Payment verified successfully! Placing your order...');
        
        await new Promise((resolve) => setTimeout(resolve, 600));

        const verifyRes = await api.post('/orders/verify-payment', {
          addressId: selectedAddressId,
          paymentMethod: 'Online',
          paymentId: transactionId.trim(),
        });
        
        setConfirmedOrder(verifyRes);
        clearCart();
        setStep(4);
        setLoading(false);
        setVerificationMsg('');
        return;
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
      setLoading(false);
      setVerificationMsg('');
    }
  };

  const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);

  if (!user || cart.items.length === 0 && step !== 4) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100">Checkout Unavailable</h2>
        <p className="text-slate-400 mt-2">Please add items to your cart before checking out.</p>
        <Link href="/shop" className="mt-6 inline-block bg-brand-teal text-white px-6 py-2.5 rounded-lg text-sm">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 max-w-lg mx-auto pb-4 border-b border-slate-100 dark:border-slate-800">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-brand-teal text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-brand-teal text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-brand-teal text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step === 4 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>✓</span>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-sm max-w-3xl mx-auto">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main step routing */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Address select list */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <MapPin size={20} className="text-brand-teal" />
              <span>Select Shipping Address</span>
            </h2>

            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 border rounded-2xl text-sm text-slate-400">
                No saved addresses found. Please add an address below to proceed.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => handleSelectAddress(addr._id, addr.pincode)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between bg-white dark:bg-slate-800 ${
                      selectedAddressId === addr._id
                        ? 'border-brand-teal ring-2 ring-brand-teal/5'
                        : 'border-slate-100 dark:border-slate-700/50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-150">{addr.fullName} ({addr.mobile})</p>
                      <p className="text-xs text-slate-400 mt-1">{addr.houseNo}, {addr.streetAddress}, {addr.area}</p>
                      <p className="text-xs text-slate-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                    {selectedAddressId === addr._id && (
                      <CheckCircle size={18} className="text-brand-teal mt-1 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Address Form Toggle button */}
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 border-dashed text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            )}

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">New Delivery Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-Digit Mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Colony Address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Locality"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-Digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="rounded-lg p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
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
          </div>

          {/* Checkout Right panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-150 uppercase tracking-widest border-b pb-2">Checkout Details</h3>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Items Count:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">{cart.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cart Total:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{subtotal}</span>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedAddressId}
                className="w-full py-3 bg-brand-saffron hover:bg-brand-saffron-dark text-white rounded-xl text-sm font-semibold shadow disabled:opacity-50"
              >
                Proceed to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 flex items-center space-x-2">
            <ShoppingBag size={20} className="text-brand-teal" />
            <span>Review Your Order</span>
          </h2>

          {/* Selected Address review */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider mb-2">Delivery Address</h4>
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{selectedAddress?.fullName} ({selectedAddress?.mobile})</p>
            <p className="text-xs text-slate-400 mt-1">
              {selectedAddress?.houseNo}, {selectedAddress?.streetAddress}, {selectedAddress?.area}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
            </p>
          </div>

          {/* Cart items list review */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider mb-2">Items Review</h4>
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-750/30">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{item.product?.name}</p>
                  <p className="text-xs text-slate-400">Size: {item.size} | Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{item.product?.finalPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider">Select Payment Method</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('Online')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'Online'
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                }`}
              >
                <CreditCard size={18} />
                <span className="text-xs font-bold">Online Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                }`}
              >
                <ShoppingBag size={18} />
                <span className="text-xs font-bold text-center">Cash on Delivery</span>
                <span className="text-[9px] text-brand-saffron font-extrabold">+ ₹10 COD Charge</span>
              </button>
            </div>
          </div>

          {/* UPI / Bank Details instructions */}
          {paymentMethod === 'Online' && (
            <div className="p-5 border border-brand-teal/20 bg-brand-teal/5 dark:bg-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-brand-teal">
                <CreditCard size={18} />
                <h4 className="font-bold text-xs uppercase tracking-wider">Pay using UPI or Bank Transfer</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Please scan the QR code below, open your UPI application, or use the Bank details to pay the grand total of **₹{grandTotal}** first. Once paid, enter the transaction ID/UTR number below to verify and place your order.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                {/* QR Code */}
                <div className="w-36 h-36 border-2 border-white bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=manngondaliya123-1@okaxis&pn=Khodal Saree&am=${grandTotal}&cu=INR&tn=Order%20Payment`)}`}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* UPI & Bank Details list */}
                <div className="space-y-2 text-xs w-full text-slate-600 dark:text-slate-350">
                  <div>
                    <span className="font-bold block text-[10px] text-slate-400 uppercase">UPI ID</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">manngondaliya123-1@okaxis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-bold block text-[10px] text-slate-400 uppercase">Account Holder</span>
                      <span className="font-semibold text-slate-850 dark:text-slate-250">Khodal Saree</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[10px] text-slate-400 uppercase">Bank Name</span>
                      <span className="font-semibold text-slate-850 dark:text-slate-250 font-sans">State Bank of India</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[10px] text-slate-400 uppercase">Account No</span>
                      <span className="font-semibold text-slate-850 dark:text-slate-250">409210921092</span>
                    </div>
                    <div>
                      <span className="font-bold block text-[10px] text-slate-400 uppercase">IFSC Code</span>
                      <span className="font-semibold text-slate-850 dark:text-slate-250 font-sans">SBIN0001234</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Now Button for Mobile Users */}
              <div className="pt-1">
                <a
                  href={`upi://pay?pa=manngondaliya123-1@okaxis&pn=Khodal%20Saree&am=${grandTotal}&cu=INR&tn=OrderPayment`}
                  className="w-full py-2.5 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard size={14} />
                  <span>Open UPI Application to Pay (₹{grandTotal})</span>
                </a>
                <p className="text-[9px] text-center text-slate-400 mt-1">Works on mobile devices with UPI-compatible apps installed.</p>
              </div>

              {/* Transaction ID input */}
              <div className="border-t pt-3 border-slate-200 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">UPI Ref No / Transaction UTR</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12-digit UPI reference number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-850 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
            </div>
          )}

          {/* Order subtotal mathematics review */}
          <div className="space-y-2 text-sm border-t pt-4 text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700 dark:text-slate-250">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-250">₹{gst}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Charge</span>
              <span className="font-semibold text-slate-700 dark:text-slate-250">
                ₹{shippingCharge} {paymentMethod === 'COD' && <span className="text-[10px] text-brand-saffron font-bold">(+ ₹10 COD Fee)</span>}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-850 dark:text-slate-100 border-t pt-2 mt-2">
              <span>Grand Total</span>
              <span className="text-xl font-extrabold text-brand-teal">
                ₹{paymentMethod === 'COD' ? (grandTotal + 10) : grandTotal}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border rounded-xl text-sm font-semibold text-slate-650 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || (paymentMethod === 'Online' && transactionId.trim().length < 6)}
              className="flex-1 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-xl text-sm font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Order...' : paymentMethod === 'COD' ? 'Place COD Order' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && confirmedOrder && (
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-800 border rounded-3xl shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-slate-850 dark:text-slate-100">Order Confirmed!</h2>
            <p className="text-xs text-slate-400">
              Thank you for shopping at Khodal Saree. Your transaction has processed successfully.
            </p>
          </div>

          {/* Details summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Invoice Number:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{confirmedOrder.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Method:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{confirmedOrder.paymentMethod || 'Online'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Order Payment ID:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{confirmedOrder.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Delivery:</span>
              <span className="font-bold text-slate-700 dark:text-slate-250">
                {new Date(confirmedOrder.expectedDeliveryDate).toDateString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-slate-450 font-bold">Amount Paid:</span>
              <span className="font-extrabold text-brand-teal text-sm">₹{confirmedOrder.grandTotal}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Link
              href={`/order-tracking/${confirmedOrder._id}`}
              className="block w-full py-3 bg-brand-teal text-white font-semibold rounded-xl text-sm shadow hover:bg-brand-teal-dark"
            >
              Track Order Status
            </Link>
            <Link
              href="/dashboard?tab=orders"
              className="block w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-250 font-semibold rounded-xl text-sm hover:bg-slate-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
