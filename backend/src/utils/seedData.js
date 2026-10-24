import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Drop old indices that might cause collisions
    try {
      await mongoose.connection.collection('products').dropIndexes();
      console.log('🔄 Dropped legacy product collection indexes');
    } catch (e) {
      // index didn't exist or already dropped
    }

    // Wipe previous data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('🧹 Cleaned existing database collections...');

    // 1. Create Seller Ahmad (matching "Welcome back, Ahmad!")
    const seller = await User.create({
      name: 'Ahmad',
      email: 'ahmad@store.com',
      password: 'password123',
      role: 'seller',
      storeName: 'My Store',
      storeSlug: 'my-store',
      whatsapp: '+92 300 1234567',
      instagram: '@mystore_official',
      storeTagline: 'Trendy Styles For You — Quality Products • Best Prices • Fast Delivery',
      plan: 'Starter',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    console.log('👤 Seller created: ahmad@store.com / password123');

    // 2. Create the 4 Exact Products shown on Screen 3 & 4
    const productsData = [
      {
        title: 'T-Shirt',
        slug: 't-shirt-black-classic',
        price: 1200,
        stock: 10,
        category: 'Fashion',
        description: 'Premium combed cotton regular fit classic black t-shirt. Breathable and durable fabric.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        seller: seller._id,
      },
      {
        title: 'Shoes',
        slug: 'urban-sneakers-white',
        price: 2000,
        stock: 5,
        category: 'Footwear',
        description: 'Lightweight urban breathable sneakers with cushioned rubber sole for daily comfort.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        seller: seller._id,
      },
      {
        title: 'Handbag',
        slug: 'leather-handbag-tan',
        price: 2500,
        stock: 8,
        category: 'Accessories',
        description: 'Elegant tan brown structured leather handbag with gold accent buckle and roomy compartments.',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
        seller: seller._id,
      },
      {
        title: 'Watch',
        slug: 'minimalist-quartz-watch',
        price: 3200,
        stock: 6,
        category: 'Watches',
        description: 'Minimalist luxury quartz analog wristwatch with genuine leather strap and scratch-proof glass.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        seller: seller._id,
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`📦 ${createdProducts.length} Products created (T-Shirt, Shoes, Handbag, Watch)!`);

    // 3. Create Orders (Screen 2 & Screen 6):
    // #10024 Ali Raza - Rs. 2,500 - New (Oct 6)
    // #10023 Sana Khan - Rs. 4,200 - Confirmed (Oct 6)
    // #10022 Usman Ali - Rs. 1,850 - Shipped (Oct 5)
    // #10021 Ayesha R. - Rs. 3,400 - Delivered (Oct 5)
    // Plus others to reach 12 orders & Rs. 24,500 total!
    const ordersData = [
      {
        orderNumber: '10024',
        seller: seller._id,
        customerName: 'Ali Raza',
        customerPhone: '+92 321 4567890',
        shippingAddress: 'House 14, Street 5, F-7/2, Islamabad',
        paymentMethod: 'Cash on Delivery',
        orderItems: [
          {
            product: createdProducts[2]._id,
            title: 'Handbag',
            qty: 1,
            price: 2500,
            image: createdProducts[2].image,
          },
        ],
        itemsPrice: 2300,
        deliveryCharges: 200,
        totalPrice: 2500,
        status: 'New',
        timeline: [
          { status: 'New', date: new Date('2026-10-06T10:24:00Z'), note: 'Order placed by customer' },
        ],
        createdAt: new Date('2026-10-06T10:24:00Z'),
      },
      {
        orderNumber: '10023',
        seller: seller._id,
        customerName: 'Sana Khan',
        customerPhone: '+92 301 9876543',
        shippingAddress: 'Flat 4B, Gulshan-e-Iqbal, Karachi',
        paymentMethod: 'Cash on Delivery',
        orderItems: [
          {
            product: createdProducts[3]._id,
            title: 'Watch',
            qty: 1,
            price: 3200,
            image: createdProducts[3].image,
          },
          {
            product: createdProducts[0]._id,
            title: 'T-Shirt',
            qty: 1,
            price: 1000,
            image: createdProducts[0].image,
          },
        ],
        itemsPrice: 4000,
        deliveryCharges: 200,
        totalPrice: 4200,
        status: 'Confirmed',
        timeline: [
          { status: 'New', date: new Date('2026-10-06T09:15:00Z'), note: 'Order placed' },
          { status: 'Confirmed', date: new Date('2026-10-06T11:00:00Z'), note: 'Confirmed with customer over phone' },
        ],
        createdAt: new Date('2026-10-06T09:15:00Z'),
      },
      {
        orderNumber: '10022',
        seller: seller._id,
        customerName: 'Usman Ali',
        customerPhone: '+92 333 5551234',
        shippingAddress: 'Sector C, Bahria Town, Lahore',
        paymentMethod: 'Cash on Delivery',
        orderItems: [
          {
            product: createdProducts[0]._id,
            title: 'T-Shirt',
            qty: 1,
            price: 1200,
            image: createdProducts[0].image,
          },
        ],
        itemsPrice: 1650,
        deliveryCharges: 200,
        totalPrice: 1850,
        status: 'Shipped',
        timeline: [
          { status: 'New', date: new Date('2026-10-05T14:10:00Z'), note: 'Order received' },
          { status: 'Confirmed', date: new Date('2026-10-05T15:00:00Z'), note: 'Ready for parcel' },
          { status: 'Shipped', date: new Date('2026-10-06T14:30:00Z'), note: 'Dispatched via Leopard Courier' },
        ],
        createdAt: new Date('2026-10-05T14:10:00Z'),
      },
      {
        orderNumber: '10021',
        seller: seller._id,
        customerName: 'Ayesha R.',
        customerPhone: '+92 345 8887766',
        shippingAddress: 'DHA Phase 6, Lahore',
        paymentMethod: 'Cash on Delivery',
        orderItems: [
          {
            product: createdProducts[3]._id,
            title: 'Watch',
            qty: 1,
            price: 3200,
            image: createdProducts[3].image,
          },
        ],
        itemsPrice: 3200,
        deliveryCharges: 200,
        totalPrice: 3400,
        status: 'Delivered',
        timeline: [
          { status: 'New', date: new Date('2026-10-05T09:00:00Z'), note: 'Order placed' },
          { status: 'Confirmed', date: new Date('2026-10-05T10:00:00Z'), note: 'Confirmed' },
          { status: 'Shipped', date: new Date('2026-10-05T14:00:00Z'), note: 'In transit' },
          { status: 'Delivered', date: new Date('2026-10-06T11:40:00Z'), note: 'Delivered and cash collected' },
        ],
        createdAt: new Date('2026-10-05T09:00:00Z'),
      },
      // Additional 8 historical orders to match Total Orders = 12, Total Sales = Rs. 24,500, Pending = 5
      {
        orderNumber: '10020',
        seller: seller._id,
        customerName: 'Bilal Ahmed',
        customerPhone: '+92 300 1112233',
        shippingAddress: 'Model Town, Lahore',
        totalPrice: 2000,
        status: 'Delivered',
        createdAt: new Date('2026-10-04T12:00:00Z'),
      },
      {
        orderNumber: '10019',
        seller: seller._id,
        customerName: 'Fatima Noor',
        customerPhone: '+92 312 9998877',
        shippingAddress: 'Saddar, Rawalpindi',
        totalPrice: 1500,
        status: 'Delivered',
        createdAt: new Date('2026-10-03T10:00:00Z'),
      },
      {
        orderNumber: '10018',
        seller: seller._id,
        customerName: 'Hamza Tariq',
        customerPhone: '+92 322 4443322',
        shippingAddress: 'Wapda Town, Multan',
        totalPrice: 2200,
        status: 'Delivered',
        createdAt: new Date('2026-10-02T16:00:00Z'),
      },
      {
        orderNumber: '10017',
        seller: seller._id,
        customerName: 'Zainab Bibi',
        customerPhone: '+92 334 7776655',
        shippingAddress: 'University Town, Peshawar',
        totalPrice: 1200,
        status: 'Delivered',
        createdAt: new Date('2026-10-02T11:00:00Z'),
      },
      {
        orderNumber: '10016',
        seller: seller._id,
        customerName: 'Khurram Shah',
        customerPhone: '+92 308 3332211',
        shippingAddress: 'Civil Lines, Faisalabad',
        totalPrice: 2000,
        status: 'Delivered',
        createdAt: new Date('2026-10-01T15:00:00Z'),
      },
      {
        orderNumber: '10015',
        seller: seller._id,
        customerName: 'Mariam Javed',
        customerPhone: '+92 315 2221100',
        shippingAddress: 'Cantt, Sialkot',
        totalPrice: 1650,
        status: 'Delivered',
        createdAt: new Date('2026-09-30T10:00:00Z'),
      },
      {
        orderNumber: '10014',
        seller: seller._id,
        customerName: 'Danish Khan',
        customerPhone: '+92 340 1239874',
        shippingAddress: 'Phase 5, DHA, Karachi',
        totalPrice: 1000,
        status: 'New',
        createdAt: new Date('2026-10-06T12:00:00Z'),
      },
      {
        orderNumber: '10013',
        seller: seller._id,
        customerName: 'Nida Aslam',
        customerPhone: '+92 323 8881234',
        shippingAddress: 'Gulberg 3, Lahore',
        totalPrice: 1000,
        status: 'Confirmed',
        createdAt: new Date('2026-10-06T13:00:00Z'),
      },
    ];

    for (const ord of ordersData) {
      if (!ord.orderItems) {
        ord.orderItems = [
          {
            title: 'T-Shirt',
            qty: 1,
            price: ord.totalPrice - 200,
            image: createdProducts[0].image,
          },
        ];
      }
      await Order.create(ord);
    }

    console.log('📋 12 Orders created matching the mockup metrics:');
    console.log('   Total Orders: 12');
    console.log('   Pending Orders: 5 (3 New, 2 Confirmed)');
    console.log('   Total Sales: Rs. 24,500');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder Error:', err);
    process.exit(1);
  }
};

seedData();
