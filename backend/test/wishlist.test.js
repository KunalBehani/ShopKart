const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} = require('../controllers/wishlist.controller');

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
// Task 1: Customer Model Wishlist Field Tests
// ==========================================
test('Task 1 — Customer Model wishlist defaults to an empty array', () => {
  const customer = new Customer({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543210'
  });

  assert.ok(Array.isArray(customer.wishlist));
  assert.strictEqual(customer.wishlist.length, 0);
});

test('Task 1 — Customer Model wishlist accepts valid Product ObjectId references', () => {
  const validId = new mongoose.Types.ObjectId();
  const customer = new Customer({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543210',
    wishlist: [validId]
  });

  assert.strictEqual(customer.wishlist.length, 1);
  assert.strictEqual(customer.wishlist[0].toString(), validId.toString());
});

// ==========================================
// Task 2: Add Product to Wishlist API Tests
// ==========================================
test('Task 2 — addToWishlist returns 400 for invalid product ID format', async () => {
  const req = {
    params: { productId: 'invalid-id-format' },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await addToWishlist(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Invalid product ID');
});

test('Task 2 — addToWishlist returns 404 when product is not found', async () => {
  const origFindById = Product.findById;
  Product.findById = async () => null;

  const validProductId = new mongoose.Types.ObjectId().toString();
  const req = {
    params: { productId: validProductId },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await addToWishlist(req, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Product not found');

  Product.findById = origFindById;
});

test('Task 2 — addToWishlist returns 409 Conflict when product is already in wishlist', async () => {
  const validProductId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  Product.findById = async () => ({ _id: validProductId, name: 'Sample' });
  Customer.findById = async () => ({
    _id: 'cust123',
    wishlist: [new mongoose.Types.ObjectId(validProductId)],
    save: async () => {}
  });

  const req = {
    params: { productId: validProductId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await addToWishlist(req, res);
  assert.strictEqual(res.statusCode, 409);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Product already in wishlist');

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

test('Task 2 — addToWishlist saves product reference and returns 201 on success', async () => {
  const validProductId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  let saved = false;
  const mockCustomer = {
    _id: 'cust123',
    wishlist: [],
    save: async () => {
      saved = true;
    }
  };

  Product.findById = async () => ({ _id: validProductId, name: 'Sample' });
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId: validProductId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await addToWishlist(req, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Product added to wishlist');
  assert.strictEqual(saved, true);
  assert.strictEqual(mockCustomer.wishlist.length, 1);
  assert.strictEqual(mockCustomer.wishlist[0], validProductId);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});

// ==========================================
// Task 3: Get Current User's Wishlist API Tests
// ==========================================
test('Task 3 — getWishlist returns populated items and count for authenticated user', async () => {
  const origCustomerFindById = Customer.findById;
  const sampleProducts = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Wireless Headphones',
      price: 4999,
      category: 'Electronics',
      image: 'https://example.com/h.jpg',
      stock: 12
    },
    {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Mechanical Keyboard',
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/k.jpg',
      stock: 5
    }
  ];

  Customer.findById = () => ({
    populate: async () => ({
      _id: 'cust123',
      wishlist: sampleProducts
    })
  });

  const req = { user: { _id: 'cust123' } };
  const res = createMockRes();

  await getWishlist(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.count, 2);
  assert.strictEqual(res.body.wishlist.length, 2);
  assert.strictEqual(res.body.wishlist[0].name, 'Wireless Headphones');

  Customer.findById = origCustomerFindById;
});

test('Task 3 — getWishlist filters out null references if products were deleted', async () => {
  const origCustomerFindById = Customer.findById;
  Customer.findById = () => ({
    populate: async () => ({
      _id: 'cust123',
      wishlist: [
        { _id: 'prod1', name: 'Valid Product', price: 100, category: 'Tech', image: 'a.jpg', stock: 2 },
        null
      ]
    })
  });

  const req = { user: { _id: 'cust123' } };
  const res = createMockRes();

  await getWishlist(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.count, 1);
  assert.strictEqual(res.body.wishlist.length, 1);

  Customer.findById = origCustomerFindById;
});

// ==========================================
// Task 4: Remove Product from Wishlist API Tests
// ==========================================
test('Task 4 — removeFromWishlist returns 400 for invalid product ID format', async () => {
  const req = {
    params: { productId: 'invalid-id' },
    user: { _id: new mongoose.Types.ObjectId() }
  };
  const res = createMockRes();

  await removeFromWishlist(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Task 4 — removeFromWishlist returns 404 when product is not in user wishlist', async () => {
  const validProductId = new mongoose.Types.ObjectId().toString();
  const origCustomerFindById = Customer.findById;

  Customer.findById = async () => ({
    _id: 'cust123',
    wishlist: [new mongoose.Types.ObjectId()],
    save: async () => {}
  });

  const req = {
    params: { productId: validProductId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await removeFromWishlist(req, res);
  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Product not in wishlist');

  Customer.findById = origCustomerFindById;
});

test('Task 4 — removeFromWishlist removes product reference and returns 200', async () => {
  const validProductId = new mongoose.Types.ObjectId().toString();
  const origCustomerFindById = Customer.findById;

  let saved = false;
  const mockCustomer = {
    _id: 'cust123',
    wishlist: [new mongoose.Types.ObjectId(validProductId)],
    save: async () => {
      saved = true;
    }
  };

  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId: validProductId },
    user: { _id: 'cust123' }
  };
  const res = createMockRes();

  await removeFromWishlist(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Product removed from wishlist');
  assert.strictEqual(saved, true);
  assert.strictEqual(mockCustomer.wishlist.length, 0);

  Customer.findById = origCustomerFindById;
});

// ==========================================
// Bonus: Toggle Wishlist Controller Tests
// ==========================================
test('Bonus — toggleWishlist adds item when absent and removes when present', async () => {
  const validProductId = new mongoose.Types.ObjectId().toString();
  const origProductFindById = Product.findById;
  const origCustomerFindById = Customer.findById;

  Product.findById = async () => ({ _id: validProductId });

  const mockCustomer = {
    _id: 'cust123',
    wishlist: [],
    save: async () => {}
  };
  Customer.findById = async () => mockCustomer;

  const req = {
    params: { productId: validProductId },
    user: { _id: 'cust123' }
  };
  const res1 = createMockRes();

  // First toggle: adds item
  await toggleWishlist(req, res1);
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.isSaved, true);
  assert.strictEqual(mockCustomer.wishlist.length, 1);

  // Second toggle: removes item
  const res2 = createMockRes();
  await toggleWishlist(req, res2);
  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res2.body.isSaved, false);
  assert.strictEqual(mockCustomer.wishlist.length, 0);

  Product.findById = origProductFindById;
  Customer.findById = origCustomerFindById;
});
