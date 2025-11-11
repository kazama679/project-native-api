import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.235:8080';

const TOKEN_KEY = 'auth.token';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers(options.headers as HeadersInit | undefined);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

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
  post: (path: string, body?: unknown) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request(path, {
      method: 'POST',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  },
  put: (path: string, body?: unknown) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request(path, {
      method: 'PUT',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  },
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export type ApiResponse<T> = {
  message: string;
  data: T;
  success: boolean;
  statusCode: number;
};


