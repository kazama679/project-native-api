import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '@/services/api';
import {
  MessageMediaItem,
  MessageResponse,
  ReactionType,
  getConversationMessages,
  reactToMessage,
  removeMessageReaction,
  sendMessage,
  uploadMessageMedia,
} from '@/services/message';

type PendingMedia = {
  id: string;
  localUri: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl?: string;
  uploading: boolean;
};

const reactionOptions: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];

const reactionEmojiMap: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};

function buildMediaUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function computeCurrentUserId(partnerId: number, msgs: MessageResponse[]): number | null {
  for (const msg of msgs) {
    if (msg.sender?.id != null && msg.sender.id !== partnerId) {
      return msg.sender.id;
    }
    if (msg.receiver?.id != null && msg.receiver.id !== partnerId) {
      return msg.receiver.id;
    }
  }
  return null;
}

function aggregateReactions(
  reactions: MessageResponse['reactions'],
  currentUserId: number | null
) {
  const summary: Array<{ type: ReactionType; count: number; isMine: boolean }> = [];
  const map: Record<ReactionType, { count: number; isMine: boolean }> = {} as any;

  reactions?.forEach((reaction) => {
    if (!reaction?.reactionType) {
      return;
    }
    if (!map[reaction.reactionType]) {
      map[reaction.reactionType] = { count: 0, isMine: false };
    }
    map[reaction.reactionType].count += 1;
    if (reaction.user?.id != null && reaction.user.id === currentUserId) {
      map[reaction.reactionType].isMine = true;
    }
  });

  Object.entries(map).forEach(([type, value]) => {
    summary.push({
      type: type as ReactionType,
      count: value.count,
      isMine: value.isMine,
    });
  });

  return summary;
}

