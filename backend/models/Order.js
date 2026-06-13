const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String, // Razorpay order_id
      required: true,
      unique: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    shippingCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: String,
      mobile: String,
      houseNo: String,
      streetAddress: String,
      area: String,
      city: String,
      district: String,
      state: String,
      country: String,
      pincode: String,
      landmark: String,
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Placed',
        'Confirmed',
        'Accepted',
        'Packed',
        'Shipped',
        'InTransit',
        'OutForDelivery',
        'Delivered',
      ],
      default: 'Placed',
    },
    trackingId: {
      type: String,
    },
    courierPartner: {
      type: String,
    },
    expectedDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
