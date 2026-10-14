const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

// Helper to create mock res object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
};

// ==========================================
// Task 1: Customer Model Cart Field Tests
// ==========================================
test('Task 1 — Customer Model cart defaults to an empty array', () => {
  const customer = new Customer({
    fullName: 'Test User',
    email: 'cart@example.com',
    password: 'password123',
    phone: '9876543210'
  });

  assert.ok(Array.isArray(customer.cart));
  assert.strictEqual(customer.cart.length, 0);
});

test('Task 1 — Customer Model cart item requires product reference and positive quantity', () => {
  const customer = new Customer({
    fullName: 'Test User',
    email: 'cart2@example.com',
    password: 'password123',
    phone: '9876543210',
    cart: [
      {
        product: new mongoose.Types.ObjectId(),
        quantity: 3
      }
    ]
  });

  assert.strictEqual(customer.cart.length, 1);
  assert.strictEqual(customer.cart[0].quantity, 3);
});

// ==========================================
// Task 2: Add to Cart Tests
// ==========================================
test('Task 2 — addToCart returns 400 for invalid product ID format', async () => {
  const req = {
    params: { productId: 'not-a-valid-id' },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Invalid product ID');
});

test('Task 2 — addToCart returns 404 when product is not found', async () => {
  const origFindById = Product.findById;
  Product.findById = async () => null;

  const req = {
    params: { productId: new mongoose.Types.ObjectId().toString() },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Product not found');

  Product.findById = origFindById;
});

test('Task 2 — addToCart returns 400 when product is out of stock', async () => {
  const origFindById = Product.findById;
  Product.findById = async () => ({ _id: new mongoose.Types.ObjectId(), stock: 0 });

  const req = {
    params: { productId: new mongoose.Types.ObjectId().toString() },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Product is out of stock');

  Product.findById = origFindById;
});

test('Task 2 — addToCart adds new product with quantity 1', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  let saved = false;
  const mockCustomer = {
    _id: 'cust123',
    cart: [],
    save: async () => { saved = true; },
    populate: async () => {}
  };

  Product.findById = async () => ({ _id: productId, name: 'Keyboard', price: 2999, stock: 10 });
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Cart updated');
  assert.strictEqual(saved, true);
  assert.strictEqual(mockCustomer.cart.length, 1);
  assert.strictEqual(mockCustomer.cart[0].quantity, 1);
  assert.strictEqual(mockCustomer.cart[0].product, productId);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

test('Task 2 — addToCart increments quantity when product already in cart', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  const mockCustomer = {
    _id: 'cust123',
    cart: [{ product: { toString: () => productId }, quantity: 1 }],
    save: async () => {},
    populate: async () => {}
  };

  Product.findById = async () => ({ _id: productId, name: 'Keyboard', price: 2999, stock: 10 });
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(mockCustomer.cart[0].quantity, 2);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

test('Task 2 — addToCart returns 400 when incrementing exceeds stock', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  const mockCustomer = {
    _id: 'cust123',
    cart: [{ product: { toString: () => productId }, quantity: 5 }],
    save: async () => {},
    populate: async () => {}
  };

  // Only 5 in stock, currently 5 in cart → adding 1 more would exceed
  Product.findById = async () => ({ _id: productId, stock: 5 });
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await addToCart(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

// ==========================================
// Task 3: Get Cart Tests
// ==========================================
test('Task 3 — getCart returns populated cart items for authenticated user', async () => {
  const origCustomerFindById = Customer.findById;

  const mockCart = [
    {
      product: {
        _id: new mongoose.Types.ObjectId(),
        name: 'Mechanical Keyboard',
        price: 2999,
        category: 'Electronics',
        image: 'https://example.com/keyboard.jpg',
        stock: 10
      },
      quantity: 2
    }
  ];

  Customer.findById = () => ({
    populate: async () => ({
      _id: 'cust123',
      cart: mockCart
    })
  });

  const req = { user: { _id: 'cust123' } };
  const res = createMockRes();

  await getCart(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.cart.length, 1);
  assert.strictEqual(res.body.cart[0].quantity, 2);
  assert.strictEqual(res.body.cart[0].product.name, 'Mechanical Keyboard');

  Customer.findById = origCustomerFindById;
});

test('Task 3 — getCart filters out stale null product references', async () => {
  const origCustomerFindById = Customer.findById;

  Customer.findById = () => ({
    populate: async () => ({
      _id: 'cust123',
      cart: [
        { product: { _id: 'prod1', name: 'Valid Product', price: 100, stock: 5 }, quantity: 1 },
        { product: null, quantity: 2 }
      ]
    })
  });

  const req = { user: { _id: 'cust123' } };
  const res = createMockRes();

  await getCart(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.cart.length, 1);
  assert.strictEqual(res.body.cart[0].product.name, 'Valid Product');

  Customer.findById = origCustomerFindById;
});

// ==========================================
// Task 4: Update Cart Quantity Tests
// ==========================================
test('Task 4 — updateCartQuantity returns 400 for invalid product ID', async () => {
  const req = {
    params: { productId: 'bad-id' },
    body: { quantity: 2 },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await updateCartQuantity(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.message, 'Invalid product ID');
});

test('Task 4 — updateCartQuantity returns 400 if quantity is less than 1', async () => {
  const req = {
    params: { productId: new mongoose.Types.ObjectId().toString() },
    body: { quantity: 0 },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await updateCartQuantity(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.message.includes('at least 1'));
});

test('Task 4 — updateCartQuantity returns 400 if quantity exceeds stock', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;

  Product.findById = async () => ({ _id: productId, stock: 5 });

  const req = {
    params: { productId },
    body: { quantity: 10 },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await updateCartQuantity(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.message.includes('stock'));

  Product.findById = origProductFindById;
});

test('Task 4 — updateCartQuantity returns 404 if product not in cart', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  Product.findById = async () => ({ _id: productId, stock: 10 });
  Customer.findById = async () => ({
    _id: 'cust123',
    cart: [],
    save: async () => {},
    populate: async () => {}
  });

  const req = {
    params: { productId },
    body: { quantity: 3 },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await updateCartQuantity(req, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.message, 'Product not in cart');

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

test('Task 4 — updateCartQuantity updates quantity and returns updated cart', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  const cartItem = { product: { toString: () => productId }, quantity: 1 };
  const mockCustomer = {
    _id: 'cust123',
    cart: [cartItem],
    save: async () => {},
    populate: async () => {}
  };

  Product.findById = async () => ({ _id: productId, stock: 10 });
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId },
    body: { quantity: 4 },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await updateCartQuantity(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(cartItem.quantity, 4);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

// ==========================================
// Task 5: Remove from Cart Tests
// ==========================================
test('Task 5 — removeFromCart returns 400 for invalid product ID', async () => {
  const req = {
    params: { productId: 'bad-id' },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await removeFromCart(req, res);
  assert.strictEqual(res.statusCode, 400);
});

test('Task 5 — removeFromCart returns 404 if product not in cart', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origCustomerFindById = Customer.findById;

  Customer.findById = async () => ({
    _id: 'cust123',
    cart: [],
    save: async () => {},
    populate: async () => {}
  });

  const req = {
    params: { productId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await removeFromCart(req, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.message, 'Product not in cart');

  Customer.findById = origCustomerFindById;
});

test('Task 5 — removeFromCart removes the product and returns 200', async () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const origCustomerFindById = Customer.findById;

  let saved = false;
  const mockCustomer = {
    _id: 'cust123',
    cart: [{ product: { toString: () => productId }, quantity: 2 }],
    save: async () => { saved = true; },
    populate: async () => {}
  };

  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await removeFromCart(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Item removed from cart');
  assert.strictEqual(saved, true);
  assert.strictEqual(mockCustomer.cart.length, 0);

  Customer.findById = origCustomerFindById;
});
