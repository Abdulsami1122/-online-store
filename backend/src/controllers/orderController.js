import Order from '../models/Order.js';

// @desc    Create new order (Public customer checkout)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      shippingAddress,
      orderItems,
      deliveryCharges = 200,
      seller,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!customerName || !customerPhone || !shippingAddress) {
      return res.status(400).json({ message: 'Please provide full name, phone number, and address' });
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
    const totalPrice = itemsPrice + Number(deliveryCharges);

    const order = new Order({
      seller,
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod: 'Cash on Delivery',
      orderItems,
      itemsPrice,
      deliveryCharges,
      totalPrice,
      status: 'New',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Track order by orderNumber or ID (Public - no login needed)
// @route   GET /api/orders/track/:identifier
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const { identifier } = req.params;
    let order;

    // Check if 5-digit number or MongoDB ObjectId
    if (/^\d+$/.test(identifier)) {
      order = await Order.findOne({ orderNumber: identifier });
    } else if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(identifier);
    } else {
      order = await Order.findOne({ orderNumber: identifier.replace('#', '') });
    }

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found. Please check your order number.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for seller dashboard with filtering
// @route   GET /api/orders
// @access  Private
export const getSellerOrders = async (req, res) => {
  try {
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { customerName: { $regex: req.query.search, $options: 'i' } },
        { customerPhone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (New, Confirmed, Shipped, Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & sales summary
// @route   GET /api/orders/metrics
// @access  Private
export const getDashboardMetrics = async (req, res) => {
  try {
    const allOrders = await Order.find({});

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(
      (o) => o.status === 'New' || o.status === 'Confirmed'
    ).length;
    const totalSales = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // Weekly sales data mock/aggregation for chart
    const weeklyData = [
      { day: 'Mon', sales: 2500 },
      { day: 'Tue', sales: 4200 },
      { day: 'Wed', sales: 1850 },
      { day: 'Thu', sales: 3400 },
      { day: 'Fri', sales: 5100 },
      { day: 'Sat', sales: 6800 },
      { day: 'Sun', sales: totalSales > 20000 ? 7200 : 3500 },
    ];

    res.json({
      totalOrders,
      pendingOrders,
      totalSales,
      recentOrders,
      weeklyData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
