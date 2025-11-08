import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getPostById, Post, reactToPost, removeReaction, ReactionType } from "../../services/post";
import { FontAwesome } from "@expo/vector-icons";

export default function PostDetail() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await getPostById(parseInt(postId));
      if (res?.data) {
        setPost(res.data);
      }
    } catch (e) {
      console.error('Error loading post:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async () => {
    if (!post || reacting) return;
    
    try {
      setReacting(true);
      if (post.currentUserReaction) {
        await removeReaction(post.id);
      } else {
        await reactToPost(post.id, { reactionType: 'LIKE' });
      }
      await loadPost();
    } catch (e) {
      console.error('Error reacting to post:', e);
    } finally {
      setReacting(false);
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

  const getReactionEmoji = (reactionType?: ReactionType) => {
    switch (reactionType) {
      case 'LOVE': return '❤️';
      case 'HAHA': return '😂';
      case 'WOW': return '😮';
      case 'SAD': return '😢';
      case 'ANGRY': return '😠';
      default: return '👍';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#9333ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Không tìm thấy bài viết</Text>
      </View>
    );
  }

  const firstMedia = post.mediaItems && post.mediaItems.length > 0 ? post.mediaItems[0] : null;
  const hasReaction = !!post.currentUserReaction;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.user.avatarUrl || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{post.user.username}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
      </View>

      {/* Image */}
      {firstMedia && (
        <Image
          source={{ uri: firstMedia.mediaUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleReaction} disabled={reacting}>
            {hasReaction ? (
              <FontAwesome name="heart" size={26} color="#FF3040" style={styles.icon} />
            ) : (
              <Ionicons name="heart-outline" size={26} color="#000" style={styles.icon} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/post/comment', params: { postId: post.id.toString() } })}
          >
            <Ionicons name="chatbubble-outline" size={26} color="#000" style={styles.icon} />
          </TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={26} color="#000" />
        </View>
        <Ionicons name="bookmark-outline" size={26} color="#000" />
      </View>

      {/* Likes */}
      {post.reactionCount > 0 && (
        <Text style={styles.likes}>
          {post.reactionCount} lượt thích
          {post.currentUserReaction && (
            <Text> • {getReactionEmoji(post.currentUserReaction.reactionType)}</Text>
          )}
        </Text>
      )}

      {/* Caption */}
      {post.caption && (
        <Text style={styles.caption}>
          <Text style={styles.usernameText}>{post.user.username} </Text>
          {post.caption}
        </Text>
      )}

      {/* Comments count */}
      {post.commentCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/post/comment', params: { postId: post.id.toString() } })}
        >
          <Text style={styles.viewComments}>Xem tất cả {post.commentCount} bình luận</Text>
        </TouchableOpacity>
      )}

      {/* Time */}
      <Text style={styles.time}>{formatTimeAgo(post.createdAt)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  username: {
    fontWeight: "600",
    fontSize: 15,
  },
  usernameText: {
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#eee",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: "row",
  },
  icon: {
    marginRight: 10,
  },
  likes: {
    fontWeight: "600",
    marginHorizontal: 12,
    marginBottom: 4,
  },
  caption: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  viewComments: {
    marginHorizontal: 12,
    color: "#666",
    marginTop: 4,
    marginBottom: 4,
  },
  time: {
    marginHorizontal: 12,
    color: "gray",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});