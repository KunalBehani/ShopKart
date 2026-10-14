const mongoose = require('mongoose');
const Product = require('../models/product.model');

// @desc    Create a new product
// @route   POST /products
// @access  Public
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation: Check for missing required fields
    if (
      name === undefined || name === null || name === '' ||
      description === undefined || description === null || description === '' ||
      price === undefined || price === null ||
      category === undefined || category === null || category === '' ||
      image === undefined || image === null || image === '' ||
      stock === undefined || stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory (name, description, price, category, image, stock)'
      });
    }

    // Validation: Price must be a valid number greater than 0
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0'
      });
    }

    // Validation: Stock must be a valid number >= 0
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative number'
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

// @desc    Get all products with search, category filtering & sorting
// @route   GET /products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Dynamically build filter query
    const filter = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter (case-insensitive, ignoring 'all')
    if (category && category.trim() !== '' && category.trim().toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .select('_id name description price category image stock createdAt')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById
};
