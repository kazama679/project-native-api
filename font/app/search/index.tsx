import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { searchUsers, User } from '../../services/user';

const reelsData = [
  { id: '1', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '3.9 triệu' },
  { id: '2', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '2.1 triệu' },
  { id: '3', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '43.8K' },
  { id: '4', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '190K' },
  { id: '5', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '2.3 triệu' },
  { id: '6', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '64.2K' },
  { id: '7', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '996K' },
  { id: '8', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '526K' },
  { id: '9', thumbnail: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg', views: '9.611' },
];

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const itemSize = screenWidth / numColumns;

const TABS = ['Tài khoản', 'Reels', 'Âm thanh', 'Thẻ'];

export default function SearchAccountScreen() {
  const [selectedTab, setSelectedTab] = useState('Tài khoản');
  const [searchKeyword, setSearchKeyword] = useState('quang');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await searchUsers(keyword.trim());
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 500); // Debounce 500ms
    console.log(searchKeyword);
    
    return () => clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  useEffect(() => {
    handleSearch('quang');
  }, [handleSearch]);

  const handleUserPress = (user: User) => {
    router.push({
      pathname: '/search/otherProfile',
      params: { userId: user.id.toString() },
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{
          uri: item.avatarUrl || 'https://via.placeholder.com/45',
        }}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.username}>{item.username}</Text>
        {item.fullName && <Text style={styles.name}>{item.fullName}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#888"
          style={styles.searchBar}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          autoFocus
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#9333ff"
            style={styles.loader}
          />
        )}
      </View>

      {/* Thanh điều hướng ngang */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'Tài khoản' && (
        <>
          {hasSearched ? (
            loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#9333ff" />
                <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                ListHeaderComponent={
                  <Text style={styles.resultsHeader}>
                    Tìm thấy {searchResults.length} kết quả
                  </Text>
                }
              />
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Không tìm thấy</Text>
                <Text style={styles.emptySubtext}>
                  Không có người dùng nào khớp với "{searchKeyword}"
                </Text>
              </View>
            )
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.placeholderText}>
                Nhập tên hoặc username để tìm kiếm
              </Text>
            </View>
          )}
        </>
      )}

      {selectedTab === 'Reels' && (
        <FlatList
            data={reelsData}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <View style={styles.reelItemContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.reelThumbnail} />
                <View style={styles.reelOverlay}>
                    <Text style={styles.reelViewsText}>👁 {item.views}</Text>
                </View>
                </View>
            )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  loader: {
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: -12,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '500',
    paddingBottom: 6
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  tabIndicator: {
    marginTop: 4,
    height: 2,
    width: 30,
    backgroundColor: '#000',
    borderRadius: 4
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 15,
  },
  name: {
    fontSize: 13,
    color: '#888',
  },reelItemContainer: {
    position: 'relative',
    width: itemSize,
    height: itemSize * 1.3,
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reelViewsText: {
    color: '#fff',
    fontSize: 12,
  },
});

