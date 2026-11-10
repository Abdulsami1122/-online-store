import API from './axios';

export const login = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  return data;
};

export const register = async (nameOrData, email, password, phone, address, city) => {
  const payload =
    typeof nameOrData === 'object'
      ? nameOrData
      : { name: nameOrData, email, password, phone, address, city };
  const { data } = await API.post('/auth/register', payload);
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

export const fetchStoreSettings = async () => {
  const { data } = await API.get('/auth/store-settings');
  return data;
};
