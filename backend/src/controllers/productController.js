import Product from '../models/Product.js';

// @desc    Get all products (Public or seller)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product (Seller)
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, price, stock, category, image, description } = req.body;

    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Title, price and stock are required' });
    }

    const product = new Product({
      title,
      price: Number(price),
      stock: Number(stock),
      category: category || 'General',
      image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
      description: description || 'High quality product.',
      seller: req.user ? req.user._id : null,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product (Seller)
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = req.body.title !== undefined ? req.body.title : product.title;
      product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
      product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
      product.category = req.body.category || product.category;
      product.image = req.body.image || product.image;
      product.description = req.body.description || product.description;

      const updated = await product.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product (Seller)
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
