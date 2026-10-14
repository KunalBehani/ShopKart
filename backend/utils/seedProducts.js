const Product = require('../models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile blue switches, detachable wrist rest, and braided USB cable.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    stock: 12
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Premium wireless over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear audio.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Ultra HD 4K Monitor 27"',
    description: '27-inch IPS panel with 99% sRGB color gamut, HDR400, USB-C connectivity, and ultra-thin bezels for productivity.',
    price: 18499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    stock: 8
  },
  {
    name: 'Classic Vintage Denim Jacket',
    description: 'Authentic 100% heavyweight cotton denim jacket with reinforced seams and timeless regular fit.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 18
  },
  {
    name: 'Slim Fit Oxford Cotton Shirt',
    description: 'Breathable pure Egyptian cotton button-down shirt designed for all-day comfort, formal meetings, and casual outings.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    stock: 35
  },
  {
    name: 'Pro Performance Running Sneakers',
    description: 'Lightweight cushioned athletic running shoes with breathable mesh upper and slip-resistant rubber outsole.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock: 14
  },
  {
    name: 'Clean Code: Agile Software Craftsmanship',
    description: 'A revolutionary handbook of software craftsmanship and best engineering practices by Robert C. Martin.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 45
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to distributed databases, stream processing, reliability, scalability, and maintainability.',
    price: 1499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd9?auto=format&fit=crop&w=800&q=80',
    stock: 30
  },
  {
    name: 'Ergonomic Memory Foam Office Chair',
    description: 'High-back ergonomic executive desk chair with adjustable lumbar support, 3D armrests, and breathable mesh.',
    price: 8999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1580481077114-118f6c58908f?auto=format&fit=crop&w=800&q=80',
    stock: 7
  },
  {
    name: 'Minimalist Nordic Ceramic Desk Lamp',
    description: 'Warm ambient LED desk lamp with touch-sensitive dimming, matte ceramic base, and energy-saving lighting.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 22
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('No products found in DB. Seeding initial catalogue...');
      await Product.insertMany(sampleProducts);
      console.log(`Successfully seeded ${sampleProducts.length} sample products!`);
    }
  } catch (error) {
    console.error('Error seeding initial products:', error.message);
  }
};

module.exports = { seedProducts, sampleProducts };
