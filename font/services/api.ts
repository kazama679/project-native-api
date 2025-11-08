import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.36.103:8080';

const TOKEN_KEY = 'auth.token';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err: any) {
    const networkError: any = new Error(
      `Không thể kết nối tới server: ${url}. Kiểm tra mạng/Base URL (EXPO_PUBLIC_API_BASE_URL).`
    );
    networkError.cause = err;
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  }

  let json: any = null;
  const text = await response.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // Non-JSON response
      json = text;
    }
  }

  if (!response.ok) {
    const message = (json && json.message) ? json.message : `HTTP ${response.status}`;
    const error: any = new Error(message);
    error.status = response.status;
    error.data = json;
    error.url = url;
    throw error;
  }

  return json;
}

export const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body?: unknown) =>
    request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: unknown) =>
    request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export type ApiResponse<T> = {
  message: string;
  data: T;
  success: boolean;
  statusCode: number;
};


