// lib/api.ts

import axios from 'axios';

// Видаляємо стару логіку baseURL
// axios.defaults.baseURL = 'http://localhost:3000/api'

// Створюємо інстанс axios
const nextServer = axios.create({
  baseURL: '/api',
  withCredentials: true, // дозволяє axios працювати з cookie
});

export type RegisterRequest = {
  userName: string;
  email: string;
  password: string;
};
export type User = {
  id: string;
  email: string;
  userName?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
export const register = async (data: RegisterRequest) => {
  const res = await nextServer.post<User>('/auth/register', data);
  return res.data;
};
