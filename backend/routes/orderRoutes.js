const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  deleteAddress,
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderDetails,
  downloadInvoice,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all order paths

// Address routes
router.route('/addresses')
  .get(getAddresses)
  .post(addAddress);
router.delete('/addresses/:id', deleteAddress);

// Checkout & Order routes
router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderDetails);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
