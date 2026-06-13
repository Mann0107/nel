const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand originalPrice discountPercentage finalPrice images stock category description.color',
    });
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  const { productId, size, quantity } = req.body;

  try {
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and size are required' });
    }

    const qty = Number(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: 'Requested quantity is not available in stock' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if product with the same size already exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQuantity = cart.items[itemIndex].quantity + qty;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Not enough stock to add more of this item' });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Item doesn't exist, add new item
      cart.items.push({ product: productId, size, quantity: qty });
    }

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand originalPrice discountPercentage finalPrice images stock category description.color',
    });
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  const { productId, size, quantity } = req.body;

  try {
    if (!productId || !size || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID, size, and quantity are required' });
    }

    const qty = Number(quantity);
    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Find the item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = qty;
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name brand originalPrice discountPercentage finalPrice images stock category description.color',
      });
      res.json(populatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
const removeFromCart = async (req, res) => {
  const { productId, size } = req.body;

  try {
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and size are required' });
    }

    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand originalPrice discountPercentage finalPrice images stock category description.color',
    });
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Empty cart
// @route   DELETE /api/cart/empty
// @access  Private
const emptyCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  emptyCart,
};
