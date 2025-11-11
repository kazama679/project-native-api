import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getProfile, User } from '@/services/user';
import { getFollowers, getFollowing } from '@/services/friendship';
import { getPostsByUserId, Post } from '@/services/post';
import ProfileMenu from './profileMenu';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns;

export default function ProfileScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const highlights = [
    { id: 1, title: 'New', uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
    { id: 2, title: 'Friends', uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
    { id: 3, title: 'Sport', uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
    { id: 4, title: 'Design', uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user) {
      loadFollowData();
      loadUserPosts();
    }
  }, [user]);

  // Reload posts when screen comes into focus (e.g., after creating a new post)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserPosts();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res?.data) {
        setUser(res.data);
      }
    } catch (e: any) {
      console.error('Error loading profile:', e);
      Alert.alert('Lỗi', e?.message || 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowData = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([getFollowers(), getFollowing()]);
      if (followersRes?.data) {
        setFollowers(followersRes.data);
      }
      if (followingRes?.data) {
        setFollowing(followingRes.data);
      }
    } catch (e) {
      console.error('Error loading follow data:', e);
    }
  };

  const loadUserPosts = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    
    try {
      setLoadingPosts(true);
      console.log('Loading posts for user ID:', user.id);
      const res = await getPostsByUserId(user.id);
      console.log('Posts API response:', JSON.stringify(res, null, 2));
      // Handle both response.data and response.response (backend format)
      const postsData = (res as any)?.data || (res as any)?.response;
      if (postsData) {
        console.log('Posts data:', postsData);
        const postsArray = Array.isArray(postsData) ? postsData : [];
        console.log('Number of posts:', postsArray.length);
        setPosts(postsArray);
      } else {
        console.log('No data in response. Full response:', res);
        setPosts([]);
      }
    } catch (e: any) {
      console.error('Error loading user posts:', e);
      console.error('Error details:', e?.message, e?.status, e?.data);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserPosts();
    await loadFollowData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{user.username}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu-outline" size={28} />
        </TouchableOpacity>
      </View>
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#fff' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
        <Image
          source={{ 
            uri: user.avatarUrl || 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' 
          }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{posts.length}</Text>
            <Text>Posts</Text>
          </View>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push('/profile/followers')}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{followers.length}</Text>
            <Text>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push('/profile/following')}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{following.length}</Text>
            <Text>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>{user.fullName || user.username}</Text>
        {user.bio && <Text>{user.bio}</Text>}
        {user.website && <Text style={{ color: '#3797EF' }}>{user.website}</Text>}

        <TouchableOpacity
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            paddingVertical: 6,
            borderRadius: 6,
            alignItems: 'center',
          }}
          onPress={() => router.push('/profile/edit')}
        >
          <Text>Chỉnh sửa trang cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* Highlights */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20, paddingLeft: 20 }}>
        {highlights.map((item) => (
          <View key={item.id} style={{ alignItems: 'center', marginRight: 15 }}>
            <Image
              source={{ uri: item.uri }}
              style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#ddd' }}
            />
            <Text style={{ fontSize: 12, marginTop: 4 }}>{item.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 0.5, borderColor: '#ddd', paddingVertical: 10 }}>
        <Ionicons name="grid-outline" size={28} />
        <Ionicons name="person-outline" size={28} />
      </View>

      {/* Grid Posts */}
      {loadingPosts ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      ) : posts.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {posts.map((item) => {
            const firstMedia = item.mediaItems && item.mediaItems.length > 0 ? item.mediaItems[0] : null;
            return (
              <TouchableOpacity
                key={item.id}
                style={{ width: imageSize, height: imageSize }}
                onPress={() => router.push({ pathname: '/post/postDetail', params: { postId: item.id.toString() } })}
              >
                {firstMedia ? (
                  <Image
                    source={{ uri: firstMedia.mediaUrl }}
                    style={{ width: imageSize, height: imageSize }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: imageSize, height: imageSize, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="image-outline" size={30} color="#ccc" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="camera-outline" size={50} color="#ccc" />
          <Text style={{ marginTop: 10, color: '#999' }}>Chưa có bài viết nào</Text>
        </View>
      )}
    </ScrollView>
    <ProfileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}
