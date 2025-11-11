import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { searchUserByPhone, sendFriendRequest } from '@/services/friendship';
import { User } from '@/services/user';

export default function PhoneSearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const response = await searchUserByPhone(phoneNumber.trim());
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        Alert.alert('Không tìm thấy', 'Không tìm thấy người dùng với số điện thoại này');
        setUser(null);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không tìm thấy người dùng');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) return;

    try {
      setSendingRequest(true);
      await sendFriendRequest(user.id);
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lời mời kết bạn');
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm theo số điện thoại</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Nhập số điện thoại"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Result */}
      {user && (
        <View style={styles.userCard}>
          <Image
            source={{
              uri: user.avatarUrl || 'https://via.placeholder.com/100',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            {user.fullName && <Text style={styles.fullName}>{user.fullName}</Text>}
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSendFriendRequest}
            disabled={sendingRequest}
          >
            <Text style={styles.addButtonText}>
              {sendingRequest ? 'Đang gửi...' : 'Gửi lời mời'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 12,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#9333ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#9333ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

