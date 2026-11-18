import axios from 'axios';

const BASE_URL = 'https://6a22742d5c6103532869d3da.mockapi.io';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar: string;
  password?: string;
  created_at?: string;
}

export interface Book {
  id: string;
  book_name: string;
  book_price: string | number;
  created_at?: string;
}

export const userApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: Omit<User, 'id' | 'created_at'>) => apiClient.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const bookApi = {
  getAll: () => apiClient.get<Book[]>('/book'),
  getById: (id: string) => apiClient.get<Book>(`/book/${id}`),
  create: (data: Omit<Book, 'id' | 'created_at'>) => apiClient.post<Book>('/book', data),
  update: (id: string, data: Partial<Book>) => apiClient.put<Book>(`/book/${id}`, data),
  delete: (id: string) => apiClient.delete(`/book/${id}`),
};