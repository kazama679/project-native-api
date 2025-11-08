import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createPost, PrivacyMode, updatePostPrivacy, getPostById, Post } from "../../services/post";

export default function TitlePost() {
  const router = useRouter();
  const { postId, imageUri } = useLocalSearchParams<{ postId?: string; imageUri?: string }>();
  const [aiTag, setAiTag] = useState(false);
  const [caption, setCaption] = useState("");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("PUBLIC");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  React.useEffect(() => {
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
        setCaption(res.data.caption || "");
        setPrivacyMode(res.data.privacyMode);
      }
    } catch (e) {
      console.error('Error loading post:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (postId && post) {
        // Update post privacy
        await updatePostPrivacy(parseInt(postId), { privacyMode });
        Alert.alert("Thành công", "Đã cập nhật chế độ xem bài viết");
        router.back();
      } else {
        // Create new post
        if (!imageUri) {
          Alert.alert("Lỗi", "Vui lòng chọn hình ảnh");
          return;
        }

        const response = await createPost({
          caption: caption.trim() || undefined,
          privacyMode,
          mediaItems: [
            {
              mediaUrl: imageUri,
              mediaType: "IMAGE",
              orderIndex: 0,
            },
          ],
        });

        // Get the created post ID from response
        const createdPostId = response?.data?.id;
        
        if (createdPostId) {
          // Navigate to postDetail of the newly created post
          router.replace({
            pathname: '/post/postDetail',
            params: { postId: createdPostId.toString() },
          });
        } else {
          Alert.alert("Thành công", "Đã đăng bài viết");
          router.back();
        }
      }
    } catch (e: any) {
      console.error('Error creating/updating post:', e);
      Alert.alert("Lỗi", e.message || "Có lỗi xảy ra khi đăng bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  const getPrivacyLabel = (mode: PrivacyMode) => {
    switch (mode) {
      case "PUBLIC":
        return "Công khai";
      case "FRIENDS":
        return "Chỉ bạn bè";
      case "PRIVATE":
        return "Chỉ mình tôi";
      default:
        return "Công khai";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#9333ff" />
      </View>
    );
  }

  const displayImageUri = post?.mediaItems?.[0]?.mediaUrl || imageUri || "https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {postId ? "Chỉnh sửa bài viết" : "Bài viết mới"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image + Caption */}
        <View style={styles.postSection}>
          <Image
            source={{ uri: displayImageUri }}
            style={styles.postImage}
            resizeMode="cover"
          />
          <TextInput
            placeholder="Thêm chú thích..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            style={styles.captionInput}
            multiline
          />
        </View>

        {/* Privacy Mode Selection */}
        <View style={styles.optionBox}>
          <Text style={styles.sectionTitle}>Chế độ xem</Text>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacyMode("PUBLIC")}
          >
            <Ionicons
              name={privacyMode === "PUBLIC" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color="#000"
            />
            <Text style={styles.optionText}>Công khai</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacyMode("FRIENDS")}
          >
            <Ionicons
              name={privacyMode === "FRIENDS" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color="#000"
            />
            <Text style={styles.optionText}>Chỉ bạn bè</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacyMode("PRIVATE")}
          >
            <Ionicons
              name={privacyMode === "PRIVATE" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color="#000"
            />
            <Text style={styles.optionText}>Chỉ mình tôi</Text>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionBox}>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="list-outline" size={22} color="#000" />
            <Text style={styles.optionText}>Cuộc thăm dò ý kiến</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="musical-notes-outline" size={22} color="#000" />
            <Text style={styles.optionText}>Thêm âm thanh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="person-add-outline" size={22} color="#000" />
            <Text style={styles.optionText}>Gắn thẻ người khác</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="location-outline" size={22} color="#000" />
            <Text style={styles.optionText}>Thêm vị trí</Text>
          </TouchableOpacity>

          <View style={styles.optionSwitch}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="sparkles-outline" size={22} color="#000" />
              <Text style={styles.optionText}>Thêm nhãn AI</Text>
            </View>
            <Switch value={aiTag} onValueChange={setAiTag} />
          </View>
        </View>
      </ScrollView>

      {/* Share button */}
      <TouchableOpacity
        style={[styles.shareButton, submitting && styles.shareButtonDisabled]}
        onPress={handleShare}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.shareText}>
            {postId ? "Cập nhật" : "Chia sẻ"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postSection: {
    flexDirection: "row",
    padding: 12,
  },
  postImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#f2f2f2",
  },
  captionInput: {
    flex: 1,
    fontSize: 15,
    textAlignVertical: "top",
  },
  optionBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#333",
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 15,
    marginLeft: 10,
  },
  optionSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  shareButton: {
    backgroundColor: "#7B5CFF",
    paddingVertical: 14,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  shareButtonDisabled: {
    backgroundColor: "#ccc",
  },
  shareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
