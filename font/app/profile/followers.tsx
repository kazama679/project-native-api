import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getFollowers } from '../../services/friendship';
import { User } from '../../services/user';

export default function FollowersScreen() {
  const router = useRouter();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const res = await getFollowers();
      if (res?.data) {
        setFollowers(res.data);
      }
    } catch (e) {
      console.error('Error loading followers:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 }}
      onPress={() => router.push({ pathname: '/search/otherProfile', params: { userId: item.id.toString() } })}
    >
      <Image
        source={{ uri: item.avatarUrl || 'https://via.placeholder.com/50' }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{item.username}</Text>
        {item.fullName && <Text style={{ color: '#666' }}>{item.fullName}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 16, color: '#9333ff' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', marginLeft: 12 }}>Người theo dõi</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9333ff" />
        </View>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#f0f0f0', marginLeft: 76 }} />}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text>Chưa có ai theo dõi bạn.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
