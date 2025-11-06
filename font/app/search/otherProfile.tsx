import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

export default function OtherProfile() {
  const [selectedTab, setSelectedTab] = useState('posts');
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.username}><TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back-outline" size={24} color="black" /></TouchableOpacity></Text>
        <Text style={styles.username}>sontungmtp</Text>
        <Ionicons name="checkmark-circle" size={16} color="#0095f6" />
        <Feather name="more-vertical" size={20} color="#000" style={{ marginLeft: 'auto' }} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Image
          source={{ uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.533</Text>
            <Text style={styles.statLabel}>bài viết</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8,3 triệu</Text>
            <Text style={styles.statLabel}>người theo dõi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>đang theo dõi</Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bio}>
        <Text style={styles.name}>Sơn Tùng M-TP 💋</Text>
        <Text style={styles.bioText}>
          WATCH “Đừng Làm Trái Tim Anh Đau” NOW 🍀🎤
        </Text>
        <Text style={styles.link}>🔗 youtu.be/abPmZCZZrFA</Text>
        <Text style={styles.followedBy}>Có 21thh04 và den.vau theo dõi</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Theo dõi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Nhắn tin</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 40,
    gap: 6,
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
  },
  bioText: {
    marginTop: 4,
    fontSize: 13,
  },
  link: {
    color: '#00376b',
    marginTop: 4,
  },
  followedBy: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  button: {
  backgroundColor: '#efefef',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 14,
  width: "48%",
  justifyContent: "center", 
  alignItems: "center",   
},
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconButton: {
    backgroundColor: '#efefef',
    borderRadius: 8,
    padding: 6,
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
