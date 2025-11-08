import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  sendFriendRequest,
  getFriendsList,
  getIncomingRequests,
  getOutgoingRequests,
  Friendship,
} from '../../services/friendship';
import { getUserById, User } from '../../services/user';
import { getProfile } from '../../services/user';

const posts = [
  { id: '1', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '2', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '3', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '4', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '5', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '6', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '7', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '8', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '9', image: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
];

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns;

type FriendshipStatus = 'none' | 'pending' | 'accepted' | 'blocked';

export default function OtherProfile() {
  const params = useLocalSearchParams();
  const userId = params.userId ? parseInt(params.userId as string) : null;
  const router = useRouter();
  
  const [selectedTab, setSelectedTab] = useState('posts');
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadCurrentUser();
    }
  }, [userId]);

  useEffect(() => {
    if (user && currentUser) {
      checkFriendshipStatus();
    }
  }, [user, currentUser]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin người dùng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user || !currentUser || user.id === currentUser.id) {
      setFriendshipStatus('none');
      return;
    }

    try {
      // Check if they are friends
      const friendsResponse = await getFriendsList();
      if (friendsResponse.success && friendsResponse.data) {
        const isFriend = friendsResponse.data.some((f: Friendship) => 
          (f.requester.id === user.id && f.addressee.id === currentUser.id) ||
          (f.requester.id === currentUser.id && f.addressee.id === user.id)
        );
        if (isFriend) {
          setFriendshipStatus('accepted');
          return;
        }
      }

      // Check incoming requests
      const incomingResponse = await getIncomingRequests();
      if (incomingResponse.success && incomingResponse.data) {
        const hasIncoming = incomingResponse.data.some((f: Friendship) => 
          f.requester.id === user.id && f.addressee.id === currentUser.id
        );
        if (hasIncoming) {
          setFriendshipStatus('pending');
          return;
        }
      }

      // Check outgoing requests
      const outgoingResponse = await getOutgoingRequests();
      if (outgoingResponse.success && outgoingResponse.data) {
        const hasOutgoing = outgoingResponse.data.some((f: Friendship) => 
          f.requester.id === currentUser.id && f.addressee.id === user.id
        );
        if (hasOutgoing) {
          setFriendshipStatus('pending');
          return;
        }
      }

      setFriendshipStatus('none');
    } catch (error) {
      console.error('Error checking friendship status:', error);
      setFriendshipStatus('none');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) return;

    try {
      setSendingRequest(true);
      await sendFriendRequest(user.id);
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn');
      setFriendshipStatus('pending');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lời mời kết bạn');
    } finally {
      setSendingRequest(false);
    }
  };

  const getButtonText = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return 'Đã là bạn bè';
      case 'pending':
        return 'Đã gửi lời mời';
      default:
        return 'Gửi lời mời';
    }
  };

  const isButtonDisabled = () => {
    return friendshipStatus === 'accepted' || friendshipStatus === 'pending' || sendingRequest;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#9333ff" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = currentUser && user.id === currentUser.id;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.username}>{user.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image
          source={{
            uri: user.avatarUrl || 'https://via.placeholder.com/85',
          }}
          style={styles.avatar}
        />
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>bài viết</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>người theo dõi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>đang theo dõi</Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bio}>
        {user.fullName && <Text style={styles.name}>{user.fullName}</Text>}
        {user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
        {user.website && <Text style={styles.link}>🔗 {user.website}</Text>}
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{user.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên đầy đủ:</Text>
            <Text style={styles.infoValue}>{user.fullName || 'Chưa cập nhật'}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              isButtonDisabled() && styles.buttonDisabled,
            ]}
            onPress={handleSendFriendRequest}
            disabled={isButtonDisabled()}
          >
            {sendingRequest ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  isButtonDisabled() && styles.buttonTextDisabled,
                ]}
              >
                {getButtonText()}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setSelectedTab('posts')}>
          <Ionicons
            name="grid-outline"
            size={24}
            color={selectedTab === 'posts' ? '#000' : '#888'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('reels')}>
          <Ionicons
            name="film-outline"
            size={24}
            color={selectedTab === 'reels' ? '#000' : '#888'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('tagged')}>
          <Ionicons
            name="person-outline"
            size={24}
            color={selectedTab === 'tagged' ? '#000' : '#888'}
          />
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#9333ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
  },
  bio: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  name: {
    fontWeight: '700',
    fontSize: 14,
  },
  bioText: {
    marginTop: 4,
    fontSize: 13,
  },
  link: {
    color: '#00376b',
    marginTop: 4,
    fontSize: 13,
  },
  infoList: {
    marginTop: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#9333ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    marginTop: 14,
    paddingVertical: 8,
  },
  postImage: {
    width: imageSize,
    height: imageSize,
  },
});
