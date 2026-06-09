import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { getToken, clearAuth } from '../utils/storage';
import { PagedResponse } from '../types';

const BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ?? '';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuth();
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export function extractEmbedded<T>(data: unknown): T[] {
  const d = data as Record<string, unknown>;
  if (d && typeof d === 'object' && '_embedded' in d) {
    const embedded = d._embedded as Record<string, unknown>;
    const key = Object.keys(embedded)[0];
    return (embedded[key] as T[]) ?? [];
  }
  if (Array.isArray(d)) return d as T[];
  return [];
}

export function extractPaged<T>(data: unknown): PagedResponse<T> {
  const d = data as Record<string, unknown>;
  const content = extractEmbedded<T>(d);
  const page = (d.page as Record<string, number> | undefined) ?? {};
  return {
    content,
    totalElements: page.totalElements ?? content.length,
    totalPages: page.totalPages ?? 1,
    size: page.size ?? 10,
    number: page.number ?? 0,
  };
}

export default api;
