const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart);

router.route('/:productId')
  .post(addToCart)
  .patch(updateCartQuantity)
  .delete(removeFromCart);

module.exports = router;
