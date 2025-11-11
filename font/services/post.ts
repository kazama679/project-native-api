import { api, ApiResponse } from './api';

// Note: For production, you need to implement image upload to a file server
// The backend expects mediaUrl to be a URL on the server
// For now, we'll send the local URI (backend should handle file upload or you need to implement upload endpoint)

export type PrivacyMode = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export type MediaType = 'IMAGE' | 'VIDEO';

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export type Post = {
  id: number;
  user: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  caption?: string;
  privacyMode: PrivacyMode;
  createdAt: string;
  updatedAt?: string;
  mediaItems: MediaItem[];
  reactionCount: number;
  commentCount: number;
  currentUserReaction?: {
    id: number;
    reactionType: ReactionType;
  };
};

export type MediaItem = {
  id: number;
  mediaUrl: string;
  mediaType: MediaType;
  orderIndex: number;
};

export type Comment = {
  id: number;
  user: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: number;
  replies?: Comment[];
};

export type CreatePostRequest = {
  caption?: string;
  privacyMode: PrivacyMode;
  mediaItems: {
    mediaUrl: string;
    mediaType: MediaType;
    orderIndex?: number;
  }[];
};

export type UpdatePostPrivacyRequest = {
  privacyMode: PrivacyMode;
};

export type CreateCommentRequest = {
  content: string;
  parentCommentId?: number;
};

export type CreateReactionRequest = {
  reactionType: ReactionType;
};

function normalizeResponse<T>(res: any): ApiResponse<T> {
  // Backend trả về { message, response, success, code }
  // Frontend cần { message, data, success, statusCode }
  const normalized: any = {
    message: res?.message || '',
    success: res?.success ?? true,
    statusCode: res?.code || res?.statusCode || 200,
  };
  
  // Backend dùng "response", frontend dùng "data"
  if (res?.response !== undefined) {
    normalized.data = res.response;
  } else if (res?.data !== undefined) {
    normalized.data = res.data;
  }
  
  return normalized as ApiResponse<T>;
}

// Đăng bài viết
export async function createPost(payload: CreatePostRequest): Promise<ApiResponse<Post>> {
  // Upload images first if they are local URIs
  const mediaItems = await Promise.all(
    payload.mediaItems.map(async (item) => {
      if (item.mediaUrl && !item.mediaUrl.startsWith('http')) {
        // If it's a local URI, we need to upload it
        // For now, we'll use the URI as-is (backend should handle file upload separately)
        // TODO: Implement proper file upload
        return item;
      }
      return item;
    })
  );

  const res = await api.post('/api/v1/posts', {
    ...payload,
    mediaItems,
  });
  return normalizeResponse<Post>(res);
}

// Xem bài viết của bạn bè (newsfeed)
export async function getFeedPosts(): Promise<ApiResponse<Post[]>> {
  const res = await api.get('/api/v1/posts/feed');
  return normalizeResponse<Post[]>(res);
}

// Lấy danh sách bài viết của user
export async function getPostsByUserId(userId: number): Promise<ApiResponse<Post[]>> {
  const res = await api.get(`/api/v1/posts/user/${userId}`);
  return normalizeResponse<Post[]>(res);
}

// Xem chi tiết bài viết
export async function getPostById(postId: number): Promise<ApiResponse<Post>> {
  const res = await api.get(`/api/v1/posts/${postId}`);
  return normalizeResponse<Post>(res);
}

// Cập nhật chế độ xem bài viết
export async function updatePostPrivacy(
  postId: number,
  payload: UpdatePostPrivacyRequest
): Promise<ApiResponse<Post>> {
  const res = await api.put(`/api/v1/posts/${postId}/privacy`, payload);
  return normalizeResponse<Post>(res);
}

// Reaction bài viết
export async function reactToPost(
  postId: number,
  payload: CreateReactionRequest
): Promise<ApiResponse<any>> {
  const res = await api.post(`/api/v1/posts/${postId}/reactions`, payload);
  return normalizeResponse<any>(res);
}

// Xóa reaction bài viết
export async function removeReaction(postId: number): Promise<ApiResponse<string>> {
  const res = await api.delete(`/api/v1/posts/${postId}/reactions`);
  return normalizeResponse<string>(res);
}

// Bình luận bài viết
export async function createComment(
  postId: number,
  payload: CreateCommentRequest
): Promise<ApiResponse<Comment>> {
  const res = await api.post(`/api/v1/posts/${postId}/comments`, payload);
  return normalizeResponse<Comment>(res);
}

// Hiển thị danh sách bình luận của bài viết
export async function getCommentsByPostId(postId: number): Promise<ApiResponse<Comment[]>> {
  const res = await api.get(`/api/v1/posts/${postId}/comments`);
  return normalizeResponse<Comment[]>(res);
}

// Xóa bài viết
export async function deletePost(postId: number): Promise<ApiResponse<string>> {
  const res = await api.delete(`/api/v1/posts/${postId}`);
  return normalizeResponse<string>(res);
}

