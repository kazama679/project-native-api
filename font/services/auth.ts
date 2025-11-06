import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiResponse } from './api';

type LoginRequest = { username: string; password: string };
type RegisterRequest = { username: string; password: string; email?: string; fullName?: string };

type LoginResponse = {
  token: string;
  userId: number;
  username: string;
};

const TOKEN_KEY = 'auth.token';

export async function login(payload: LoginRequest) {
  const res = await api.post('/api/v1/users/login', payload) as any;
  // Backend trả về "response" thay vì "data"
  const token = res?.response?.token || res?.data?.token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
  return res;
}

export async function register(payload: RegisterRequest) {
  const res = await api.post('/api/v1/users/register', payload) as ApiResponse<any>;
  return res;
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}