export default function MessageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    partnerId?: string;
    username?: string;
    fullName?: string;
  }>();
  const partnerId = Number(params.partnerId);
  const partnerDisplayName = (params.fullName as string) || (params.username as string) || 'Tin nhắn';

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [reactionTarget, setReactionTarget] = useState<MessageResponse | null>(null);

  const flatListRef = useRef<FlatList<MessageResponse>>(null);

  const hasUploadingMedia = pendingMedia.some((item) => item.uploading);
  const readyMedia = pendingMedia.filter((item) => !!item.mediaUrl && !item.uploading);
  const canSend =
    !hasUploadingMedia &&
    (inputValue.trim().length > 0 || readyMedia.length > 0) &&
    Number.isFinite(partnerId);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!Number.isFinite(partnerId)) {
      setError('Không xác định được người nhận');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getConversationMessages(partnerId);
      const data = (res.data || []).slice().sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setMessages(data);
      const detectedUserId = computeCurrentUserId(partnerId, data);
      if (detectedUserId != null) {
        setCurrentUserId((prev) =>
          prev !== detectedUserId ? detectedUserId : prev
        );
      }
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [partnerId, scrollToBottom]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handlePickMedia = useCallback(async () => {
    if (!Number.isFinite(partnerId)) {
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện để gửi hình ảnh/video.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const asset = pickerResult.assets[0];
    const mediaType = asset.type === 'video' ? 'VIDEO' : 'IMAGE';
    const id = `${Date.now()}-${Math.random()}`;

    setPendingMedia((prev) => [
      ...prev,
      {
        id,
        localUri: asset.uri,
        mediaType,
        uploading: true,
      },
    ]);

    try {
      const uploadRes = await uploadMessageMedia({
        uri: asset.uri,
        name:
          asset.fileName ||
          `message-${Date.now()}${mediaType === 'VIDEO' ? '.mp4' : '.jpg'}`,
        type:
          asset.mimeType ||
          (mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
      });

      const payload = uploadRes.data;

      setPendingMedia((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                mediaUrl: payload.mediaUrl,
                mediaType: payload.mediaType,
                uploading: false,
              }
            : item
        )
      );
    } catch (err: any) {
      setPendingMedia((prev) => prev.filter((item) => item.id !== id));
      Alert.alert('Lỗi', err?.message || 'Không thể upload media');
    }
  }, [partnerId]);

  const handleRemovePendingMedia = useCallback((id: string) => {
    setPendingMedia((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    if (!canSend || !Number.isFinite(partnerId)) {
      return;
    }

    try {
      const payload = {
        receiverId: partnerId,
        content: inputValue.trim().length > 0 ? inputValue.trim() : undefined,
        mediaItems:
          readyMedia.length > 0
            ? readyMedia.map((item) => ({
                mediaUrl: item.mediaUrl!,
                mediaType: item.mediaType,
                thumbnailUrl: null,
              }))
            : undefined,
      };

      const res = await sendMessage(payload);
      if (res.data) {
        setMessages((prev) => [...prev, res.data!]);
        if (res.data.sender?.id && res.data.sender.id !== partnerId) {
          setCurrentUserId(res.data.sender.id);
        }
        setTimeout(scrollToBottom, 100);
      }
      setInputValue('');
      setPendingMedia([]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể gửi tin nhắn');
    }
  }, [canSend, inputValue, partnerId, readyMedia, scrollToBottom]);

  const openReactionPicker = useCallback((message: MessageResponse) => {
    setReactionTarget(message);
  }, []);

  const closeReactionPicker = useCallback(() => {
    setReactionTarget(null);
  }, []);

  const handleSelectReaction = useCallback(
    async (reaction: ReactionType) => {
      if (!reactionTarget) {
        return;
      }
      try {
        const res = await reactToMessage(reactionTarget.id, reaction);
        if (res.data) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === res.data!.id ? res.data! : msg))
          );
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err?.message || 'Không thể gửi reaction');
      } finally {
        closeReactionPicker();
      }
    },
    [reactionTarget, closeReactionPicker]
  );

  const handleRemoveReaction = useCallback(async () => {
    if (!reactionTarget) return;
    try {
      await removeMessageReaction(reactionTarget.id);
      const userIdToRemove =
        currentUserId ??
        (reactionTarget.reactions || []).find(
          (reaction) => reaction.user?.id != null && reaction.user.id !== partnerId
        )?.user?.id ??
        null;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === reactionTarget.id
            ? {
                ...msg,
                reactions:
                  userIdToRemove == null
                    ? msg.reactions
                    : msg.reactions?.filter(
                        (reaction) => reaction.user?.id !== userIdToRemove
                      ),
              }
            : msg
        )
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể xóa reaction');
    } finally {
      closeReactionPicker();
    }
  }, [reactionTarget, currentUserId, closeReactionPicker]);

  const openMedia = useCallback((url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      Alert.alert('Không thể mở media', 'Vui lòng thử lại sau.');
    });
  }, []);

  const renderMediaItem = useCallback(
    (media: MessageMediaItem) => {
      const uri = buildMediaUrl(media.mediaUrl);
      if (media.mediaType === 'IMAGE') {
        return (
          <Image
            key={media.id}
            source={{ uri }}
            style={styles.messageImage}
          />
        );
      }

      return (
        <TouchableOpacity
          key={media.id}
          style={styles.messageVideo}
          onPress={() => openMedia(uri)}
        >
          <Text style={styles.videoIcon}>▶</Text>
          <Text style={styles.videoText}>Xem video</Text>
        </TouchableOpacity>
      );
    },
    [openMedia]
  );

  const renderMessage = useCallback(
    ({ item }: { item: MessageResponse }) => {
      const isOwnMessage = item.sender?.id != null && item.sender.id !== partnerId;
      const reactionSummary = aggregateReactions(item.reactions, currentUserId);
      const existingReaction = item.reactions?.find(
        (reaction) => reaction.user?.id === currentUserId
      );

      return (
        <View
          style={[
            styles.messageRow,
            isOwnMessage ? styles.rowRight : styles.rowLeft,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => openReactionPicker(item)}
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.myBubble : styles.theirBubble,
            ]}
          >
            {item.content ? (
              <Text
                style={[
                  styles.messageText,
                  isOwnMessage ? styles.myText : styles.theirText,
                ]}
              >
                {item.content}
              </Text>
            ) : null}
            {item.media?.map(renderMediaItem)}
          </TouchableOpacity>

          {reactionSummary.length > 0 ? (
            <View
              style={[
                styles.reactionSummary,
                isOwnMessage ? styles.reactionRight : styles.reactionLeft,
              ]}
            >
              {reactionSummary.map((reaction) => (
                <View key={reaction.type} style={styles.reactionItem}>
                  <Text style={styles.reactionEmoji}>
                    {reactionEmojiMap[reaction.type]}
                  </Text>
                  <Text
                    style={[
                      styles.reactionCount,
                      reaction.isMine ? styles.reactionMine : null,
                    ]}
                  >
                    {reaction.count}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {existingReaction && reactionTarget?.id === item.id ? (
            <Text style={styles.reactionHint}>Giữ để thay đổi reaction</Text>
          ) : null}
        </View>
      );
    },
    [partnerId, currentUserId, openReactionPicker, renderMediaItem, reactionTarget]
  );

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      return null;
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMessages}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Hãy bắt đầu cuộc trò chuyện đầu tiên!</Text>
      </View>
    );
  }, [loading, error, loadMessages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{partnerDisplayName}</Text>
          {params.username ? (
            <Text style={styles.headerUsername}>@{params.username}</Text>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => `${item.id}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContainer}
            ListEmptyComponent={listEmptyComponent}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />

          {pendingMedia.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.attachmentScroll}
              contentContainerStyle={styles.attachmentContent}
            >
              {pendingMedia.map((media) => (
                <View key={media.id} style={styles.attachmentPreview}>
                  {media.mediaType === 'IMAGE' ? (
                    <Image
                      source={{ uri: media.localUri }}
                      style={styles.attachmentImage}
                    />
                  ) : (
                    <View style={styles.attachmentVideo}>
                      <Text style={styles.videoIcon}>▶</Text>
                      <Text style={styles.videoText}>Video</Text>
                    </View>
                  )}
                  {media.uploading ? (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={styles.removeAttachment}
                    onPress={() => handleRemovePendingMedia(media.id)}
                  >
                    <Text style={styles.removeAttachmentText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePickMedia}
              >
                <Text style={styles.actionIcon}>＋</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#888"
                value={inputValue}
                onChangeText={setInputValue}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !canSend && styles.sendDisabled]}
                onPress={handleSend}
                disabled={!canSend}
              >
                <Text style={styles.sendText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {reactionTarget ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeReactionPicker}
          style={styles.reactionPickerOverlay}
        >
          <View style={styles.reactionPicker}>
            {reactionOptions.map((reaction) => (
              <TouchableOpacity
                key={reaction}
                onPress={() => handleSelectReaction(reaction)}
                style={styles.reactionPickerOption}
              >
                <Text style={styles.reactionOptionEmoji}>
                  {reactionEmojiMap[reaction]}
                </Text>
              </TouchableOpacity>
            ))}
            {reactionTarget.reactions?.some(
              (reaction) => reaction.user?.id === currentUserId
            ) ? (
              <TouchableOpacity
                onPress={handleRemoveReaction}
                style={styles.removeReactionButton}
              >
                <Text style={styles.removeReactionText}>Bỏ</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 30,
    color: '#007AFF',
    lineHeight: 30,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerUsername: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 8,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myBubble: {
    backgroundColor: '#c75cf0',
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
  },
  theirText: {
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 220,
    borderRadius: 12,
    marginTop: 8,
  },
  messageVideo: {
    width: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  videoIcon: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 6,
  },
  videoText: {
    fontSize: 14,
    color: '#fff',
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  reactionRight: {
    alignSelf: 'flex-end',
  },
  reactionLeft: {
    alignSelf: 'flex-start',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    color: '#555',
    marginLeft: 2,
  },
  reactionMine: {
    color: '#000',
    fontWeight: '700',
  },
  reactionHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#999',
  },
  attachmentScroll: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  attachmentContent: {
    paddingVertical: 4,
  },
  attachmentPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachment: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  removeAttachmentText: {
    color: '#fff',
    fontSize: 12,
  },
  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 22,
    color: '#555',
  },
  messageInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 140,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#c75cf0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  reactionPickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 120 : 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  reactionPickerOption: {
    marginHorizontal: 6,
  },
  reactionOptionEmoji: {
    fontSize: 24,
  },
  removeReactionButton: {
    marginLeft: 10,
  },
  removeReactionText: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#c75cf0',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

