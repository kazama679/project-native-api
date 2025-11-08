import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCommentsByPostId, createComment, Comment } from "../../services/post";

export default function CommentScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await getCommentsByPostId(parseInt(postId));
      if (res?.data) {
        setComments(res.data);
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!postId || !comment.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      await createComment(parseInt(postId), { content: comment.trim() });
      setComment("");
      await loadComments();
    } catch (e) {
      console.error('Error creating comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
  };

  const renderComment = (item: Comment, isReply: boolean = false) => (
    <View style={[styles.commentRow, isReply && styles.replyRow]}>
      <Image
        source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.commentBody}>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: 'wrap' }}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.time}> {formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <TouchableOpacity>
          <Text style={styles.replyText}>Trả lời</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommentWithReplies = ({ item }: { item: Comment }) => (
    <View>
      {renderComment(item, false)}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id}>
              {renderComment(reply, true)}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bình luận</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Comment list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333ff" />
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderCommentWithReplies}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
            </View>
          )}
        />
      )}

      {/* Input */}
      <View style={styles.commentInputBox}>
        <ScrollEmojis />
        <View style={styles.inputArea}>
          <TextInput
            placeholder="Bạn nghĩ gì về nội dung này?"
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            style={styles.input}
            multiline
            editable={!submitting}
          />
          <TouchableOpacity onPress={handleSubmitComment} disabled={!comment.trim() || submitting}>
            <Ionicons
              name="send-outline"
              size={22}
              color={comment.trim() && !submitting ? "#7B5CFF" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const ScrollEmojis = () => {
  const emojis = ["❤️", "😂", "🔥", "👏", "🥰", "😮", "😢"];
  return (
    <View style={styles.emojiRow}>
      {emojis.map((e, i) => (
        <TouchableOpacity key={i}>
          <Text style={styles.emoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  replyRow: {
    paddingLeft: 48,
  },
  repliesContainer: {
    marginLeft: 48,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
  },
  time: {
    color: "#888",
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    marginVertical: 2,
  },
  replyText: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  commentInputBox: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
  },
  emoji: {
    fontSize: 20,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});
