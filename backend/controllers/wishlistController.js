const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Helper to get or create wishlist
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

// @desc    Get logged in user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
      'products',
      'name brand originalPrice discountPercentage finalPrice images stock category'
    );
    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    const exists = wishlist.products.includes(productId);

    if (exists) {
      // Remove product
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
      res.json({ message: 'Product removed from wishlist', inWishlist: false, products: wishlist.products });
    } else {
      // Add product
      wishlist.products.push(productId);
      await wishlist.save();
      res.json({ message: 'Product added to wishlist', inWishlist: true, products: wishlist.products });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
