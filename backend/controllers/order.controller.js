const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const razorpay = require('../config/razorpay');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validate incoming shipping address fields.
 * Returns an error string or null.
 */
const validateShipping = (addr) => {
  if (!addr) return 'Shipping address is required';

  const { fullName, phone, addressLine1, city, state, pincode } = addr;

  if (!fullName || !fullName.trim()) return 'Full name is required';
  if (!phone || !phone.trim()) return 'Phone number is required';
  if (!/^[0-9]{10}$/.test(phone.trim())) return 'Phone must be a valid 10-digit number';
  if (!addressLine1 || !addressLine1.trim()) return 'Address line is required';
  if (!city || !city.trim()) return 'City is required';
  if (!state || !state.trim()) return 'State is required';
  if (!pincode || !pincode.trim()) return 'Pincode is required';
  if (!/^[0-9]{6}$/.test(pincode.trim())) return 'Pincode must contain exactly 6 digits';

  return null;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Validate cart, verify stock, calculate server-side total,
 *          create a ShopKart pending Order, create a Razorpay Order.
 * @route   POST /orders/create-payment-order
 * @access  Private
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    const addrError = validateShipping(shippingAddress);
    if (addrError) {
      return res.status(400).json({ success: false, message: addrError });
    }

    // 2. Load authenticated customer with cart
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock'
    });

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // 3. Reject empty cart
    const validCart = (customer.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    if (validCart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 4. Fresh stock check & server-side total calculation
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of validCart) {
      // Re-fetch product to get the absolute latest data
      const product = await Product.findById(cartItem.product._id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${cartItem.product.name}" is no longer available`
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // Accumulate server-computed total (never trust frontend)
      totalAmount += product.price * cartItem.quantity;

      // Build purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });
    }

    // 5. Create ShopKart order with PENDING_PAYMENT status
    const shopKartOrder = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    // 6. Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // INR → paise
      currency: 'INR',
      receipt: shopKartOrder._id.toString()
    });

    // 7. Save Razorpay order ID on the ShopKart order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // 8. Return safe checkout data (Key Secret is NEVER sent)
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,   // already in paise
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    const razorpayAuthFailed = error?.statusCode === 401 || error?.error?.description === 'Authentication failed';
    const message = razorpayAuthFailed
      ? 'Razorpay Authentication failed. Please add your valid Razorpay Test Mode Key ID and Secret in backend/.env'
      : (error?.error?.description || error.message || 'Server Error');
    return res.status(500).json({ success: false, message });
  }
};

/**
 * @desc    Verify Razorpay HMAC signature, mark order PAID/PLACED, clear cart.
 * @route   POST /orders/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // 1. Load the ShopKart order
    const order = await Order.findById(shopKartOrderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. Ownership check — user can only verify their own order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this order' });
    }

    // 3. Use our stored Razorpay Order ID (never the browser-supplied one)
    const body = order.razorpayOrderId + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark as failed but do NOT clear cart
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 4. Signature verified — mark order PAID and PLACED
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 5. Clear customer cart only after successful verification
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * @desc    Get all orders belonging to the authenticated user (newest first).
 * @route   GET /orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('getMyOrders error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * @desc    Get a single order by ID. User must own the order.
 * @route   GET /orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Strict ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

/**
 * @desc    Update order status (dev/admin use — bonus feature).
 * @route   PATCH /orders/:id/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
