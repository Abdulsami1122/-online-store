import API from './axios';

export const fetchProducts = async (params = {}) => {
  const { data } = await API.get('/products', { params });
  return data;
};

export const fetchProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

export const addProduct = async (productData) => {
  const { data } = await API.post('/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await API.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`);
  return data;
};
