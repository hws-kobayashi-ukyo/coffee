import axios from 'axios';
import { Product, CartItem, OrderItem } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 商品関連API
export const productService = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
};

// カート関連API
export const cartService = {
  getCart: (sessionId: string) => api.get<CartItem[]>(`/cart/${sessionId}`),
  addToCart: (sessionId: string, item: CartItem) => 
    api.post<CartItem[]>(`/cart/${sessionId}`, item),
  updateCart: (sessionId: string, productId: number, quantity: number) =>
    api.put<CartItem[]>(`/cart/${sessionId}/${productId}`, { quantity }),
  removeFromCart: (sessionId: string, productId: number) =>
    api.delete<CartItem[]>(`/cart/${sessionId}/${productId}`),
  clearCart: (sessionId: string) => 
    api.delete<CartItem[]>(`/cart/${sessionId}`),
};

// 注文関連API
export const orderService = {
  createOrder: (items: OrderItem[]) => 
    api.post('/orders', { items }),
  getOrders: () => api.get('/orders'),
};
