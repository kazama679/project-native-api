import { api, ApiResponse } from './api';

export type User = {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  status: boolean;
};

export type UserUpdateRequest = {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
};

export async function getProfile(): Promise<any> {
  const res = await api.get('/api/v1/users/me') as any;
  // Chuẩn hóa response: hỗ trợ cả "response" và "data"
  if (res?.response && !res?.data) {
    res.data = res.response;
  }
  return res;
}

export async function updateProfile(payload: UserUpdateRequest): Promise<any> {
  const res = await api.put('/api/v1/users/me', payload) as any;
  // Chuẩn hóa response: hỗ trợ cả "response" và "data"
  if (res?.response && !res?.data) {
    res.data = res.response;
  }
  return res;
}

