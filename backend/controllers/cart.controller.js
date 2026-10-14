const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// @desc    Add product to cart or increment quantity if already exists
// @route   POST /cart/:productId
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Check if product is already in cart
    const existingItem = customer.cart.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (existingItem) {
      // Check if incrementing exceeds product stock
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock})`
        });
      }
      existingItem.quantity += 1;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customer.save();

    // Populate product details in cart
    await customer.populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get current user's cart with populated products
// @route   GET /cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Filter out dangling references if any product was removed from the database
    const validCart = customer.cart.filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Update quantity of a product in cart
// @route   PATCH /cart/:productId
// @access  Private
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Validate quantity is positive integer >= 1
    const numQty = Number(quantity);
    if (isNaN(numQty) || !Number.isInteger(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer and at least 1'
      });
    }

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate quantity does not exceed available stock
    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`
      });
    }

    // Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Find item in cart
    const cartItem = customer.cart.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    cartItem.quantity = numQty;
    await customer.save();

    await customer.populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const index = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    await customer.populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: validCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
