import { AxiosError } from 'axios';
import axios from 'axios';

export type ApiError = AxiosError<{ error: string }>;
const nextServer = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
