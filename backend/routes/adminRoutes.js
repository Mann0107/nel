const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // protect all admin endpoints
router.use(admin);   // restrict to admin accounts only

// Stats & metrics
router.get('/dashboard-stats', getDashboardStats);

// Product controls
router.post('/products', createProduct);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Order controls
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Customer controls
router.get('/customers', getCustomers);
router.put('/customers/:id/block', toggleBlockCustomer);

// Pincode controls
router.route('/pincodes')
  .get(getPincodes)
  .post(addPincode);
router.delete('/pincodes/:id', deletePincode);

module.exports = router;
