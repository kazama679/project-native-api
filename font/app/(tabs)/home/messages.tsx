import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ConversationResponse,
  getConversations,
  ReactionType,
} from '@/services/message';

const reactionEmojiMap: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};

const PLACEHOLDER_AVATAR = require('../../../assets/images/react-logo.png');

function formatRelativeTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Vừa xong';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;

  return date.toLocaleDateString();
}

function buildPreview(conversation: ConversationResponse) {
  const { lastMessage } = conversation;
  if (!lastMessage) return 'Tin nhắn mới';

  if (lastMessage.content && lastMessage.content.trim().length > 0) {
    return lastMessage.content.trim();
  }

  if (lastMessage.media && lastMessage.media.length > 0) {
    const hasVideo = lastMessage.media.some((item) => item.mediaType === 'VIDEO');
    const hasImage = lastMessage.media.some((item) => item.mediaType === 'IMAGE');

    if (hasVideo && hasImage) {
      return 'Đã gửi hình ảnh và video';
    }
    if (hasVideo) {
      return 'Đã gửi video';
    }
    return 'Đã gửi hình ảnh';
  }

  return 'Tin nhắn mới';
}

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      setError(null);
      const res = await getConversations();
      setConversations(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách hội thoại');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const filteredConversations = useMemo(() => {
    if (!searchText.trim()) {
      return conversations;
    }
    const keyword = searchText.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const participant = conversation.participant;
      const target = `${participant?.username || ''} ${participant?.fullName || ''}`.toLowerCase();
      return target.includes(keyword);
    });
  }, [conversations, searchText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  const renderConversation = useCallback(
    ({ item }: { item: ConversationResponse }) => {
      const participant = item.participant;
      const lastMessage = item.lastMessage;
      const reactionSummary =
        lastMessage?.reactions?.map((reaction) => reactionEmojiMap[reaction.reactionType]).join(' ') || '';
      const preview = buildPreview(item);

      return (
        <TouchableOpacity
          style={styles.messageItem}
          onPress={() =>
            router.push({
              pathname: '/home/message',
              params: {
                partnerId: participant?.id?.toString() || '',
                username: participant?.username || '',
                fullName: participant?.fullName || '',
              },
            })
          }
        >
          <Image
            source={
              participant?.avatarUrl
                ? { uri: participant.avatarUrl }
                : PLACEHOLDER_AVATAR
            }
            style={styles.avatar}
          />

          <View style={styles.messageInfo}>
            <View style={styles.messageHeader}>
              <Text style={styles.name}>{participant?.fullName || participant?.username}</Text>
              <Text style={styles.time}>{formatRelativeTime(lastMessage?.createdAt || '')}</Text>
            </View>
            <Text style={styles.preview} numberOfLines={1}>
              {preview}
              {reactionSummary ? `  ${reactionSummary}` : ''}
            </Text>
          </View>

          {item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      );
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tin nhắn</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => `${item.participant?.id}`}
          renderItem={renderConversation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error ? error : 'Chưa có cuộc trò chuyện nào.'}
              </Text>
            </View>
          }
          contentContainerStyle={
            filteredConversations.length === 0 ? styles.emptyContent : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#f2f2f2',
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  preview: {
    fontSize: 14,
    color: '#555',
  },
  unreadBadge: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContent: {
    flexGrow: 1,
  },
});
