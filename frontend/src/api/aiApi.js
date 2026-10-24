import API from './axios';

export const sendChatMessage = async (message, sellerId) => {
  const { data } = await API.post('/ai/chat', { message, sellerId });
  return data;
};
