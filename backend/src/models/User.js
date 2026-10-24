import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['seller', 'admin', 'customer'],
      default: 'seller',
    },
    storeName: {
      type: String,
      default: 'My Store',
    },
    storeSlug: {
      type: String,
      default: 'my-store',
    },
    whatsapp: {
      type: String,
      default: '+92 300 1234567',
    },
    instagram: {
      type: String,
      default: '@mystore_official',
    },
    storeTagline: {
      type: String,
      default: 'Trendy Styles For You — Quality Products • Best Prices • Fast Delivery',
    },
    plan: {
      type: String,
      enum: ['Free', 'Starter', 'Pro'],
      default: 'Free',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
