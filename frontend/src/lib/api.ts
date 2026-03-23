import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  },
);

// Auth
export async function loginWithGoogle(code: string) {
  const { data } = await api.post('/auth/login', { code });
  if (data.data?.token) {
    localStorage.setItem('auth_token', data.data.token);
  }
  return data.data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function logoutUser() {
  await api.post('/auth/logout');
  localStorage.removeItem('auth_token');
}

export async function updateProfile(dto: { name: string }) {
  const { data } = await api.patch('/auth/me', dto);
  if (data.data?.token) {
    localStorage.setItem('auth_token', data.data.token);
  }
  return data.data;
}

// Posts
export async function getPosts() {
  const { data } = await api.get('/posts');
  return data.data;
}

export async function createPost(dto: { title: string; content: string }) {
  const { data } = await api.post('/posts', dto);
  return data.data;
}

export async function deletePost(id: string) {
  await api.delete(`/posts/${id}`);
}

// Payments
export async function createPaymentOrder(amount: number) {
  const { data } = await api.post('/payments/create-order', {
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });
  return data.order;
}

export async function verifyPayment(paymentData: any) {
  const { data } = await api.post('/payments/verify', paymentData);
  return data;
}

// AI
export async function askAi(message: string, mode: 'generic' | 'rag') {
  const { data } = await api.post('/ai/chat', { message, mode });
  return data.data;
}

export async function uploadAiPdf(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/ai/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
