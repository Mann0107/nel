const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update product average rating after save
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const reviews = await this.constructor.find({ product: this.product });
  const numReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

  await Product.findByIdAndUpdate(this.product, {
    averageRating: Math.round(averageRating * 10) / 10,
    numReviews,
  });
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
