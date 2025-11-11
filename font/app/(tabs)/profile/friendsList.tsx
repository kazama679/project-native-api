import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  blockFriend,
  getFriendsList,
  unfriend,
  Friendship,
} from '@/services/friendship';

type FriendItem = {
  id: number;
  userId: number;
  name: string;
  username: string;
  avatar?: string;
  friendshipId: number;
};

export default function FriendsListScreen() {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriendsList();
      if (response.success && response.data) {
        const items: FriendItem[] = response.data.map((f: Friendship) => {
          // Xác định user nào là bạn bè (không phải current user)
          const friend = f.requester?.id ? f.requester : f.addressee;
          return {
            id: f.id,
            friendshipId: f.id,
            userId: friend?.id || 0,
            name: friend?.fullName || friend?.username || 'Unknown',
            username: friend?.username || 'unknown',
            avatar: friend?.avatarUrl,
          };
        });
        setFriends(items);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (userId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn hủy kết bạn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await unfriend(userId);
              Alert.alert('Thành công', 'Đã hủy kết bạn');
              fetchFriends();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy kết bạn');
            }
          },
        },
      ]
    );
  };

  const handleBlock = async (userId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn chặn người này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockFriend(userId);
              Alert.alert('Thành công', 'Đã chặn người dùng');
              fetchFriends();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể chặn người dùng');
            }
          },
        },
      ]
    );
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.username.toLowerCase().includes(search.toLowerCase())
  );

  const renderFriendItem = ({ item }: { item: FriendItem }) => (
    <View style={styles.friendContainer}>
      <Image
        source={{
          uri: item.avatar || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{item.username}</Text>
        {item.name !== item.username && (
          <Text style={styles.name}>{item.name}</Text>
        )}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUnfriend(item.userId)}
        >
          <Text style={styles.actionButtonText}>Hủy kết bạn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.blockButton]}
          onPress={() => handleBlock(item.userId)}
        >
          <Text style={[styles.actionButtonText, styles.blockButtonText]}>
            Chặn
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách bạn bè</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          placeholder="Tìm kiếm bạn bè"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Friends List */}
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search
                ? 'Không tìm thấy bạn bè nào'
                : 'Chưa có bạn bè nào'}
            </Text>
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
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'row',
    alignItems: 'center',
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
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  blockButton: {
    backgroundColor: '#fee',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  blockButtonText: {
    color: '#d00',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 14,
  },
});

