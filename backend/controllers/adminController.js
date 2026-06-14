const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Pincode = require('../models/Pincode');
const { sendNotification } = require('../utils/notificationHelper');

// ================= STATS & ANALYTICS =================

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalSalesData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$grandTotal' } } },
    ]);
    const totalSales = totalSalesData[0]?.totalSales || 0;

    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'customer' });

    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PRODUCT CRUD =================

// @desc    Add a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const {
    name,
    code,
    brand,
    category,
    originalPrice,
    discountPercentage,
    description,
    sizes,
    stock,
    images,
  } = req.body;

  try {
    const codeExists = await Product.findOne({ code });
    if (codeExists) {
      return res.status(400).json({ message: 'Product code already exists' });
    }

    if (category) {
      const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${category.trim()}$`, 'i') } });
      if (!categoryExists) {
        const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        await Category.create({
          name: category.trim(),
          slug,
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
        });
      }
    }

    const product = new Product({
      name,
      code,
      brand,
      category: category ? category.trim() : category,
      originalPrice,
      discountPercentage: discountPercentage || 0,
      description,
      sizes,
      stock,
      images,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    name,
    brand,
    category,
    originalPrice,
    discountPercentage,
    description,
    sizes,
    stock,
    images,
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (category) {
        const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${category.trim()}$`, 'i') } });
        if (!categoryExists) {
          const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          await Category.create({
            name: category.trim(),
            slug,
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500',
          });
        }
      }

      product.name = name || product.name;
      product.brand = brand || product.brand;
      product.category = category ? category.trim() : product.category;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
      product.description = description || product.description;
      product.sizes = sizes || product.sizes;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ORDER MANAGEMENT =================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status and dispatch information
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status, courierPartner, trackingId, expectedDeliveryDate } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('user', 'email mobile name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    const targetStatus = status || order.status;

    if (targetStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = targetStatus;
    if (courierPartner) order.courierPartner = courierPartner;
    if (trackingId) order.trackingId = trackingId;
    if (expectedDeliveryDate) order.expectedDeliveryDate = new Date(expectedDeliveryDate);

    const updatedOrder = await order.save();

    // Trigger notification to customer
    let trackInfoStr = '';
    if (courierPartner && trackingId) {
      trackInfoStr = ` via ${courierPartner} (Tracking ID: ${trackingId}).`;
    }
    await sendNotification(
      order.user._id,
      `Order Status: ${order.status}`,
      `Dear ${order.user.name}, your order status is now updated to: ${order.status}${trackInfoStr}`,
      order.user.email,
      order.user.mobile
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CUSTOMER MANAGEMENT =================

// @desc    Get all customer accounts
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or Unblock a customer
// @route   PUT /api/admin/customers/:id/block
// @access  Private/Admin
const toggleBlockCustomer = async (req, res) => {
  const { isBlocked } = req.body;

  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an administrator account' });
    }

    customer.isBlocked = isBlocked;
    await customer.save();

    res.json({ message: `Customer has been ${isBlocked ? 'blocked' : 'unblocked'} successfully`, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PINCODE MANAGEMENT =================

// @desc    Get all pincodes
// @route   GET /api/admin/pincodes
// @access  Private/Admin
const getPincodes = async (req, res) => {
  try {
    const pincodes = await Pincode.find({}).sort({ pincode: 1 });
    res.json(pincodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add deliverable pincode
// @route   POST /api/admin/pincodes
// @access  Private/Admin
const addPincode = async (req, res) => {
  const { pincode, serviceable, deliveryCharge, estDays } = req.body;

  try {
    let pinRecord = await Pincode.findOne({ pincode });

    if (pinRecord) {
      pinRecord.serviceable = serviceable !== undefined ? serviceable : pinRecord.serviceable;
      pinRecord.deliveryCharge = deliveryCharge !== undefined ? deliveryCharge : pinRecord.deliveryCharge;
      pinRecord.estDays = estDays !== undefined ? estDays : pinRecord.estDays;
      await pinRecord.save();
      return res.json({ message: 'Pincode updated successfully', pincode: pinRecord });
    }

    pinRecord = await Pincode.create({
      pincode,
      serviceable: serviceable !== undefined ? serviceable : true,
      deliveryCharge: deliveryCharge || 0,
      estDays: estDays || 5,
    });

    res.status(201).json({ message: 'Pincode added successfully', pincode: pinRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove deliverable pincode
// @route   DELETE /api/admin/pincodes/:id
// @access  Private/Admin
const deletePincode = async (req, res) => {
  try {
    const pinRecord = await Pincode.findById(req.params.id);
    if (pinRecord) {
      await Pincode.deleteOne({ _id: req.params.id });
      res.json({ message: 'Pincode removed successfully' });
    } else {
      res.status(404).json({ message: 'Pincode record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getCustomers,
  toggleBlockCustomer,
  getPincodes,
  addPincode,
  deletePincode,
};
