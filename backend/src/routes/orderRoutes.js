import express from 'express';
import {
  createOrder,
  trackOrder,
  getSellerOrders,
  updateOrderStatus,
  getDashboardMetrics,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public checkout order placement
router.post('/', createOrder);

// Public customer tracking without login
router.get('/track/:identifier', trackOrder);

// Seller dashboard orders & metrics
router.get('/', protect, getSellerOrders);
router.get('/metrics', protect, getDashboardMetrics);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
