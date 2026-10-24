import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    slug: {
      type: String,
      default: function () {
        return this.title
          ? this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000)
          : undefined;
      },
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 10,
      min: [0, 'Stock cannot be negative'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    description: {
      type: String,
      default: 'Premium quality product with fast delivery.',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    },
    images: {
      type: [String],
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function (next) {
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  } else if (this.images && this.images.length > 0 && !this.image) {
    this.image = this.images[0];
  }
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
