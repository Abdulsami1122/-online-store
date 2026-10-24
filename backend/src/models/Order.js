import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        title: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    itemsPrice: { type: Number, default: 0 },
    deliveryCharges: { type: Number, default: 200 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'New',
    },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate 5-digit order number like #10024 before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = (10020 + count).toString();
  }
  if (this.isModified('status') || this.isNew) {
    const lastEntry = this.timeline[this.timeline.length - 1];
    if (!lastEntry || lastEntry.status !== this.status) {
      this.timeline.push({
        status: this.status,
        date: new Date(),
        note: `Order status updated to ${this.status}`,
      });
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
