import API from './axios';

export const createOrder = async (orderData) => {
  const { data } = await API.post('/orders', orderData);
  return data;
};

export const trackOrder = async (identifier) => {
  const { data } = await API.get(`/orders/track/${identifier}`);
  return data;
};

export const fetchSellerOrders = async (params = {}) => {
  const { data } = await API.get('/orders', { params });
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await API.put(`/orders/${orderId}/status`, { status });
  return data;
};

export const fetchDashboardMetrics = async () => {
  const { data } = await API.get('/orders/metrics');
  return data;
};
