import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a new user (Customer or Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, city, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password)' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    const assignedRole = role && ['admin', 'seller', 'customer'].includes(role) ? role : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        avatar: user.avatar,
        storeName: user.storeName,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Customer or Admin with hashed password verification)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        avatar: user.avatar,
        storeName: user.storeName,
        storeTagline: user.storeTagline,
        storeLogo: user.storeLogo,
        heroBannerImage: user.heroBannerImage,
        heroBadgeText: user.heroBadgeText,
        heroTitle: user.heroTitle,
        heroSubtitle: user.heroSubtitle,
        heroButtonText: user.heroButtonText,
        heroFloatingBadge: user.heroFloatingBadge,
        tickerText: user.tickerText,
        showTicker: user.showTicker,
        selectedTemplate: user.selectedTemplate,
        facebook: user.facebook,
        tiktok: user.tiktok,
        deliveryCharges: user.deliveryCharges,
        currency: user.currency,
        whatsapp: user.whatsapp,
        bankName: user.bankName,
        bankAccountTitle: user.bankAccountTitle,
        bankAccountNumber: user.bankAccountNumber,
        bankIban: user.bankIban,
        easypaisaTitle: user.easypaisaTitle,
        easypaisaNumber: user.easypaisaNumber,
        jazzcashTitle: user.jazzcashTitle,
        jazzcashNumber: user.jazzcashNumber,
        onlinePaymentInstructions: user.onlinePaymentInstructions,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.avatar = req.body.avatar || user.avatar;
      if (req.body.storeName) user.storeName = req.body.storeName;
      if (req.body.storeTagline) user.storeTagline = req.body.storeTagline;
      if (req.body.whatsapp) user.whatsapp = req.body.whatsapp;
      if (req.body.address) user.address = req.body.address;
      if (req.body.city) user.city = req.body.city;

      // Store Logo, Hero Banner & Customizations
      if (req.body.storeLogo !== undefined) user.storeLogo = req.body.storeLogo;
      if (req.body.heroBannerImage !== undefined) user.heroBannerImage = req.body.heroBannerImage;
      if (req.body.heroBadgeText !== undefined) user.heroBadgeText = req.body.heroBadgeText;
      if (req.body.heroTitle !== undefined) user.heroTitle = req.body.heroTitle;
      if (req.body.heroSubtitle !== undefined) user.heroSubtitle = req.body.heroSubtitle;
      if (req.body.heroButtonText !== undefined) user.heroButtonText = req.body.heroButtonText;
      if (req.body.heroFloatingBadge !== undefined) user.heroFloatingBadge = req.body.heroFloatingBadge;
      if (req.body.tickerText !== undefined) user.tickerText = req.body.tickerText;
      if (req.body.showTicker !== undefined) user.showTicker = req.body.showTicker;
      if (req.body.selectedTemplate !== undefined) user.selectedTemplate = req.body.selectedTemplate;
      if (req.body.facebook !== undefined) user.facebook = req.body.facebook;
      if (req.body.tiktok !== undefined) user.tiktok = req.body.tiktok;
      if (req.body.deliveryCharges !== undefined) user.deliveryCharges = Number(req.body.deliveryCharges);
      if (req.body.currency !== undefined) user.currency = req.body.currency;

      // Online Payment & Bank Configuration
      if (req.body.bankName !== undefined) user.bankName = req.body.bankName;
      if (req.body.bankAccountTitle !== undefined) user.bankAccountTitle = req.body.bankAccountTitle;
      if (req.body.bankAccountNumber !== undefined) user.bankAccountNumber = req.body.bankAccountNumber;
      if (req.body.bankIban !== undefined) user.bankIban = req.body.bankIban;
      if (req.body.easypaisaTitle !== undefined) user.easypaisaTitle = req.body.easypaisaTitle;
      if (req.body.easypaisaNumber !== undefined) user.easypaisaNumber = req.body.easypaisaNumber;
      if (req.body.jazzcashTitle !== undefined) user.jazzcashTitle = req.body.jazzcashTitle;
      if (req.body.jazzcashNumber !== undefined) user.jazzcashNumber = req.body.jazzcashNumber;
      if (req.body.onlinePaymentInstructions !== undefined)
        user.onlinePaymentInstructions = req.body.onlinePaymentInstructions;

      if (req.body.shippingAddress) {
        user.shippingAddress = {
          ...user.shippingAddress,
          ...req.body.shippingAddress,
        };
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        storeName: updatedUser.storeName,
        storeTagline: updatedUser.storeTagline,
        storeLogo: updatedUser.storeLogo,
        heroBannerImage: updatedUser.heroBannerImage,
        heroBadgeText: updatedUser.heroBadgeText,
        heroTitle: updatedUser.heroTitle,
        heroSubtitle: updatedUser.heroSubtitle,
        heroButtonText: updatedUser.heroButtonText,
        heroFloatingBadge: updatedUser.heroFloatingBadge,
        tickerText: updatedUser.tickerText,
        showTicker: updatedUser.showTicker,
        selectedTemplate: updatedUser.selectedTemplate,
        facebook: updatedUser.facebook,
        tiktok: updatedUser.tiktok,
        deliveryCharges: updatedUser.deliveryCharges,
        currency: updatedUser.currency,
        whatsapp: updatedUser.whatsapp,
        bankName: updatedUser.bankName,
        bankAccountTitle: updatedUser.bankAccountTitle,
        bankAccountNumber: updatedUser.bankAccountNumber,
        bankIban: updatedUser.bankIban,
        easypaisaTitle: updatedUser.easypaisaTitle,
        easypaisaNumber: updatedUser.easypaisaNumber,
        jazzcashTitle: updatedUser.jazzcashTitle,
        jazzcashNumber: updatedUser.jazzcashNumber,
        onlinePaymentInstructions: updatedUser.onlinePaymentInstructions,
        shippingAddress: updatedUser.shippingAddress,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public store settings & online payment details (For customer storefront)
// @route   GET /api/auth/store-settings
// @access  Public
export const getStoreSettings = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.json({
        storeName: 'TrendBazaar',
        storeTagline: 'Quality Products • Best Prices • 100% Cash on Delivery',
        storeLogo: '',
        heroBannerImage: '',
        heroBadgeText: '✨ Direct From Verified Sellers',
        heroTitle: 'Premium Quality Products for Everyday Life',
        heroSubtitle: 'Shop pure natural honey, luxury car decoration, premium footwear, trending fashion, and daily essentials. Order with 100% Cash on Delivery and open parcel delivery.',
        heroButtonText: 'Shop All Products',
        heroFloatingBadge: '100% Genuine Quality',
        tickerText: '⚡ FLASH SALE LIVE: GET EXTRA 10% OFF • 🚚 FREE OPEN PARCEL CASH ON DELIVERY • ⭐ 100% MONEY-BACK GUARANTEE',
        showTicker: true,
        selectedTemplate: 'luxury-boutique',
        facebook: 'https://facebook.com',
        tiktok: '',
        deliveryCharges: 199,
        currency: 'Rs.',
        whatsapp: '+92 306 5779097',
        phone: '+92 306 5779097',
        email: 'admin@store.com',
        address: 'Shop #12, Commercial Plaza, Main Boulevard, Lahore',
        bankName: 'Meezan Bank',
        bankAccountTitle: 'Abdul Sami',
        bankAccountNumber: '01020304050607',
        bankIban: '',
        easypaisaTitle: 'Abdul Sami',
        easypaisaNumber: '0306 5779097',
        jazzcashTitle: 'Abdul Sami',
        jazzcashNumber: '0306 5779097',
        onlinePaymentInstructions: 'Please transfer the exact total amount and attach your payment screenshot below.',
      });
    }

    res.json({
      storeName: adminUser.storeName || 'TrendBazaar',
      storeTagline: adminUser.storeTagline || '',
      storeLogo: adminUser.storeLogo || '',
      heroBannerImage: adminUser.heroBannerImage || '',
      heroBadgeText: adminUser.heroBadgeText || '✨ Direct From Verified Sellers',
      heroTitle: adminUser.heroTitle || 'Premium Quality Products for Everyday Life',
      heroSubtitle:
        adminUser.heroSubtitle ||
        'Shop pure natural honey, luxury car decoration, premium footwear, trending fashion, and daily essentials. Order with 100% Cash on Delivery and open parcel delivery.',
      heroButtonText: adminUser.heroButtonText || 'Shop All Products',
      heroFloatingBadge: adminUser.heroFloatingBadge || '100% Genuine Quality',
      tickerText:
        adminUser.tickerText ||
        '⚡ FLASH SALE LIVE: GET EXTRA 10% OFF • 🚚 FREE OPEN PARCEL CASH ON DELIVERY • ⭐ 100% MONEY-BACK GUARANTEE',
      showTicker: adminUser.showTicker !== undefined ? adminUser.showTicker : true,
      selectedTemplate: adminUser.selectedTemplate || 'luxury-boutique',
      facebook: adminUser.facebook || 'https://facebook.com',
      tiktok: adminUser.tiktok || '',
      deliveryCharges: adminUser.deliveryCharges !== undefined ? adminUser.deliveryCharges : 199,
      currency: adminUser.currency || 'Rs.',
      whatsapp: adminUser.whatsapp || '+92 306 5779097',
      phone: adminUser.phone || '+92 306 5779097',
      email: adminUser.email || '',
      address: adminUser.address || '',
      bankName: adminUser.bankName || 'Meezan Bank',
      bankAccountTitle: adminUser.bankAccountTitle || adminUser.name || 'Abdul Sami',
      bankAccountNumber: adminUser.bankAccountNumber || '01020304050607',
      bankIban: adminUser.bankIban || '',
      easypaisaTitle: adminUser.easypaisaTitle || adminUser.name || 'Abdul Sami',
      easypaisaNumber: adminUser.easypaisaNumber || '0306 5779097',
      jazzcashTitle: adminUser.jazzcashTitle || adminUser.name || 'Abdul Sami',
      jazzcashNumber: adminUser.jazzcashNumber || '0306 5779097',
      onlinePaymentInstructions:
        adminUser.onlinePaymentInstructions ||
        'Please transfer the exact total amount and attach your payment screenshot below.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
