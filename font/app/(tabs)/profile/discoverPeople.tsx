import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  Friendship
} from "@/services/friendship";
import { getToken } from "@/services/auth";
import { api } from "@/services/api";

type RequestItem = {
  id: string;
  friendshipId: number;
  requesterId: number;
  name: string;
  desc?: string;
  avatar?: string;
  type: "confirm" | "follow";
};

export default function DiscoverPeople() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  const filteredRequests = useMemo(() => {
    const data = activeTab === 'incoming' ? requests : outgoingRequests;
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => r.name.toLowerCase().includes(q));
  }, [requests, outgoingRequests, search, activeTab]);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const token = await getToken();
      let decodedUserId: number | null = null;

      if (token) {
        decodedUserId = extractUserIdFromToken(token);
        console.log("🪪 User ID từ token:", decodedUserId);
        console.log("🔑 Token:", token);
      } else {
        console.log("⚠️ Không có token trong AsyncStorage");
      }

      setCurrentUserId(decodedUserId);
      await logUserInfoAndFriendships(token, decodedUserId);
      await fetchIncoming(decodedUserId);
      await fetchOutgoing(decodedUserId);
    } catch (error: any) {
      console.error("❌ Lỗi khởi tạo discoverPeople:", error.message);
    }
  };

  const logUserInfoAndFriendships = async (token?: string | null, userId?: number | null) => {
    try {
      let finalToken = token;
      let finalUserId = userId;

      if (!finalToken) {
        finalToken = await getToken();
      }

      if (finalToken && finalUserId == null) {
        finalUserId = extractUserIdFromToken(finalToken);
        console.log("🪪 User ID từ token:", finalUserId);
        console.log("🔑 Token:", finalToken);
      } else if (!finalToken) {
        console.log("⚠️ Không có token trong AsyncStorage");
      }

      const friendshipsResponse = await api.get('/api/v1/friendships');
      console.log("📦 Danh sách friendships từ /api/v1/friendships:");
      console.log(JSON.stringify(friendshipsResponse, null, 2));
    } catch (error: any) {
      console.error("❌ Lỗi khi log thông tin:", error.message);
    }
  };

  const extractUserIdFromToken = (token: string): number | null => {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      
      // Decode base64url
      const payload = parts[1];
      let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4;
      if (pad === 2) base64 += "==";
      else if (pad === 3) base64 += "=";
      else if (pad !== 0) base64 += "===";
      
      const decoded = globalThis.atob ? globalThis.atob(base64) : Buffer.from(base64, "base64").toString("utf-8");
      const payloadObj = JSON.parse(decoded);
      
      // JWT có userId trong claims
      const userId = payloadObj.userId || payloadObj.sub || payloadObj.id;
      return userId ? Number(userId) : null;
    } catch (error) {
      console.error("Lỗi khi decode token:", error);
      return null;
    }
  };

  const fetchIncoming = async (targetUserId?: number | null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIncomingRequests();
      if (response.success && response.data) {
        const filterId = targetUserId ?? currentUserId;
        const filtered = response.data.filter((f: Friendship) => {
          const addresseeId = f.addressee?.id;
          const isPending = f.status === 'PENDING';
          return isPending && (filterId == null || addresseeId === filterId);
        });

        const items: RequestItem[] = filtered.map((f: Friendship) => ({
          id: String(f.id),
          friendshipId: f.id,
          requesterId: f.requester?.id,
          name: f.requester?.username || `User ${f.requester?.id ?? "?"}`,
          desc: "Đang chờ xác nhận",
          avatar: f.requester?.avatarUrl || undefined,
          type: "confirm",
        }));
        setRequests(items);
      } else {
        setRequests([]);
      }
    } catch (e: any) {
      setError(e?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoing = async (targetUserId?: number | null) => {
    try {
      const response = await getOutgoingRequests();
      if (response.success && response.data) {
        const filterId = targetUserId ?? currentUserId;
        const filtered = response.data.filter((f: Friendship) => {
          const requesterId = f.requester?.id;
          const isPending = f.status === 'PENDING';
          return isPending && (filterId == null || requesterId === filterId);
        });

        const items: RequestItem[] = filtered.map((f: Friendship) => ({
          id: String(f.id),
          friendshipId: f.id,
          requesterId: f.addressee?.id,
          name: f.addressee?.username || `User ${f.addressee?.id ?? "?"}`,
          desc: "Đã gửi lời mời",
          avatar: f.addressee?.avatarUrl || undefined,
          type: "follow",
        }));
        setOutgoingRequests(items);
      } else {
        setOutgoingRequests([]);
      }
    } catch (e: any) {
      console.error('Error fetching outgoing requests:', e);
    }
  };

  const onConfirm = async (item: RequestItem) => {
    try {
      await acceptFriendRequest(item.friendshipId);
      Alert.alert('Thành công', 'Đã chấp nhận lời mời kết bạn');
      await fetchIncoming(currentUserId);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể chấp nhận lời mời');
    }
  };

  const onDelete = async (item: RequestItem) => {
    try {
      await cancelFriendRequest(item.friendshipId);
      Alert.alert('Thành công', 'Đã từ chối lời mời kết bạn');
      if (activeTab === 'incoming') {
        await fetchIncoming(currentUserId);
      } else {
        await fetchOutgoing(currentUserId);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể từ chối lời mời');
    }
  };

  const renderUserItem = ({ item }: { item: RequestItem }) => (
    <View style={styles.userContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
      </View>

      {activeTab === "incoming" && item.type === "confirm" ? (
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => onConfirm(item)}>
            <Text style={styles.btnTextWhite}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
            <Text style={styles.btnText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === "outgoing" ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
          <Text style={styles.btnText}>Hủy</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lời mời kết bạn</Text>
        <TouchableOpacity onPress={() => router.push('/search/userSearch')}>
          <Ionicons name="search-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
            Đến ({requests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
            Đã gửi ({outgoingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Follow requests */}
      {error ? (
        <Text style={{ marginHorizontal: 12, color: "red", marginTop: 12 }}>{error}</Text>
      ) : null}
      {loading && filteredRequests.length === 0 ? (
        <Text style={{ marginHorizontal: 12, marginTop: 12, color: "#666" }}>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ marginHorizontal: 12, marginTop: 20, color: "#666", textAlign: 'center' }}>
              {activeTab === 'incoming' ? 'Không có lời mời kết bạn nào' : 'Chưa gửi lời mời kết bạn nào'}
            </Text>
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  manageText: {
    color: "#9333ff",
    fontSize: 14,
    marginLeft: "auto",
  },
  searchContainer: {
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchInput: {
    marginLeft: 6,
    flex: 1,
    fontSize: 14,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    color: "#666",
  },
  btnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  followBtn: {
    backgroundColor: "#9333ff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  confirmBtn: {
    backgroundColor: "#9333ff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deleteBtn: {
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnText: {
    fontSize: 13,
    color: "#000",
  },
  btnTextWhite: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#9333ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#9333ff',
    fontWeight: '700',
  },
});

