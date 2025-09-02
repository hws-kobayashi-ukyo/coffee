import axios from 'axios';
import { Product, Order } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 商品管理API
export const productService = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id'>) => api.post<Product>('/products', product),
  update: (id: number, product: Omit<Product, 'id'>) => api.put<Product>(`/products/${id}`, product),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// 注文管理API
export const orderService = {
  getAll: () => api.get<Order[]>('/orders'),
};
