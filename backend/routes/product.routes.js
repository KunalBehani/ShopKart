const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById
} = require('../controllers/product.controller');

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById);

module.exports = router;
