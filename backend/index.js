const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const { seedProducts } = require('./utils/seedProducts');

// Initialize express app
const app = express();

// CORS middleware for frontend development

const allowedOrigins = [
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isLocalOrigin =
    origin &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (origin && (allowedOrigins.includes(origin) || isLocalOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && !allowedOrigins.includes(origin) && !isLocalOrigin ? 403 : 204);
  }

  next();
});


// Body parser and cookie parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ShopKart Authentication & Product API is running...' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

// Connect to Database and start server if executed directly
if (require.main === module) {
  connectDB().then(async () => {
    await seedProducts();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

module.exports = app;
