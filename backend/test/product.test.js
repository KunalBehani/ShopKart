const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Product = require('../models/product.model');
const {
  createProduct,
  getProducts,
  getProductById
} = require('../controllers/product.controller');

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

test('Product Model — Validation passes for valid product data', () => {
  const product = new Product({
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://example.com/headphones.jpg',
    stock: 25
  });

  const err = product.validateSync();
  assert.strictEqual(err, undefined);
});

test('Product Model — Validation fails if price is 0 or negative', () => {
  const zeroPrice = new Product({
    name: 'Item',
    description: 'Desc',
    price: 0,
    category: 'Electronics',
    image: 'img.jpg',
    stock: 10
  });
  const errZero = zeroPrice.validateSync();
  assert.ok(errZero.errors.price);

  const negPrice = new Product({
    name: 'Item',
    description: 'Desc',
    price: -10,
    category: 'Electronics',
    image: 'img.jpg',
    stock: 10
  });
  const errNeg = negPrice.validateSync();
  assert.ok(errNeg.errors.price);
});

test('Product Model — Validation fails if stock is negative', () => {
  const negStock = new Product({
    name: 'Item',
    description: 'Desc',
    price: 100,
    category: 'Electronics',
    image: 'img.jpg',
    stock: -5
  });
  const err = negStock.validateSync();
  assert.ok(err.errors.stock);
});

test('Product Model — Validation fails if mandatory fields are missing', () => {
  const empty = new Product({});
  const err = empty.validateSync();
  assert.ok(err.errors.name);
  assert.ok(err.errors.description);
  assert.ok(err.errors.price);
  assert.ok(err.errors.category);
  assert.ok(err.errors.image);
  assert.ok(err.errors.stock);
});

test('Create Product Controller — Missing required fields returns 400', async () => {
  const req = {
    body: {
      name: 'Mechanical Keyboard',
      // missing description
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/keyboard.jpg',
      stock: 10
    }
  };
  const res = createMockRes();

  await createProduct(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Invalid price (<= 0) returns 400', async () => {
  const req = {
    body: {
      name: 'Keyboard',
      description: 'Desc',
      price: -500,
      category: 'Electronics',
      image: 'keyboard.jpg',
      stock: 10
    }
  };
  const res = createMockRes();

  await createProduct(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Invalid stock (< 0) returns 400', async () => {
  const req = {
    body: {
      name: 'Keyboard',
      description: 'Desc',
      price: 1500,
      category: 'Electronics',
      image: 'keyboard.jpg',
      stock: -2
    }
  };
  const res = createMockRes();

  await createProduct(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

test('Create Product Controller — Valid data returns 201 with created product', async () => {
  const originalCreate = Product.create;
  Product.create = async (doc) => ({
    _id: '507f1f77bcf86cd799439099',
    ...doc,
    createdAt: new Date()
  });

  const req = {
    body: {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches.',
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/keyboard.jpg',
      stock: 10
    }
  };
  const res = createMockRes();

  try {
    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product.name, 'Mechanical Keyboard');
    assert.strictEqual(res.body.product.price, 2999);
  } finally {
    Product.create = originalCreate;
  }
});

test('Get Single Product Controller — Invalid ObjectId returns 400', async () => {
  const req = { params: { id: 'invalid-id-format' } };
  const res = createMockRes();

  await getProductById(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Invalid product ID');
});

test('Get Single Product Controller — Non-existent ID returns 404', async () => {
  const originalFindById = Product.findById;
  Product.findById = async () => null;

  const req = { params: { id: '507f1f77bcf86cd799439099' } };
  const res = createMockRes();

  try {
    await getProductById(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Product not found');
  } finally {
    Product.findById = originalFindById;
  }
});

test('Get Single Product Controller — Valid ID returns 200 with product', async () => {
  const originalFindById = Product.findById;
  const mockProduct = {
    _id: '507f1f77bcf86cd799439099',
    name: 'Sample',
    price: 999
  };
  Product.findById = async () => mockProduct;

  const req = { params: { id: '507f1f77bcf86cd799439099' } };
  const res = createMockRes();

  try {
    await getProductById(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product.name, 'Sample');
  } finally {
    Product.findById = originalFindById;
  }
});
