const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
    },
    serviceable: {
      type: Boolean,
      required: true,
      default: true,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    estDays: {
      type: Number,
      required: true,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Pincode = mongoose.model('Pincode', pincodeSchema);
module.exports = Pincode;
