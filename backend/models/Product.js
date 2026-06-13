const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Saree',
        'Kurti',
        'Salwar Suit',
        'Lehenga',
        'Western Dress',
        'Party Wear',
        'Men\'s Wear',
        'Kids Wear',
      ],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      fabric: { type: String, required: true },
      material: { type: String, required: true },
      quality: { type: String, required: true },
      weight: { type: String, required: true },
      color: { type: String, required: true },
      design: { type: String, required: true },
      pattern: { type: String, required: true },
      sleeveType: { type: String, required: true },
      neckType: { type: String, required: true },
      occasion: { type: String, required: true },
      washCare: { type: String, required: true },
    },
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to calculate finalPrice based on originalPrice and discount
productSchema.pre('validate', function (next) {
  if (this.originalPrice) {
    this.finalPrice = Math.round(this.originalPrice * (1 - this.discountPercentage / 100));
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
