import axios from 'axios';

// Create an Axios instance with base configuration
// withCredentials: true ensures HttpOnly cookies (containing JWT) are sent and received
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Uses Vite dev server proxy for /customers in local dev
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new customer
 * @param {Object} data - { fullName, email, password, phone }
 */
export const registerCustomerApi = async (data) => {
  const response = await api.post('/customers/register', data);
  return response.data;
};

/**
 * Login customer and receive HttpOnly cookie token
 * @param {Object} data - { email, password }
 */
export const loginCustomerApi = async (data) => {
  const response = await api.post('/customers/login', data);
  return response.data;
};

/**
 * Fetch authenticated customer profile using HttpOnly cookie token
 */
export const getProfileApi = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Logout customer and clear HttpOnly cookie
 */
export const logoutCustomerApi = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

/**
 * Change customer password
 * @param {Object} data - { oldPassword, newPassword }
 */
export const changePasswordApi = async (data) => {
  const response = await api.patch('/customers/change-password', data);
  return response.data;
};

/**
 * Fetch products list with optional search, category, and sorting filters
 * @param {Object} params - { search, category, sort }
 */
export const getProductsApi = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by its MongoDB _id
 * @param {string} id - Product ID
 */
export const getProductByIdApi = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product (Task 2 API)
 * @param {Object} data - { name, description, price, category, image, stock }
 */
export const createProductApi = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

/**
 * Add a product to current user's wishlist
 * @param {string} productId - Product ID to add
 */
export const addToWishlistApi = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Get current user's wishlist with populated product details
 */
export const getWishlistApi = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Remove a product from current user's wishlist
 * @param {string} productId - Product ID to remove
 */
export const removeFromWishlistApi = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Toggle a product in current user's wishlist
 * @param {string} productId - Product ID to toggle
 */
export const toggleWishlistApi = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

/**
 * Add a product to the current user's cart (increments quantity if already present)
 * @param {string} productId
 */
export const addToCartApi = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Get the current user's cart with populated product details
 */
export const getCartApi = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Update quantity of a product in the cart
 * @param {string} productId
 * @param {number} quantity
 */
export const updateCartQuantityApi = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove a product from the current user's cart
 * @param {string} productId
 */
export const removeFromCartApi = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

/**
 * Create a Razorpay payment order — validates cart, stock, computes total server-side.
 * @param {Object} shippingAddress
 */
export const createPaymentOrderApi = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

/**
 * Verify Razorpay payment signature and confirm ShopKart order.
 * @param {Object} payload - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPaymentApi = async (payload) => {
  const response = await api.post('/orders/verify-payment', payload);
  return response.data;
};

/**
 * Fetch current user's orders, newest first.
 */
export const getMyOrdersApi = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Fetch a single order by ID.
 * @param {string} id - Order ID
 */
export const getOrderByIdApi = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export default api;



