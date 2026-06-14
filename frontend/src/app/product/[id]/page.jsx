'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, Truck, Shield, RefreshCcw, ShoppingBag, Heart, ArrowRight, ArrowLeft, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../utils/api';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetails({ params }) {
  const productId = params.id;
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Pincode state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Zoom states
  const [zoomOrigin, setZoomOrigin] = useState('center');
  const [isZoomed, setIsZoomed] = useState(false);

  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleLightboxMouseDown = (e) => {
    if (lightboxZoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - lightboxPan.x,
        y: e.clientY - lightboxPan.y
      });
    }
  };

  const handleLightboxMouseMove = (e) => {
    if (isDragging && lightboxZoom > 1) {
      setLightboxPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleLightboxMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setLightboxZoom(z => Math.min(4, z + 0.5));
  };

  const zoomOut = () => {
    setLightboxZoom(z => {
      const nextZoom = Math.max(1, z - 0.5);
      if (nextZoom === 1) {
        setLightboxPan({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  const resetZoom = () => {
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const handleImageDoubleClick = () => {
    if (lightboxZoom > 1) {
      resetZoom();
    } else {
      setLightboxZoom(2);
    }
  };

  const handlePrevImage = () => {
    if (!product || !product.images) return;
    const idx = product.images.indexOf(activeImage);
    if (idx > 0) {
      setActiveImage(product.images[idx - 1]);
      resetZoom();
    }
  };

  const handleNextImage = () => {
    if (!product || !product.images) return;
    const idx = product.images.indexOf(activeImage);
    if (idx < product.images.length - 1) {
      setActiveImage(product.images[idx + 1]);
      resetZoom();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        resetZoom();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeImage, product]);

  const isWishlisted = wishlist.products?.some((p) => p._id === productId || p === productId);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.get(`/products/${productId}`);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        
        // Fetch related products of the same category
        if (data.category) {
          const categoryData = await api.get(`/products?category=${encodeURIComponent(data.category)}`);
          if (categoryData && categoryData.products) {
            const filtered = categoryData.products
              .filter((p) => p._id !== data._id)
              .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgPos: '0% 0%' });
  const [showLens, setShowLens] = useState(false);

  const handleZoomMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    setLensPos({
      x,
      y,
      bgPos: `${xPercent}% ${yPercent}%`
    });
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeResult({ serviceable: false, message: 'Please enter a valid 6-digit pincode' });
      return;
    }
    setPincodeLoading(true);
    setPincodeResult(null);
    try {
      const res = await api.get(`/pincodes/check/${pincode}`);
      setPincodeResult(res);
    } catch (err) {
      setPincodeResult({ serviceable: false, message: 'Failed to verify location. Try again.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, selectedSize, quantity);
      alert('Added to cart!');
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await api.post(`/products/${product._id}/reviews`, { rating, comment });
      setReviewMsg('Thank you! Your review has been added.');
      setComment('');
      // Reload product details to show new review
      const data = await api.get(`/products/${productId}`);
      setProduct(data);
    } catch (err) {
      setReviewMsg(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-200 dark:bg-slate-800 aspect-[3/4] rounded-2xl" />
          <div className="space-y-4">
            <div className="bg-slate-200 dark:bg-slate-800 h-8 w-3/4 rounded" />
            <div className="bg-slate-200 dark:bg-slate-800 h-6 w-1/4 rounded" />
            <div className="bg-slate-200 dark:bg-slate-800 h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Shop Link */}
      <div className="flex">
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-brand-teal transition-all hover:-translate-x-1"
        >
          <ArrowLeft size={16} />
          <span>Back to Shop</span>
        </Link>
      </div>

      {/* Product top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Images */}
        <div className="space-y-4">
          {/* Main Display Image with Zoom Lens */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            onMouseMove={handleZoomMove}
            onMouseEnter={() => setShowLens(true)}
            onMouseLeave={() => setShowLens(false)}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 cursor-zoom-in"
          >
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover object-top"
              priority
            />
            {showLens && (
              <div
                className="absolute rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.4)] pointer-events-none"
                style={{
                  width: '180px',
                  height: '180px',
                  left: `${lensPos.x - 90}px`,
                  top: `${lensPos.y - 90}px`,
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: lensPos.bgPos,
                  backgroundSize: '300% 300%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </div>

          {/* Thumbnail selectors */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-brand-teal' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest mb-1">
              <span>{product.brand}</span>
              <span>Code: {product.code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-400">
                <Star size={16} fill="currentColor" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {product.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-slate-400">({product.numReviews || 0} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-brand-teal dark:text-brand-teal-light">
                ₹{product.finalPrice}
              </span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    Original Price: ₹{product.originalPrice}
                  </span>
                  <span className="bg-brand-saffron/10 text-brand-saffron font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {product.discountPercentage}% OFF Save ₹{product.originalPrice - product.finalPrice}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Sizes</h3>
            <div className="flex space-x-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-10 text-xs font-bold rounded-lg border transition-all ${
                    selectedSize === sz
                      ? 'bg-brand-teal border-brand-teal text-white shadow'
                      : 'border-slate-250 hover:border-slate-400 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Qty</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 h-11">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 text-slate-500 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="px-3 font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 text-slate-500 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-grow flex space-x-2 pt-5">
              {product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-grow py-3 px-4 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 shadow"
                >
                  <ShoppingBag size={18} />
                  <span>{adding ? 'Adding...' : 'Add To Cart'}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-grow py-3 px-4 bg-red-650 text-red-600 bg-red-100 dark:bg-red-950/20 rounded-lg font-semibold text-sm cursor-not-allowed text-center uppercase"
                >
                  Out Of Stock
                </button>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border shadow-sm transition-colors ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Pincode Checker */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <Truck size={14} className="text-brand-teal" />
              <span>Check Delivery Pincode Availability</span>
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 400001"
                className="w-full rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                {pincodeLoading ? 'Checking...' : 'Check'}
              </button>
            </form>
            {pincodeResult && (
              <p
                className={`text-xs font-semibold ${
                  pincodeResult.serviceable ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {pincodeResult.serviceable
                  ? `✓ Delivery Available (Estimated: ${pincodeResult.estDays} Days, Shipping: ₹${pincodeResult.deliveryCharge})`
                  : `✗ ${pincodeResult.message}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Specifications details sheet */}
      <section className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold font-serif mb-6 text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-100 dark:border-slate-700">
          Product Details & Fabric Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {product.description && Object.entries(product.description).map(([key, val]) => (
            <div key={key} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-750/30">
              <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{val}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-750/30">
            <span className="text-slate-400">Sizes Available</span>
            <span className="font-semibold text-slate-750 text-brand-teal">{product.sizes?.join(', ')}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-750/30">
            <span className="text-slate-400">Stock Status</span>
            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-100 dark:border-slate-700">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Review Summary & Write Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">Customer Feedback</h2>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
              {product.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-slate-400 mt-1">Out of 5 Stars</span>
            <div className="flex text-amber-400 my-2">
              {Array(Math.round(product.averageRating || 0)).fill(0).map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-xs text-slate-500">Based on {product.numReviews || 0} Ratings</span>
          </div>

          {/* Write a review */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-white dark:bg-slate-800 border rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-750 uppercase tracking-wider">Write a review</h3>
              {reviewMsg && (
                <div className="p-3 text-xs bg-slate-50 rounded-lg text-brand-teal font-semibold">
                  {reviewMsg}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal text-amber-500 font-bold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Good)</option>
                  <option value={2}>⭐⭐ (2 - Fair)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with this dress..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-teal text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold py-2.5 rounded-lg"
              >
                {reviewLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-550/10 dark:bg-slate-800 border border-dashed rounded-2xl text-center text-xs text-slate-400">
              Please <Link href="/auth/login" className="text-brand-teal font-semibold hover:underline">sign in</Link> to share your review comments.
            </div>
          )}
        </div>

        {/* Right Column: Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-slate-100">Review Comments</h2>
          {product.reviews && product.reviews.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 border border-dashed rounded-3xl text-sm text-slate-400">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {product.reviews?.map((rev) => (
                <div key={rev._id} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array(rev.rating).fill(0).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                    {Array(5 - rev.rating).fill(0).map((_, i) => (
                      <Star key={i} size={12} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-light">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full-Screen Lightbox Image Viewer */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col select-none animate-fade-in">
          {/* Top Control Bar */}
          <div className="w-full flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/60 to-transparent">
            {/* Back Button */}
            <button
              onClick={() => {
                setIsLightboxOpen(false);
                resetZoom();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:-translate-x-1"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold">Back to Details</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-sm">
              <button
                onClick={zoomOut}
                disabled={lightboxZoom <= 1}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-xs font-mono font-semibold text-white/80 w-12 text-center">
                {Math.round(lightboxZoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={lightboxZoom >= 4}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-l border-white/15"
                title="Reset Zoom"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Central Image Stage */}
          <div className="flex-grow relative flex items-center justify-center overflow-hidden px-4">
            {/* Previous Image Trigger */}
            {product.images && product.images.indexOf(activeImage) > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors hover:scale-105"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Main Image Stage */}
            <div
              className={`relative max-w-full max-h-[75vh] aspect-[3/4] overflow-hidden rounded-2xl transition-shadow ${
                lightboxZoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
              onMouseDown={handleLightboxMouseDown}
              onMouseMove={handleLightboxMouseMove}
              onMouseUp={handleLightboxMouseUp}
              onMouseLeave={handleLightboxMouseUp}
              onDoubleClick={handleImageDoubleClick}
            >
              <img
                src={activeImage}
                alt={product.name}
                draggable={false}
                className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-100 ease-out`}
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${lightboxPan.y / lightboxZoom}px)`,
                }}
              />
            </div>

            {/* Next Image Trigger */}
            {product.images && product.images.indexOf(activeImage) < product.images.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors hover:scale-105"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Thumbnails list at bottom */}
          {product.images && product.images.length > 1 && (
            <div className="py-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center space-x-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(img);
                    resetZoom();
                  }}
                  className={`relative w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-brand-teal scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
