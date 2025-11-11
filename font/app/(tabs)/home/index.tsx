import { getFeedPosts, Post, ReactionType, reactToPost, removeReaction } from '@/services/post';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getConversations } from '@/services/message';

const stories = [
  { id: '1', name: 'Your Story', image: 'https://i.imgur.com/2nCt3Sb.jpg' },
  { id: '2', name: 'karenne', image: 'https://i.imgur.com/8Km9tLL.jpg' },
  { id: '3', name: 'zackjohn', image: 'https://i.imgur.com/6VBx3io.jpg' },
  { id: '4', name: 'kieron_d', image: 'https://i.imgur.com/jNNT4LE.jpg' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [reactingPostId, setReactingPostId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadFeed();
    loadUnreadCount();
  }, []);

  // Refresh unread count khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  const loadFeed = async () => {
    try {
      setLoading(true);
      const res = await getFeedPosts();
      if (res?.data) {
        setPosts(res.data);
      }
    } catch (e) {
      console.error('Error loading feed:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await getConversations();
      if (res?.data) {
        // Tính tổng số tin nhắn chưa đọc từ tất cả conversations
        const totalUnread = res.data.reduce((sum, conversation) => {
          return sum + (conversation.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (e) {
      console.error('Error loading unread count:', e);
    }
  };

  const handleReaction = async (postId: number, currentReaction?: { id: number; reactionType: ReactionType }) => {
    if (reactingPostId === postId) return;
    
    try {
      setReactingPostId(postId);
      if (currentReaction) {
        // Remove reaction
        await removeReaction(postId);
      } else {
        // Add like reaction
        await reactToPost(postId, { reactionType: 'LIKE' });
      }
      // Reload feed to get updated data
      await loadFeed();
    } catch (e) {
      console.error('Error reacting to post:', e);
    } finally {
      setReactingPostId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const renderStory = ({ item }: any) => (
    <View style={styles.storyItem}>
      <View style={styles.storyBorder}>
        <Image source={{ uri: item.image }} style={styles.storyImage} />
      </View>
      <Text style={styles.storyName}>{item.name}</Text>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => {
    const firstMedia = item.mediaItems && item.mediaItems.length > 0 ? item.mediaItems[0] : null;
    const hasReaction = !!item.currentUserReaction;
    const isReacting = reactingPostId === item.id;

    return (
      <View style={styles.postContainer}>
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.postUser}>
            <Image
              source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/50' }}
              style={styles.userAvatar}
              height={30}
              width={30}
            />
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              {item.user.fullName && <Text style={styles.location}>{item.user.fullName}</Text>}
            </View>
          </View>
          <Feather name="more-vertical" size={20} />
        </View>

        {/* Hình ảnh bài đăng */}
        {firstMedia && (
          <Image source={{ uri: firstMedia.mediaUrl }} style={styles.postImage} />
        )}

        {/* Action icons */}
        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              onPress={() => handleReaction(item.id, item.currentUserReaction)}
              disabled={isReacting}
            >
              {hasReaction ? (
                <FontAwesome name="heart" size={24} color="#FF3040" style={styles.icon} />
              ) : (
                <FontAwesome name="heart-o" size={24} style={styles.icon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/post/postDetail', params: { postId: item.id.toString() } })}
            >
              <Feather name="message-circle" size={24} style={styles.icon} />
            </TouchableOpacity>
            <Feather name="send" size={24} />
          </View>
          <Feather name="bookmark" size={24} />
        </View>

        {/* Likes */}
        {item.reactionCount > 0 && (
          <Text style={styles.likes}>
            <Text style={styles.bold}>{item.reactionCount}</Text> lượt thích
          </Text>
        )}

        {/* Caption */}
        {item.caption && (
          <Text style={styles.caption}>
            <Text style={styles.bold}>{item.user.username}</Text> {item.caption}
          </Text>
        )}

        {/* Comments count */}
        {item.commentCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/post/postDetail', params: { postId: item.id.toString() } })}
          >
            <Text style={styles.viewComments}>Xem tất cả {item.commentCount} bình luận</Text>
          </TouchableOpacity>
        )}

        {/* Time */}
        <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Instagram</Text>
        <View style={styles.headerIcons}>
          <Feather name="heart" size={24} style={styles.headerIcon} />
          <TouchableOpacity 
            onPress={() => router.push("/home/messages")}
            style={styles.messageIconContainer}
          >
            <Feather name="message-circle" size={24} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <FlatList
          horizontal
          data={stories}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Posts */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333ff" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadFeed}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ddd',
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Billabong', // font giống Instagram
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 15 },
  messageIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3040',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storiesContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  storyItem: { alignItems: 'center', marginHorizontal: 8 },
  storyBorder: {
    borderWidth: 2,
    borderColor: '#FF0066',
    borderRadius: 45,
    padding: 3,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storyName: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  postContainer: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  postUser: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 35, height: 35, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14 },
  location: { fontSize: 12, color: '#666' },
  postImage: {
    width: '100%',
    height: 400,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: { flexDirection: 'row' },
  icon: { marginRight: 12 },
  likes: { paddingHorizontal: 12, fontWeight: '500', marginBottom: 5 },
  caption: { paddingHorizontal: 12, marginBottom: 10 },
  bold: { fontWeight: 'bold' },
  viewComments: {
    paddingHorizontal: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  time: {
    paddingHorizontal: 12,
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
