const Pincode = require('../models/Pincode');

// @desc    Check if a pincode is serviceable
// @route   GET /api/pincodes/check/:pincode
// @access  Public
const checkPincode = async (req, res) => {
  const { pincode } = req.params;

  try {
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      return res.status(400).json({
        serviceable: false,
        message: 'Invalid pincode format. Must be a 6-digit number.',
      });
    }

    const record = await Pincode.findOne({ pincode });

    if (record && record.serviceable) {
      res.json({
        serviceable: true,
        pincode: record.pincode,
        deliveryCharge: record.deliveryCharge,
        estDays: record.estDays,
        message: 'Delivery Available',
      });
    } else {
      res.json({
        serviceable: false,
        message: 'Sorry, Delivery Not Available At Your Location',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkPincode,
};
