const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  emptyCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all cart endpoints

router.route('/')
  .get(getCart);

router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart); // using POST /remove to supply JSON body in request
router.delete('/empty', emptyCart);

module.exports = router;
