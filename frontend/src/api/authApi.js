import API from './axios';

export const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  return data;
};

export const register = async (name, email, password) => {
  const { data } = await API.post('/auth/register', { name, email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await API.get('/auth/profile');
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await API.put('/auth/profile', userData);
  return data;
};
