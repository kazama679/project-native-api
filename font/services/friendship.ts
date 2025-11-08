import { api, ApiResponse } from './api';
import { User } from './user';

export type Friendship = {
  id: number;
  requester: User;
  addressee: User;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  updatedAt?: string;
};

export type FriendshipRequest = {
  requester: number;
  addressee: number;
  friendshipStatus?: string;
};

function normalizeResponse<T>(res: any): ApiResponse<T> {
  if (res?.response && !res?.data) {
    res.data = res.response;
  }
  return res as ApiResponse<T>;
}

// Tìm kiếm người dùng theo số điện thoại
export async function searchUserByPhone(phoneNumber: string): Promise<ApiResponse<User>> {
  const res = await api.get(`/api/v1/users/search/phone?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  return normalizeResponse<User>(res);
}

// Gửi lời mời kết bạn
export async function sendFriendRequest(targetUserId: number): Promise<ApiResponse<Friendship>> {
  const res = await api.post(`/api/v1/friendships/send-request/${targetUserId}`);
  return normalizeResponse<Friendship>(res);
}

// Duyệt lời mời kết bạn
export async function acceptFriendRequest(friendshipId: number): Promise<ApiResponse<Friendship>> {
  const res = await api.put(`/api/v1/friendships/${friendshipId}/accept`);
  return normalizeResponse<Friendship>(res);
}

// Hủy lời mời kết bạn (người gửi hủy)
export async function cancelFriendRequest(friendshipId: number): Promise<ApiResponse<string>> {
  const res = await api.delete(`/api/v1/friendships/cancel/${friendshipId}`);
  return normalizeResponse<string>(res);
}

// Hủy kết bạn
export async function unfriend(targetUserId: number): Promise<ApiResponse<string>> {
  const res = await api.delete(`/api/v1/friendships/unfriend/${targetUserId}`);
  return normalizeResponse<string>(res);
}

// Chặn bạn bè
export async function blockFriend(targetUserId: number): Promise<ApiResponse<string>> {
  const res = await api.post(`/api/v1/friendships/block/${targetUserId}`);
  return normalizeResponse<string>(res);
}

// Lấy danh sách lời mời kết bạn đến (incoming)
export async function getIncomingRequests(): Promise<ApiResponse<Friendship[]>> {
  const res = await api.get('/api/v1/friendships/incoming');
  return normalizeResponse<Friendship[]>(res);
}

// Lấy danh sách lời mời kết bạn đã gửi (outgoing)
export async function getOutgoingRequests(): Promise<ApiResponse<Friendship[]>> {
  const res = await api.get('/api/v1/friendships/outgoing');
  return normalizeResponse<Friendship[]>(res);
}

// Lấy danh sách bạn bè
export async function getFriendsList(): Promise<ApiResponse<Friendship[]>> {
  const res = await api.get('/api/v1/friendships/friends');
  return normalizeResponse<Friendship[]>(res);
}

export async function getFollowers(): Promise<ApiResponse<User[]>> {
  const res = await api.get('/api/v1/friendships/followers');
  return normalizeResponse<User[]>(res);
}

export async function getFollowing(): Promise<ApiResponse<User[]>> {
  const res = await api.get('/api/v1/friendships/following');
  return normalizeResponse<User[]>(res);
}

