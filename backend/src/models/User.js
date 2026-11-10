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
      enum: ['seller', 'admin'],
      default: 'admin',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    storeName: {
      type: String,
      default: 'TrendBazaar',
    },
    storeSlug: {
      type: String,
      default: 'trend-bazaar',
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
    bankName: {
      type: String,
      default: 'Meezan Bank',
    },
    bankAccountTitle: {
      type: String,
      default: 'Abdul Sami',
    },
    bankAccountNumber: {
      type: String,
      default: '01020304050607',
    },
    bankIban: {
      type: String,
      default: '',
    },
    easypaisaTitle: {
      type: String,
      default: 'Abdul Sami',
    },
    easypaisaNumber: {
      type: String,
      default: '0306 5779097',
    },
    jazzcashTitle: {
      type: String,
      default: 'Abdul Sami',
    },
    jazzcashNumber: {
      type: String,
      default: '0306 5779097',
    },
    onlinePaymentInstructions: {
      type: String,
      default: 'Please send payment to the account above and attach your payment screenshot or transaction receipt.',
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
