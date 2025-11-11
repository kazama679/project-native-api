import { api, ApiResponse } from './api';

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export type UserSummary = {
  id: number;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export type MessageMediaItem = {
  id: number;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string | null;
};

export type MessageReactionInfo = {
  id: number;
  user: UserSummary;
  reactionType: ReactionType;
  createdAt: string;
};

export type MessageResponse = {
  id: number;
  sender: UserSummary;
  receiver: UserSummary;
  content?: string | null;
  isRead: boolean;
  createdAt: string;
  media: MessageMediaItem[];
  reactions: MessageReactionInfo[];
};

export type ConversationResponse = {
  participant: UserSummary;
  lastMessage: MessageResponse;
  unreadCount: number;
};

export type SendMessagePayload = {
  receiverId: number;
  content?: string;
  mediaItems?: Array<{
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    thumbnailUrl?: string | null;
  }>;
};

export type UploadMessageMediaParams = {
  uri: string;
  name: string;
  type: string;
};

function normalizeResponse<T>(res: any): ApiResponse<T> {
  if (res?.response && !res?.data) {
    res.data = res.response;
  }
  return res as ApiResponse<T>;
}

export async function getConversations(): Promise<ApiResponse<ConversationResponse[]>> {
  const res = await api.get('/api/v1/messages/threads');
  return normalizeResponse<ConversationResponse[]>(res);
}

export async function getConversationMessages(partnerId: number): Promise<ApiResponse<MessageResponse[]>> {
  const res = await api.get(`/api/v1/messages/threads/${partnerId}`);
  return normalizeResponse<MessageResponse[]>(res);
}

export async function sendMessage(payload: SendMessagePayload): Promise<ApiResponse<MessageResponse>> {
  const res = await api.post('/api/v1/messages', payload);
  return normalizeResponse<MessageResponse>(res);
}

export async function reactToMessage(
  messageId: number,
  reactionType: ReactionType
): Promise<ApiResponse<MessageResponse>> {
  const res = await api.post(`/api/v1/messages/${messageId}/reactions`, {
    reactionType,
  });
  return normalizeResponse<MessageResponse>(res);
}

export async function removeMessageReaction(messageId: number): Promise<ApiResponse<void>> {
  const res = await api.delete(`/api/v1/messages/${messageId}/reactions`);
  return normalizeResponse<void>(res);
}

export async function uploadMessageMedia(
  params: UploadMessageMediaParams
): Promise<ApiResponse<{ mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO'; thumbnailUrl?: string | null }>> {
  const formData = new FormData();
  formData.append('file', {
    uri: params.uri,
    name: params.name,
    type: params.type,
  } as any);

  const res = await api.post('/api/v1/messages/media', formData);
  return normalizeResponse(res);
}


