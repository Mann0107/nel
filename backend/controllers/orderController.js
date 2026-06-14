const crypto = require('crypto');
const Razorpay = require('razorpay');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Pincode = require('../models/Pincode');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const { sendNotification } = require('../utils/notificationHelper');

// Initialize Razorpay
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// ================= ADDRESS SERVICES =================

// @desc    Get user addresses
// @route   GET /api/orders/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/orders/addresses
// @access  Private
const addAddress = async (req, res) => {
  const {
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
    isDefault,
  } = req.body;

  try {
    // Check if pincode is serviceable
    const pinRecord = await Pincode.findOne({ pincode });
    if (!pinRecord || !pinRecord.serviceable) {
      return res.status(400).json({
        message: 'Sorry, Delivery Not Available At Your Location (Pincode not serviceable)',
      });
    }

    if (isDefault) {
      // Unset previous defaults
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
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
      isDefault: isDefault || false,
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/orders/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (address) {
      await Address.deleteOne({ _id: req.params.id });
      res.json({ message: 'Address removed successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CHECKOUT & ORDER SERVICES =================

// @desc    Create Razorpay Order
// @route   POST /api/orders/create-payment-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  const { addressId } = req.body;

  try {
    if (!addressId) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get Address
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Verify Pincode serviceability
    const pincodeRecord = await Pincode.findOne({ pincode: address.pincode });
    if (!pincodeRecord || !pincodeRecord.serviceable) {
      return res.status(400).json({ message: 'Selected address pincode is not serviceable' });
    }

    // Get Cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Shopping cart is empty' });
    }

    // Calculate totals & check stock
    let subtotal = 0;
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(404).json({ message: 'One of the items in your cart is no longer available' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficent stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      subtotal += product.finalPrice * item.quantity;
    }

    const gst = Math.round(subtotal * 0.18); // GST @ 18%
    const shippingCharge = pincodeRecord.deliveryCharge;
    const grandTotal = subtotal + gst + shippingCharge;

    let razorpayOrderId = '';
    let isMock = true;

    if (razorpay) {
      // Real Razorpay execution
      const options = {
        amount: Math.round(grandTotal * 100), // amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      try {
        const response = await razorpay.orders.create(options);
        razorpayOrderId = response.id;
        isMock = false;
      } catch (err) {
        console.error('Razorpay Order Create Error:', err);
        return res.status(500).json({ message: 'Failed to create payment order with gateway. Try again.' });
      }
    } else {
      // Mock execution fallback
      razorpayOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
    }

    res.json({
      orderId: razorpayOrderId,
      amount: grandTotal,
      currency: 'INR',
      subtotal,
      gst,
      shippingCharge,
      grandTotal,
      isMock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment signature & create order
// @route   POST /api/orders/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    addressId,
    orderId, // internally passed if mock
    paymentMethod, // added!
    paymentId, // user-supplied transaction reference ID
  } = req.body;

  try {
    if (!addressId) {
      return res.status(400).json({ message: 'Address ID is required' });
    }

    const isCOD = paymentMethod === 'COD';
    const isOnlineManual = paymentMethod === 'Online';

    // Verify payment authenticity
    let activeOrderId = '';
    let finalPaymentId = '';

    if (isCOD) {
      activeOrderId = `cod_${crypto.randomBytes(8).toString('hex')}`;
      finalPaymentId = `cod_pay_${crypto.randomBytes(8).toString('hex')}`;
    } else if (isOnlineManual) {
      activeOrderId = `upi_${crypto.randomBytes(8).toString('hex')}`;
      finalPaymentId = paymentId || `upi_pay_${crypto.randomBytes(8).toString('hex')}`;
    } else {
      activeOrderId = razorpay_order_id || orderId;
      finalPaymentId = razorpay_payment_id || `mock_payment_${crypto.randomBytes(8).toString('hex')}`;
    }
    
    if (!isCOD && !isOnlineManual && razorpay && !activeOrderId.startsWith('mock_')) {
      if (!razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Payment gateway parameters are missing' });
      }

      const body = activeOrderId + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed. Security alert.' });
      }
    }

    // Payment authenticated. Fetch variables to construct permanent Order
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const pinRecord = await Pincode.findOne({ pincode: address.pincode });
    if (!pinRecord || !pinRecord.serviceable) {
      return res.status(400).json({ message: 'Pincode is not serviceable' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Verify stock one last time and reserve stock
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      subtotal += product.finalPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.finalPrice,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const gst = Math.round(subtotal * 0.18);
    const shippingCharge = isCOD ? (pinRecord.deliveryCharge + 10) : pinRecord.deliveryCharge;
    const grandTotal = subtotal + gst + shippingCharge;

    // Generate Invoice Number: NL-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `NL-${todayStr}-${randomSuffix}`;

    // Create Order Record
    const newOrder = await Order.create({
      user: req.user._id,
      orderId: activeOrderId,
      invoiceNumber,
      items: orderItems,
      subtotal,
      gst,
      shippingCharge,
      grandTotal,
      shippingAddress: {
        fullName: address.fullName,
        mobile: address.mobile,
        houseNo: address.houseNo,
        streetAddress: address.streetAddress,
        area: address.area,
        city: address.city,
        district: address.district,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        landmark: address.landmark,
      },
      paymentId: finalPaymentId,
      paymentMethod: isCOD ? 'COD' : (isOnlineManual ? 'Online' : 'Razorpay'),
      status: 'Placed',
      expectedDeliveryDate: new Date(Date.now() + pinRecord.estDays * 24 * 60 * 60 * 1000),
    });

    // Clear user cart
    cart.items = [];
    await cart.save();

    // Trigger confirmation alerts
    await sendNotification(
      req.user._id,
      'Order Placed Successfully',
      `Your order with ID ${activeOrderId} and Invoice ${invoiceNumber} has been placed. Expected delivery by ${newOrder.expectedDeliveryDate.toDateString()}.`,
      req.user.email,
      req.user.mobile
    );

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders list
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order detail
// @route   GET /api/orders/:id
// @access  Private
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download order invoice as PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id });
    
    // Auth check: user must be the order owner or admin
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.invoiceNumber}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  deleteAddress,
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderDetails,
  downloadInvoice,
};
