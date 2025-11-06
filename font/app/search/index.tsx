import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

const DATA = [
  { id: '1', username: 'aka__buns', name: 'Bấu', avatar: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '2', username: 'b.fenle', name: 'FEN - LÊ', avatar: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '3', username: 'bentopan_2.8', name: 'bảnh', avatar: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '4', username: '_prv.cbong', name: 'Cỏ aka__buns theo dõi', avatar: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  { id: '5', username: 'copehayzoi', name: 'Bích Hạnh', avatar: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
];

const TABS = ['Tài khoản', 'Reels', 'Âm thanh', 'Thẻ'];

export default function SearchAccountScreen() {
  const [selectedTab, setSelectedTab] = useState('Tài khoản');
  
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <TextInput
        placeholder="Tìm kiếm"
        placeholderTextColor="#888"
        style={styles.searchBar}
      />

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
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemContainer} onPress={() => router.push('/search/otherProfile')}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.textContainer}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
  searchBar: {
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 8,
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

