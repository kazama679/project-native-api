import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { searchUsers } from '@/services/user';
import { User } from '@/services/user';

export default function UserSearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await searchUsers(keyword.trim());
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [keyword, handleSearch]);

  const handleUserPress = (user: User) => {
    router.push({
      pathname: '/search/otherProfile',
      params: { userId: user.id.toString() },
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{
          uri: item.avatarUrl || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.fullName && (
          <Text style={styles.fullName}>{item.fullName}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          placeholder="Tìm kiếm theo tên hoặc username"
          placeholderTextColor="#888"
          value={keyword}
          onChangeText={setKeyword}
          style={styles.searchInput}
          autoFocus
        />
        {loading && (
          <ActivityIndicator size="small" color="#9333ff" style={styles.loader} />
        )}
      </View>

      {/* Results */}
      {hasSearched && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#9333ff" />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={
                <Text style={styles.resultsHeader}>
                  Tìm thấy {users.length} kết quả
                </Text>
              }
            />
          ) : (
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy</Text>
              <Text style={styles.emptySubtext}>
                Không có người dùng nào khớp với "{keyword}"
              </Text>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loader: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 12,
  },
  resultsHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  userItem: {
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
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 13,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

