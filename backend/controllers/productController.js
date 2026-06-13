const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all products with search & filter
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;

    // Search query
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    // Filters
    const query = { ...keyword };

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    if (req.query.size) {
      query.sizes = req.query.size;
    }

    if (req.query.color) {
      query['description.color'] = { $regex: req.query.color, $options: 'i' };
    }

    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      query.finalPrice = {};
      if (req.query.minPrice) {
        query.finalPrice.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.finalPrice.$lte = Number(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.rating) {
      query.averageRating = { $gte: Number(req.query.rating) };
    }

    // Sorting
    let sortOptions = {};
    if (req.query.sort === 'priceAsc') {
      sortOptions = { finalPrice: 1 };
    } else if (req.query.sort === 'priceDesc') {
      sortOptions = { finalPrice: -1 };
    } else if (req.query.sort === 'rating') {
      sortOptions = { averageRating: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default: newest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOptions);

    res.json({ products, page, pages: Math.ceil(count / pageSize), count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Find reviews for this product
      const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
      
      res.json({
        ...product._doc,
        reviews,
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed this product
      const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        product: product._id,
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = new Review({
        user: req.user._id,
        userName: req.user.name,
        product: product._id,
        rating: Number(rating),
        comment,
      });

      await review.save();

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProductReview,
};
